# vue-evm-nft

This package provides reusable [Vue 3](https://vuejs.org/) composable functions, [Pinia](https://pinia.vuejs.org/) stores, and utilities for working with NFTs on [EVM-compatible ](https://ethereum.org/en/developers/docs/evm/)blockchains like [Ethereum](https://ethereum.org/en/), [Avalanche](https://www.avax.network/), [Polygon](https://polygon.technology/), [Binance Smart Chain](https://www.bnbchain.org/en/bnb-smart-chain) and more. 

No API is needed, the blockchain is the API!

![](https://i.imgur.com/IF9VaIa.jpg)

## Features

- The Web Browser makes calls directly to the blockchain.
- No Crypto wallet needed.
- List NFTs with Meta Data, token ID, and Owner.
- List all NFTs on a contract.
- List all NFTs on contract, that are held by a specific wallet.
- Paging through large collections.
- Sorting by Token ID with toggle.
- Local caching with Pinia.
- More efficient RPC Batch Call support. 
- Utilities for working with Meta Data structures.

## Dependencies

This package depends on other packages such as `axios`, `ethers.js`, `pinia`, and `vue`. Your project should already have these installed, this package has been tested with...

- axios 1.7.7
- ethers.js 6.13.3
- pinia 2.2.4
- vue 3.5.11

## Installation

You can install the package directly from npm:

```bash
npm install vue-evm-nft
```

# Docs
This project is free and open source, although it was originally built to work with [Dig-A-Hash Dynamic Meta Data Services](https://www.dig-a-hash.com). We build lots of websites that display NFTs, so this component was super useful to us. However, Dig-A-Hash specific settings have been removed from this package so that these components can be used for any NFT project, on any EVM-compatible blockchain. 

This package ships with 2 composables, 2 Pinia stores, and modules containing the ABI arrays for the various Dig-A-Hash NFT Smart Contracts.

## Usage

```javascript
import {
  useEvmNftGallery,
  blockchains,
  dahDemoV1Abi as abi,
} from 'vue-evm-nft';

const { page, numberOfPages, nfts, isAscending, onChangeSortOrder } =
  useEvmNftGallery(
    contractPublicKey,
    contractAddress,
    abi,
    chainId,
    null,
    blockchains.fantom.publicRpc,
    itemsPerPage,
    nftStoreCollectionName,
    false
  );
```

## Composables

### useEvmNftGallery

The `useEvmNftGallery` composable is designed to manage and display NFTs stored in EVM-based contracts. It allows sorting and pagination through NFTs while leveraging other composables (`useEvmNft` and `useEvmNftStore`) for local caching and enhanced functionality.

#### Parameters
- **`contractPublicKey`** (`string`): The public key of the wallet holding the contract.
- **`contractAddress`** (`string`): The address of the NFT contract.
- **`abi`** (`array`): The contract's ABI (Application Binary Interface).
- **`chainId`** (`number`): The EVM Chain ID. Pass `null` if using Dig-A-Hash hosted meta data for improved performance when fetching meta data.
- **`holderPublicKey`** (`string`): (Optional) If provided, fetches NFTs owned by this wallet. If `null`, it will return all NFTs associated with the contract.
- **`ethersProviderUrl`** (`string`): The URL of the Ethers provider corresponding to the specified chain.
- **`itemsPerPage`** (`number`): The number of NFTs to display per page.
- **`nftStoreItemCollectionName`** (`string`): The name of the NFT store collection.
- **`isAscendingSort`** (`boolean`): Determines the starting sorting order of the NFTs. Set to `true` for ascending order, `false` for descending. use onToggleSortOrder() to change the sort direction.

#### Returns and object containing...
- **`page`**: The current page of NFTs being displayed. Changing page will cause the component to fetch and store the new page of NFTs. If the page has already been fetched, it will not fetch again until page refresh.
- **`numberOfPages`**: The total number of pages based on the number of items and the `itemsPerPage`specified in the params above.
- **`nfts`**: The current page of NFTs to be displayed.
- **`isAscending`**: The current sorting order of NFTs.
- **`onToggleSortOrder`**: A function to toggle or change the sorting order of NFTs.
- **`isLoading`**: A boolean that will indicate whether or not the component is fetching. Create a vue watcher to track changes.
- **`nftLoadingMessage`**: A string that will indicate exactly what the component is doing while isLoading is true. Create a vue watcher to track changes.

## useEvmNft
This is used internally by useEvmNftGallery but it can still be used directly.

```
import { useEvmNft } from 'vue-evm-nft';
```

 Docs go here.

## useNftStore
This is the Pinia store used internally by useEvmNftGallery but it can still be used directly. 

```
import { useNftStore } from 'vue-evm-nft';
```

Docs go here.

## src/stores/nftHelperStore.js
This is a Pinia store that you can copy and place into the Pinia stores folder in your project, so this file cannot be imported. This file shows lots of good examples on how to create shortcut/helpers to the various bits of meta data attributes. This is a good way to extend the nftStore described above.

## Dig-A-Hash Specific Settings
There are still some Smart Contract ABI arrays that belong to Dig-A-Hash, but any ABI can be used. 

Dig-A-Hash uses a predictable pattern to store Meta-Data based on the contract address, the contract owners public key, chain ID, and token ID. So we do not need to lookup the Token URI with a call to the contract if the chainId is passed to useEvmNftGallery. This increases performance in fetching NFT Meta Data because we can easily derive the path to the Meta Data based on the predictable storage pattern as follows...

```
https://nft.dah-services.com/profiles/{ContractOwnerPublicKey}/meta-data/{ChainId}/{ContractAddress}/{TokenId}.json
```

While this is a very small performance improvement, all Dig-A-Hash specific settings can be easily ignored.

## blockchains
This is a JS module that contains info about the various blockchains in use (chainIds, blockchain explorer links, blockchain name, etc). Blockchains commonly used by Dig-A-Hash have been included, which you can use. This is not a comprehensive list.

```
import { blockchains } from 'vue-evm-nft';
```

## Dig-A-Hash Smart Contract ABIs
- **`dahDemoV1Abi`**: ```import { dahDemoV1Abi } from 'vue-evm-nft';``` - The ABI for the first NFT Smart Contract built to use Dig-A-Hash dynamic Meta Data. The Token ID starts at 1, and it uses a classic counter for Token IDs, costs more in gas than more modern versions. This contract supports public mints.

- **`dahNftV2Abi`**: ```import { dahNftV2Abi } from 'vue-evm-nft';``` - The ABI for the 2nd NFT Smart Contract built to use Dig-A-Hash dynamic Meta Data. The Token ID starts at 0, and it does not use counter so it is more gas efficient than the first version.  This contract supports public mints.

## Contributing
To contribute to this package, please fork the repository and submit a pull request with your changes. Make sure to test your changes locally before opening the pull request by using npm link as described above. PRs will only be merged after substantial local testing by the maintainer.

## License
This project is licensed under the ISC License.