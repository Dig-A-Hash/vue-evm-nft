import { type ref, Ref } from 'vue';
import { NftMetaData } from './useNftStore';

export declare function useEvmMetaDataGallery(
  contractPublicKey: string,
  contractAddress: string,
  abi: any[],
  chainId: number | null,
  holderPublicKey: string | null,
  ethersProviderUrl: string,
  itemsPerPage: number,
  nftStoreItemCollectionName: string,
  isAscendingSort: boolean,
  isGetAllNftQuery: boolean
): {
  page: ref<number>;
  numberOfPages: ref<number>;
  nfts: ref<NftMetaData[]>;
  isAscending: ref<boolean>;
  isLoading: ref<boolean>;
  loadingMessage: ref<string>;
  toggleSortOrder: () => Promise<void>;
  getNftPage: (iPage: number) => Promise<void>;
  getTokenOwner: (tokenId: number) => Promise<string>;
  getTokenMetaData: (tokenIds: number[]) => Promise<object>;
  getMetaDataBatch: (batchObjects: any[]) => Promise<object>;
};
