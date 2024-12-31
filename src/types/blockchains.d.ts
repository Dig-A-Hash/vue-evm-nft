export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface BlockchainExplorer {
  name: string;
  baseUrl: string;
  contractPathTemplate: string;
  tokenPathTemplate: string;
}

export interface BlockchainConfig {
  chainId: number;
  name: string;
  explorer: BlockchainExplorer;
  nativeCurrency: NativeCurrency;
  publicRpc: string;
  altPublicRpc?: string[]; // Optional property for alternative RPC URLs
}

/**
 * Object containing configuration for various blockchains.
 */
export declare const blockchains: Record<string, BlockchainConfig>;
