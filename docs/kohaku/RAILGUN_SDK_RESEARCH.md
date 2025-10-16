# RAILGUN SDK Integration Research

**Date:** 17 Ekim 2025  
**Status:** Research Phase  
**Target:** Integrate RAILGUN v3.0 privacy protocol into CepWallet Rust backend

---

## 📚 RAILGUN Overview

### What is RAILGUN?

RAILGUN is a privacy protocol for Ethereum and EVM chains that provides:
- **Shielded Transactions**: Private transfers using ZK-SNARKs
- **Merkle Tree**: Anonymous set for hiding transaction origins
- **Note System**: UTXO-like model with encrypted commitments
- **Compliance**: Optional disclosure for regulatory requirements

### Key Features
- ✅ Zero-knowledge proofs (Groth16)
- ✅ Shielded ERC-20 & ETH transfers
- ✅ Privacy pools with configurable disclosure
- ✅ Multi-token support
- ✅ Gas-efficient circuit design

---

## 🔍 Available SDK Options

### 1. Official RAILGUN SDK (JavaScript/TypeScript)

**Package:** `@railgun-community/sdk`  
**Language:** TypeScript/JavaScript  
**Maturity:** Production-ready, audited  
**Pros:**
- ✅ Official support from RAILGUN team
- ✅ Battle-tested in production (Railway wallet)
- ✅ Complete proof generation
- ✅ Merkle tree sync utilities
- ✅ Well-documented

**Cons:**
- ❌ Rust FFI required for integration
- ❌ JavaScript runtime overhead
- ❌ Complex proof generation in Node.js

**Example Usage:**
```typescript
import { RailgunWallet } from '@railgun-community/sdk';

const wallet = new RailgunWallet(mnemonic);
const shieldTx = await wallet.shield({
  token: '0x...',
  amount: '1000000000000000000', // 1 ETH
});
```

---

### 2. Native Rust Implementation (From Scratch)

**Approach:** Build RAILGUN client in pure Rust  
**Maturity:** Does not exist yet  
**Pros:**
- ✅ No FFI overhead
- ✅ Full control over implementation
- ✅ Native performance
- ✅ Better Tauri integration

**Cons:**
- ❌ Significant development effort (~3-6 months)
- ❌ Security audit required
- ❌ Circuit compatibility risks
- ❌ Merkle sync complexity

**Required Components:**
1. **Smart Contract Interaction:** ethers-rs
2. **ZK-SNARK Proofs:** ark-groth16 or bellman
3. **Merkle Tree:** Custom implementation
4. **Note Management:** UTXO tracking
5. **Encryption:** AES-256-GCM for notes

**Example Architecture:**
```rust
struct RailgunWallet {
    ethers_client: Provider,
    spending_key: SpendingKey,
    viewing_key: ViewingKey,
    merkle_tree: MerkleTree,
    notes: Vec<Note>,
}

impl RailgunWallet {
    async fn shield(&self, token: Address, amount: U256) -> Result<TxHash> {
        // 1. Generate commitment
        let commitment = self.generate_commitment(token, amount);
        
        // 2. Generate ZK proof
        let proof = self.generate_shield_proof(commitment)?;
        
        // 3. Send transaction
        let tx = self.client.send_transaction(/*...*/).await?;
        Ok(tx.hash())
    }
}
```

---

### 3. Hybrid Approach (Recommended) ⭐

**Strategy:** 
- Use Rust for contract interaction (ethers-rs)
- Use JavaScript SDK for ZK proof generation (via FFI)
- Gradually migrate to native Rust proofs

**Maturity:** Best of both worlds  
**Pros:**
- ✅ Quick to implement (~1-2 weeks)
- ✅ Leverages mature proof generation
- ✅ Native Rust contract interaction
- ✅ Migration path to full Rust

**Cons:**
- ⚠️ FFI complexity
- ⚠️ JavaScript runtime required
- ⚠️ Slight performance overhead

**Architecture Diagram:**
```
┌─────────────────────────────────────────────┐
│  CepWallet Tauri App (Rust)                 │
│  ┌───────────────────────────────────────┐  │
│  │  Privacy Commands (Tauri IPC)         │  │
│  └───────────────────────────────────────┘  │
│              ↓                               │
│  ┌───────────────────────────────────────┐  │
│  │  RailgunManager (Rust)                │  │
│  │  - Contract interaction (ethers-rs)   │  │
│  │  - Merkle sync                        │  │
│  │  - Note management                    │  │
│  └───────────────────────────────────────┘  │
│              ↓ FFI                           │
│  ┌───────────────────────────────────────┐  │
│  │  Node.js Process                      │  │
│  │  - @railgun-community/sdk             │  │
│  │  - ZK proof generation                │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Recommended Implementation: Hybrid Approach

### Phase 1: Setup (Week 1)

#### 1.1 Rust Dependencies

Add to `src-tauri/Cargo.toml`:
```toml
[dependencies]
# Ethereum interaction
ethers = { version = "2.0", features = ["ws", "rustls"] }
ethers-contract = "2.0"
ethers-providers = "2.0"
ethers-signers = "2.0"

# Async runtime
tokio = { version = "1.0", features = ["full"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Cryptography
hex = "0.4"
sha3 = "0.10"
aes-gcm = "0.10"

# FFI for Node.js
napi = { version = "2.0", features = ["async"] }
napi-derive = "2.0"

# Utilities
anyhow = "1.0"
thiserror = "1.0"
tracing = "0.1"
```

#### 1.2 JavaScript Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "@railgun-community/sdk": "^3.0.0",
    "@railgun-community/shared-models": "^3.0.0"
  }
}
```

---

### Phase 2: Contract Integration (Week 1-2)

#### 2.1 RAILGUN Contract ABI

Create `src-tauri/src/privacy/railgun_abi.rs`:
```rust
use ethers::prelude::*;

abigen!(
    RailgunLogic,
    r#"[
        function generateDeposit() external view returns (bytes32)
        function deposit(bytes32[] calldata commitments, uint256[] calldata amounts) external payable
        function transact(bytes calldata proof, bytes calldata publicInputs) external
        function withdraw(bytes calldata proof, address to, uint256 amount) external
        event CommitmentCreated(bytes32 indexed commitment, uint256 blockNumber)
        event Nullified(bytes32 indexed nullifier, uint256 blockNumber)
    ]"#,
);
```

#### 2.2 Contract Addresses

Create `src-tauri/src/privacy/contracts.rs`:
```rust
use ethers::types::Address;

pub struct RailgunContracts {
    pub logic: Address,
    pub proxy: Address,
    pub treasury: Address,
}

impl RailgunContracts {
    pub fn mainnet() -> Self {
        Self {
            logic: "0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9".parse().unwrap(),
            proxy: "0x3b5FFC4842Eb34e28Faff7E6c08Bdc7dE88d1a28".parse().unwrap(),
            treasury: "0x..."parse().unwrap(),
        }
    }
    
    pub fn sepolia() -> Self {
        Self {
            logic: "0x...".parse().unwrap(),
            proxy: "0x...".parse().unwrap(),
            treasury: "0x...".parse().unwrap(),
        }
    }
}
```

---

### Phase 3: FFI Bridge (Week 2)

#### 3.1 Node.js Proof Generator

Create `src-tauri/proof-generator/index.js`:
```javascript
const { RailgunWallet, generateProof } = require('@railgun-community/sdk');

// Initialize RAILGUN SDK
async function initRailgun() {
  await RailgunWallet.initialize(/* provider */);
}

// Generate shield proof
async function generateShieldProof(params) {
  const { token, amount, commitment } = params;
  
  const proof = await generateProof({
    type: 'shield',
    inputs: {
      token,
      amount,
      commitment,
    }
  });
  
  return {
    proof: proof.proof,
    publicInputs: proof.publicInputs,
  };
}

module.exports = {
  initRailgun,
  generateShieldProof,
};
```

#### 3.2 Rust FFI Wrapper

Create `src-tauri/src/privacy/ffi.rs`:
```rust
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ProofRequest {
    proof_type: String,
    token: String,
    amount: String,
    commitment: String,
}

#[derive(Deserialize)]
struct ProofResponse {
    proof: Vec<u8>,
    public_inputs: Vec<String>,
}

pub async fn generate_proof_via_nodejs(
    proof_type: &str,
    token: &str,
    amount: &str,
    commitment: &str,
) -> Result<ProofResponse> {
    let request = ProofRequest {
        proof_type: proof_type.to_string(),
        token: token.to_string(),
        amount: amount.to_string(),
        commitment: commitment.to_string(),
    };
    
    // Call Node.js script
    let output = Command::new("node")
        .arg("proof-generator/index.js")
        .arg(serde_json::to_string(&request)?)
        .output()?;
    
    if !output.status.success() {
        return Err(anyhow!("Proof generation failed"));
    }
    
    let response: ProofResponse = serde_json::from_slice(&output.stdout)?;
    Ok(response)
}
```

---

### Phase 4: Shield Implementation (Week 3)

Update `src-tauri/src/privacy/railgun.rs`:
```rust
use ethers::prelude::*;
use crate::privacy::ffi::generate_proof_via_nodejs;

impl RailgunManager {
    pub async fn shield(
        &self,
        token_address: &str,
        amount: &str,
    ) -> Result<ShieldedTransaction> {
        // 1. Generate commitment
        let commitment = self.generate_commitment(token_address, amount)?;
        
        // 2. Generate ZK proof (via Node.js FFI)
        let proof = generate_proof_via_nodejs(
            "shield",
            token_address,
            amount,
            &hex::encode(&commitment),
        ).await?;
        
        // 3. Prepare contract call
        let contract = RailgunLogic::new(
            self.contract_address,
            self.provider.clone(),
        );
        
        let tx = contract
            .deposit(
                vec![commitment],
                vec![U256::from_dec_str(amount)?],
            )
            .value(if token_address == ETH { U256::from_dec_str(amount)? } else { U256::zero() })
            .send()
            .await?;
        
        // 4. Wait for confirmation
        let receipt = tx.await?;
        
        // 5. Create note
        let note = Note {
            commitment: hex::encode(&commitment),
            token: token_address.to_string(),
            amount: amount.to_string(),
            spent: false,
        };
        
        self.notes.lock().await.push(note);
        
        Ok(ShieldedTransaction {
            tx_hash: format!("{:?}", receipt.transaction_hash),
            status: "Confirmed".to_string(),
            privacy_level: "Railgun".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            proof_time_ms: Some(8000),
        })
    }
}
```

---

## 📊 Performance Estimates

| Operation | Hybrid (FFI) | Native Rust | JavaScript SDK |
|-----------|--------------|-------------|----------------|
| Shield Proof | ~10s | ~5s | ~12s |
| Transfer Proof | ~25s | ~15s | ~30s |
| Unshield Proof | ~12s | ~6s | ~15s |
| Merkle Sync | ~3s | ~2s | ~5s |

---

## 🔐 Security Considerations

### 1. Proof Generation Trust
- ⚠️ Node.js process runs proofs - isolated environment needed
- ✅ Verify proof outputs before submission
- ✅ Use checksums for proof-generator scripts

### 2. Key Management
- ❌ Never pass spending keys to Node.js
- ✅ Only pass public commitments
- ✅ Sign transactions in Rust only

### 3. Contract Interaction
- ✅ Use ethers-rs for all blockchain calls
- ✅ Verify contract addresses
- ✅ Gas estimation before sending

---

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ Update .gitignore
2. 🔄 Add Rust dependencies to Cargo.toml
3. ⏳ Add JavaScript dependencies to package.json
4. ⏳ Create proof-generator/ directory
5. ⏳ Implement FFI bridge

### Short-term (Next 2 Weeks)
1. Implement shield() function
2. Implement unshield() function
3. Implement private_transfer() function
4. Add merkle tree sync
5. Test on Sepolia testnet

### Long-term (1-3 Months)
1. Migrate to native Rust proofs (ark-groth16)
2. Optimize proof generation
3. Add Privacy Pools support
4. Security audit
5. Mainnet deployment

---

## 📚 Resources

- [RAILGUN Documentation](https://docs.railgun.org/)
- [RAILGUN GitHub](https://github.com/Railgun-Privacy)
- [ethers-rs Documentation](https://docs.rs/ethers/)
- [ark-groth16 Docs](https://docs.rs/ark-groth16/)
- [circom Documentation](https://docs.circom.io/)

---

**Conclusion:** Hybrid approach provides fastest path to production while maintaining flexibility for future optimization. Start with FFI bridge, validate functionality, then gradually migrate to native Rust.

**Status:** ✅ Research Complete, Ready for Implementation  
**Next:** Update Cargo.toml and begin Phase 1
