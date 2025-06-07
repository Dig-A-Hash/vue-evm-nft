# vue-evm-nft

This package provides reusable [Vue 3](https://vuejs.org/) composable functions, [Pinia](https://pinia.vuejs.org/) stores, and utilities for working with [ERC721](https://docs.openzeppelin.com/contracts/4.x/erc721) NFTs on [EVM-compatible ](https://ethereum.org/en/developers/docs/evm/)blockchains like [Ethereum](https://ethereum.org/en/), [Avalanche](https://www.avax.network/), [Polygon](https://polygon.technology/), [Binance Smart Chain](https://www.bnbchain.org/en/bnb-smart-chain) and more. This package supports TypeScript and JavaScript.

No API is needed, the blockchain is the API!

![](https://i.imgur.com/2lnsn52.jpg)

## Features

- The Web Browser makes calls directly to the blockchain.
- No Crypto wallet needed.
- List NFTs with Meta Data, token ID, and Owner.
- List all NFTs on a contract.
- List all NFTs on contract, that are held by a specific wallet.
- Paging through large collections.
- Sorting by Token ID.
- Local caching with Pinia.
- More efficient RPC Batch Call support.
- Utilities for working with NFT Meta Data structures.

## Dependencies

This package will work with the following dependencies in your app, if they are already included.

- [axios 1.8.2](https://github.com/axios/axios)
- [ethers.js 6.x](https://github.com/ethers-io/ethers.js/)
- [pinia 2.x or 3.x](https://github.com/vuejs/pinia)
- [vue 3.x](https://github.com/vuejs/core)

## Installation

You can install the package directly from npm:

```bash
npm install vue-evm-nft
```

# Docs

This project is free and open source, although it was originally built to work with [Dig-A-Hash Dynamic Meta Data Services](https://www.dig-a-hash.com). We build lots of websites that display NFTs, so these components are super useful to us. Some of these components can be used for any NFT project, on any EVM-compatible blockchain, while others will be exclusively for use with NFT collections using Dig-A-Hash Dynamic Meta Data.

## Examples

The repos and links below show example code on how to use this package in a Vue app with JavaScript & TypeScript.

### TypeScript

Repo - https://github.com/KidSysco/vuetify-nft-gallery-ts/tree/main

Demo - https://vuetify-nft-gallery-ts.vercel.app/

### JavaScript

Repo - https://github.com/Dig-A-Hash/vuetify-nft-gallery

## Package Contents

This package ships with 3 composables, 2 Pinia stores, and modules containing the ABI arrays for the various Dig-A-Hash NFT Smart Contracts.

Web 3 developers are expected to provide params for their own contracts, wallets, ABIs, and RPCs. Web 3 developers should have a solid working knowledge of the [Ethereum Virtual Machine (EVM)](https://ethereum.org/en/developers/docs/evm/), [Open Zeppelin](https://docs.openzeppelin.com/), [Vue](https://vuejs.org/), and [Pinia](https://pinia.vuejs.org/).

There are 2 main composables to use...

`useEvmNftGallery` - Can be used with any EVM-based NFT project.

`useEvmMetaDataGallery` - Can only be used with [Dig-A-Hash Dynamic Meta Data Services](https://www.dig-a-hash.com).

There are some other small differences below...

| Composable              | Fully Verify NFTs On-Chain | List Tokens in a Specific Wallet | List All Tokens on Contract | Get All Tokens in 1 Call | Large Page Sizes |
| ----------------------- | -------------------------- | -------------------------------- | --------------------------- | ------------------------ | ---------------- |
| `useEvmNftGallery`      | X                          | X                                | X                           |                          |                  |
| `useEvmMetaDataGallery` |                            |                                  | X                           | X                        | X                |

## useEvmNftGallery Composable

The `useEvmNftGallery` composable is designed to work with any NFT project displaying NFTs stored in EVM-based contracts. It allows sorting and pagination through NFTs while leveraging other composables (`useEvmNft` and `useEvmNftStore`) for local caching and utility functions.

This composable will get the Meta Data from the URL of every NFT as it is listed on-chain. So this composable can be used even if your NFTs do not use Dig-A-Hash dynamic Meta Data. This composable will be a little slower than useEvmMetaDataGallery, and public PRCs will enforce smaller page sizes (24 items per page or less). This composable cannot fetch all NFTs on a contract at once, blockchain RPCs simply do not serve that purpose well. However, the blockchain verification allows this composable to fetch NFTs from a specific wallet, or all NFTs on contract.

## Usage

```javascript
import {
  useEvmNftGallery,
  blockchains,
  dahDemoV1Abi as abi,
} from 'vue-evm-nft';

const { page, numberOfPages, nfts, isAscending, toggleSortOrder, isLoading } =
  useEvmNftGallery({
    contractPublicKey,
    contractAddress,
    abi: dahDemoV1Abi,
    chainId,
    holderPublicKey: null,
    rpc: blockchains.avalanche.publicRpc,
    itemsPerPage,
    nftStoreItemCollectionName,
    isAscendingSort: true,
  });
});
```

#### Configuration Object (config: EvmNftOptions)

- **`contractPublicKey`** (`string`): The public key of the wallet holding the NFT Smart Contract.
- **`contractAddress`** (`string`): The address of the NFT Smart Contract.
- **`abi`** (`array`): The NFT Smart Contract ABI (Application Binary Interface).
- **`chainId`** (`number`): The EVM Chain ID. Pass `null` if you are not using Dig-A-Hash meta data, then the composable will get the Meta Data from the token by making a call to the contract. Pass a chain ID if using Dig-A-Hash hosted meta data for improved performance when fetching meta data.
- **`holderPublicKey`** (`string`): (Optional) If provided, fetches NFTs owned by this wallet. If `null`, it will return all NFTs associated with the contract. Warning: If the contract has burned tokens, then passing null here will result in inaccurate counts and listings, the only option for this case is to pass a public Key instead (not null).
- **`rpc`** (`string`): The URL of the Ethers provider corresponding to the specified chain.
- **`itemsPerPage`** (`number`): The number of NFTs to display per page.
- **`nftStoreItemCollectionName`** (`string`): The name of the NFT store collection, used to reference the cache in Pinia. Use a unique name to be referenced later, whenever you need to access the cached NFTs in the store by page.
- **`isAscendingSort`** (`boolean`): Determines the starting sorting order of the NFTs. Set to `true` for ascending order, `false` for descending. Use onToggleSortOrder() to change the sort direction.

#### Returns an object containing:

- **`page`**: The current page of NFTs being displayed. Changing page will cause the component to fetch and store the new page of NFTs in Pinia. If the page has already been fetched, it will not fetch again until page refresh.
- **`numberOfPages`**: The total number of pages based on the number of items and the `itemsPerPage`specified in the params above.
- **`nfts`**: The current page of NFTs to be displayed.
- **`isAscending`**: The current sorting order of NFTs.
- **`toggleSortOrder`**: A function to toggle or change the sorting order of NFTs.
- **`isLoading`**: A boolean that will indicate whether or not the component is fetching. Create a vue watcher to track changes.
- **`loadingMessage`**: A string that will indicate exactly what the component is doing while isLoading is true. Create a vue watcher to track changes.
- **`getNftPage`**: An async function that takes a param indicating which page of NFTs to fetch from the contract. This is only a utility/convenience function that is not required. This function is not ready to fire until isLoading is true. Watch isLoading and do not fire getNftPage until isLoading has been set to false at least once. Most likely, you should just use the useEvmNft composable to get this function, unless you have already called this composable, because this composable will return the first page of NFTs regardless.
- **`getTokenOwner`**: An async function to get the current token holder wallet address. This is only a utility/convenience function that is not required. This function is not ready to fire until isLoading is true. Watch isLoading and do not fire getTokenMetaData until isLoading has been set to false at least once. Most likely, you should just use the useEvmNft composable to get this function, unless you have already called this composable, because this composable will return the first page of NFTs regardless.
- **`getTokenMetaData`**: An async function to get meta data for an array of Token Ids. This is only a utility/convenience function that is not required. If chain ID is not null, then we get the meta data without needing to access the blockchain at all because we use Dig-A-Hash predictable storage paths based on that chain ID. This function is not ready to fire until isLoading is true. Watch isLoading and do not fire getTokenMetaData until isLoading has been set to false at least once. Most likely, you should just use the useEvmNft composable to get this function, unless you have already called this composable, because this composable will return the first page of NFTs regardless.

## useEvmMetaDataGallery Composable

The `useEvmMetaDataGallery` composable is designed to work with NFT contracts using [Dig-A-Hash Dynamic Meta Data Services](https://www.dig-a-hash.com). It allows sorting and pagination through NFTs while leveraging other composables (`useEvmNft` and `useEvmNftStore`) for local caching and enhanced functionality.

This composable is similar to the useEvmNftGallery but this composable is designed to fetch NFT meta data with much less on-chain validation. This allows for faster fetching, and larger page sizes, including the ability to fetch all NFTs in one query. This composable cannot fetch NFTs from a specific wallet, and is designed only to fetch all NFTs on a contract.

## Usage

```javascript
import {
  useEvmMetaDataGallery,
  blockchains,
  dahDemoV1Abi as abi,
} from 'vue-evm-nft';

const { page, numberOfPages, nfts, isLoading, isAscending, toggleSortOrder } =
  useEvmMetaDataGallery({
    contractPublicKey,
    contractAddress,
    abi,
    chainId: blockchains.fantom.chainId,
    rpc: blockchains.fantom.publicRpc,
    itemsPerPage,
    nftStoreItemCollectionName,
    isAscendingSort: false,
    isGetAllNftQuery: false,
  });
```

#### Configuration Object (config: EvmMetaDataOptions)

- **`contractPublicKey`** (`string`): The public key of the wallet holding the contract.
- **`contractAddress`** (`string`): The address of the NFT contract.
- **`abi`** (`array`): The contract's ABI (Application Binary Interface).
- **`chainId`** (`number`): The EVM Chain ID. Pass `null` if you are not using Dig-A-Hash meta data, then the composable will get the Meta Dat from the token by making a call to the contract. Pass a chain ID if using Dig-A-Hash hosted meta data for improved performance when fetching meta data.
- **`rpc`** (`string`): The URL of the Ethers provider corresponding to the specified chain.
- **`itemsPerPage`** (`number`): The number of NFTs to display per page.
- **`nftStoreItemCollectionName`** (`string`): The name of the NFT store collection, used to reference the cache in Pinia. Use a unique name to be referenced later, whenever you need to access the cached NFTs in the store by page.
- **`isAscendingSort`** (`boolean`): Determines the starting sorting order of the NFTs. Set to `true` for ascending order, `false` for descending. Use onToggleSortOrder() to change the sort direction.
- **`isGetAllNftQuery`** (`boolean`): Set to `true` to get all NFTs back in the entire collection, this will be done in batches of `itemsPerPage`. `false` to get back pages of data with `itemsPerPage` items in each page.

#### Returns an object containing:

- **`page`**: The current page of NFTs being displayed. Changing page will cause the component to fetch and store the new page of NFTs in Pinia. If the page has already been fetched, it will not fetch again until page refresh.
- **`numberOfPages`**: The total number of pages based on the number of items and the `itemsPerPage`specified in the params above.
- **`nfts`**: The current page of NFTs to be displayed.
- **`isAscending`**: The current sorting order of NFTs.
- **`toggleSortOrder`**: A function to toggle or change the sorting order of NFTs.
- **`isLoading`**: A boolean that will indicate whether or not the component is fetching. Create a vue watcher to track changes.
- **`loadingMessage`**: A string that will indicate exactly what the component is doing while isLoading is true. Create a vue watcher to track changes.
- **`getNftPage`**: An async function that takes a param indicating which page of NFTs to fetch from the contract. This is only a utility/convenience function that is not required. This function is not ready to fire until isLoading is true. Watch isLoading and do not fire getNftPage until isLoading has been set to false at least once. Most likely, you should just use the useEvmNft composable to get this function, unless you have already called this composable, because this composable will return the first page of NFTs regardless.
- **`getTokenOwner`**: An async function to get the current token holder wallet address. This is only a utility/convenience function that is not required. This function is not ready to fire until isLoading is true. Watch isLoading and do not fire getTokenMetaData until isLoading has been set to false at least once. Most likely, you should just use the useEvmNft composable to get this function, unless you have already called this composable, because this composable will return the first page of NFTs regardless.
- **`getTokenMetaData`**: An async function to get meta data for an array of Token Ids. This is only a utility/convenience function that is not required. If chain ID is not null, then we get the meta data without needing to access the blockchain at all because we use Dig-A-Hash predictable storage paths based on that chain ID. This function is not ready to fire until isLoading is true. Watch isLoading and do not fire getTokenMetaData until isLoading has been set to false at least once. Most likely, you should just use the useEvmNft composable to get this function, unless you have already called this composable, because this composable will return the first page of NFTs regardless.

## useDahGallery Composable

This composable is exactly like the useEvmMetaDataGallery but this composable requires two new props to the config because there is absolutely no on-chain validation at all using this composable. This is the fastest, and most reliable method.

## Usage

```javascript
import {
  useEvmMetaDataGallery,
  blockchains,
  dahDemoV1Abi as abi,
} from 'vue-evm-nft';

const {
  page,
  numberOfPages,
  nfts,
  isLoading,
  isAscending,
  toggleSortOrder,
} = useDahGallery({
  contractPublicKey,
  contractAddress,
  abi,
  chainId: blockchains.fantom.chainId,
  rpc: blockchains.fantom.publicRpc,
  itemsPerPage,
  nftStoreItemCollectionName,
  isAscendingSort: false,
  isGetAllNftQuery: false,
  startTokenId: 0 // new
  supply: 500 // new
});
```

#### Configuration Object (config: DahGalleryOptions)

All items from the useEvmMetaDataGallery config object are used here the same way. Two new options must be specified below.

- **`startTokenId`**: A number indicating the starting token id for the collection, usually 0 or 1.
- **`supply`**: A number specifying the total supply count of all NFTs on contract.

## useEvmNft Composable

The useEvmNft composable is the core composable used internally by useEvmNftGallery, useEvmMetaDataGallery, and useDahGallery.

This composable can be used directly to create new composables or just to use the helper functions it exposes (examples below).

- **`pageSize`** (`number`): The number of NFTs to display per page.
- **`provider`** (`object`): The `ethers.js` provider instance.
- **`holderPublicKey`** (`string`): The public key of the NFT holder. Set to `null` to retrieve all NFTs on the contract.
- **`contractOwnerPublicKey`** (`string`): The public key of the contract owner.
- **`contractAddress`** (`string`): The contract address.
- **`contractABI`** (`array`): The ABI (Application Binary Interface) of the contract.
- **`chainId`** (`number`): The chain ID. Pass `null` if the metadata is not stored in the Dig-A-Hash pattern.
- **`excludeWallet`** (`string`): (Optional) The wallet to exclude from the list of NFTs.

#### Returns an object containing:

- **`getNfts`** (`function`): Fetches NFTs based on the current page, pagination size, and sorting order. There is no need for a watch when firing getTokenOwner from this composable.
- **`getTokenOwner`** (`function`): Retrieves the owner of a specific NFT. This composable is async, so it will not return until getTokenOwner is ready to fire. There is no need for a watch when firing getTokenOwner from this composable.
- **`getTokenMetaData`** (`function`): Retrieves metadata for specific token IDs. This composable is async, so it will not return until getTokenMetaData is ready to fire. There is no need for a watch when firing getTokenMetaData from this composable.
- **`loadingMessage`** (`ref`): A reactive reference to track the loading status message.

### Example Usage getTokenMetaData

Easily get Dig-A-Hash Meta Data for an array of NFTs using `getTokenMetaData`. Note that the ethers provider is not needed here, we are just fetching Meta Data using a simple http request, there will be no on-chain validation using this function.

```typescript
import { useEvmNft, type Nft } from 'vue-evm-nft';

const metaData = ref<Nft[]>([]);

onMounted(async () => {
  const evmNft = await useEvmNft(
    itemsPerPage, // This is ignored. Use any number.
    null, // null Ethers provider is faster.
    null,
    contractPublicKey,
    contractAddress,
    abi,
    chainId
  );

  metaData.value = await evmNft.getTokenMetaData([1]);
});
```

### Example Usage getTokenOwner

Get the current holder of the token using `getTokenOwner`. The ethers provider is needed here because we need to lookup the current holder on-chain.

```typescript
import { ethers } from 'ethers'; // import ethers 6
import { useEvmNft, type Nft } from 'vue-evm-nft';

const tokenOwner = ref('');

onMounted(async () => {
  const evmNft = await useEvmNft(
    itemsPerPage, // This is ignored. Use any number.
    new ethers.JsonRpcProvider(blockchains.avalanche.publicRpc),
    null,
    contractPublicKey,
    contractAddress,
    abi,
    chainId
  );

  tokenOwner.value = await evmNft.getTokenOwner(1);
});
```

## useNftStore Pinia Store

This Pinia store used internally by useEvmNftGallery but it can still be used directly. The `useNftStore` is a Pinia store used to manage collections of NFTs, their metadata, and associated image URLs. It allows for efficient retrieval and management of NFT attributes, including safe handling of different image sizes.

Refer to the various NFT collections in the store using nftStoreItemCollectionName.

#### State

- **`itemCollections`** (`object`): Stores NFT collections. Each collection is keyed by its name and contains the following properties:
  - **`items`** (`array`): An array of NFTs for each page.
  - **`itemCount`** (`number`): The total number of items in the collection.
  - **`page`** (`number`): The current page of items being viewed.

```
import {
  useEvmNftGallery,
  useEvmMetaDataGallery,
  blockchains,
  dahDemoV1Abi as abi,
  useNftStore,
} from 'vue-evm-nft';

const nftStore = useNftStore();

// page 1
nftStore.$state.itemCollections[nftStoreItemCollectionName].items[0];

// current page
nftStore.$state.itemCollections[nftStoreItemCollectionName].page;
```

#### Getters

- **`getNftUrl`** (`function`): Generates the URL for viewing an NFT on the website.

  - **Parameters**:
    - `tokenId` (`string`): The NFT's token ID.
    - `path` (`string`): The base path for the NFT page.
  - **Returns**: A URL string for the NFT.

- **`getImageLarge`** (`function`): Retrieves a large version of the NFT image if available, otherwise defaults to the NFT's standard image.

  - **Parameters**:
    - `metaData` (`object`): The NFT's metadata object.
  - **Returns**: The URL of the large image or the default image.

- **`getImageMedium`** (`function`): Retrieves a medium version of the NFT image if available, otherwise defaults to the NFT's standard image.

  - **Parameters**:
    - `metaData` (`object`): The NFT's metadata object.
  - **Returns**: The URL of the medium image or the default image.

- **`getPublicAttributeValue`** (`function`): Retrieves a specific attribute from the NFT's public metadata.
  - **Parameters**:
    - `metaData` (`object`): The NFT's metadata object.
    - `attributeName` (`string`): The name of the attribute to retrieve.
  - **Returns**: The value of the specified attribute or `null` if not found.

#### Actions

- **`setCollectionItems`** (`function`): Adds or updates items in a specific collection for a given page.

  - **Parameters**:
    - `page` (`number`): The page number to set.
    - `items` (`array`): The items to be added to the collection.
    - `collectionName` (`string`): The name of the collection.

- **`addCollection`** (`function`): Adds a new collection to the store.

  - **Parameters**:
    - `collectionName` (`string`): The name of the collection to add.

- **`removeCollection`** (`function`): Removes a collection from the store.
  - **Parameters**:
    - `collectionName` (`string`): The name of the collection to remove.

#### Example Usage

```javascript
import { useNftStore } from 'vue-evm-nft';

const nftStore = useNftStore();

// Add a new collection
nftStore.addCollection('myCollection');

// Set items for page 1 in the 'myCollection' collection
nftStore.setCollectionItems(1, [{ tokenId: 1, metaData: {} }], 'myCollection');

// Retrieve a large image URL for an NFT
const largeImageUrl = nftStore.getImageLarge(nft.metaData.image);

// Get a specific public attribute value from the NFT metadata
const attributeValue = nftStore.getPublicAttributeValue(nft.metaData, 'rarity');

// Remove a collection
nftStore.removeCollection('myCollection');
```

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

- **`dahDemoV1Abi`**: `import { dahDemoV1Abi } from 'vue-evm-nft';` - The ABI for the first NFT Smart Contract built to use Dig-A-Hash dynamic Meta Data. The Token ID starts at 1, and it uses a classic counter for Token IDs, costs more in gas than more modern versions. This contract supports public mints.

- **`dahNftV2Abi`**: `import { dahNftV2Abi } from 'vue-evm-nft';` - The ABI for the 2nd NFT Smart Contract built to use Dig-A-Hash dynamic Meta Data. The Token ID starts at 0, and it does not use counter so it is more gas efficient than the first version. This contract supports public mints.

### Contract Compatibility

This package works with standard NFT contracts following OpenZeppelin's [ERC721](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721) specifications. Custom contracts or contracts that deviate from these standards may require additional adjustments.

## Contributing

To contribute to this package, please fork the repository and submit a pull request with your changes. Make sure to test your changes locally before opening the pull request by using npm link as described above. PRs will only be merged after substantial local testing by the maintainer.

## License

This project is licensed under the ISC License.
