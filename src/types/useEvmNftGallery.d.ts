import { type ref, Ref } from 'vue';
import { NftMetaData } from './useNftStore';

/**
 * The EvmNftOptions configuration object for the useEvmNftGallery composable.
 */
export interface EvmNftOptions {
  contractPublicKey: string;
  contractAddress: string;
  abi: any[];
  chainId: number | null;
  holderPublicKey: string | null;
  rpc: string;
  itemsPerPage: number;
  nftStoreItemCollectionName: string;
  isAscendingSort: boolean;
}

/**
 * Initializes the NFT Gallery composable exposing several variables and functions
 * needed to sort and page through EVM based NFT Contracts. This will be a little
 * slower than useEvmMetaDataGallery, and public PRCs will enforce smaller page
 * sizes because this composable will verify every NFT on-chain, which results in a
 * Blockchain RPC call for every NFT. That also means this composable cannot fetch
 * all NFTs on a contract at once, blockchain RPCs will not serve that purpose
 * well. However, such blockchain verification allows this composable to fetch
 * NFTs from a specific wallet, or all NFTs on contract.
 * @param {object} config - The EvmNftOptions configuration object for
 * the useEvmNftGallery.
 * @returns page, numberOfPages, nfts, isAscending, toggleSortOrder,
 * isLoading loadingMessage, getNftPage, getTokenOwner, getTokenMetaData.
 */
export declare function useEvmNftGallery(config: EvmNftOptions): {
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
};
