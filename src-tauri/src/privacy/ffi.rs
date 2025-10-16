/// FFI Bridge for Node.js Proof Generator
/// 
/// This module provides an interface to call the Node.js proof generator
/// from Rust code. It uses subprocess to execute the Node.js script and
/// captures the JSON output.

use std::process::Command;
use serde::{Deserialize, Serialize};
use crate::error::Result;

/// Request structure sent to Node.js proof generator
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofRequest {
    pub proof_type: String,
    pub chain_id: Option<u64>,
    
    // Shield-specific
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub amount: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub commitment: Option<String>,
    
    // Transfer-specific
    #[serde(skip_serializing_if = "Option::is_none")]
    pub merkle_root: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullifier: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output_commitment: Option<String>,
    
    // Unshield-specific
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recipient: Option<String>,
}

/// Response from Node.js proof generator
#[derive(Debug, Deserialize)]
pub struct ProofResponse {
    pub success: bool,
    #[serde(default)]
    pub proof: String,
    #[serde(default)]
    pub public_inputs: Vec<String>,
    #[serde(default)]
    pub error: Option<String>,
}

/// Generate a ZK-SNARK proof by calling Node.js proof generator
/// 
/// # Arguments
/// * `request` - Proof generation parameters
/// 
/// # Returns
/// * `Result<ProofResponse>` - Generated proof or error
/// 
/// # Example
/// ```rust
/// let request = ProofRequest {
///     proof_type: "shield".to_string(),
///     token: Some("0x...".to_string()),
///     amount: Some("1000000000000000000".to_string()),
///     commitment: Some("0xabcd...".to_string()),
///     ..Default::default()
/// };
/// 
/// let proof = generate_proof(request).await?;
/// ```
pub async fn generate_proof(request: ProofRequest) -> Result<ProofResponse> {
    tracing::info!("Calling Node.js proof generator: {}", request.proof_type);
    
    // Serialize request to JSON
    let request_json = serde_json::to_string(&request)
        .map_err(|e| anyhow::anyhow!("Failed to serialize proof request: {}", e))?;
    
    // Get proof-generator directory path
    let proof_generator_dir = std::env::current_dir()
        .map_err(|e| anyhow::anyhow!("Failed to get current directory: {}", e))?
        .join("proof-generator");
    
    if !proof_generator_dir.exists() {
        return Err(anyhow::anyhow!(
            "proof-generator directory not found at {:?}",
            proof_generator_dir
        ).into());
    }
    
    let script_path = proof_generator_dir.join("index.js");
    
    if !script_path.exists() {
        return Err(anyhow::anyhow!(
            "proof-generator/index.js not found"
        ).into());
    }
    
    tracing::debug!("Running: node {} '{}'", script_path.display(), request_json);
    
    // Execute Node.js script
    let output = Command::new("node")
        .arg(&script_path)
        .arg(&request_json)
        .output()
        .map_err(|e| anyhow::anyhow!("Failed to execute Node.js: {}. Make sure Node.js is installed.", e))?;
    
    // Check if command succeeded
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(anyhow::anyhow!(
            "Proof generation failed: {}",
            stderr
        ).into());
    }
    
    // Parse stdout
    let stdout = String::from_utf8_lossy(&output.stdout);
    tracing::debug!("Node.js output: {}", stdout);
    
    // Extract JSON from output (last line should be JSON)
    let json_line = stdout
        .lines()
        .rev()
        .find(|line| line.trim().starts_with('{'))
        .ok_or_else(|| anyhow::anyhow!("No JSON output found from proof generator"))?;
    
    // Parse response
    let response: ProofResponse = serde_json::from_str(json_line)
        .map_err(|e| anyhow::anyhow!("Failed to parse proof response: {}", e))?;
    
    if !response.success {
        return Err(anyhow::anyhow!(
            "Proof generation failed: {}",
            response.error.unwrap_or_else(|| "Unknown error".to_string())
        ).into());
    }
    
    tracing::info!("Proof generated successfully");
    Ok(response)
}

/// Generate a shield proof (public → private)
pub async fn generate_shield_proof(
    token: &str,
    amount: &str,
    commitment: &str,
    chain_id: u64,
) -> Result<ProofResponse> {
    let request = ProofRequest {
        proof_type: "shield".to_string(),
        chain_id: Some(chain_id),
        token: Some(token.to_string()),
        amount: Some(amount.to_string()),
        commitment: Some(commitment.to_string()),
        merkle_root: None,
        nullifier: None,
        output_commitment: None,
        recipient: None,
    };
    
    generate_proof(request).await
}

/// Generate a private transfer proof (private → private)
pub async fn generate_transfer_proof(
    merkle_root: &str,
    nullifier: &str,
    output_commitment: &str,
    chain_id: u64,
) -> Result<ProofResponse> {
    let request = ProofRequest {
        proof_type: "transfer".to_string(),
        chain_id: Some(chain_id),
        merkle_root: Some(merkle_root.to_string()),
        nullifier: Some(nullifier.to_string()),
        output_commitment: Some(output_commitment.to_string()),
        token: None,
        amount: None,
        commitment: None,
        recipient: None,
    };
    
    generate_proof(request).await
}

/// Generate an unshield proof (private → public)
pub async fn generate_unshield_proof(
    nullifier: &str,
    recipient: &str,
    amount: &str,
    chain_id: u64,
) -> Result<ProofResponse> {
    let request = ProofRequest {
        proof_type: "unshield".to_string(),
        chain_id: Some(chain_id),
        nullifier: Some(nullifier.to_string()),
        recipient: Some(recipient.to_string()),
        amount: Some(amount.to_string()),
        token: None,
        commitment: None,
        merkle_root: None,
        output_commitment: None,
    };
    
    generate_proof(request).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Only run if Node.js and proof-generator are set up
    async fn test_shield_proof_generation() {
        let result = generate_shield_proof(
            "0x0000000000000000000000000000000000000000",
            "1000000000000000000",
            "0xabcd1234",
            1,
        ).await;
        
        assert!(result.is_ok());
        let proof = result.unwrap();
        assert!(!proof.proof.is_empty());
        assert!(!proof.public_inputs.is_empty());
    }
}
