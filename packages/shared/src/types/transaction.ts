/** Transaction types */
export type TransactionType = 'transfer' | 'contract-interaction' | 'deploy' | 'approve' | 'swap';

/** Transaction status */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

/** Fee configuration */
export interface FeeConfig {
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit: bigint;
}

/** Transaction data */
export interface TransactionData {
  to: string;
  from: string;
  value: bigint;
  data: string; // Contract call data
  nonce?: number;
  chainId: number;
  type?: TransactionType;
}

/** Raw transaction (for signing) */
export interface RawTransaction extends TransactionData, FeeConfig {
  r?: string;
  s?: string;
  v?: number;
}

/** Signed transaction */
export interface SignedTransaction extends RawTransaction {
  hash: string;
}

/** Transaction info (in wallet) */
export interface TransactionInfo {
  hash: string;
  from: string;
  to?: string;
  value: bigint;
  data: string;
  status: TransactionStatus;
  blockNumber?: number;
  timestamp?: number;
  type: TransactionType;
  gasUsed?: bigint;
  gasPrice?: bigint;
}

/** Transaction history */
export interface TransactionHistory {
  transactions: TransactionInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/** Transaction building result */
export interface BuildTransactionResult {
  data: RawTransaction;
  estimatedGas: bigint;
  estimatedCost: {
    value: bigint;
    formatted: string;
  };
}

/** Transaction signing request */
export interface SignTransactionRequest {
  tx: RawTransaction;
  bip44Path?: string;
}

/** Transaction signing response */
export interface SignTransactionResponse {
  signature: {
    v: number;
    r: string;
    s: string;
  };
  hash: string;
}
