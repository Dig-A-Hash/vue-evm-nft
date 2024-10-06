export const blockchains = {
  fantom: {
    chainId: 250,
    name: 'Fantom',
    enabled: true,
    isTestnet: false,
    env: 'Mainnet',
    explorerName: 'Fantom Mainnet Explorer',
    explorerUrl: 'https://ftmscan.com/',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    publicRpc: 'https://rpc.ankr.com/fantom/',
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    enabled: true,
    isTestnet: false,
    env: 'Mainnet',
    explorerName: 'SnowTrace Explorer',
    explorerUrl: 'https://snowtrace.io/',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    publicRpc: 'https://api.avax.network/ext/bc/C/rpc',
  },
  polygon: {
    chainId: import.meta.env.VITE_POLYGON_MAINNET_CHAIN_ID,
    name: 'Polygon',
    chainId: 137,
    enabled: true,
    isTestnet: false,
    env: 'Mainnet',
    explorerName: 'Polygon Explorer',
    explorerUrl: 'https://polygonscan.com/',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
    // publicRpc: 'https://rpc.ankr.com/polygon', // X
    publicRpc: 'https://polygon-rpc.com',
    // publicRpc: 'https://polygon.llamarpc.com',
    // publicRpc: 'https://1rpc.io/matic', //X
  },
};
