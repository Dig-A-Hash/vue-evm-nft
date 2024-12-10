import { Ref } from 'vue';
import { ethers } from 'ethers';

/**
 * Composable for interacting with EVM-based NFT contracts.
 *
 * @param pageSize - Number of items per page.
 * @param provider - Ethers.js provider instance.
 * @param holderPublicKey - Wallet address of the NFT holder, or `null` to fetch all NFTs.
 * @param contractOwnerPublicKey - Wallet address of the contract owner.
 * @param contractAddress - The contract address.
 * @param contractABI - The ABI of the contract.
 * @param chainId - Chain ID, or `null` for contracts not using Dig-A-Hash metadata.
 * @returns Object containing methods and reactive properties for NFT interaction.
 */
export declare function useEvmNft(
  pageSize: number,
  provider: ethers.JsonRpcProvider,
  holderPublicKey: string | null,
  contractOwnerPublicKey: string,
  contractAddress: string,
  contractABI: any[],
  chainId: number | null
): Promise<{
  /**
   * Fetches NFTs for a specific page and sort order.
   *
   * @param page - The page number to fetch.
   * @param isAscending - Whether to sort in ascending order.
   * @returns Promise resolving to an object containing tokens, page size, and total count.
   */
  getNfts: (
    page: number,
    isAscending: boolean
  ) => Promise<{
    tokens: Array<{
      tokenId: number;
      metaData: object | null;
      metaDataUrl: string;
      owner: string | null;
      privateData: object | null;
    }>;
    pageSize: number;
    count: number;
  }>;

  /**
   * Fetches metadata for a batch of token IDs.
   *
   * @param batchedTokenIds - Array of objects with `tokenId` and `owner` properties.
   * @param isAscending - Whether to sort metadata in ascending order.
   * @returns Promise resolving to an array of tokens with metadata and owner information.
   */
  getMetaDataBatch: (
    batchedTokenIds: Array<{ tokenId: number; owner: string | null }>,
    isAscending: boolean
  ) => Promise<
    Array<{
      tokenId: number;
      metaDataUrl: string;
      metaData: object | null;
      privateData: object | null;
      owner: string | null;
    }>
  >;

  /**
   * Fetches metadata for a list of token IDs.
   *
   * @param tokenIds - Array of token IDs.
   * @returns Promise resolving to an array of token objects with metadata.
   */
  getTokenMetaData: (tokenIds: number[]) => Promise<
    Array<{
      tokenId: number;
      metaDataUrl: string;
      metaData: object | null;
      privateData: object | null;
    }>
  >;

  /**
   * Fetches the owner of a specific token.
   *
   * @param tokenId - The ID of the token.
   * @returns Promise resolving to the owner's wallet address.
   */
  getTokenOwner: (tokenId: number) => Promise<string>;

  /**
   * A reactive property tracking the current loading message.
   */
  loadingMessage: Ref<string>;
}>;
