export const blockchains = {
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    explorer: {
      name: 'Avascan Explorer',
      baseUrl: 'https://avascan.info/',
      contractPathTemplate: 'blockchain/c/token/{contractAddress}',
      tokenPathTemplate: 'blockchain/c/erc721/{contractAddress}/nft/{tokenId}',
    },
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    publicRpc: 'https://api.avax.network/ext/bc/C/rpc',
  },
  bsc: {
    chainId: 56,
    name: 'Binance Smart Chain',
    explorer: {
      name: 'BSC Explorer',
      baseUrl: 'https://bscscan.com/',
      contractPathTemplate: 'token/{contractAddress}',
      tokenPathTemplate: 'token/{contractAddress}?a={tokenId}',
    },
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    publicRpc: 'https://bsc-dataseed1.defibit.io',
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    explorer: {
      name: 'EtherScan Explorer',
      baseUrl: 'https://etherscan.io/',
      contractPathTemplate: 'token/{contractAddress}',
      tokenPathTemplate: 'token/{contractAddress}?a={tokenId}',
    },
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    publicRpc: 'https://cloudflare-eth.com',
  },
  fantom: {
    chainId: 250,
    name: 'Fantom',
    explorer: {
      name: 'Fantom Explorer',
      baseUrl: 'https://ftmscan.com/',
      contractPathTemplate: 'token/{contractAddress}',
      tokenPathTemplate: 'token/{contractAddress}?a={tokenId}',
    },
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    publicRpc: 'https://rpcapi.fantom.network',
  },
  harmony: {
    chainId: 1666600000,
    name: 'Harmony One',
    explorer: {
      name: 'Harmony One Explorer',
      baseUrl: 'https://explorer.harmony.one/',
      contractPathTemplate: 'token/{contractAddress}',
      tokenPathTemplate: 'token/{contractAddress}/instance/{tokenId}',
    },
    nativeCurrency: {
      name: 'ONE',
      symbol: 'ONE',
      decimals: 18,
    },
    publicRpc: 'https://api.s0.b.hmny.io',
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    explorer: {
      name: 'Optimism Explorer',
      baseUrl: 'https://optimistic.etherscan.io/',
      contractPathTemplate: 'token/{contractAddress}',
      tokenPathTemplate: 'token/{contractAddress}?a={tokenId}',
    },
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    publicRpc: 'https://mainnet.optimism.io',
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    explorer: {
      name: 'Polygon Explorer',
      baseUrl: 'https://polygonscan.com/',
      contractPathTemplate: 'token/{contractAddress}',
      tokenPathTemplate: 'token/{contractAddress}?a={tokenId}',
    },
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
    publicRpc: 'https://polygon-rpc.com', // Batch size limit 8.
    altPublicRpc: [
      'https://rpc.ankr.com/polygon', // Batch size limit 8.
      'https://1rpc.io/matic', // Batch size limit 8.
      'https://polygon.llamarpc.com', // Batch size 28.
    ],
  },
};
