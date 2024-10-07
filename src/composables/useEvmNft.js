import axios from 'axios';
import { ethers } from 'ethers';
import { ref } from 'vue';

/**
 * This is used if chainId is not null because we can derive the path
 * using the chainId if the meta data is on Dig-A-Hash.
 */
const DIG_A_HASH_BASE_URL = 'https://nft.dah-services.com/';

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
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  contractOwnerPublicKey = contractOwnerPublicKey.toLowerCase();
  contractAddress = contractAddress.toLowerCase();
  const loadingMessage = ref('');

  async function getStartTokenId() {
    try {
      await contract.ownerOf(0);
      return 0;
    } catch {
      return 1;
    }
  }

  /**
   * Retrieves the balance of NFTs for a given holder or the total supply.
   * If a holder's public key is provided, it fetches the balance of NFTs
   * owned by that specific holder. If no public key is provided, it
   * returns the total supply of NFTs.
   *
   * @param {string} holderPublicKey - The public key (address) of the NFT
   * holder. If null, the total supply of NFTs is retrieved.
   * @returns {Promise<number>} - A Promise that resolves to the balance of
   * NFTs owned by the holder or the total supply as a number.
   */
  async function getBalance(holderPublicKey) {
    if (holderPublicKey) {
      holderPublicKey = holderPublicKey.toLowerCase();
      const balance = await contract.balanceOf(holderPublicKey);
      return Number(balance);
    } else {
      const balance = await contract.totalSupply();
      return Number(balance);
    }
  }

  /**
   * Calculates the start and end indexes for paginated data retrieval,
   * adjusted for token balances and direction. This function is used
   * for determining which subset of tokens to fetch on a specific page.
   *
   * @param {number} page - The current page number. Defaults to 1 if not provided.
   * @param {number} balance - The total number of tokens or items available.
   * @param {number} pageSize - The number of tokens or items to display per page.
   * @param {boolean} isAscending - Determines the order of retrieval:
   *   - `true`: Retrieves items in ascending order.
   *   - `false`: Retrieves items in descending order.
   * @param {number} startTokenId - The starting token ID of the contract,
   * which could be 0 or 1 depending on the contract.
   * @returns {Object} - An object containing:
   *   - `startIndex` (number): The index at which to start retrieving tokens.
   *   - `endIndex` (number): The index at which to end retrieval (inclusive).
   *   - `lastPage` (number): The total number of pages based on the balance and page size.
   */
  function calculatePageIndexes(
    page,
    balance,
    pageSize,
    isAscending,
    startTokenId
  ) {
    const lastPage = Math.ceil(balance / pageSize);
    page = page || 1;

    let startIndex, endIndex;
    if (isAscending) {
      startIndex = pageSize * (page - 1);
      endIndex = Math.min(balance, pageSize * page);
    } else {
      startIndex = Math.max(0, balance - pageSize * page);
      endIndex = balance - pageSize * (page - 1);
    }

    if (startTokenId === 0) {
      endIndex--;
    }

    return { startIndex, endIndex, lastPage };
  }

  /**
   * Fetches a batch of NFT tokens from the blockchain, including their owners,
   * within a specified range. This function does not work well with contracts
   * that have burned tokens. Use fetchUserTokens instead.
   *
   * @param {number} startIndex - The starting index for fetching tokens (adjusted
   * to the token IDs).
   * @param {number} endIndex - The ending index for fetching tokens.
   * @param {number} startTokenId - The starting token ID of the contract, which
   * could be 0 or 1 depending on the contract.
   * @returns {Promise<Object[]>} - A Promise that resolves to an array of objects,
   * each containing:
   *   - `tokenId` (number): The ID of the fetched token.
   *   - `owner` (string): The address of the token's owner.
   */
  async function fetchAllTokens(startIndex, endIndex, startTokenId) {
    const batchedTokenIdPromises = [];

    // Adjust startIndex to match token IDs for contracts starting at 0 or 1
    startIndex += startTokenId;

    for (
      let tokenId = endIndex;
      tokenId >= startIndex && tokenId >= startTokenId;
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
   * Fetches a batch of NFT tokens owned by a specific user from the
   * blockchain, excluding metadata. This function generates promises
   * to retrieve token IDs for a user's NFTs, based on a range of indices.
   * The tokens are fetched using `tokenOfOwnerByIndex`, which is
   * specific to the holder's address.
   * @param {number} startIndex - The starting index for fetching tokens (inclusive).
   * @param {number} endIndex - The ending index for fetching tokens (inclusive).
   * @param {string} holderPublicKey - The public key (address) of the NFT holder.
   * @param {number} startTokenId - The starting token ID of the contract, which
   * could be 0 or 1 depending on the contract.
   * @returns {Promise<Object[]>} - A Promise that resolves to an array of objects,
   * each containing:
   *   - `tokenId` (number): The ID of the fetched token.
   *   - `owner` (string): The holder's public key.
   */
  async function fetchUserTokens(
    startIndex,
    endIndex,
    holderPublicKey,
    startTokenId
  ) {
    const batchedTokenIdPromises = [];

    // Adjust indexes for fetching user's tokens
    for (let i = endIndex - startTokenId; i >= startIndex; i--) {
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
   * Gets NFTs and their Meta Data, with support for paging, and sorting by Token ID.
   * @param {number} page - The page.
   * @param {boolean} isAscending - The sort direction.
   * @returns
   */
  async function getNfts(page, isAscending) {
    loadingMessage.value = 'Connecting to Blockchain...';

    const startTokenId = await getStartTokenId();
    const balance = await getBalance(holderPublicKey);
    const { startIndex, endIndex, lastPage } = calculatePageIndexes(
      page,
      balance,
      pageSize,
      isAscending,
      startTokenId
    );

    // Fetch tokens based on whether a specific wallet is provided or not
    const batchedTokenIds = holderPublicKey
      ? await fetchUserTokens(
          startIndex,
          endIndex,
          holderPublicKey,
          startTokenId
        )
      : await fetchAllTokens(startIndex, endIndex, startTokenId);

    const tokens = await getMetaDataBatch(batchedTokenIds, isAscending);

    return { tokens, pageSize, count: balance };
  }

  /**
   * Prepares and post processes the batched token IDs to assemble meta-data and
   * on chain token IDs and owners.
   * @param {*} batchedTokenIds
   * @param {*} isAscending
   * @returns An array of objects containing the tokens and their meta-data.
   */
  async function getMetaDataBatch(batchedTokenIds, isAscending) {
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
   * @param {array} tokenIds - The token IDs.
   * @returns An array of objects containing the token ID, meta-data URL,
   * meta-data, and private data.
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
        publicMetaData = await axios.get(metaDataUrl + '?v=' + Date.now());
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
   * @param {*} tokenId - The token ID.
   * @returns A wallet address.
   */
  async function getTokenOwner(tokenId) {
    try {
      const owner = await contract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error(`Error fetching token with ID ${tokenId}:`, error);
      throw error;
    }
  }

  return {
    getNfts,
    getTokenOwner,
    getMetaDataBatch,
    getTokenMetaData,
    loadingMessage,
  };
}
