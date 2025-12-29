import axios from 'axios';
import { ethers } from 'ethers';
import { ref } from 'vue';
import { DIG_A_HASH_BASE_URL } from '../modules/constants.js';

/**
 * Gets contract and NFT data from the Blockchain by setting up the
 * composable with stateful parameters that must be setup by the caller.
 * This composable requires Ethers.js and Axios as dependencies.
 * @param {integer} pageSize - The number of items per page.
 * @param {object} provider - The ethers.js provider.
 * @param {string} holderPublicKey - NFT holder's wallet, set to null to get all NFTs on contract (history).
 * @param {string} contractOwnerPublicKey - The contract owner's wallet.
 * @param {string} contractAddress - The contract address.
 * @param {array} contractABI - The contract ABI.
 * @param {integer} chainId - Passing a chain ID specifies that we are getting a Dig-A-Hash NFT.
 * Pass null if the Meta Data is not stored with Dig-A-Hash in a predictable pattern.
 * @param {string} excludeWallet - The wallet to exclude from the NFTs. Only works when publicKey is null.
 * @returns An object containing the following properties:
 * getMyNfts: A function to get the NFTs for the current user.
 */
export async function useEvmNft(
  pageSize,
  provider,
  holderPublicKey,
  contractOwnerPublicKey,
  contractAddress,
  contractABI,
  chainId
) {
  let contract = null;
  const _balance = ref(-1);
  const _startTokenId = ref(-1);

  // Only initialize the contract if both contractAddress and contractABI are provided
  if (contractAddress && contractABI && provider) {
    contract = new ethers.Contract(contractAddress, contractABI, provider);
  }

  contractOwnerPublicKey = contractOwnerPublicKey.toLowerCase();
  contractAddress = contractAddress.toLowerCase();

  const loadingMessage = ref('');

  /**
   * Validates the contract instance.
   * @private
   * @returns Nothing but throws an error if there is no contract.
   */
  function _contractRequired() {
    if (!contract) {
      throw new Error('Contract is required for useEvmNft.');
    }
  }

  /**
   * Sets the starting Token ID on the contract. This is used to tell if
   * the first Token ID is 0 or 1. This can miscalculate if the first
   * token(s) is/are burned but it doesn't matter because they technically
   * don't exist.
   * @private
   */
  async function _setStartTokenId() {
    try {
      if (_startTokenId.value > -1) {
        return;
      }

      if (holderPublicKey) {
        _startTokenId.value = 0;
        return;
      }

      await contract.ownerOf(0);
      _startTokenId.value = 0;
    } catch {
      _startTokenId.value = 1;
    }
  }

  /**
   * Sets the balance of NFTs for a given holder or the total supply.
   * If a holder's public key is provided, it fetches the balance of NFTs
   * owned by that specific holder. If no public key is provided, it
   * returns the total supply of NFTs.
   * @private
   * @param {string} holderPublicKey - The public key (address) of the NFT
   * holder. If null, the total supply of NFTs is retrieved.
   */
  async function _setBalance(holderPublicKey) {
    if (_balance.value > -1) {
      return;
    } else {
      if (holderPublicKey) {
        holderPublicKey = holderPublicKey.toLowerCase();
        const balance = await contract.balanceOf(holderPublicKey);
        _balance.value = Number(balance);
      } else {
        const balance = await contract.totalSupply();
        _balance.value = Number(balance);
      }
    }
  }

  /**
   * Calculates the start and end indices (indexes) for token retrieval. This
   * is where the main "business logic" for this package exists. This function
   * is tricky because it supports the following features...
   * - Paging
   * - 0 Token Balance
   * - Sort direction by Token ID in ascending or descending order.
   * - Tokens in a specified wallet (using the holderPublicKey param).
   * - Contracts that start at Token ID 0 or 1.
   *  An important note is that when the holderPublicKey is provided, the
   *  startTokenId is always 0. This is because the tokens are pulled from
   *  the tokenOfOwnerByIndex function by index, which always starts at 0.
   * @private
   * @param {number} page - The current page number. Defaults to 1 if not provided.
   * @param {boolean} isAscending - Determines the order of retrieval:
   *   - `true`: Retrieves items in ascending order.
   *   - `false`: Retrieves items in descending order.
   * @returns {Object} - An object containing:
   *   - `startIndex` (number): The index at which to start retrieving tokens.
   *   - `endIndex` (number): The index at which to end retrieval (inclusive).
   *   - `lastPage` (number): The total number of pages based on the balance and page size.
   */
  function _calculatePageIndexes(page, isAscending) {
    const lastPage = Math.ceil(_balance.value / pageSize);
    page = page || 1;

    let startIndex, endIndex;
    const startTokenId = holderPublicKey ? 0 : _startTokenId.value;
    var endIndexAdjustment = 0;
    if (_startTokenId.value === 0) {
      endIndexAdjustment = 1;
    }

    if (holderPublicKey) {
      endIndexAdjustment = 1;
    }

    if (isAscending) {
      startIndex = Math.max(startTokenId, pageSize * (page - 1) + startTokenId);
      endIndex = Math.min(
        _balance.value - endIndexAdjustment,
        pageSize * page - endIndexAdjustment
      );
    } else {
      const startValueAdjusted = _startTokenId.value === 1 ? 0 : 1;
      startIndex = Math.max(
        startTokenId,
        _balance.value + startTokenId - pageSize * page
      );
      endIndex =
        _balance.value -
        (holderPublicKey ? 1 : startValueAdjusted) -
        pageSize * (page - 1);
    }

    // console.log('Start Index: ' + startIndex);
    // console.log('End Index: ' + endIndex);
    // console.log('Balance: ' + _balance.value);
    // console.log('Start Token ID: ' + _startTokenId.value);

    return { startIndex, endIndex, lastPage };
  }

  /**
   * Fetches a batch of NFT tokens from the contract, including their owners,
   * within a specified range. This function does not work well with contracts
   * that have burned tokens. Use fetchUserTokens instead. Used only for getNfts
   * with on-chain validation.
   * @private
   * @param {number} startIndex - The starting index for fetching tokens (adjusted
   * to the token IDs).
   * @param {number} endIndex - The ending index for fetching tokens.
   * @returns {Promise<Object[]>} - A Promise that resolves to an array of objects
   * in reverse order by tokenId, each containing:
   *   - `tokenId` (number): The ID of the fetched token.
   *   - `owner` (string): The address of the token's owner.
   */
  async function _fetchContractTokens(startIndex, endIndex) {
    const batchedTokenIdPromises = [];

    for (
      let tokenId = endIndex;
      tokenId >= startIndex && tokenId >= _startTokenId.value;
      tokenId--
    ) {
      batchedTokenIdPromises.push(
        contract
          .ownerOf(tokenId)
          .then((owner) => ({ tokenId, owner }))
          .catch((error) => {
            // Handle invalid token IDs (e.g., tokens that have been burned)
            if (error.message.includes('invalid token ID')) {
              console.warn(`Token ID ${tokenId} is invalid or burned.`);
              return null; // Skip this token
            }
            throw error; // Re-throw other unexpected errors
          })
      );
    }

    // Wait for all promises and filter out null values
    const batchedTokenIds = await Promise.all(batchedTokenIdPromises);
    return batchedTokenIds.filter((token) => token !== null);
  }

  /**
   * Fetches a batch of NFTs on-chain owned by a specific user from the
   * contract, excluding metadata. This function generates promises
   * to retrieve token IDs for a user's NFTs, based on a range of indices.
   * The tokens are fetched using `tokenOfOwnerByIndex`, which is
   * specific to the holder's address. Used only for getNfts with on-chain
   * validation.
   *
   * An important note is that when the holderPublicKey is provided, the
   * startTokenId is always 0. This is because the tokens are pulled from
   * the tokenOfOwnerByIndex function by index, which always starts at 0.
   * @private
   * @param {number} startIndex - The starting index for fetching tokens (inclusive).
   * @param {number} endIndex - The ending index for fetching tokens (inclusive).
   * @param {string} holderPublicKey - The public key (address) of the NFT holder.
   * @returns {Promise<Object[]>} - A Promise that resolves to an array of objects
   * in reverse order by tokenId, each containing:
   *   - `tokenId` (number): The ID of the fetched token.
   *   - `owner` (string): The holder's public key.
   */
  async function _fetchUserTokens(startIndex, endIndex, holderPublicKey) {
    const batchedTokenIdPromises = [];

    // Adjust indexes for fetching user's tokens
    for (let i = endIndex; i >= startIndex; i--) {
      batchedTokenIdPromises.push(
        contract
          .tokenOfOwnerByIndex(holderPublicKey, i)
          .then((tokenId) => ({
            tokenId: Number(tokenId),
            owner: holderPublicKey,
          }))
          .catch((error) => {
            console.error(`Error fetching token at index ${i}:`, error);
            throw error;
          })
      );
    }

    return Promise.all(batchedTokenIdPromises);
  }

  /**
   * Prepares and post processes the batched token IDs to assemble meta-data and
   * on chain token IDs and owners. Used only for getNfts with on-chain validation.
   * @public
   * @param {*} batchedTokenIds - An array of objects with tokenId, and owner props.
   * @param {*} isAscending - true if is ascending sort order, false for desc.
   * @returns An array of objects containing the tokens and their meta-data.
   */
  async function _getMetaDataBatch(batchedTokenIds, isAscending) {
    // Create an array to store the valid token IDs
    const validTokenIds = [];
    for (const batchedToken of batchedTokenIds) {
      if (batchedToken.owner !== null) {
        validTokenIds.push(batchedToken.tokenId);
      }
    }

    // Get Meta-Data for each token.
    const tokensWithMetaData = await getTokenMetaData(validTokenIds);

    // Match up owner's publicKey with tokens to set the owner property.
    const tokens = tokensWithMetaData.map((metaData) => {
      const matchingToken = batchedTokenIds.find(
        (token) => token.tokenId === metaData.tokenId
      );
      if (matchingToken) {
        return { ...metaData, owner: matchingToken.owner };
      }
      return metaData;
    });

    // Sort the tokens by tokenId if Ascending, otherwise desc is default.
    if (isAscending) {
      tokens.sort((a, b) => {
        return a.tokenId - b.tokenId;
      });
    }
    return tokens;
  }

  /**
   * Gets the NFT Meta-Data for a list of token IDs. If chainId is not null, then
   * we assume this is a Dig-A-Hash NFT. If chainId is null, then we must run another
   * call to the contract to get the Token URI, which is a tiny bit slower.
   * @public
   * @param {array} tokenIds - An array of token IDs.
   * @returns An array of objects containing the token ID, meta-data URL,
   * meta-data, and null private data.
   */
  async function getTokenMetaData(tokenIds) {
    loadingMessage.value = 'Fetching Meta Data...';
    const tokens = [];

    let metaDataUrls;

    if (chainId) {
      // Derive the meta data URI from the predictable Dig-A-Hash storage pattern. (Faster)
      metaDataUrls = tokenIds.map((tokenId) => {
        return `${DIG_A_HASH_BASE_URL}profiles/${contractOwnerPublicKey.toLowerCase()}/meta-data/${chainId}/${contractAddress}/${tokenId.toString()}.json`;
      });
    } else {
      // Fetch the Meta Data Token URI from the contract. (Slower)
      const startTime = Date.now();
      metaDataUrls = await Promise.all(
        tokenIds.map(async (tokenId) => {
          return await contract.tokenURI(tokenId);
        })
      );
      const endTime = Date.now();
      const difference = endTime - startTime;
      console.log(
        'Added Meta Data Fetch time due to a null chainId. (ms): ' + difference
      );
    }

    // Fetch all meta data
    const metaDataPromises = metaDataUrls.map(async (metaDataUrl) => {
      var publicMetaData = {};
      try {
        publicMetaData = await axios.get(metaDataUrl);
      } catch (error) {
        publicMetaData.data = null;
      }

      return publicMetaData.data;
    });

    const metaData = await Promise.all(metaDataPromises);

    // re-attach the tokenId
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      tokens.push({
        tokenId,
        metaDataUrl: metaDataUrls[i],
        metaData: metaData[i],
        privateData: null,
      });
    }

    return tokens;
  }

  /**
   * Gets the owner of a token.
   * @public
   * @param {*} tokenId - The token ID.
   * @returns A wallet address.
   */
  async function getTokenOwner(tokenId) {
    _contractRequired();
    try {
      const owner = await contract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error(`Error fetching token with ID ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Gets NFTs and their Meta Data using on-chain validation, with support
   * for paging, and sorting by Token ID. this function is a little slower
   * than getMetaDataCollection because it validates each token on-chain.
   * @public
   * @param {number} page - The page.
   * @param {boolean} isAscending - The sort direction.
   * @returns
   */
  async function getNfts(page, isAscending) {
    _contractRequired();
    loadingMessage.value = 'Connecting to Blockchain...';

    await _setStartTokenId();
    await _setBalance(holderPublicKey);

    if (_balance.value === 0) {
      return { tokens: [], pageSize, count: 0 };
    }

    const { startIndex, endIndex, lastPage } = _calculatePageIndexes(
      page,
      isAscending
    );

    // Fetch tokens based on whether a specific wallet is provided or not
    const batchedTokenIds = holderPublicKey
      ? await _fetchUserTokens(startIndex, endIndex, holderPublicKey)
      : await _fetchContractTokens(startIndex, endIndex);

    const tokens = await _getMetaDataBatch(batchedTokenIds, isAscending);

    return { tokens, pageSize, count: _balance.value };
  }

  /**
   * Retrieves and paginates NFT metadata based on the contract's token balance
   * and configuration. This method optimizes performance by avoiding direct
   * blockchain queries for token IDs, instead calculating them directly. If
   * a chain ID is specified, this function will be extra fast because it can
   * use Dig-A-Hash predictable meta data.
   * @param {number} page - The page number for pagination. Defaults to 1 if not provided.
   * @param {boolean} isAscending - If true, sorts tokens in ascending order by token ID; if false, descending order.
   * @returns {Promise<Object>} An object containing: {Array} tokens - An array of objects where each object includes token metadata, and token ID.
   *   - {number} pageSize - The size of each page (number of items per page).
   *   - {number} count - The total number of tokens or NFTs for the specified contract.
   * @throws {Error} If the contract instance has not been initialized.
   */
  async function getMetaDataCollection(page, isAscending) {
    _contractRequired();
    loadingMessage.value = 'Connecting to Blockchain...';

    await _setStartTokenId();
    await _setBalance(holderPublicKey);

    if (_balance.value === 0) {
      return { tokens: [], pageSize, count: 0 };
    }

    const { startIndex, endIndex, lastPage } = _calculatePageIndexes(
      page,
      isAscending
    );

    const tokenIds = [];
    for (let i = startIndex; i <= endIndex; i++) {
      tokenIds.push(i);
    }

    const tokens = await getTokenMetaData(tokenIds);

    // Ensure we sort
    if (isAscending) {
      tokens.sort((a, b) => a.tokenId - b.tokenId);
    } else {
      tokens.sort((a, b) => b.tokenId - a.tokenId);
    }

    return { tokens, pageSize, count: _balance.value };
  }

  /**
   * Retrieves and paginates NFT metadata based on a provided (cached)
   * token balance. This method optimizes performance by avoiding direct
   * blockchain queries for token IDs, instead calculating them directly.
   * If a chain ID is specified, this function will be extra fast because
   * it can use Dig-A-Hash predictable meta data.
   * @param {number} page - The page number for pagination. Defaults to 1 if not provided.
   * @param {boolean} isAscending - If true, sorts tokens in ascending order by token ID; if false, descending order.
   * @param {number} contractBalance - The number of NFTs on the contract.
   * @param {number} contractStartTokenId - 1 or 0, the starting token ID.
   * @returns {Promise<Object>} An object containing: {Array} tokens - An array of objects where each object includes token metadata, and token ID.
   *   - {number} pageSize - The size of each page (number of items per page).
   *   - {number} count - The total number of tokens or NFTs for the specified contract.
   * @throws {Error} If the contract instance has not been initialized.
   */
  async function getDahCollection(
    page,
    isAscending,
    contractBalance,
    contractStartTokenId
  ) {
    // _contractRequired();
    loadingMessage.value = 'Connecting to CDN...';

    _startTokenId.value = contractStartTokenId;

    // If contractBalance is provided, use it; otherwise, assume a large collection
    if (contractBalance !== null) {
      _balance.value = contractBalance;
    } else {
      _balance.value = Number.MAX_SAFE_INTEGER;

      // Fetch the requested page's metadata to check for nulls
      const { startIndex, endIndex } = _calculatePageIndexes(page, isAscending);

      const tokenIds = [];
      for (let i = startIndex; i <= endIndex; i++) {
        tokenIds.push(i);
      }

      const tokens = await getTokenMetaData(tokenIds);

      // If all metadata is null, estimate balance as less than startIndex
      const allNull = tokens.every((token) => token.metaData === null);
      if (allNull && startIndex > _startTokenId.value) {
        _balance.value = startIndex - _startTokenId.value;
      }

      // If some metadata is null, estimate balance based on first null
      if (!allNull) {
        const firstNullIndex = tokens.findIndex(
          (token) => token.metaData === null
        );
        if (firstNullIndex !== -1) {
          _balance.value = startIndex + firstNullIndex - _startTokenId.value;
        }
      }

      // Return tokens including nulls
      if (_balance.value === 0) {
        return { tokens: [], pageSize, count: 0 };
      }

      // Filter nulls and sort
      const validTokens = tokens.filter((token) => token.metaData !== null);
      if (isAscending) {
        validTokens.sort((a, b) => a.tokenId - b.tokenId);
      } else {
        validTokens.sort((a, b) => b.tokenId - b.tokenId);
      }

      return { tokens, pageSize, count: _balance.value };
    }

    // For known contractBalance, proceed as original
    if (_balance.value === 0) {
      return { tokens: [], pageSize, count: 0 };
    }

    const { startIndex, endIndex } = _calculatePageIndexes(page, isAscending);

    const tokenIds = [];
    for (
      let i = startIndex;
      i <= endIndex && i < _balance.value + _startTokenId.value;
      i++
    ) {
      tokenIds.push(i);
    }

    const tokens = await getTokenMetaData(tokenIds);

    // Filter out null metadata and sort
    const validTokens = tokens.filter((token) => token.metaData !== null);
    if (isAscending) {
      validTokens.sort((a, b) => a.tokenId - b.tokenId);
    } else {
      validTokens.sort((a, b) => b.tokenId - b.tokenId);
    }

    return { tokens, pageSize, count: _balance.value };
  }

  return {
    getNfts,
    getTokenOwner,
    getTokenMetaData,
    loadingMessage,
    getMetaDataCollection,
    getDahCollection,
  };
}
