import test from 'ava';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useEvmNftGallery } from '../../src/composables/useEvmNftGallery';
import { useEvmMetaDataGallery } from '../../src/composables/useEvmMetaDataGallery';
import { blockchains } from '../../src/modules/blockchains';
import { dahDemoV1Abi } from '../../src/modules/dahDemoV1Abi';

let contractPublicKey = '0xcbb2a9868d73f24c056893131b97a69ffd36eba9'; // DAH
let contractAddress = '0x33f1cdD52e7ec6F65Ab93dD518c1e2EdB3a8Dd63'; // DAH - Roadmap - StartTokenId = 1
let chainId = blockchains.avalanche.chainId;
let itemsPerPage = 5;
let nftStoreItemCollectionName = 'nftSmartContract1';
const suspenseTemplate = '<Suspense><div></div></Suspense>';

test.beforeEach(() => {
  setActivePinia(createPinia());
});

test('should fetch page 1 of all NFTs on contract', async (t) => {
  const wrapper = mount(
    {
      setup() {
        const { nfts } = useEvmMetaDataGallery({
          contractPublicKey,
          contractAddress,
          abi: dahDemoV1Abi,
          chainId,
          rpc: blockchains.avalanche.publicRpc,
          itemsPerPage,
          nftStoreItemCollectionName,
          isAscendingSort: true,
          isGetAllNftQuery: false,
        });
        return { nfts };
      },
      template: suspenseTemplate,
    },
    {
      global: {
        plugins: [createPinia()],
      },
    }
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const nfts = wrapper.vm.nfts;
  // console.dir(nfts);
  // console.log('NFT list page 1:');
  // console.dir(nfts.map((item) => ({ tokenId: item.tokenId })));
  t.true(nfts.length === itemsPerPage);
  t.true(nfts[0].tokenId === 1);
  t.true(nfts[1].tokenId === 2);
  t.true(nfts[2].tokenId === 3);
  t.true(nfts[3].tokenId === 4);
  t.true(nfts[4].tokenId === 5);
  //
});

test('should fetch page 2 of all NFTs on contract', async (t) => {
  const wrapper = mount(
    {
      setup() {
        const { nfts, getNftPage } = useEvmMetaDataGallery({
          contractPublicKey,
          contractAddress,
          abi: dahDemoV1Abi,
          chainId,
          rpc: blockchains.avalanche.publicRpc,
          itemsPerPage,
          nftStoreItemCollectionName,
          isAscendingSort: true,
          isGetAllNftQuery: false,
        });

        return { nfts, getNftPage };
      },
      template: suspenseTemplate,
    },
    {
      global: {
        plugins: [createPinia()],
      },
    }
  );

  // Wait for initial data to load completely
  await flushPromises();
  await wrapper.vm.$nextTick();

  // Log the initial data for debugging purposes

  // console.log('Initial NFTs:', wrapper.vm.nfts);

  // Simulate changing the page, assuming there's a method or interaction that triggers the change.
  // If `getNftPage` is a method to manually trigger page fetching:
  await wrapper.vm.getNftPage(2);

  // Wait for the new page data to be fetched and processed
  await flushPromises();
  await wrapper.vm.$nextTick();

  // Log the data after fetching page 2
  const nfts = wrapper.vm.nfts;
  // console.log('NFT list after changing to page 2:');
  // console.dir(nfts.map((item) => ({ tokenId: item.tokenId })));
  // console.log('nfts: ', nfts);

  // Assert that the NFTs for page 2 have been fetched
  t.true(nfts.length === itemsPerPage);
  t.true(nfts[0].tokenId === 6);
  t.true(nfts[1].tokenId === 7);
  t.true(nfts[2].tokenId === 8);
  t.true(nfts[3].tokenId === 9);
  t.true(nfts[4].tokenId === 10);
});

test('should fetch page 1 of all NFTs on contract in desc order', async (t) => {
  const wrapper = mount(
    {
      setup() {
        const { nfts } = useEvmMetaDataGallery({
          contractPublicKey: '0x18582f2CA048ac5f22E5a64F92E8a7d7b1F806a4', // Dog plex
          contractAddress: '0x9c870E5B8724Db43E58Cd62C424E3071A3FB66E9', // Dog plex - dog show
          abi: dahDemoV1Abi,
          chainId: blockchains.fantom.chainId,
          rpc: blockchains.fantom.publicRpc,
          itemsPerPage: 24,
          nftStoreItemCollectionName: 'a1',
          isAscendingSort: false,
        });
        return { nfts };
      },
      template: suspenseTemplate,
    },
    {
      global: {
        plugins: [createPinia()],
      },
    }
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const nfts = wrapper.vm.nfts;
  //console.dir(nfts);
  // console.log('NFT list page 1:');
  // console.dir(nfts.map((item) => ({ tokenId: item.tokenId })));
  t.true(nfts.length === 6);
  t.true(nfts[0].tokenId === 6);
  t.true(nfts[1].tokenId === 5);
  t.true(nfts[2].tokenId === 4);
  t.true(nfts[3].tokenId === 3);
  t.true(nfts[4].tokenId === 2);
  t.true(nfts[5].tokenId === 1);
});

// This will not be supported. Keeping the test here for debugging and future purposes.

/*

test.skip('should fetch page 1 of all NFTs on contract with burned NFTs', async (t) => {
  const wrapper = mount(
    {
      setup() {
        const { nfts } = useEvmNftGallery({
          contractPublicKey: '0x5e44cEFFBeCaeCC0D75b3Be756d40726CE310608', // Urbanhomestead
          contractAddress: '0x186EE2C8D81183b6bB06368413bc03ed5aa8eF21', // Urbanhomestead - Products
          abi: dahDemoV1Abi,
          chainId: blockchains.avalanche.chainId,
          holderPublicKey: null,
          rpc: blockchains.avalanche.publicRpc,
          itemsPerPage: 24,
          nftStoreItemCollectionName: 'a1',
          isAscendingSort: false,
        });
        return { nfts };
      },
      template: suspenseTemplate,
    },
    {
      global: {
        plugins: [createPinia()],
      },
    }
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const nfts = wrapper.vm.nfts;
  //console.dir(nfts);
  // console.log('NFT list page 1:');
  // console.dir(nfts.map((item) => ({ tokenId: item.tokenId })));
  t.true(nfts.length > 0);
  // t.true(nfts[0].tokenId === 6);
  // t.true(nfts[1].tokenId === 5);
  // t.true(nfts[2].tokenId === 4);
  // t.true(nfts[3].tokenId === 3);
  // t.true(nfts[4].tokenId === 2);
  // t.true(nfts[5].tokenId === 1);
});

*/
