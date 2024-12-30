export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface BlockchainConfig {
  chainId: number;
  name: string;
  enabled?: boolean;
  explorerName: string;
  explorerUrl: string;
  nativeCurrency: NativeCurrency;
  publicRpc: string;
  altPublicRpc?: string[]; // Optional property for alternative RPC URLs
  iconUrl?: string; // Optional property for blockchains like Ethereum
}

/**
 * Object containing configuration for various blockchains.
 */
export declare const blockchains: Record<string, BlockchainConfig>;
