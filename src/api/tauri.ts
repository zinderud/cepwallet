/**
 * Tauri Backend API
 * 
 * Type-safe wrapper for Tauri invoke commands
 */

import { invoke } from '@tauri-apps/api/core';
// Local type for wallet creation parameters
interface WalletCreateParams {
  encryptionKey: string;
  mnemonic?: string;
}

import type {
  DeviceInfo,
  TransactionRequest,
  ShieldedTransaction,
  RailgunWallet,
  ShieldKeyResponse,
  InitializePrivacyParams,
  CreateRailgunWalletParams,
  GetShieldKeyParams,
  ShieldTransactionParams,
  UnshieldTransactionParams,
  PrivateTransferParams,
  GetShieldedBalanceParams,
  JoinPrivacyPoolParams,
  ExitPrivacyPoolParams,
  PrivacyPoolSwapParams,
  GenerateZKProofParams,
  EstimateProofTimeParams,
  PrivacyPoolOperation,
  WalletCreateResponse,
  ShieldPrivateKeyResponse,
} from '../types';

// ============================================================================
// Hardware Wallet API (Trezor)
// ============================================================================

export const trezorApi = {
  /**
   * Connect to Trezor device
   */
  connect: async (): Promise<DeviceInfo> => {
    return invoke<DeviceInfo>('connect_device');
  },

  /**
   * Disconnect from Trezor device
   */
  disconnect: async (): Promise<void> => {
    return invoke('disconnect_device');
  },

  /**
   * Get device information
   */
  getDeviceInfo: async (): Promise<DeviceInfo> => {
    return invoke<DeviceInfo>('get_device_info');
  },

  /**
   * Get public key from device
   */
  getPublicKey: async (path: string): Promise<string> => {
    return invoke<string>('get_public_key', { path });
  },

  /**
   * Get Ethereum address from device
   */
  getAddress: async (path: string): Promise<string> => {
    return invoke<string>('get_address', { path });
  },

  /**
   * Get multiple addresses from device
   */
  getAddresses: async (startIndex: number, count: number): Promise<string[]> => {
    return invoke<string[]>('get_addresses', { startIndex, count });
  },

  /**
   * Sign transaction with hardware wallet
   */
  signTransaction: async (tx: TransactionRequest): Promise<string> => {
    return invoke<string>('sign_transaction', { tx });
  },

  /**
   * Sign message with hardware wallet
   */
  signMessage: async (message: string, path: string): Promise<string> => {
    return invoke<string>('sign_message', { message, path });
  },

  /**
   * Sign typed data (EIP-712)
   */
  signTypedData: async (data: any, path: string): Promise<string> => {
    return invoke<string>('sign_typed_data', { data, path });
  },
};

// ============================================================================
// Privacy API (RAILGUN)
// ============================================================================

export const privacyApi = {
  /**
   * Initialize privacy features (RAILGUN + Privacy Pools)
   */
  initialize: async (chainId: number): Promise<void> => {
    return invoke('initialize_privacy', { chainId });
  },

  /**
   * Check if privacy features are ready
   */
  isReady: async (): Promise<boolean> => {
    return invoke<boolean>('is_privacy_ready');
  },

  /**
   * Shield tokens (Public → Private)
   */
  shield: async (params: ShieldTransactionParams): Promise<ShieldedTransaction> => {
    return invoke<ShieldedTransaction>('shield_transaction', { ...params });
  },

  /**
   * Unshield tokens (Private → Public)
   */
  unshield: async (params: UnshieldTransactionParams): Promise<ShieldedTransaction> => {
    return invoke<ShieldedTransaction>('unshield_transaction', { ...params });
  },

  /**
   * Private transfer (Private → Private)
   */
  transfer: async (params: PrivateTransferParams): Promise<ShieldedTransaction> => {
    return invoke<ShieldedTransaction>('private_transfer', { ...params });
  },

  /**
   * Get shielded balance for a token
   */
  getShieldedBalance: async (token: string): Promise<string> => {
    return invoke<string>('get_shielded_balance', { token });
  },

  /**
   * Join a privacy pool
   */
  joinPool: async (params: JoinPrivacyPoolParams): Promise<PrivacyPoolOperation> => {
    return invoke<PrivacyPoolOperation>('join_privacy_pool', { ...params });
  },

  /**
   * Exit a privacy pool
   */
  exitPool: async (params: ExitPrivacyPoolParams): Promise<PrivacyPoolOperation> => {
    return invoke<PrivacyPoolOperation>('exit_privacy_pool', { ...params });
  },

  /**
   * Perform privacy pool swap
   */
  poolSwap: async (params: PrivacyPoolSwapParams): Promise<PrivacyPoolOperation> => {
    return invoke<PrivacyPoolOperation>('privacy_pool_swap', { ...params });
  },

  /**
   * Generate ZK proof
   */
  generateProof: async (params: GenerateZKProofParams): Promise<string> => {
    return invoke<string>('generate_zk_proof', { ...params });
  },

  /**
   * Estimate proof generation time
   */
  estimateProofTime: async (proofType: string): Promise<number> => {
    return invoke<number>('estimate_proof_time', { proofType });
  },
};

// ============================================================================
// RAILGUN Wallet Management API
// ============================================================================

export const railgunWalletApi = {
  /**
   * Create a new RAILGUN wallet
   * 
   * @param encryptionKey - 32-byte hex string (66 chars with 0x prefix)
   * @param mnemonic - Optional mnemonic phrase (generates new if not provided)
   * @returns Wallet information including ID, address, and mnemonic
   */
  createWallet: async (params: WalletCreateParams): Promise<WalletCreateResponse> => {
    console.log('📡 Tauri API: create_railgun_wallet');
    console.log('  Input params:', params);
    
    // Tauri automatically converts camelCase → snake_case
    // So we send camelCase from TypeScript!
    const args = {
      encryptionKey: params.encryptionKey,
      mnemonic: params.mnemonic
    };
    console.log('  Sending (camelCase - Tauri will convert):', args);
    
    return invoke<WalletCreateResponse>('create_railgun_wallet', args);
  },

  /**
   * Get shield private key for a RAILGUN wallet
   * 
   * @param railgunWalletId - RAILGUN wallet ID
   * @returns Shield private key (used for shield operations)
   */
  getShieldKey: async (params: GetShieldKeyParams): Promise<ShieldPrivateKeyResponse> => {
    return invoke<ShieldPrivateKeyResponse>('get_shield_key', {
      railgunWalletId: params.railgunWalletId,
    });
  },
};

// ============================================================================
// Unified API Export
// ============================================================================

export const tauriApi = {
  trezor: trezorApi,
  privacy: privacyApi,
  railgunWallet: railgunWalletApi,
};

export default tauriApi;
