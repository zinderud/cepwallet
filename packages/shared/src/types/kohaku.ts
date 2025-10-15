/** Kohaku/RAILGUN specific types */

/** Shield operation (public → private) */
export interface ShieldOperation {
  token: string; // Token contract address
  amount: bigint;
  recipientShield: string; // Recipient RAILGUN address (0x-prefixed)
  senderToken?: string; // Alternative sender token
}

/** Private transfer (private → private) */
export interface PrivateTransfer {
  to: string; // Recipient RAILGUN address
  amount: bigint;
  token: string;
  fee?: bigint;
}

/** Unshield operation (private → public) */
export interface UnshieldOperation {
  token: string;
  amount: bigint;
  senderShield: string; // Sender RAILGUN address
  recipient: string; // Recipient Ethereum address
}

/** Privacy level */
export type PrivacyLevel = 'standard' | 'high' | 'maximum';

/** Privacy pool tier (compliance) */
export type PrivacyPoolTier = 'tier1' | 'tier2' | 'unrestricted';

/** Privacy pool configuration */
export interface PrivacyPoolConfig {
  tier: PrivacyPoolTier;
  allowlist?: string[]; // Allowed destinations
  blocklist?: string[];
}

/** RAILGUN address format */
export interface RailgunAddress {
  address: string; // 0x-prefixed address
  chain: number;
  viewingPublicKey?: string;
}

/** Transaction humanizer result */
export interface HumanizedTransaction {
  description: string;
  protocol: string;
  function?: string;
  params: Record<string, unknown>;
}

/** Shield/Unshield status */
export type ShieldStatus = 'pending' | 'shielded' | 'unshielded' | 'error';

/** Privacy transaction info */
export interface PrivacyTransactionInfo {
  id: string;
  type: 'shield' | 'transfer' | 'unshield';
  status: ShieldStatus;
  amount: bigint;
  token: string;
  timestamp: number;
  txHash?: string;
  error?: string;
}

/** ZK proof status */
export interface ZKProofStatus {
  generated: boolean;
  verified: boolean;
  timestamp?: number;
  error?: string;
}

/** Kohaku integration state */
export interface KohakuState {
  initialized: boolean;
  connected: boolean;
  balance: {
    [token: string]: bigint;
  };
  transactionHistory: PrivacyTransactionInfo[];
  privacyLevel: PrivacyLevel;
  currentTier: PrivacyPoolTier;
}
