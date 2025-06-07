import { type ref, Ref } from 'vue';
import { type Nft } from './useNftStore.js';

/**
 * The EvmMetaDataOptions configuration object for the useEvmMetaDataGallery composable.
 */
export interface EvmMetaDataOptions {
  contractPublicKey: string;
  contractAddress: string;
  abi: any[];
  chainId: number | null;
  rpc: string;
  itemsPerPage: number;
  nftStoreItemCollectionName: string;
  isAscendingSort: boolean;
  isGetAllNftQuery: boolean;
}

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
export declare function useEvmMetaDataGallery(config: EvmMetaDataOptions): {
  page: ref<number>;
  numberOfPages: ref<number>;
  nfts: Ref<Nft[]>;
  isAscending: ref<boolean>;
  isLoading: ref<boolean>;
  loadingMessage: ref<string>;
  toggleSortOrder: () => Promise<void>;
  getNftPage: (iPage: number) => Promise<void>;
  getTokenOwner: (tokenId: number) => Promise<string>;
  getTokenMetaData: (tokenIds: number[]) => Promise<Nft[]>;
};
