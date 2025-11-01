/// Common types for privacy module
use serde::{Deserialize, Serialize};

/// Privacy level for transactions
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum PrivacyLevel {
    /// Public Ethereum transaction (fully visible on-chain)
    Public,
    /// RAILGUN shielded (amount and recipient hidden)
    Railgun,
    /// Privacy Pool (compliance-friendly privacy)
    PrivacyPool,
    /// Maximum privacy (RAILGUN + Privacy Pool)
    Maximum,
}

impl Default for PrivacyLevel {
    fn default() -> Self {
        PrivacyLevel::Public
    }
}

impl PrivacyLevel {
    /// Get estimated fee multiplier for this privacy level
    pub fn fee_multiplier(&self) -> f64 {
        match self {
            PrivacyLevel::Public => 1.0,
            PrivacyLevel::Railgun => 2.5,
            PrivacyLevel::PrivacyPool => 3.0,
            PrivacyLevel::Maximum => 4.5,
        }
    }

    /// Get estimated proof generation time (seconds)
    pub fn proof_generation_time(&self) -> u64 {
        match self {
            PrivacyLevel::Public => 0,
            PrivacyLevel::Railgun => 15,
            PrivacyLevel::PrivacyPool => 25,
            PrivacyLevel::Maximum => 45,
        }
    }
}

/// Shielded transaction (RAILGUN)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShieldedTransaction {
    /// Transaction type
    pub tx_type: ShieldedTxType,
    /// Token address (0x0 for ETH)
    pub token: String,
    /// Amount in wei (as string to avoid precision loss)
    pub amount: String,
    /// Recipient (for transfers and unshield)
    pub recipient: Option<String>,
    /// ZK proof data (hex string or proof identifier)
    pub proof: Option<String>,
    /// Merkle tree root
    pub merkle_root: Option<String>,
    /// Nullifier (to prevent double-spending)
    pub nullifier: Option<String>,
    /// Transaction data for broadcasting
    pub transaction: Option<serde_json::Value>,
}

/// Shielded transaction type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ShieldedTxType {
    /// Shield: Public -> Private
    Shield,
    /// Transfer: Private -> Private
    Transfer,
    /// Unshield: Private -> Public
    Unshield,
}

/// Privacy pool operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyPoolOperation {
    /// Operation type
    pub operation: PoolOperationType,
    /// Pool ID
    pub pool_id: String,
    /// Token address
    pub token: String,
    /// Amount
    pub amount: String,
    /// Additional parameters (JSON)
    pub params: Option<serde_json::Value>,
}

/// Privacy pool operation type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PoolOperationType {
    /// Join pool with deposit
    Join,
    /// Exit pool and withdraw
    Exit,
    /// Swap within pool
    Swap,
    /// Generate compliance proof
    ComplianceProof,
}

/// ZK proof metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZKProofMetadata {
    /// Proof type
    pub proof_type: String,
    /// Public inputs
    pub public_inputs: Vec<String>,
    /// Proof data (serialized)
    pub proof: Vec<u8>,
    /// Generation timestamp
    pub timestamp: u64,
}

/// Privacy balance (shielded balances)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyBalance {
    /// Public balance (on-chain visible)
    pub public: String,
    /// RAILGUN shielded balance
    pub railgun: Option<String>,
    /// Privacy pool balance
    pub privacy_pool: Option<String>,
    /// Total
    pub total: String,
}

/// Privacy transaction status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PrivacyTxStatus {
    /// Proof generation in progress
    GeneratingProof,
    /// Waiting for Trezor signature
    WaitingForSignature,
    /// Broadcasting to network
    Broadcasting,
    /// Confirmed on-chain
    Confirmed,
    /// Failed
    Failed(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_privacy_level_fee_multiplier() {
        assert_eq!(PrivacyLevel::Public.fee_multiplier(), 1.0);
        assert_eq!(PrivacyLevel::Railgun.fee_multiplier(), 2.5);
        assert_eq!(PrivacyLevel::PrivacyPool.fee_multiplier(), 3.0);
        assert_eq!(PrivacyLevel::Maximum.fee_multiplier(), 4.5);
    }

    #[test]
    fn test_privacy_level_proof_time() {
        assert_eq!(PrivacyLevel::Public.proof_generation_time(), 0);
        assert!(PrivacyLevel::Railgun.proof_generation_time() > 0);
        assert!(
            PrivacyLevel::Maximum.proof_generation_time()
                > PrivacyLevel::Railgun.proof_generation_time()
        );
    }

    #[test]
    fn test_shielded_tx_serialization() {
        let tx = ShieldedTransaction {
            tx_type: ShieldedTxType::Shield,
            token: "0x0000000000000000000000000000000000000000".to_string(),
            amount: "1000000000000000000".to_string(),
            recipient: None,
            proof: None,
            merkle_root: None,
            nullifier: None,
        };

        let json = serde_json::to_string(&tx).unwrap();
        let deserialized: ShieldedTransaction = serde_json::from_str(&json).unwrap();

        assert_eq!(tx.tx_type, deserialized.tx_type);
        assert_eq!(tx.amount, deserialized.amount);
    }
}
