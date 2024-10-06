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

  /**
   * Gets a page of NFTs, plus Meta-Data in the specified order.
   * @param {integer} page - The page number.
   * @param {boolean} isAscending - True to sort in ascending order, false to sort in descending order.
   * @returns An object containing the items, pageSize, and a totalCount of all NFTs on this contract.
   */
  async function getNfts(page, isAscending) {
    loadingMessage.value = 'Connecting to Blockchain...';
    let startTokenId = 0; // Assume token ID starts at 0 by default

    // Check if token ID 0 exists to determine if the contract starts at 0 or 1
    try {
      await contract.ownerOf(0);
      startTokenId = 0; // Token ID starts at 0
    } catch (error) {
      startTokenId = 1; // Token ID starts at 1
    }

    let balance;
    if (holderPublicKey) {
      // Get Contract NFT balance for the specified wallet.
      holderPublicKey = holderPublicKey.toLowerCase();
      balance = await contract.balanceOf(holderPublicKey);
      balance = Number(balance);
    } else {
      // Get Contract NFT balance for the entire contract.
      balance = await contract.totalSupply();
      balance = Number(balance);
    }

    // Calculate the last page.
    const lastPage = Math.ceil(balance / pageSize);

    if (!page) {
      page = 1;
    }

    // Calculate the start and end indexes for the current page
    let startIndex, endIndex;

    if (isAscending) {
      // Ascending order: Start from the lowest token ID
      startIndex = pageSize * (page - 1);
      endIndex = Math.min(balance, pageSize * page);

      // Adjust endIndex if the start tokenId is 0 to avoid overshooting
      if (startTokenId === 0) {
        endIndex--;
      }
    } else {
      // Descending order: Start from the highest token ID and go backwards
      startIndex = Math.max(startTokenId, balance - pageSize * page);
      endIndex = balance - pageSize * (page - 1);

      // Adjust endIndex if the start tokenId is 0 to avoid overshooting
      if (startTokenId === 0) {
        endIndex--;
      }
    }

    // Batch fetching token IDs
    const batchedTokenIdPromises = [];

    if (!holderPublicKey) {
      // Get all tokens on contract historical.
      // Adjust condition to ensure both startIndex and endIndex are included.
      for (
        let tokenId = endIndex;
        tokenId >= startIndex && tokenId >= startTokenId;
        tokenId--
      ) {
        batchedTokenIdPromises.push(
          contract.ownerOf(tokenId).then((owner) => {
            return { tokenId, owner };
          })
        );
      }
    } else {
      // Get tokens for specified wallet.
      // Ensure correct token ID ranges by adjusting i logic.
      for (let i = endIndex - 1; i >= startIndex; i--) {
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
    }

    // This will end up being an array of objects with TokenId, and Owner.
    const batchedTokenIds = await Promise.all(batchedTokenIdPromises);

    // This gets the meta-data and associates the owner and tokenId.
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
