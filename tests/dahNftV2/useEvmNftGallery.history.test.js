import test from 'ava';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useEvmNftGallery } from '../../src/composables/useEvmNftGallery';
import { blockchains } from '../../src/modules/blockchains';
import { dahNftV2Abi } from '../../src/modules/dahNftV2Abi';

let contractPublicKey = '0x18582f2CA048ac5f22E5a64F92E8a7d7b1F806a4';
let contractAddress = '0x9c870E5B8724Db43E58Cd62C424E3071A3FB66E9';
let chainId = blockchains.polygon.chainId;
let itemsPerPage = 5;
let nftStoreCollectionName = 'nftSmartContract1';
const suspenseTemplate = '<Suspense><div></div></Suspense>';

test.beforeEach(() => {
  setActivePinia(createPinia());
});

test('should fetch page 1 of all NFTs on contract', async (t) => {
  const wrapper = mount(
    {
      setup() {
        const { nfts } = useEvmNftGallery(
          contractPublicKey,
          contractAddress,
          dahNftV2Abi,
          chainId,
          null,
          blockchains.polygon.publicRpc,
          itemsPerPage,
          nftStoreCollectionName,
          true
        );
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
  t.true(nfts[0].tokenId === 0);
  t.true(nfts[1].tokenId === 1);
  t.true(nfts[2].tokenId === 2);
  t.true(nfts[3].tokenId === 3);
  t.true(nfts[4].tokenId === 4);
  //
});

test('should fetch page 2 of all NFTs on contract', async (t) => {
  itemsPerPage = 5;
  const wrapper = mount(
    {
      setup() {
        const { nfts, onGetMyNfts } = useEvmNftGallery(
          contractPublicKey,
          contractAddress,
          dahNftV2Abi,
          chainId,
          null,
          blockchains.polygon.publicRpc, // otherwise batch too large
          itemsPerPage,
          nftStoreCollectionName,
          true
        );

        return { nfts, onGetMyNfts };
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

  // Simulate changing the page, assuming there's a method or interaction that triggers the change.
  // If `onGetMyNfts` is a method to manually trigger page fetching:
  await wrapper.vm.onGetMyNfts(2);

  // Wait for the new page data to be fetched and processed
  await flushPromises();
  await wrapper.vm.$nextTick();

  // Log the data after fetching page 2
  const nfts = wrapper.vm.nfts;
  // console.log('NFT list after changing to page 2:');
  // console.dir(nfts.map((item) => ({ tokenId: item.tokenId })));

  // Assert that the NFTs for page 2 have been fetched
  t.true(nfts.length === itemsPerPage);
  // t.true(nfts[0].tokenId === 5);
  // t.true(nfts[1].tokenId === 6);
  // t.true(nfts[2].tokenId === 7);
  // t.true(nfts[3].tokenId === 8);
  // t.true(nfts[4].tokenId === 9);
});
