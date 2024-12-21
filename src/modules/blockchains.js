export const blockchains = {
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    enabled: true,
    explorerName: 'Avascan Explorer',
    explorerUrl: 'https://avascan.info/',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    publicRpc: 'https://api.avax.network/ext/bc/C/rpc',
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    enabled: true,
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
    enabled: true,
    explorerName: 'Fantom Mainnet Explorer',
    explorerUrl: 'https://ftmscan.com/',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    publicRpc: 'https://rpcapi.fantom.network',
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    enabled: true,
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
