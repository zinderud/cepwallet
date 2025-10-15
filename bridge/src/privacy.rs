/**
 * Privacy Bridge - Rust Integration Handler
 * Handles privacy operations and cost calculations via Rust bridge
 */

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/**
 * Privacy Level Enum
 */
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum PrivacyLevel {
    PUBLIC,
    SEMI_PRIVATE,
    FULL_PRIVATE,
}

/**
 * Privacy Cost Info
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyCostInfo {
    pub base_gas_price: String,
    pub base_gas_amount: String,
    pub base_gas_cost: String,
    pub privacy_level: PrivacyLevel,
    pub premium_percent: u32,
    pub premium_amount: String,
    pub total_gas_cost: String,
    pub estimated_time_seconds: u64,
}

/**
 * Privacy Validation Result
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyValidationResult {
    pub valid: bool,
    pub reason: String,
    pub warnings: Vec<String>,
    pub suggestions: Vec<String>,
}

/**
 * Transaction Privacy Info
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionPrivacyInfo {
    pub tx_hash: String,
    pub from_address: String,
    pub to_address: String,
    pub tx_type: String, // "shield", "transfer", "unshield"
    pub amount: String,
    pub privacy_level: PrivacyLevel,
    pub gas_cost: String,
    pub timestamp: u64,
}

/**
 * Privacy Operations Handler
 */
pub struct PrivacyBridge;

impl PrivacyBridge {
    /**
     * Calculate privacy cost for a transaction
     * 
     * # Arguments
     * * `base_gas_price` - Base gas price in Wei
     * * `base_gas_amount` - Base gas amount to use
     * * `level` - Privacy level enum
     * 
     * # Returns
     * PrivacyCostInfo with calculated costs and premium
     */
    pub fn calculate_privacy_cost(
        base_gas_price: &str,
        base_gas_amount: &str,
        level: PrivacyLevel,
    ) -> Result<PrivacyCostInfo, String> {
        // Parse inputs
        let price = base_gas_price
            .parse::<f64>()
            .map_err(|_| "Invalid gas price format".to_string())?;
        
        let amount = base_gas_amount
            .parse::<f64>()
            .map_err(|_| "Invalid gas amount format".to_string())?;

        // Calculate premium percent based on privacy level
        let premium_percent = match level {
            PrivacyLevel::PUBLIC => 0,
            PrivacyLevel::SEMI_PRIVATE => 15,
            PrivacyLevel::FULL_PRIVATE => 35,
        };

        // Calculate costs
        let base_cost = price * amount;
        let premium_amount = base_cost * (premium_percent as f64 / 100.0);
        let total_cost = base_cost + premium_amount;

        // Estimate time based on level (in seconds)
        let estimated_time = match level {
            PrivacyLevel::PUBLIC => 15,        // ~15 seconds
            PrivacyLevel::SEMI_PRIVATE => 30,  // ~30 seconds
            PrivacyLevel::FULL_PRIVATE => 60,  // ~60 seconds
        };

        Ok(PrivacyCostInfo {
            base_gas_price: base_gas_price.to_string(),
            base_gas_amount: base_gas_amount.to_string(),
            base_gas_cost: format!("{:.0}", base_cost),
            privacy_level: level,
            premium_percent,
            premium_amount: format!("{:.0}", premium_amount),
            total_gas_cost: format!("{:.0}", total_cost),
            estimated_time_seconds: estimated_time,
        })
    }

    /**
     * Validate privacy level for transaction
     * 
     * # Arguments
     * * `level` - Privacy level to validate
     * * `tx_type` - Transaction type ("shield", "transfer", "unshield")
     * * `max_premium_percent` - Maximum allowed premium percent
     * 
     * # Returns
     * PrivacyValidationResult with validation status
     */
    pub fn validate_privacy_level(
        level: PrivacyLevel,
        tx_type: &str,
        max_premium_percent: u32,
    ) -> PrivacyValidationResult {
        let mut warnings = Vec::new();
        let mut suggestions = Vec::new();

        // Check transaction type compatibility
        match (tx_type, level) {
            ("shield", PrivacyLevel::PUBLIC) => {
                warnings.push("Shielding with public level provides no privacy benefit".to_string());
                suggestions.push("Consider using semi-private or full private for shield operations".to_string());
            }
            ("unshield", PrivacyLevel::PUBLIC) => {
                warnings.push("Unshielding with public level exposes transaction details".to_string());
                suggestions.push("Consider using semi-private for better privacy".to_string());
            }
            _ => {}
        }

        // Check gas premium
        let premium_percent = match level {
            PrivacyLevel::PUBLIC => 0,
            PrivacyLevel::SEMI_PRIVATE => 15,
            PrivacyLevel::FULL_PRIVATE => 35,
        };

        if premium_percent > max_premium_percent {
            return PrivacyValidationResult {
                valid: false,
                reason: format!(
                    "Privacy level premium ({}%) exceeds maximum allowed ({}%)",
                    premium_percent, max_premium_percent
                ),
                warnings,
                suggestions,
            };
        }

        PrivacyValidationResult {
            valid: true,
            reason: "Privacy level is valid".to_string(),
            warnings,
            suggestions,
        }
    }

    /**
     * Validate address for privacy transaction
     * 
     * # Arguments
     * * `from_address` - Sender address
     * * `to_address` - Recipient address
     * * `level` - Privacy level
     * 
     * # Returns
     * PrivacyValidationResult with address validation
     */
    pub fn validate_address_privacy(
        from_address: &str,
        to_address: &str,
        level: PrivacyLevel,
    ) -> PrivacyValidationResult {
        // Check address format (basic validation)
        if from_address.is_empty() || to_address.is_empty() {
            return PrivacyValidationResult {
                valid: false,
                reason: "Address cannot be empty".to_string(),
                warnings: Vec::new(),
                suggestions: vec!["Provide valid sender and recipient addresses".to_string()],
            };
        }

        // Check for self-transfer
        if from_address.eq_ignore_ascii_case(to_address) {
            let mut suggestions = vec!["Self-transfers may not benefit from privacy".to_string()];
            
            if level == PrivacyLevel::FULL_PRIVATE {
                suggestions.push("Consider using public level for self-transfers to save on gas".to_string());
            }

            return PrivacyValidationResult {
                valid: true,
                reason: "Self-transfer detected".to_string(),
                warnings: vec!["Self-transfers have reduced privacy benefit".to_string()],
                suggestions,
            };
        }

        PrivacyValidationResult {
            valid: true,
            reason: "Address validation passed".to_string(),
            warnings: Vec::new(),
            suggestions: Vec::new(),
        }
    }

    /**
     * Get privacy impact metrics
     * 
     * # Arguments
     * * `level` - Privacy level
     * 
     * # Returns
     * Privacy impact metrics
     */
    pub fn get_privacy_impact(level: PrivacyLevel) -> serde_json::Value {
        match level {
            PrivacyLevel::PUBLIC => {
                serde_json::json!({
                    "on_chain_visibility": 100,
                    "anonymity_percent": 0,
                    "traceability_percent": 100,
                    "description": "Transaction fully visible on blockchain"
                })
            }
            PrivacyLevel::SEMI_PRIVATE => {
                serde_json::json!({
                    "on_chain_visibility": 30,
                    "anonymity_percent": 70,
                    "traceability_percent": 20,
                    "description": "Partial privacy with amount/recipient obfuscation"
                })
            }
            PrivacyLevel::FULL_PRIVATE => {
                serde_json::json!({
                    "on_chain_visibility": 0,
                    "anonymity_percent": 100,
                    "traceability_percent": 0,
                    "description": "Complete privacy via Railgun shielding"
                })
            }
        }
    }

    /**
     * Calculate aggregate privacy for multiple transactions
     * 
     * # Arguments
     * * `transactions` - Vector of TransactionPrivacyInfo
     * 
     * # Returns
     * Average privacy score (0-100)
     */
    pub fn calculate_aggregate_privacy(transactions: &[TransactionPrivacyInfo]) -> u32 {
        if transactions.is_empty() {
            return 0;
        }

        let total: u32 = transactions
            .iter()
            .map(|tx| match tx.privacy_level {
                PrivacyLevel::PUBLIC => 0,
                PrivacyLevel::SEMI_PRIVATE => 50,
                PrivacyLevel::FULL_PRIVATE => 100,
            })
            .sum();

        total / transactions.len() as u32
    }

    /**
     * Get compatible privacy levels for transaction type
     * 
     * # Arguments
     * * `tx_type` - Transaction type
     * 
     * # Returns
     * Vec of compatible privacy levels
     */
    pub fn get_compatible_levels(tx_type: &str) -> Vec<PrivacyLevel> {
        match tx_type {
            "shield" => vec![
                PrivacyLevel::PUBLIC,
                PrivacyLevel::SEMI_PRIVATE,
                PrivacyLevel::FULL_PRIVATE,
            ],
            "transfer" => vec![
                PrivacyLevel::PUBLIC,
                PrivacyLevel::SEMI_PRIVATE,
                PrivacyLevel::FULL_PRIVATE,
            ],
            "unshield" => vec![
                PrivacyLevel::PUBLIC,
                PrivacyLevel::SEMI_PRIVATE,
                PrivacyLevel::FULL_PRIVATE,
            ],
            _ => vec![PrivacyLevel::PUBLIC],
        }
    }

    /**
     * Recommend privacy level for transaction
     * 
     * # Arguments
     * * `tx_type` - Transaction type
     * * `amount` - Transaction amount in Wei
     * * `gas_cost_public` - Gas cost at public level
     * * `gas_cost_private` - Gas cost at full private level
     * 
     * # Returns
     * Recommended PrivacyLevel
     */
    pub fn recommend_privacy_level(
        tx_type: &str,
        amount: &str,
        gas_cost_public: &str,
        gas_cost_private: &str,
    ) -> PrivacyLevel {
        // Parse amounts
        let amount_wei = amount.parse::<f64>().unwrap_or(0.0);
        let public_cost = gas_cost_public.parse::<f64>().unwrap_or(0.0);
        let private_cost = gas_cost_private.parse::<f64>().unwrap_or(0.0);

        // Calculate cost ratio
        let cost_ratio = if public_cost > 0.0 {
            private_cost / public_cost
        } else {
            1.0
        };

        // Recommendation logic
        match tx_type {
            "shield" => {
                // Shield operations benefit from higher privacy
                if cost_ratio < 1.5 {
                    PrivacyLevel::FULL_PRIVATE
                } else if cost_ratio < 2.0 {
                    PrivacyLevel::SEMI_PRIVATE
                } else {
                    PrivacyLevel::PUBLIC
                }
            }
            "unshield" => {
                // Unshield operations should maintain privacy
                if cost_ratio < 1.8 {
                    PrivacyLevel::SEMI_PRIVATE
                } else {
                    PrivacyLevel::PUBLIC
                }
            }
            _ => {
                // Regular transfers - balance cost and privacy
                if cost_ratio < 1.6 && amount_wei > 1e18 {
                    // Large amounts get more privacy
                    PrivacyLevel::SEMI_PRIVATE
                } else {
                    PrivacyLevel::PUBLIC
                }
            }
        }
    }
}

/**
 * WASM bindings for browser/JS compatibility
 */
#[wasm_bindgen]
pub fn wasm_calculate_privacy_cost(
    base_gas_price: &str,
    base_gas_amount: &str,
    level: u32,
) -> Result<JsValue, JsValue> {
    let privacy_level = match level {
        0 => PrivacyLevel::PUBLIC,
        1 => PrivacyLevel::SEMI_PRIVATE,
        2 => PrivacyLevel::FULL_PRIVATE,
        _ => return Err(JsValue::from_str("Invalid privacy level")),
    };

    match PrivacyBridge::calculate_privacy_cost(base_gas_price, base_gas_amount, privacy_level) {
        Ok(cost_info) => serde_wasm_bindgen::to_value(&cost_info)
            .map_err(|e| JsValue::from_str(&e.to_string())),
        Err(e) => Err(JsValue::from_str(&e)),
    }
}

/**
 * WASM binding for privacy level validation
 */
#[wasm_bindgen]
pub fn wasm_validate_privacy_level(
    level: u32,
    tx_type: &str,
    max_premium: u32,
) -> Result<JsValue, JsValue> {
    let privacy_level = match level {
        0 => PrivacyLevel::PUBLIC,
        1 => PrivacyLevel::SEMI_PRIVATE,
        2 => PrivacyLevel::FULL_PRIVATE,
        _ => return Err(JsValue::from_str("Invalid privacy level")),
    };

    let result = PrivacyBridge::validate_privacy_level(privacy_level, tx_type, max_premium);
    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_privacy_cost_public() {
        let result = PrivacyBridge::calculate_privacy_cost("100", "21000", PrivacyLevel::PUBLIC);
        assert!(result.is_ok());
        let cost = result.unwrap();
        assert_eq!(cost.premium_percent, 0);
    }

    #[test]
    fn test_calculate_privacy_cost_semi_private() {
        let result =
            PrivacyBridge::calculate_privacy_cost("100", "21000", PrivacyLevel::SEMI_PRIVATE);
        assert!(result.is_ok());
        let cost = result.unwrap();
        assert_eq!(cost.premium_percent, 15);
    }

    #[test]
    fn test_calculate_privacy_cost_full_private() {
        let result =
            PrivacyBridge::calculate_privacy_cost("100", "21000", PrivacyLevel::FULL_PRIVATE);
        assert!(result.is_ok());
        let cost = result.unwrap();
        assert_eq!(cost.premium_percent, 35);
    }

    #[test]
    fn test_validate_privacy_level_shield() {
        let result = PrivacyBridge::validate_privacy_level(
            PrivacyLevel::SEMI_PRIVATE,
            "shield",
            50,
        );
        assert!(result.valid);
    }

    #[test]
    fn test_validate_privacy_level_exceeds_premium() {
        let result = PrivacyBridge::validate_privacy_level(
            PrivacyLevel::FULL_PRIVATE,
            "transfer",
            20,
        );
        assert!(!result.valid);
    }

    #[test]
    fn test_aggregate_privacy() {
        let transactions = vec![
            TransactionPrivacyInfo {
                tx_hash: "0x123".to_string(),
                from_address: "0xabc".to_string(),
                to_address: "0xdef".to_string(),
                tx_type: "transfer".to_string(),
                amount: "1000000000000000000".to_string(),
                privacy_level: PrivacyLevel::PUBLIC,
                gas_cost: "2100000".to_string(),
                timestamp: 1000,
            },
            TransactionPrivacyInfo {
                tx_hash: "0x456".to_string(),
                from_address: "0xabc".to_string(),
                to_address: "0xdef".to_string(),
                tx_type: "transfer".to_string(),
                amount: "2000000000000000000".to_string(),
                privacy_level: PrivacyLevel::FULL_PRIVATE,
                gas_cost: "3000000".to_string(),
                timestamp: 2000,
            },
        ];

        let aggregate = PrivacyBridge::calculate_aggregate_privacy(&transactions);
        assert_eq!(aggregate, 50);
    }
}
