import { type Ref } from 'vue';
import { type Nft } from './useNftStore';

/**
 * The DahGalleryOptions configuration object for the useDahGallery composable.
 */
export interface DahGalleryOptions {
  contractPublicKey: string;
  contractAddress: string;
  abi: any[];
  chainId: number | null;
  rpc: string;
  itemsPerPage: number;
  nftStoreItemCollectionName: string;
  isAscendingSort: boolean;
  isGetAllNftQuery: boolean;
  startTokenId: number;
  supply: number | null;
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
export declare function useDahGallery(config: DahGalleryOptions): {
  page: Ref<number>;
  numberOfPages: Ref<number>;
  nfts: Ref<Nft[]>;
  isAscending: Ref<boolean>;
  isLoading: Ref<boolean>;
  loadingMessage: Ref<string>;
  toggleSortOrder: () => Promise<void>;
  getNftPage: (iPage: number) => Promise<void>;
  getTokenOwner: (tokenId: number) => Promise<string>;
  getTokenMetaData: (tokenIds: number[]) => Promise<Nft[]>;
};
