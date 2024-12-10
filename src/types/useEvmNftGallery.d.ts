import { Ref } from 'vue';

export declare function useEvmNftGallery(
  contractPublicKey: string,
  contractAddress: string,
  abi: any[],
  chainId: number | null,
  holderPublicKey: string | null,
  ethersProviderUrl: string,
  itemsPerPage: number,
  nftStoreItemCollectionName: string,
  isAscendingSort: boolean
): {
  page: Ref<number>;
  numberOfPages: Ref<number>;
  nfts: Ref<any[]>;
  isAscending: Ref<boolean>;
  isLoading: Ref<boolean>;
  loadingMessage: Ref<string>;
  toggleSortOrder: () => Promise<void>;
  getNftPage: (iPage: number) => Promise<void>;
  getTokenOwner: (tokenId: number) => Promise<string>;
  getTokenMetaData: (tokenIds: number[]) => Promise<object>;
  getMetaDataBatch: (batchObjects: any[]) => Promise<object>;
};
