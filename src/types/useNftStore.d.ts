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
  getNftUrl: (
    tokenId: string | number,
    path: string
  ) => (tokenId: string | number, path: string) => string;

  /**
   * Appends an 'l' to the end of an image to get the large version from imgurl.
   */
  getImageLarge: (url: string) => (url: string) => string;

  /**
   * Appends an 'm' to the end of an image to get the large version from imgurl.
   */
  getImageMedium: (url: string) => (url: string) => string;

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
