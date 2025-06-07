import { StoreDefinition } from 'pinia';
import { BlockchainConfig } from './blockchains.js';

/**
 * A metadata attribute for an NFT.
 */
export interface MetaDataAttribute {
  trait_type: string;
  value: string;
}

/**
 * Metadata for an NFT.
 */
export interface NftMetaData {
  image: string;
  name: string;
  description: string;
  attributes?: MetaDataAttribute[];
}

/**
 * An NFT object.
 */
export interface Nft {
  tokenId: number;
  metaData: NftMetaData;
  metaDataUrl: string;
  owner: string | null;
  privateData: object | null;
}

/**
 * A collection of NFTs to be stored in Pinia.
 */
export interface NftCollection {
  items: Nft[]; // Items are stored by page number.
  itemCount: number; // Total number of items in the collection.
  page: number; // Current page of the collection.
}

/**
 * State for the NFT store.
 */
export interface NftStoreState {
  // Collections stored by collection name.
  itemCollections: Record<string, NftCollection>;
}

/**
 * Getters for the NFT store.
 */
export interface NftStoreGetters {
  /**
   * Gets the Blockchain Explorer URL to verify an NFT.
   * @returns URL for viewing the NFT on the blockchain explorer.
   */
  explorerTokenUrl: () => (
    tokenId: string | number,
    contractAddress: string,
    blockchainConfig: BlockchainConfig
  ) => string;

  /**
   * Gets the Blockchain Explorer URL to verify a Smart Contract.
   * @returns URL for viewing the Smart Contract on the blockchain explorer.
   */
  explorerContractUrl: () => (
    contractAddress: string,
    blockchainConfig: BlockchainConfig
  ) => string;

  /**
   * Gets a path (no base URL) to the NFT item on this website,
   * used for creating QR Codes linking directly to items.
   * @param tokenId - The token ID of the NFT item.
   * @param nftStoreItemCollectionName - The name of the collection.
   * @returns A website path to the NFT item. This path will
   * still need a base URL prepended.
   */
  nftPath: () => (
    tokenId: number,
    nftStoreItemCollectionName: string
  ) => string;

  /**
   * Gets a base URL to the NFT meta-data. This is only for use with  Dig-A-Hash Meta Data.
   * @param contractPublicKey - The public key of the contract.
   * @param chainId - The chain ID of the contract.
   * @param contractAddress - The address of the contract.
   * @returns The Dig-A-Hash Meta Data Base URL. This result will
   * still need a token id appended.
   */
  digaMetaDataBaseUrl: () => (
    contractPublicKey: string,
    chainId: number,
    contractAddress: string
  ) => string;

  /**
   * Gets a full URL to the NFT meta-data. This is only for use with  Dig-A-Hash Meta Data.
   * @param tokenId - The token ID of the NFT item.
   * @param contractPublicKey - The public key of the contract.
   * @param chainId - The chain ID of the contract.
   * @param contractAddress - The address of the contract.
   * @returns The Dig-A-Hash Meta Data URL.
   */
  digaMetaDataUrl: () => (
    tokenId: number,
    contractPublicKey: string,
    chainId: number,
    contractAddress: string
  ) => string;

  /**
   * Appends an 'l' to the end of an image file name.
   */
  getImageLarge: () => (url: string) => string;

  /**
   * Appends an 'm' to the end of an image file name.
   */
  getImageMedium: () => (url: string) => string;

  /**
   * Gets a public attribute value from the NFT metadata by
   * attribute name.
   * @returns The value of the attribute, or `null` if not found.
   */
  getPublicAttributeValue: () => (
    metaData: NftMetaData,
    attributeName: string
  ) => string | null;
}

/**
 * Actions for the NFT store.
 */
export interface NftStoreActions {
  /**
   * Sets items for a specific page and collection.
   */
  setCollectionItems: (
    page: number,
    items: NftMetaData[],
    collectionName: string
  ) => void;

  /**
   * Adds a new collection to the store.
   */
  addCollection: (collectionName: string) => void;

  /**
   * Removes a collection by its name.
   */
  removeCollection: (collectionName: string) => void;
}

/**
 * Type definition for the `useNftStore` Pinia store.
 */
export declare const useNftStore: StoreDefinition<
  'nftStore',
  NftStoreState,
  NftStoreGetters,
  NftStoreActions
>;
