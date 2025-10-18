/**
 * Trezor + RAILGUN Integration Type Definitions
 * 
 * ⚠️ CRITICAL SECURITY NOTE:
 * Private keys are NEVER exported from Trezor device.
 * All key derivation uses deterministic encryption (SLIP-0011).
 */

/**
 * Trezor device information
 */
export interface DeviceInfo {
  connected: boolean;
  model: string;
  session: string | null;
  firmwareVersion?: string;
}

/**
 * Wallet info after Secret Wallet activation
 */
export interface WalletInfo {
  isSecretWallet: boolean;
  address: string;
  path: string;
  deviceState: string;
}

/**
 * RAILGUN key set derived from Trezor
 * 
 * ⚠️ These are DERIVED encryption keys, NOT private keys!
 * Private keys remain in Trezor Secure Element.
 */
export interface RailgunKeySet {
  /**
   * Spending key for authorizing transactions
   * Derived via cipherKeyValue("RAILGUN_SPENDING_KEY")
   */
  spendingKey: string; // 32-byte hex

  /**
   * Viewing key for audit/read-only access
   * Derived via cipherKeyValue("RAILGUN_VIEWING_KEY")
   */
  viewingKey: string; // 32-byte hex

  /**
   * Nullifying key for privacy operations
   * Derived via cipherKeyValue("RAILGUN_NULLIFYING_KEY")
   */
  nullifyingKey: string; // 32-byte hex

  /**
   * Unique wallet identifier
   */
  walletId: string;

  /**
   * Timestamp of creation
   */
  createdAt?: number;
}

/**
 * Transaction request for Trezor signing
 */
export interface TransactionRequest {
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: string;
  data?: string;
  chainId: number;
}

/**
 * Signed transaction from Trezor
 */
export interface SignedTransaction {
  r: string;
  s: string;
  v: string;
}

/**
 * Trezor session state
 */
export interface TrezorSessionState {
  isConnected: boolean;
  isUnlocked: boolean;
  isSecretWallet: boolean;
  address: string | null;
  deviceModel: string | null;
  sessionId: string | null;
  sessionStartTime: number | null;
  lastActivityTime: number | null;
}

/**
 * Key derivation purpose
 */
export type KeyPurpose = 'spending' | 'viewing' | 'nullifying';

/**
 * Trezor Connect cipherKeyValue parameters
 */
export interface CipherKeyValueParams {
  path: string; // BIP-32 derivation path
  key: string; // Label shown on Trezor
  value: string; // Data to encrypt (16-byte aligned)
  encrypt: boolean;
  askOnEncrypt: boolean;
  askOnDecrypt: boolean;
  iv?: string; // Optional IV
}

/**
 * Trezor Connect response
 */
export interface TrezorResponse<T> {
  success: boolean;
  payload: T | TrezorError;
}

/**
 * Trezor error
 */
export interface TrezorError {
  error: string;
  code?: string;
}

/**
 * RAILGUN wallet metadata
 */
export interface RailgunWalletMetadata {
  walletId: string;
  address0zk: string; // RAILGUN 0zk address
  createdAt: number;
  encryptedWith: 'trezor-derived';
  trezorPath: string;
  isSecretWallet: boolean;
}

/**
 * Wallet creation options
 */
export interface WalletCreationOptions {
  useSecretWallet: boolean;
  derivationPath?: string; // Default: m/44'/60'/0'/0/0
  requireConfirmation?: boolean; // Default: true
}

/**
 * Session timeout configuration
 */
export interface SessionConfig {
  timeoutMinutes: number; // Default: 30
  warnBeforeMinutes: number; // Default: 5
  autoLockOnIdle: boolean; // Default: true
}

/**
 * Trezor Connect initialization manifest
 */
export interface TrezorManifest {
  email: string;
  appUrl: string;
}
