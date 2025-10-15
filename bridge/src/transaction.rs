use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use anyhow::{anyhow, Result};
use log::debug;

/// Transaction structure for signing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EthereumTransaction {
    pub nonce: u64,
    pub gas_price: String,      // Wei
    pub gas_limit: u64,
    pub to: String,             // Address
    pub value: String,          // Wei
    pub data: String,           // Hex string
    pub chain_id: u64,
}

impl EthereumTransaction {
    /// Encode transaction for signing (RLP format)
    /// This is a simplified version - real implementation needs full RLP encoding
    pub fn to_signing_hash(&self) -> Result<Vec<u8>> {
        debug!("Encoding transaction for signing");
        
        // Simplified encoding - real implementation should use RLP encoding
        let encoded = format!(
            "{}:{}:{}:{}:{}:{}:{}",
            self.nonce,
            self.gas_price,
            self.gas_limit,
            self.to,
            self.value,
            self.data,
            self.chain_id
        );

        let mut hasher = Sha256::new();
        hasher.update(encoded.as_bytes());
        let hash = hasher.finalize().to_vec();

        Ok(hash)
    }

    /// Validate transaction fields
    pub fn validate(&self) -> Result<()> {
        // Check to address format (0x + 40 hex chars)
        if !self.to.starts_with("0x") || self.to.len() != 42 {
            return Err(anyhow!("Invalid 'to' address format"));
        }

        // Check value is numeric
        self.value.parse::<u128>()
            .map_err(|_| anyhow!("Invalid 'value' - must be numeric Wei"))?;

        // Check gas price is numeric
        self.gas_price.parse::<u128>()
            .map_err(|_| anyhow!("Invalid 'gas_price' - must be numeric Wei"))?;

        // Check chain_id is valid
        if self.chain_id == 0 {
            return Err(anyhow!("Invalid chain_id"));
        }

        // Check data is valid hex
        if !self.data.is_empty() && !self.data.starts_with("0x") {
            return Err(anyhow!("Invalid 'data' - must be hex string starting with 0x"));
        }

        Ok(())
    }

    /// Calculate total transaction fee
    pub fn total_fee(&self) -> Result<String> {
        let gas_price: u128 = self.gas_price.parse()?;
        let gas_limit = self.gas_limit as u128;
        let total = gas_price * gas_limit;
        Ok(total.to_string())
    }

    /// Get human-readable transaction summary
    pub fn summary(&self) -> String {
        format!(
            "Tx: {} -> {}\nValue: {} Wei\nGas: {} * {} = {} Wei\nTotal: ~{} Wei",
            self.nonce,
            &self.to[0..10],
            self.value,
            self.gas_price,
            self.gas_limit,
            self.gas_limit * 1, // Simplified
            self.value
        )
    }
}

/// Message to sign
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignableMessage {
    pub message: String,        // Hex encoded or UTF-8
    pub message_type: String,   // "utf8" or "hex"
}

impl SignableMessage {
    /// Validate message format
    pub fn validate(&self) -> Result<()> {
        match self.message_type.as_str() {
            "utf8" => {
                if self.message.is_empty() {
                    return Err(anyhow!("Message cannot be empty"));
                }
                Ok(())
            }
            "hex" => {
                if !self.message.starts_with("0x") {
                    return Err(anyhow!("Hex message must start with 0x"));
                }
                // Validate hex format
                let hex_part = &self.message[2..];
                if hex_part.len() % 2 != 0 {
                    return Err(anyhow!("Hex message must have even length"));
                }
                hex::decode(hex_part)
                    .map_err(|e| anyhow!("Invalid hex encoding: {}", e))?;
                Ok(())
            }
            _ => Err(anyhow!("Unknown message_type: {}", self.message_type)),
        }
    }

    /// Convert to signing hash
    pub fn to_signing_hash(&self) -> Result<Vec<u8>> {
        let message_bytes = match self.message_type.as_str() {
            "utf8" => self.message.as_bytes().to_vec(),
            "hex" => {
                let hex_part = &self.message[2..];
                hex::decode(hex_part)
                    .map_err(|e| anyhow!("Failed to decode hex: {}", e))?
            }
            _ => return Err(anyhow!("Unknown message_type")),
        };

        // EIP-191 Signed Message Hash: "\x19Ethereum Signed Message:\n{len}{message}"
        let prefix = format!("\x19Ethereum Signed Message:\n{}", message_bytes.len());
        let mut full_message = prefix.into_bytes();
        full_message.extend_from_slice(&message_bytes);

        let mut hasher = Sha256::new();
        hasher.update(&full_message);
        Ok(hasher.finalize().to_vec())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transaction_validation() {
        let tx = EthereumTransaction {
            nonce: 0,
            gas_price: "1000000000".to_string(),
            gas_limit: 21000,
            to: "0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6".to_string(),
            value: "1000000000000000000".to_string(),
            data: "0x".to_string(),
            chain_id: 1,
        };

        assert!(tx.validate().is_ok());
    }

    #[test]
    fn test_invalid_address() {
        let tx = EthereumTransaction {
            nonce: 0,
            gas_price: "1000000000".to_string(),
            gas_limit: 21000,
            to: "invalid_address".to_string(),
            value: "1000000000000000000".to_string(),
            data: "0x".to_string(),
            chain_id: 1,
        };

        assert!(tx.validate().is_err());
    }

    #[test]
    fn test_message_validation() {
        let msg = SignableMessage {
            message: "Hello, CepWallet!".to_string(),
            message_type: "utf8".to_string(),
        };

        assert!(msg.validate().is_ok());
    }

    #[test]
    fn test_hex_message_validation() {
        let msg = SignableMessage {
            message: "0xdeadbeef".to_string(),
            message_type: "hex".to_string(),
        };

        assert!(msg.validate().is_ok());
    }

    #[test]
    fn test_invalid_hex_message() {
        let msg = SignableMessage {
            message: "0xzzz".to_string(),
            message_type: "hex".to_string(),
        };

        assert!(msg.validate().is_err());
    }

    #[test]
    fn test_transaction_fee_calculation() {
        let tx = EthereumTransaction {
            nonce: 0,
            gas_price: "1000000000".to_string(),  // 1 Gwei
            gas_limit: 21000,
            to: "0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6".to_string(),
            value: "1000000000000000000".to_string(),
            data: "0x".to_string(),
            chain_id: 1,
        };

        let fee = tx.total_fee().unwrap();
        assert_eq!(fee, "21000000000000000"); // 21000 * 1e9
    }
}
