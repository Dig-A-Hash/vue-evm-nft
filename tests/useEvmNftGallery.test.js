import test from 'ava';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useEvmNftGallery } from '../src/composables/useEvmNftGallery';
import { blockchains } from '../src/modules/blockchains';
import { dahDemoV1Abi } from '../src/modules/dahDemoV1Abi';

let walletPublicKey = '0x5e44ceffbecaecc0d75b3be756d40726ce310608';
let contractAddress = '0x186EE2C8D81183b6bB06368413bc03ed5aa8eF21';
let chainId = blockchains.avalanche.chainId;
let itemsPerPage = 24;
let nftStoreCollectionName = 'nftSmartContract1';

test.beforeEach(() => {
  setActivePinia(createPinia());
});

test('useEvmNftGallery fetches NFT Meta Data', async (t) => {
  const wrapper = mount(
    {
      setup() {
        const { nfts } = useEvmNftGallery(
          walletPublicKey,
          contractAddress,
          dahDemoV1Abi,
          chainId,
          walletPublicKey,
          blockchains.avalanche.publicRpc,
          itemsPerPage,
          nftStoreCollectionName,
          true
        );
        return { nfts };
      },
      template: '<Suspense><div></div></Suspense>', // Wrap in Suspense
    },
    {
      global: {
        plugins: [createPinia()],
      },
    }
  );

  // Wait for promises to resolve
  await flushPromises();
  await wrapper.vm.$nextTick(); // Ensure Vue's reactivity system is updated
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay to wait for network requests

  // Ensure Vue has processed all changes
  await wrapper.vm.$nextTick(); // Trigger another reactivity update if needed

  // Assert that the NFTs are now populated
  t.true(wrapper.vm.nfts.length > 0);
});
