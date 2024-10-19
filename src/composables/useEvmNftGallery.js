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
 * @param {boolean} isAscendingSort - Sorting value.
 * @returns page, numberOfPages, nfts, isAscending, onToggleSortOrder,
 * isLoading nftLoadingMessage,
 */
export function useEvmNftGallery(
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
  let getMyNfts = function () {};
  let getTokenOwner = function () {};
  let getTokenMetaData = function () {};
  let getMetaDataBatch = function () {};

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
    getMyNfts = evmNft.getNfts;
    getTokenOwner = evmNft.getTokenOwner;
    getTokenMetaData = evmNft.getTokenMetaData;
    getMetaDataBatch = evmNft.getMetaDataBatch;

    await getNftPage(page.value);
  });

  // Get NFTs if page changes.
  watch(page, async (newPage, oldPage) => {
    if (newPage !== oldPage) {
      await getNftPage(newPage);
    }
  });

  /**
   * Handles changing the sort order. Call this from anywhere.
   */
  async function toggleSortOrder() {
    isAscending.value = !isAscending.value;
    nftStore.itemCollections[nftStoreItemCollectionName].items = [];
    nftStore.itemCollections[nftStoreItemCollectionName].page = 1;
    page.value = 1;
    await getNftPage(page.value);
  }

  /**
   * Handles getting NFTs and associated Meta Data.
   * @param {number} iPage - A page param.
   * @returns - Nothing but sets many internal props.
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

      const { tokens, pageSize, count } = await getMyNfts(
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
      throw error;
    } finally {
      isLoading.value = false;
    }
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
