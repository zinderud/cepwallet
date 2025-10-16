/**
 * Tauri API Wrapper
 * 
 * Bu dosya React frontend ile Rust backend arasındaki
 * IPC iletişimini sağlar.
 */

import { invoke } from '@tauri-apps/api/tauri';

// ============================================================================
// Types
// ============================================================================

export interface DeviceInfo {
  model: string;
  label?: string;
  firmware_version: string;
  vendor: string;
}

export interface TransactionRequest {
  to: string;
  value: string;
  data?: string;
  gas_limit?: string;
  gas_price?: string;
  nonce?: number;
  chain_id: number;
}

export interface PublicKey {
  public_key: string;
  address: string;
  chain_code: string;
  path: string;
}

// ============================================================================
// Device Commands
// ============================================================================

/**
 * Connect to Trezor device
 * @returns Device information
 */
export const connectDevice = async (): Promise<DeviceInfo> => {
  return invoke<DeviceInfo>('connect_device');
};

/**
 * Disconnect from Trezor device
 */
export const disconnectDevice = async (): Promise<void> => {
  return invoke<void>('disconnect_device');
};

/**
 * Get connected device information
 * @returns Device information
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  return invoke<DeviceInfo>('get_device_info');
};

// ============================================================================
// Wallet Commands
// ============================================================================

/**
 * Get public key for a derivation path
 * @param path BIP-44 derivation path (e.g., "m/44'/60'/0'/0/0")
 * @returns Public key hex string
 */
export const getPublicKey = async (path: string): Promise<string> => {
  return invoke<string>('get_public_key', { path });
};

/**
 * Get Ethereum address for a derivation path
 * @param path BIP-44 derivation path (e.g., "m/44'/60'/0'/0/0")
 * @returns Ethereum address
 */
export const getAddress = async (path: string): Promise<string> => {
  return invoke<string>('get_address', { path });
};

/**
 * Get multiple Ethereum addresses
 * @param startIndex Starting address index
 * @param count Number of addresses to retrieve
 * @returns Array of Ethereum addresses
 */
export const getAddresses = async (
  startIndex: number,
  count: number
): Promise<string[]> => {
  return invoke<string[]>('get_addresses', { startIndex, count });
};

// ============================================================================
// Transaction Commands
// ============================================================================

/**
 * Sign an Ethereum transaction
 * @param path BIP-44 derivation path
 * @param tx Transaction data
 * @returns Signed transaction hex string
 */
export const signTransaction = async (
  path: string,
  tx: TransactionRequest
): Promise<string> => {
  return invoke<string>('sign_transaction', { path, tx });
};

/**
 * Sign a message
 * @param path BIP-44 derivation path
 * @param message Message to sign
 * @returns Signature hex string
 */
export const signMessage = async (
  path: string,
  message: string
): Promise<string> => {
  return invoke<string>('sign_message', { path, message });
};

/**
 * Sign EIP-712 typed data
 * @param path BIP-44 derivation path
 * @param data Typed data object
 * @returns Signature hex string
 */
export const signTypedData = async (
  path: string,
  data: any
): Promise<string> => {
  return invoke<string>('sign_typed_data', { path, data });
};

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get default Ethereum address (index 0)
 * @returns Ethereum address
 */
export const getDefaultAddress = async (): Promise<string> => {
  return getAddress("m/44'/60'/0'/0/0");
};

/**
 * Get first N addresses
 * @param count Number of addresses (default: 10)
 * @returns Array of addresses
 */
export const getFirstAddresses = async (count: number = 10): Promise<string[]> => {
  return getAddresses(0, count);
};

// ============================================================================
// Export all
// ============================================================================

export const tauriApi = {
  // Device
  connectDevice,
  disconnectDevice,
  getDeviceInfo,
  
  // Wallet
  getPublicKey,
  getAddress,
  getAddresses,
  getDefaultAddress,
  getFirstAddresses,
  
  // Transactions
  signTransaction,
  signMessage,
  signTypedData,
};

export default tauriApi;
