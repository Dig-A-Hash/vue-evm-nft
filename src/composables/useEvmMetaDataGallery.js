import { ref, onMounted, watch } from 'vue';
import { useEvmNft } from './useEvmNft';
import { useNftStore } from '../stores/nftStore';
import { ethers } from 'ethers';

/**
 * Initializes the NFT Gallery composable exposing several variables and
 * functions needed to sort and page through EVM based NFT Contracts. This
 * component is dependant on the useEvmNft composable, and Pinia nftStore.
 * @param {string} contractPublicKey - The public key of the wallet holding the contract.
 * @param {string} contractAddress - The contract address.
 * @param {array} abi - The contract ABI.
 * @param {number} chainId - The EVM Chain ID, pass null to use Dig-A-Hash
 * meta-data for improved Meta Data fetching performance.
 * @param {string} holderPublicKey - Gets NFTs on contract held by this wallet only.
 * If null, all NFTs on contract will return.
 * @param {string} ethersProviderUrl - The Ethers provider for the Chain ID.
 * @param {number} itemsPerPage - The number of items to get per page.
 * @param {string} nftStoreItemCollectionName - The NFT Store collection name.
 * @param {boolean} isAscendingSort - Sorting by Token ID direction.
 * @returns page, numberOfPages, nfts, isAscending, toggleSortOrder,
 * isLoading loadingMessage, getNftPage, getTokenOwner, getTokenMetaData, getMetaDataBatch
 */
export function useEvmMetaDataGallery(
  contractPublicKey,
  contractAddress,
  abi,
  chainId,
  holderPublicKey,
  ethersProviderUrl,
  itemsPerPage,
  nftStoreItemCollectionName,
  isAscendingSort
) {
  const nftStore = useNftStore();

  const page = ref(1);
  const numberOfPages = ref(0);
  const nfts = ref([]);
  const isAscending = ref(isAscendingSort);
  const isLoading = ref(false);
  const loadingMessage = ref('');

  // Proxy functions from useEvmNft.
  let _getMyNfts = null;
  let _getTokenOwner = null;
  let _getTokenMetaData = null;
  let _getMetaDataBatch = null;

  onMounted(async () => {
    nftStore.addCollection(nftStoreItemCollectionName);

    const evmNft = await useEvmNft(
      parseInt(itemsPerPage),
      new ethers.JsonRpcProvider(ethersProviderUrl),
      holderPublicKey,
      contractPublicKey,
      contractAddress,
      abi,
      chainId
    );

    loadingMessage.value = evmNft.loadingMessage; // bind ref to loadingMessage

    // Set the function pointer for calling later, after mount.
    _getMyNfts = evmNft.getMetaDataCollection;
    _getTokenOwner = evmNft.getTokenOwner;
    _getTokenMetaData = evmNft.getTokenMetaData;
    _getMetaDataBatch = evmNft.getMetaDataBatch;

    await getNftPage(page.value);
  });

  // Get NFTs if page changes.
  watch(page, async (newPage, oldPage) => {
    if (newPage !== oldPage) {
      await getNftPage(newPage);
    }
  });

  /**
   * Toggles the sort order of the NFTs between ascending and descending.
   * It also clears the current collection and resets pagination to the first page.
   * @returns {Promise<void>} - A promise for a page of NFTs
   */
  async function toggleSortOrder() {
    isAscending.value = !isAscending.value;
    nftStore.itemCollections[nftStoreItemCollectionName].items = [];
    nftStore.itemCollections[nftStoreItemCollectionName].page = 1;
    page.value = 1;
    await getNftPage(page.value);
  }

  /**
   * Fetches a specific page of NFTs and associated metadata.
   * This function updates the local state with NFTs and their pagination details.
   * @param {number} iPage - The page number to retrieve.
   * @returns - A promise that resolves once the NFTs are fetched.
   */
  async function getNftPage(iPage) {
    try {
      isLoading.value = true;
      // Skip fetching NFTs if we already have them.
      if (
        nftStore.itemCollections[nftStoreItemCollectionName].items[iPage - 1]
      ) {
        nfts.value =
          nftStore.itemCollections[nftStoreItemCollectionName].items[iPage - 1];
        numberOfPages.value =
          nftStore.itemCollections[nftStoreItemCollectionName].page;
        return;
      }

      const { tokens, pageSize, count } = await _getMyNfts(
        iPage,
        isAscending.value
      );
      nfts.value = tokens;
      nftStore.setCollectionItems(iPage, tokens, nftStoreItemCollectionName);
      nftStore.itemCollections[nftStoreItemCollectionName].page = Math.ceil(
        count / pageSize
      );
      numberOfPages.value =
        nftStore.itemCollections[nftStoreItemCollectionName].page;
      nftStore.itemCollections[nftStoreItemCollectionName].itemCount = count;
    } catch (error) {
      console.error('Error in getNftPage:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches the owner of a specific token by its ID. Exposing a proxy function for evmNft.
   * @param {number} tokenId - The ID of the token to look up the owner for.
   * @returns {Promise<string>} - A promise that resolves with the owner’s address.
   */
  async function getTokenOwner(tokenId) {
    return await _getTokenOwner(tokenId);
  }

  /**
   * Retrieves metadata for a given set of token IDs. Exposing a proxy function for evmNft.
   * @param {array} tokenIds - An array of token IDs to retrieve metadata for.
   * @returns {Promise<object>} - A promise that resolves with the metadata for the tokens.
   */
  async function getTokenMetaData(tokenIds) {
    return await _getTokenMetaData(tokenIds);
  }

  /**
   * Retrieves metadata for a batch of tokens. Exposing a proxy function for evmNft.
   * @param {array} batchObjects - Array of batch objects, each containing details for multiple tokens.
   * @returns {Promise<object>} - A promise that resolves with the metadata for the batch of tokens.
   */
  async function getMetaDataBatch(batchObjects) {
    return await _getMetaDataBatch(batchObjects);
  }

  return {
    page,
    numberOfPages,
    nfts,
    isAscending,
    isLoading,
    loadingMessage,
    toggleSortOrder,
    getNftPage,
    getTokenOwner,
    getTokenMetaData,
    getMetaDataBatch,
  };
}
