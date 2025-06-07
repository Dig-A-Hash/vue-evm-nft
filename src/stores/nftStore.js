import { defineStore } from 'pinia';
import { DIG_A_HASH_BASE_URL } from '../modules/constants.js';

/**
 * Gets the base URL for all DAH meta data.
 * @param {string} contractPublicKey
 * @param {number} chainId
 * @param {string} contractAddress
 * @returns a string of the base URL without a token ID.
 */
function deriveMetaDataBaseUrl(contractPublicKey, chainId, contractAddress) {
  return `${DIG_A_HASH_BASE_URL}profiles/${contractPublicKey.toLowerCase()}/meta-data/${chainId}/${contractAddress.toLowerCase()}/`;
}

/**
 * Defines the nftStore.
 * NFTs are kept in at least one array per contract, so all items
 * in itemCollections can be named arbitrarily, but you will need
 * to reference them properly in the app.
 */
export const useNftStore = defineStore('nftStore', {
  state: () => ({
    itemCollections: {},
  }),

  getters: {
    /**
     * Gets the Blockchain Explorer URL for an NFT.
     * @returns URL for viewing the NFT on the blockchain explorer.
     */
    explorerTokenUrl: () => {
      return (tokenId, contractAddress, blockchainConfig) => {
        tokenId = tokenId.toString();
        return `${
          blockchainConfig.explorer.baseUrl
        }${blockchainConfig.explorer.tokenPathTemplate
          .replace('{contractAddress}', contractAddress)
          .replace('{tokenId}', tokenId)}`;
      };
    },

    /**
     * Gets the Blockchain Explorer URL for a Smart Contract.
     * @returns URL for viewing the Smart Contract on the blockchain explorer.
     */
    explorerContractUrl: () => {
      return (contractAddress, blockchainConfig) => {
        return `${
          blockchainConfig.explorer.baseUrl
        }${blockchainConfig.explorer.contractPathTemplate.replace(
          '{contractAddress}',
          contractAddress
        )}`;
      };
    },

    /**
     * Gets a path (no base URL) to the NFT item on this website,
     * used for creating QR Codes linking directly to items.
     * @param tokenId - The token ID of the NFT item.
     * @param nftStoreItemCollectionName - The name of the collection.
     * @returns A website path to the NFT item. This path will
     * still need a base URL prepended.
     */
    nftPath: () => {
      return (tokenId, nftStoreItemCollectionName) =>
        `${nftStoreItemCollectionName}/${tokenId.toString()}`;
    },

    /**
     * Gets a base URL to the NFT meta-data. This is only for use with  Dig-A-Hash Meta Data.
     * @param contractPublicKey - The public key of the contract.
     * @param chainId - The chain ID of the contract.
     * @param contractAddress - The address of the contract.
     * @returns The Dig-A-Hash Meta Data Base URL. This result will
     * still need a token id appended.
     */
    digaMetaDataBaseUrl: () => {
      return (contractPublicKey, chainId, contractAddress) => {
        return deriveMetaDataBaseUrl(
          contractPublicKey,
          chainId,
          contractAddress
        );
      };
    },

    /**
     * Gets a full URL to the NFT meta-data. This is only for use with  Dig-A-Hash Meta Data.
     * @param tokenId - The token ID of the NFT item.
     * @param contractPublicKey - The public key of the contract.
     * @param chainId - The chain ID of the contract.
     * @param contractAddress - The address of the contract.
     * @returns The Dig-A-Hash Meta Data URL.
     */
    digaMetaDataUrl: () => {
      return (tokenId, contractPublicKey, chainId, contractAddress) => {
        return `${deriveMetaDataBaseUrl(
          contractPublicKey,
          chainId,
          contractAddress
        )}${tokenId}.json`;
      };
    },

    /**
     * Gets the medium image URL by appending "m" to the file name.
     * @returns - The image URL with an "m" appended to the file name.
     */
    getImageMedium: () => {
      return (url) => {
        try {
          const lastDotIndex = url.lastIndexOf('.');

          // If there's no extension, just add "m" to the file name
          if (lastDotIndex === -1) {
            return url + 'm';
          }

          // Split the name and extension
          const namePart = url.substring(0, lastDotIndex);
          const extensionPart = url.substring(lastDotIndex);

          // Add "m" to the name part, keep the extension as is
          return `${namePart}m${extensionPart}`;
        } catch (error) {
          return url;
        }
      };
    },

    /**
     * Gets the medium image URL by appending "l" to the file name.
     * @returns - The image URL with an "l" appended to the file name.
     */
    getImageLarge: () => {
      return (url) => {
        try {
          const lastDotIndex = url.lastIndexOf('.');

          // If there's no extension, just add "l" to the file name
          if (lastDotIndex === -1) {
            return url + 'l';
          }

          // Split the name and extension
          const namePart = url.substring(0, lastDotIndex);
          const extensionPart = url.substring(lastDotIndex);

          // Add "l" to the name part, keep the extension as is
          return `${namePart}l${extensionPart}`;
        } catch (error) {
          return url;
        }
      };
    },
    /**
     * Gets the specified public meta-data attributes value.
     * @param {object} metaData - The NFT meta-data.
     * @param {object} attributeName - The NFT meta-data attribute name.
     * @returns A value from the meta-data attributes.
     */
    getPublicAttributeValue: () => {
      return (metaData, attributeName) => {
        return (
          metaData?.attributes?.find((item) => {
            return (
              item.trait_type?.toLowerCase() === attributeName.toLowerCase()
            );
          })?.value || null
        );
      };
    },
  },
  actions: {
    setCollectionItems(page, items, collectionName) {
      this.itemCollections[collectionName].items[page - 1] = items;
    },
    /**
     * Adds a new collection of NFTs to the store.
     * @param {*} collectionName - The collection name.
     */
    addCollection(collectionName) {
      if (!this.itemCollections[collectionName]) {
        this.itemCollections[collectionName] = {
          items: [],
          itemCount: 0, // Total number of items.
          page: 1,
        };
      }
    },
    /**
     * Removes a collection by name
     * @param {*} collectionName - The name of collection to remove.
     */
    removeCollection(collectionName) {
      if (this.itemCollections[collectionName]) {
        delete this.itemCollections[collectionName];
      }
    },
  },
});
