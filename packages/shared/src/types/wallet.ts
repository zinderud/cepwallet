import { BigNumberish } from 'ethers';

/** Wallet types */
export type WalletType = 'hardware' | 'software' | 'multi-sig';

/** Account types */
export type AccountType = 'standard' | 'custom' | 'ledger' | 'trezor';

/** Network types */
export type NetworkType = 'mainnet' | 'sepolia' | 'localhost' | 'polygon' | 'arbitrum';

/** Chain configuration */
export interface ChainConfig {
  id: number;
  name: string;
  type: NetworkType;
  rpc: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/** Account interface */
export interface Account {
  id: string;
  type: AccountType;
  address: string;
  publicKey: string;
  name: string;
  balance: {
    value: bigint;
    formatted: string;
  };
  chainId: number;
  path?: string; // BIP44 path (e.g., "m/44'/60'/0'/0/0")
  createdAt: Date;
}

/** Wallet state */
export interface WalletState {
  connected: boolean;
  type: WalletType;
  accounts: Account[];
  selectedAccount: Account | null;
  selectedChain: ChainConfig;
  networks: ChainConfig[];
  isLoading: boolean;
  error: string | null;
}

/** Wallet initialization options */
export interface WalletInitOptions {
  type: WalletType;
  network?: NetworkType;
  autoConnect?: boolean;
  derivationPath?: string;
}

/** Token interface */
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logo?: string;
  balance?: bigint;
}

/** Balance info */
export interface BalanceInfo {
  native: {
    value: bigint;
    formatted: string; // in ETH
  };
  tokens: {
    [tokenAddress: string]: {
      value: bigint;
      formatted: string;
    };
  };
}
