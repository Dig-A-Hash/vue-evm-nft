import { defineStore } from 'pinia';
import { useNftStore } from 'vue-evm-nft';

const nftStore = useNftStore();

/**
 * Gets the base URL for all DAH meta data.
 * @param {string} walletPublicKey
 * @param {number} chainId
 * @param {string} contractAddress
 * @returns a string of the base URL without a token ID.
 */
function deriveMetaDataBaseUrl(walletPublicKey, chainId, contractAddress) {
  return `${
    import.meta.env.VITE_DAH_NFT_CDN
  }profiles/${walletPublicKey.toLowerCase()}/meta-data/${chainId}/${contractAddress.toLowerCase()}/`;
}

/**
 * This is intended to be customized to create helpers for NFT
 * meta data. This file is not referenced in this package because it
 * is intended to be copied, and pasted into your own Pinia stores folder.
 */
export const useNftHelperStore = defineStore('nftHelperStore', {
  state: () => ({}),

  getters: {
    // NFT Meta Data Attributes
    nftFtmScanUrl: (state) => {
      return (tokenId) => {
        return `https://ftmscan.com/token/${
          import.meta.env.VITE_POUR_HOUSE_CONTRACT
        }?a=${tokenId}`;
      };
    },
    nftUrl: () => {
      return (tokenId, artistPathName) =>
        `${import.meta.env.VITE_SITE_URL}${artistPathName}/${tokenId}`;
    },
    metaDataBaseUrl: () => {
      return (walletPublicKey, chainId, contractAddress) => {
        return deriveMetaDataBaseUrl(walletPublicKey, chainId, contractAddress);
      };
    },
    metaDataUrl: () => {
      return (tokenId, walletPublicKey, chainId, contractAddress) => {
        return `${deriveMetaDataBaseUrl(
          walletPublicKey,
          chainId,
          contractAddress
        )}${tokenId}.json`;
      };
    },
    getAge: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'age');
      };
    },
    getDateAdded: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'date-added');
      };
    },
    getBreed: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'breed');
      };
    },
    getLike1: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'like-1');
      };
    },
    getDislike1: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'dislike-1');
      };
    },
    getSex: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'sex');
      };
    },
    isMale: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'sex') === 'male';
      };
    },
    getTraining: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'training');
      };
    },
    getTricks: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'tricks');
      };
    },
    getObedienceHumanId: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(
          metaData,
          'obedience-humans-id'
        );
      };
    },
    getObedienceDogsId: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'obedience-dogs-id');
      };
    },
    getChipped: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'chipped');
      };
    },
    getPersonalityId: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'personality-id');
      };
    },
    getFromLocation: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'from-location');
      };
    },
    getVaccinationIds: () => {
      return (metaData) => {
        return nftStore.getPublicAttributeValue(metaData, 'vaccinations');
      };
    },
    getBathAndBrushPrice: () => {
      return (metaData) => {
        return parseFloat(
          nftStore.getPublicAttributeValue(metaData, 'Bath and Brush')
        ).toFixed(2);
      };
    },
    getSaniAndBathPrice: () => {
      return (metaData) => {
        return parseFloat(
          nftStore.getPublicAttributeValue(metaData, 'Sani and Bath')
        ).toFixed(2);
      };
    },
    getFullGroomPrice: () => {
      return (metaData) => {
        return parseFloat(
          nftStore.getPublicAttributeValue(metaData, 'Full Groom')
        ).toFixed(2);
      };
    },
    getLevelColor: () => {
      return (level) => {
        switch (parseInt(level)) {
          case 1:
            return 'red-accent-2';
          case 2:
            return 'amber-accent-2';
          case 3:
            return 'light-green-accent-3';
          default:
            return 'white';
        }
      };
    },
    getSexColor: (state) => {
      return (metaData) => {
        const is_Male = state.isMale(metaData);
        return is_Male ? 'text-blue-accent-1' : 'text-pink-accent-2';
      };
    },
  },
});
