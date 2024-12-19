import { StoreDefinition } from 'pinia';

interface MetaDataAttribute {
  trait_type: string;
  value: string;
}

export interface NftMetaData {
  image: string;
  name: string;
  tokenId?: number;
  description: string;
  attributes?: MetaDataAttribute[];
}

export interface NftCollection {
  items: Record<number, NftMetaData[]>; // Items are stored by page number.
  itemCount: number; // Total number of items in the collection.
  page: number; // Current page of the collection.
}

export interface NftStoreState {
  itemCollections: Record<string, NftCollection>; // Collections stored by collection name.
}

export interface NftStoreGetters {
  /**
   * Gets the URL for an NFT based on its token ID and path.
   */
  getNftUrl: (tokenId: string | number, path: string) => string;

  /**
   * Gets a large image URL for an NFT if available, otherwise the default NFT image.
   */
  getImageLarge: (metaData: NftMetaData) => string;

  /**
   * Gets a medium image URL for an NFT if available, otherwise the default NFT image.
   */
  getImageMedium: (metaData: NftMetaData) => string;

  /**
   * Gets a public attribute value from the NFT metadata.
   */
  getPublicAttributeValue: () => (
    metaData: NftMetaData,
    attributeName: string
  ) => string | null;
}

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
