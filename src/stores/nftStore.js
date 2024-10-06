import { defineStore } from 'pinia';

/**
 * Gets the specified public meta-data attribute value or the NFT image if
 * the  meta-data attribute value does not exist. This is used to
 * get smaller versions of the original image from meta-data
 * attributes.
 * @param {object} metaData - The NFT meta-data.
 * @param {object} propertyName - The NFT meta-data property name.
 * @returns A value from the meta-data.
 */
function metaDataAttributeValueOrImage(metaData, propertyName) {
  return (
    metaData?.attributes?.find((item) => {
      return item.trait_type?.toLowerCase() === propertyName.toLowerCase();
    })?.value || metaData.image
  );
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
     * Gets the NFT URL for viewing on this website.
     * @returns
     */
    getNftUrl: () => {
      return (tokenId, path) => `/${path}/${tokenId}`;
    },

    // NFT Meta Data Attributes

    /**
     * Gets a large version of the image if specified, otherwise the default NFT image.
     * This is a safe, and efficient way to call for images.
     * @returns An image URL.
     */
    getImageLarge: () => {
      return (metaData) => {
        return metaDataAttributeValueOrImage(metaData, 'url-large');
      };
    },
    /**
     * Gets a medium version of the image if specified, otherwise the default NFT image.
     * This is a safe, and efficient way to call for images.
     * @returns An image URL.
     */
    getImageMedium: () => {
      return (metaData) => {
        return metaDataAttributeValueOrImage(metaData, 'url-medium');
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
