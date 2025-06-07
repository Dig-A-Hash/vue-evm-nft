import { ref, onMounted, watch } from 'vue';
import { useEvmNft } from './useEvmNft.js';
import { useNftStore } from '../stores/nftStore.js';
import { ethers } from 'ethers';

/**
 * Similar to the useEvmNftGallery but this composable is designed to fetch
 * NFT meta data with much less on-chain validation. This allows for faster
 * fetching, and larger page sizes, including the ability to fetch all NFTs
 * in one query. This composable cannot fetch NFTs from a specific wallet,
 * and is designed only to fetch all NFTs on a contract.
 * @param {object} config - The EvmMetaDataOptions configuration object for
 * the useEvmMetaDataGallery.
 * @returns page, numberOfPages, nfts, isAscending, toggleSortOrder,
 * isLoading loadingMessage, getNftPage, getTokenOwner, getTokenMetaData.
 */
export function useEvmMetaDataGallery(config) {
  const {
    contractPublicKey,
    contractAddress,
    abi,
    chainId,
    rpc,
    itemsPerPage,
    nftStoreItemCollectionName,
    isAscendingSort,
    isGetAllNftQuery,
  } = config;

  const holderPublicKey = null;
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

  onMounted(async () => {
    nftStore.addCollection(nftStoreItemCollectionName);

    const evmNft = await useEvmNft(
      parseInt(itemsPerPage),
      new ethers.JsonRpcProvider(rpc),
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

    if (isGetAllNftQuery) {
      await getAllNfts();
    } else {
      await getNftPage(page.value);
    }
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
      // append tokens if isGetAllNftQuery is true
      if (isGetAllNftQuery) {
        nfts.value = nfts.value.concat(tokens);
      } else {
        nfts.value = tokens;
      }

      nftStore.setCollectionItems(
        iPage,
        nfts.value, // used to be tokens, just need the appended items
        nftStoreItemCollectionName
      );
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
   * Fetches all NFTs and associated metadata for a given contract in a loop
   * with no paging.
   */
  async function getAllNfts() {
    try {
      isLoading.value = true;
      await getNftPage(1);
      for (let i = 2; i <= numberOfPages.value; i++) {
        await getNftPage(i);
      }
    } catch (error) {
      console.error('Error in getAllNfts:', error);
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
  };
}
