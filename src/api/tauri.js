/**
 * Tauri Backend API
 *
 * Type-safe wrapper for Tauri invoke commands
 */
import { invoke } from '@tauri-apps/api/core';
// ============================================================================
// Hardware Wallet API (Trezor)
// ============================================================================
export const trezorApi = {
  /**
     * Connect to Trezor device
     */
  connect: async () => {
    return invoke('connect_device');
  },
  /**
     * Disconnect from Trezor device
     */
  disconnect: async () => {
    return invoke('disconnect_device');
  },
  /**
     * Get device information
     */
  getDeviceInfo: async () => {
    return invoke('get_device_info');
  },
  /**
     * Get public key from device
     */
  getPublicKey: async (path) => {
    return invoke('get_public_key', { path });
  },
  /**
     * Get Ethereum address from device
     */
  getAddress: async (path) => {
    return invoke('get_address', { path });
  },
  /**
     * Get multiple addresses from device
     */
  getAddresses: async (startIndex, count) => {
    return invoke('get_addresses', { startIndex, count });
  },
  /**
     * Sign transaction with hardware wallet
     */
  signTransaction: async (tx) => {
    return invoke('sign_transaction', { tx });
  },
  /**
     * Sign message with hardware wallet
     */
  signMessage: async (message, path) => {
    return invoke('sign_message', { message, path });
  },
  /**
     * Sign typed data (EIP-712)
     */
  signTypedData: async (data, path) => {
    return invoke('sign_typed_data', { data, path });
  },
};
// ============================================================================
// Privacy API (RAILGUN)
// ============================================================================
export const privacyApi = {
  /**
     * Initialize privacy features (RAILGUN + Privacy Pools)
     */
  initialize: async (chainId) => {
    return invoke('initialize_privacy', { chainId });
  },
  /**
     * Check if privacy features are ready
     */
  isReady: async () => {
    return invoke('is_privacy_ready');
  },
  /**
     * Shield tokens (Public → Private)
     */
  shield: async (params) => {
    return invoke('shield_transaction', { ...params });
  },
  /**
     * Unshield tokens (Private → Public)
     */
  unshield: async (params) => {
    return invoke('unshield_transaction', { ...params });
  },
  /**
     * Private transfer (Private → Private)
     */
  transfer: async (params) => {
    return invoke('private_transfer', { ...params });
  },
  /**
     * Get shielded balance for a token
     */
  getShieldedBalance: async (token) => {
    return invoke('get_shielded_balance', { token });
  },
  /**
     * Scan merkletree for wallet balance updates
     */
  scanMerkletree: async (railgunWalletId) => {
    return invoke('scan_merkletree', { railgunWalletId });
  },
  /**
     * Join a privacy pool
     */
  joinPool: async (params) => {
    return invoke('join_privacy_pool', { ...params });
  },
  /**
     * Exit a privacy pool
     */
  exitPool: async (params) => {
    return invoke('exit_privacy_pool', { ...params });
  },
  /**
     * Perform privacy pool swap
     */
  poolSwap: async (params) => {
    return invoke('privacy_pool_swap', { ...params });
  },
  /**
     * Generate ZK proof
     */
  generateProof: async (params) => {
    return invoke('generate_zk_proof', { ...params });
  },
  /**
     * Estimate proof generation time
     */
  estimateProofTime: async (proofType) => {
    return invoke('estimate_proof_time', { proofType });
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
  createWallet: async (params) => {
    console.log('📡 Tauri API: create_railgun_wallet');
    console.log('  Input params:', params);
    // Tauri automatically converts camelCase → snake_case
    // So we send camelCase from TypeScript!
    const args = {
      encryptionKey: params.encryptionKey,
      mnemonic: params.mnemonic
    };
    console.log('  Sending (camelCase - Tauri will convert):', args);
    return invoke('create_railgun_wallet', args);
  },
  /**
     * Get shield private key for wallet
     *
     * @param railgunWalletId - RAILGUN wallet ID
     * @returns Shield private key (used for shield operations)
     */
  getShieldKey: async (params) => {
    console.log('📡 Tauri API: get_shield_key');
    console.log('  Input params:', params);
    console.log('  Sending to Tauri:', { railgunWalletId: params.railgunWalletId });
    try {
      const result = await invoke('get_shield_key', {
        railgunWalletId: params.railgunWalletId,
      });
      console.log('✅ Tauri response:', result);
      return result;
    }
    catch (error) {
      console.error('❌ Tauri invoke error:', error);
      throw error;
    }
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
