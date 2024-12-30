export const blockchains = {
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    explorerName: 'Avascan Explorer',
    explorerUrl: 'https://avascan.info/',
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
    explorerName: 'BSC Mainnet Explorer',
    explorerUrl: 'https://bscscan.com/',
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
    iconUrl: '/img/blockchain-logos/eth.png',
    explorerName: 'EtherScan Explorer',
    explorerUrl: 'https://etherscan.io/',
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
    explorerName: 'Fantom Mainnet Explorer',
    explorerUrl: 'https://ftmscan.com/',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    publicRpc: 'https://rpcapi.fantom.network',
  },
  harmony: {
    chainId: 1666600000,
    name: 'Harmony',
    explorerName: 'Harmony Testnet Explorer',
    explorerUrl: 'https://explorer.pops.one/',
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
    explorerName: 'Optimism Explorer',
    explorerUrl: 'https://optimistic.etherscan.io/',
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
    explorerName: 'Polygon Explorer',
    explorerUrl: 'https://polygonscan.com/',
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
