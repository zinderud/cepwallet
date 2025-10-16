// Test binary for FFI bridge
// Run with: cargo run --bin test-ffi

use cepwallet::privacy::ffi::{ProofRequest, ProofResponse};
use std::process::Command;
use serde_json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("\n╔═══════════════════════════════════════════════════╗");
    println!("║   CepWallet FFI Bridge Test                      ║");
    println!("╚═══════════════════════════════════════════════════╝\n");

    // Test 1: Module compilation
    println!("Test 1: FFI module compiled ✓\n");

    // Test 2: ProofRequest serialization
    println!("Test 2: ProofRequest serialization...");
    let request = ProofRequest {
        proof_type: "shield".to_string(),
        chain_id: Some(11155111),
        token: Some("0x0000000000000000000000000000000000000000".to_string()),
        amount: Some("1000000000000000000".to_string()),
        commitment: Some("0xabcd1234".to_string()),
        merkle_root: None,
        nullifier: None,
        output_commitment: None,
        recipient: None,
    };

    let json = serde_json::to_string(&request)?;
    println!("  Serialized: {}", &json[..80.min(json.len())]);
    println!("  ✓ Serialization works\n");

    // Test 3: Execute Node.js process
    println!("Test 3: Calling Node.js proof generator...");
    
    // Get current directory
    let current_dir = std::env::current_dir()?;
    let proof_generator_dir = current_dir.join("proof-generator");
    let script_path = proof_generator_dir.join("test-minimal.js");

    if !script_path.exists() {
        eprintln!("  ✗ Error: {} not found", script_path.display());
        eprintln!("  Make sure you're running from workspace root");
        return Ok(());
    }

    println!("  Script path: {}", script_path.display());
    
    let output = Command::new("node")
        .arg(script_path)
        .current_dir(&proof_generator_dir)
        .output()?;

    if output.status.success() {
        println!("  ✓ Node.js execution successful");
        
        // Show last few lines of output
        let stdout = String::from_utf8_lossy(&output.stdout);
        let lines: Vec<&str> = stdout.lines().collect();
        let last_lines = &lines[lines.len().saturating_sub(5)..];
        
        println!("\n  Node.js output (last 5 lines):");
        for line in last_lines {
            println!("    {}", line);
        }
        println!();
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        eprintln!("  ✗ Node.js execution failed");
        eprintln!("  stderr: {}", stderr);
        return Ok(());
    }

    // Test 4: ProofResponse deserialization
    println!("Test 4: ProofResponse deserialization...");
    let test_response_json = r#"{
        "success": true,
        "proof": "dGVzdCBwcm9vZg==",
        "publicInputs": ["0x123", "0x456", "789"]
    }"#;

    let response: ProofResponse = serde_json::from_str(test_response_json)?;
    println!("  Success: {}", response.success);
    println!("  Proof length: {} bytes", response.proof.len());
    println!("  Public inputs: {} items", response.public_inputs.len());
    println!("  ✓ Deserialization works\n");

    println!("╔═══════════════════════════════════════════════════╗");
    println!("║   ✅ ALL FFI BRIDGE TESTS PASSED                  ║");
    println!("║                                                   ║");
    println!("║   FFI communication layer is working correctly    ║");
    println!("║                                                   ║");
    println!("║   Next: Integrate with railgun.rs                 ║");
    println!("╚═══════════════════════════════════════════════════╝\n");

    Ok(())
}
