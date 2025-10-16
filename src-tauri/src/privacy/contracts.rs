/// RAILGUN Smart Contract Addresses
/// 
/// This module contains deployed RAILGUN contract addresses for various networks.
/// 
/// RAILGUN v3.0 Architecture:
/// - RailgunLogic: Core privacy logic
/// - RailgunProxy: Upgradeable proxy
/// - Treasury: Fee collection
/// - Relayer: Transaction relay for privacy

use ethers::types::Address;
use std::str::FromStr;

/// RAILGUN contract addresses for a specific network
#[derive(Debug, Clone)]
pub struct RailgunContracts {
    /// Main logic contract address
    pub logic: Address,
    /// Proxy contract address (user-facing)
    pub proxy: Address,
    /// Treasury address for fee collection
    pub treasury: Address,
}

impl RailgunContracts {
    /// Ethereum Mainnet RAILGUN v3.0 contracts
    pub fn mainnet() -> Self {
        Self {
            // RAILGUN Logic v3.0
            logic: Address::from_str("0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9")
                .expect("Invalid RAILGUN Logic address"),
            // RAILGUN Proxy
            proxy: Address::from_str("0x3b5FFC4842Eb34e28Faff7E6c08Bdc7dE88d1a28")
                .expect("Invalid RAILGUN Proxy address"),
            // Treasury
            treasury: Address::from_str("0x...")
                .expect("Invalid Treasury address"),
        }
    }

    /// Sepolia Testnet RAILGUN contracts
    pub fn sepolia() -> Self {
        Self {
            // TODO: Update with actual Sepolia addresses when deployed
            logic: Address::from_str("0x0000000000000000000000000000000000000000")
                .expect("Invalid address"),
            proxy: Address::from_str("0x0000000000000000000000000000000000000000")
                .expect("Invalid address"),
            treasury: Address::from_str("0x0000000000000000000000000000000000000000")
                .expect("Invalid address"),
        }
    }

    /// Get contracts for a specific chain ID
    pub fn for_chain_id(chain_id: u64) -> Option<Self> {
        match chain_id {
            1 => Some(Self::mainnet()),
            11155111 => Some(Self::sepolia()),
            _ => None,
        }
    }

    /// Get the main contract address to interact with (usually proxy)
    pub fn main_address(&self) -> Address {
        self.proxy
    }
}

/// Token addresses for common ERC-20 tokens
#[derive(Debug, Clone)]
pub struct CommonTokens;

impl CommonTokens {
    /// ETH (native token, represented as 0x0)
    pub fn eth() -> Address {
        Address::zero()
    }

    /// USDC (Ethereum Mainnet)
    pub fn usdc_mainnet() -> Address {
        Address::from_str("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
            .expect("Invalid USDC address")
    }

    /// USDT (Ethereum Mainnet)
    pub fn usdt_mainnet() -> Address {
        Address::from_str("0xdAC17F958D2ee523a2206206994597C13D831ec7")
            .expect("Invalid USDT address")
    }

    /// DAI (Ethereum Mainnet)
    pub fn dai_mainnet() -> Address {
        Address::from_str("0x6B175474E89094C44Da98b954EedeAC495271d0F")
            .expect("Invalid DAI address")
    }

    /// WETH (Wrapped ETH)
    pub fn weth_mainnet() -> Address {
        Address::from_str("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
            .expect("Invalid WETH address")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mainnet_contracts() {
        let contracts = RailgunContracts::mainnet();
        assert_ne!(contracts.logic, Address::zero());
        assert_ne!(contracts.proxy, Address::zero());
    }

    #[test]
    fn test_chain_id_mapping() {
        let mainnet = RailgunContracts::for_chain_id(1);
        assert!(mainnet.is_some());

        let sepolia = RailgunContracts::for_chain_id(11155111);
        assert!(sepolia.is_some());

        let unknown = RailgunContracts::for_chain_id(999);
        assert!(unknown.is_none());
    }

    #[test]
    fn test_common_tokens() {
        assert_eq!(CommonTokens::eth(), Address::zero());
        assert_ne!(CommonTokens::usdc_mainnet(), Address::zero());
    }
}
