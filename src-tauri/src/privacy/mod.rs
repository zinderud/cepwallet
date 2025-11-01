pub mod contracts;
pub mod ffi;
pub mod privacy_pools;
/// Privacy Module - RAILGUN & Privacy Pools Integration
///
/// This module provides zero-knowledge proof based privacy features:
/// - RAILGUN shielded transactions
/// - Privacy Pools (compliance-friendly privacy)
/// - ZK proof generation and verification
///
/// Architecture:
/// - railgun.rs: RAILGUN protocol implementation
/// - privacy_pools.rs: Privacy Pools integration
/// - zkproof.rs: Zero-knowledge proof generation
/// - types.rs: Common types and structures
/// - contracts.rs: Contract addresses and constants
pub mod railgun;
pub mod types;
pub mod wallet;
pub mod zkproof;

pub use contracts::{CommonTokens, RailgunContracts};
pub use ffi::{
    generate_proof, generate_shield_proof, generate_transfer_proof, generate_unshield_proof,
};
pub use privacy_pools::PrivacyPoolManager;
pub use railgun::RailgunManager;
pub use types::{PrivacyLevel, PrivacyPoolOperation, ShieldedTransaction};
pub use wallet::{
    create_railgun_wallet, get_shield_private_key, ShieldKeyResponse, WalletCreateResponse,
};
pub use zkproof::{ProofType, ZKProofGenerator};

use crate::error::{CepWalletError, Result};

/// Privacy manager - orchestrates RAILGUN and Privacy Pools
pub struct PrivacyManager {
    railgun: RailgunManager,
    privacy_pools: PrivacyPoolManager,
    zk_generator: ZKProofGenerator,
}

impl PrivacyManager {
    /// Create new privacy manager
    pub fn new(chain_id: u64) -> Result<Self> {
        Ok(Self {
            railgun: RailgunManager::new(chain_id)?,
            privacy_pools: PrivacyPoolManager::new()?,
            zk_generator: ZKProofGenerator::new()?,
        })
    }

    /// Initialize privacy features
    pub async fn initialize(&mut self) -> Result<()> {
        // Initialize RAILGUN
        self.railgun.initialize().await?;

        // Initialize Privacy Pools
        self.privacy_pools.initialize().await?;

        // Load ZK proving keys (this can take time)
        self.zk_generator.load_proving_keys().await?;

        Ok(())
    }

    /// Check if privacy features are ready
    pub fn is_ready(&self) -> bool {
        self.railgun.is_ready() && self.privacy_pools.is_ready() && self.zk_generator.is_ready()
    }

    /// Get privacy manager reference
    pub fn railgun(&self) -> &RailgunManager {
        &self.railgun
    }

    /// Get privacy pools manager reference
    pub fn privacy_pools(&self) -> &PrivacyPoolManager {
        &self.privacy_pools
    }

    /// Get ZK proof generator reference
    pub fn zk_generator(&self) -> &ZKProofGenerator {
        &self.zk_generator
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_privacy_manager_creation() {
        let manager = PrivacyManager::new(11155111); // Sepolia testnet
        assert!(manager.is_ok());
    }

    #[tokio::test]
    async fn test_privacy_manager_initialization() {
        let mut manager = PrivacyManager::new(11155111).unwrap(); // Sepolia testnet
        let result = manager.initialize().await;
        // Note: Will fail if proving keys not available
        // In production, we'll download them or bundle them
    }
}
