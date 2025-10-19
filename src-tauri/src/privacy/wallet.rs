/// RAILGUN Wallet Management
/// 
/// Manages RAILGUN wallet creation, import, and shield key management.
/// Uses FFI to call Node.js for wallet operations.

use serde::{Deserialize, Serialize};
use crate::error::Result;
use std::process::Command;

/// Wallet creation response
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletCreateResponse {
    pub success: bool,
    #[serde(default)]
    pub railgun_wallet_id: String,
    #[serde(default)]
    pub railgun_address: String,
    #[serde(default)]
    pub mnemonic: String,
    #[serde(default)]
    pub error: Option<String>,
}

/// Shield private key response
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShieldKeyResponse {
    pub success: bool,
    #[serde(default)]
    pub shield_private_key: String,
    #[serde(default)]
    pub error: Option<String>,
}

/// Create a new RAILGUN wallet
/// 
/// # Arguments
/// * `encryption_key` - 32-byte hex string for wallet encryption
/// * `mnemonic` - Optional mnemonic (generates new if None)
/// 
/// # Returns
/// * `WalletCreateResponse` - Wallet ID, address, and mnemonic
pub async fn create_railgun_wallet(
    encryption_key: &str,
    mnemonic: Option<&str>,
) -> Result<WalletCreateResponse> {
    tracing::info!("Creating RAILGUN wallet via FFI");
    
    // Validate encryption key length (must be 32 bytes = 64 hex chars + 0x = 66 total)
    if encryption_key.len() != 66 || !encryption_key.starts_with("0x") {
        return Err(anyhow::anyhow!(
            "Encryption key must be 32 bytes (66 hex chars with 0x prefix)"
        ).into());
    }
    
    // Build request
    let mut request = serde_json::json!({
        "operation": "createWallet",
        "encryptionKey": encryption_key,
    });
    
    if let Some(m) = mnemonic {
        request["mnemonic"] = serde_json::Value::String(m.to_string());
    }
    
    let request_json = serde_json::to_string(&request)
        .map_err(|e| anyhow::anyhow!("Failed to serialize wallet request: {}", e))?;
    
    // Get proof-generator directory (workspace root / proof-generator)
    let current_dir = std::env::current_dir()
        .map_err(|e| anyhow::anyhow!("Failed to get current directory: {}", e))?;
    
    tracing::debug!("Current directory: {}", current_dir.display());
    
    // Try workspace root first (if current_dir is src-tauri, go up one level)
    let workspace_root = if current_dir.ends_with("src-tauri") {
        current_dir.parent().unwrap_or(&current_dir)
    } else {
        &current_dir
    };
    
    let proof_generator_dir = workspace_root.join("proof-generator");
    let script_path = proof_generator_dir.join("index.js");
    
    tracing::debug!("Looking for script at: {}", script_path.display());
    
    if !script_path.exists() {
        return Err(anyhow::anyhow!(
            "proof-generator/index.js not found at {}", 
            script_path.display()
        ).into());
    }
    
    tracing::debug!("Running: node {} '{}'", script_path.display(), request_json);
    
    // Execute Node.js script
    let output = Command::new("node")
        .arg(&script_path)
        .arg(&request_json)
        .current_dir(&proof_generator_dir)
        .output()
        .map_err(|e| anyhow::anyhow!("Failed to execute Node.js: {}", e))?;
    
    // Log both stdout and stderr for debugging
    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let stderr_str = String::from_utf8_lossy(&output.stderr);
    
    tracing::debug!("Node.js stdout: {}", stdout_str);
    if !stderr_str.is_empty() {
        tracing::warn!("Node.js stderr: {}", stderr_str);
    }
    
    if !output.status.success() {
        return Err(anyhow::anyhow!(
            "Wallet creation failed:\nSTDOUT: {}\nSTDERR: {}", 
            stdout_str, 
            stderr_str
        ).into());
    }
    
    // Parse response
    let json_line = stdout_str
        .lines()
        .rev()
        .find(|line| line.trim().starts_with('{'))
        .ok_or_else(|| anyhow::anyhow!("No JSON output from wallet creation"))?;
    
    let response: WalletCreateResponse = serde_json::from_str(json_line)
        .map_err(|e| anyhow::anyhow!("Failed to parse wallet response: {}", e))?;
    
    if !response.success {
        return Err(anyhow::anyhow!(
            "Wallet creation failed: {}",
            response.error.unwrap_or_else(|| "Unknown error".to_string())
        ).into());
    }
    
    tracing::info!("RAILGUN wallet created successfully");
    tracing::info!("  Wallet ID: {}", response.railgun_wallet_id);
    tracing::info!("  Address: {}", response.railgun_address);
    
    Ok(response)
}

/// Get shield private key for a RAILGUN wallet
/// 
/// # Arguments
/// * `railgun_wallet_id` - RAILGUN wallet ID
/// 
/// # Returns
/// * `ShieldKeyResponse` - Shield private key
pub async fn get_shield_private_key(
    railgun_wallet_id: &str,
) -> Result<ShieldKeyResponse> {
    tracing::info!("Getting shield private key via FFI");
    
    let request = serde_json::json!({
        "operation": "getShieldPrivateKey",
        "railgunWalletId": railgun_wallet_id,
    });
    
    let request_json = serde_json::to_string(&request)
        .map_err(|e| anyhow::anyhow!("Failed to serialize request: {}", e))?;
    
    // Get proof-generator directory (workspace root / proof-generator)
    let current_dir = std::env::current_dir()
        .map_err(|e| anyhow::anyhow!("Failed to get current directory: {}", e))?;
    
    // Try workspace root first (if current_dir is src-tauri, go up one level)
    let workspace_root = if current_dir.ends_with("src-tauri") {
        current_dir.parent().unwrap_or(&current_dir)
    } else {
        &current_dir
    };
    
    let proof_generator_dir = workspace_root.join("proof-generator");
    let script_path = proof_generator_dir.join("index.js");
    
    tracing::debug!("Shield key - Looking for script at: {}", script_path.display());
    
    if !script_path.exists() {
        return Err(anyhow::anyhow!(
            "proof-generator/index.js not found at {}", 
            script_path.display()
        ).into());
    }
    
    // Execute Node.js script
    let output = Command::new("node")
        .arg(&script_path)
        .arg(&request_json)
        .current_dir(&proof_generator_dir)
        .output()
        .map_err(|e| anyhow::anyhow!("Failed to execute Node.js: {}", e))?;
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(anyhow::anyhow!("Shield key retrieval failed: {}", stderr).into());
    }
    
    // Parse response
    let stdout = String::from_utf8_lossy(&output.stdout);
    let json_line = stdout
        .lines()
        .rev()
        .find(|line| line.trim().starts_with('{'))
        .ok_or_else(|| anyhow::anyhow!("No JSON output from shield key retrieval"))?;
    
    let response: ShieldKeyResponse = serde_json::from_str(json_line)
        .map_err(|e| anyhow::anyhow!("Failed to parse response: {}", e))?;
    
    if !response.success {
        return Err(anyhow::anyhow!(
            "Shield key retrieval failed: {}",
            response.error.unwrap_or_else(|| "Unknown error".to_string())
        ).into());
    }
    
    tracing::info!("Shield private key retrieved successfully");
    
    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Only run if Node.js and proof-generator are set up
    async fn test_create_wallet() {
        let encryption_key = format!("0x{}", "0".repeat(64)); // 32 bytes
        let result = create_railgun_wallet(&encryption_key, None).await;
        
        assert!(result.is_ok());
        let wallet = result.unwrap();
        assert!(!wallet.railgun_wallet_id.is_empty());
        assert!(!wallet.railgun_address.is_empty());
        assert!(!wallet.mnemonic.is_empty());
    }
    
    #[tokio::test]
    #[ignore]
    async fn test_get_shield_key() {
        // First create a wallet
        let encryption_key = format!("0x{}", "0".repeat(64));
        let wallet = create_railgun_wallet(&encryption_key, None).await.unwrap();
        
        // Then get its shield key
        let result = get_shield_private_key(&wallet.railgun_wallet_id).await;
        
        assert!(result.is_ok());
        let key_response = result.unwrap();
        assert!(!key_response.shield_private_key.is_empty());
    }
}
