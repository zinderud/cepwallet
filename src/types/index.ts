/**
 * CepWallet TypeScript Type Definitions
 * 
 * Tauri backend command types and interfaces
 */

// ============================================================================
// Hardware Wallet Types (Trezor)
// ============================================================================

export interface DeviceInfo {
  model: string;
  label: string;
  firmware_version: string;
  initialized: boolean;
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

// ============================================================================
// Privacy / RAILGUN Types
// ============================================================================

export interface ShieldedTransaction {
  tx_type: 'Shield' | 'Transfer' | 'Unshield';
  token: string;
  amount: string;
  recipient?: string;
  proof?: string;
  merkle_root?: string;
  nullifier?: string;
  transaction?: {
    to: string;
    data: string;
    value?: string;
  };
}

export interface RailgunWallet {
  railgunWalletId: string;
  railgunAddress: string;
  mnemonic: string;
}

export interface ShieldKeyResponse {
  shieldPrivateKey: string;
}

// ============================================================================
// Privacy Command Parameters
// ============================================================================

export interface InitializePrivacyParams {
  chainId: number;
}

export interface CreateRailgunWalletParams {
  encryptionKey: string;
  mnemonic?: string;
}

export interface GetShieldKeyParams {
  railgunWalletId: string;
}

export interface ShieldTransactionParams {
  token: string;
  amount: string;
  railgunAddress: string;
  shieldPrivateKey: string;
}

export interface UnshieldTransactionParams {
  token: string;
  amount: string;
  recipient: string;
  railgunWalletId: string;
  encryptionKey: string;
  mnemonic: string;
}

export interface PrivateTransferParams {
  recipient: string;
  token: string;
  amount: string;
  railgunWalletId: string;
  encryptionKey: string;
  mnemonic: string;
}

export interface GetShieldedBalanceParams {
  token: string;
}

// ============================================================================
// Privacy Pool Types
// ============================================================================

export interface PrivacyPoolOperation {
  pool_id: string;
  token: string;
  amount: string;
  operation_type: 'Deposit' | 'Withdraw' | 'Swap';
  proof?: string;
}

export interface JoinPrivacyPoolParams {
  poolId: string;
  token: string;
  depositAmount: string;
}

export interface ExitPrivacyPoolParams {
  poolId: string;
  token: string;
  withdrawAmount: string;
}

export interface PrivacyPoolSwapParams {
  poolId: string;
  fromToken: string;
  toToken: string;
  amount: string;
}

// ============================================================================
// ZK Proof Types
// ============================================================================

export type ProofType = 'shield' | 'transfer' | 'unshield' | 'pool_membership' | 'compliance';

export interface GenerateZKProofParams {
  proofType: ProofType;
  publicInputs: string[];
}

export interface EstimateProofTimeParams {
  proofType: ProofType;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WalletCreateResponse {
  success: boolean;
  railgunWalletId: string;
  railgunAddress: string;
  mnemonic: string;
}

export interface ShieldPrivateKeyResponse {
  success: boolean;
  shieldPrivateKey: string;
}
