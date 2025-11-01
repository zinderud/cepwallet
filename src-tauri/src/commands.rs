use crate::hardware::{DeviceInfo, TrezorManager};
use crate::privacy::{PrivacyLevel, PrivacyManager, PrivacyPoolOperation, ShieldedTransaction};
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

pub struct AppState {
    pub trezor: Mutex<Option<TrezorManager>>,
    pub privacy: Mutex<Option<PrivacyManager>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionRequest {
    pub to: String,
    pub value: String,
    pub data: Option<String>,
    pub gas_limit: Option<String>,
    pub gas_price: Option<String>,
    pub nonce: Option<u64>,
    pub chain_id: u64,
}

/// Connect to Trezor device
#[tauri::command]
pub async fn connect_device(state: State<'_, AppState>) -> Result<DeviceInfo, String> {
    let manager = TrezorManager::new(5000).map_err(|e| e.to_string())?;

    let device_info = manager.connect().await.map_err(|e| e.to_string())?;

    let mut trezor = state.trezor.lock().await;
    *trezor = Some(manager);

    Ok(device_info)
}

/// Disconnect from Trezor device
#[tauri::command]
pub async fn disconnect_device(state: State<'_, AppState>) -> Result<(), String> {
    let mut trezor = state.trezor.lock().await;

    if let Some(manager) = trezor.as_ref() {
        manager.disconnect().await.map_err(|e| e.to_string())?;
    }

    *trezor = None;
    Ok(())
}

/// Get device information
#[tauri::command]
pub async fn get_device_info(state: State<'_, AppState>) -> Result<DeviceInfo, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    manager.get_device_info().await.map_err(|e| e.to_string())
}

/// Get public key for a derivation path
#[tauri::command]
pub async fn get_public_key(state: State<'_, AppState>, path: String) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    let pubkey = manager
        .get_public_key(&path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(pubkey.public_key)
}

/// Get Ethereum address for a derivation path
#[tauri::command]
pub async fn get_address(state: State<'_, AppState>, path: String) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    manager.get_address(&path).await.map_err(|e| e.to_string())
}

/// Get multiple Ethereum addresses
#[tauri::command]
pub async fn get_addresses(
    state: State<'_, AppState>,
    start_index: u32,
    count: u32,
) -> Result<Vec<String>, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    manager
        .get_addresses(start_index, count)
        .await
        .map_err(|e| e.to_string())
}

/// Sign an Ethereum transaction
#[tauri::command]
pub async fn sign_transaction(
    state: State<'_, AppState>,
    path: String,
    tx: TransactionRequest,
) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    // Serialize transaction to bytes (simplified)
    let tx_data = serde_json::to_vec(&tx).map_err(|e| e.to_string())?;

    let signed = manager
        .sign_transaction(&path, tx_data)
        .await
        .map_err(|e| e.to_string())?;

    Ok(signed.signature)
}

/// Sign a message
#[tauri::command]
pub async fn sign_message(
    state: State<'_, AppState>,
    path: String,
    message: String,
) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    manager
        .sign_message(&path, &message)
        .await
        .map_err(|e| e.to_string())
}

/// Simple greet command for testing Tauri IPC
#[tauri::command]
pub fn greet(name: String) -> String {
    format!("Hello, {}! Welcome to CepWallet.", name)
}

/// Sign EIP-712 typed data
#[tauri::command]
pub async fn sign_typed_data(
    state: State<'_, AppState>,
    path: String,
    data: serde_json::Value,
) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor.as_ref().ok_or("Device not connected".to_string())?;

    manager
        .sign_typed_data(&path, data)
        .await
        .map_err(|e| e.to_string())
}

// ============================================================================
// PRIVACY COMMANDS (Kohaku Integration)
// ============================================================================

/// Initialize privacy features (RAILGUN + Privacy Pools)
#[tauri::command]
pub async fn initialize_privacy(state: State<'_, AppState>, chain_id: u64) -> Result<(), String> {
    let mut privacy = state.privacy.lock().await;

    if privacy.is_some() {
        return Ok(()); // Already initialized
    }

    let mut manager = PrivacyManager::new(chain_id).map_err(|e| e.to_string())?;
    manager.initialize().await.map_err(|e| e.to_string())?;

    *privacy = Some(manager);

    println!(
        "✅ Privacy features initialized for chain {} (RAILGUN + Privacy Pools)",
        chain_id
    );
    Ok(())
}

/// Check if privacy features are ready
#[tauri::command]
pub async fn is_privacy_ready(state: State<'_, AppState>) -> Result<bool, String> {
    let privacy = state.privacy.lock().await;

    match privacy.as_ref() {
        Some(manager) => Ok(manager.is_ready()),
        None => Ok(false),
    }
}

/// Shield ETH/tokens (Public → Private via RAILGUN)
#[tauri::command]
pub async fn shield_transaction(
    state: State<'_, AppState>,
    token: String,
    amount: String,
    railgun_address: String,
    shield_private_key: String,
) -> Result<ShieldedTransaction, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    manager
        .railgun()
        .shield(&token, &amount, &railgun_address, &shield_private_key)
        .await
        .map_err(|e| e.to_string())
}

/// Unshield ETH/tokens (Private → Public via RAILGUN)
#[tauri::command]
pub async fn unshield_transaction(
    state: State<'_, AppState>,
    token: String,
    amount: String,
    recipient: String,
    railgun_wallet_id: String,
    encryption_key: String,
    mnemonic: String,
) -> Result<ShieldedTransaction, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    manager
        .railgun()
        .unshield(
            &railgun_wallet_id,
            &encryption_key,
            &mnemonic,
            &recipient,
            &token,
            &amount,
        )
        .await
        .map_err(|e| e.to_string())
}

/// Private transfer (Private → Private via RAILGUN)
#[tauri::command]
pub async fn private_transfer(
    state: State<'_, AppState>,
    recipient: String,
    token: String,
    amount: String,
    railgun_wallet_id: String,
    encryption_key: String,
    mnemonic: String,
) -> Result<ShieldedTransaction, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    manager
        .railgun()
        .shielded_transfer(
            &railgun_wallet_id,
            &encryption_key,
            &mnemonic,
            &recipient,
            &token,
            &amount,
        )
        .await
        .map_err(|e| e.to_string())
}

/// Get shielded balance
#[tauri::command]
pub async fn get_shielded_balance(
    state: State<'_, AppState>,
    token: String,
) -> Result<String, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    manager
        .railgun()
        .get_shielded_balance(&token)
        .await
        .map_err(|e| e.to_string())
}

/// Scan merkletree for wallet balance updates
#[tauri::command]
pub async fn scan_merkletree(
    state: State<'_, AppState>,
    railgun_wallet_id: String,
) -> Result<(), String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    manager
        .railgun()
        .scan_merkletree(&railgun_wallet_id)
        .await
        .map_err(|e| e.to_string())
}

/// Join a privacy pool
#[tauri::command]
pub async fn join_privacy_pool(
    state: State<'_, AppState>,
    pool_id: String,
    token: String,
    deposit_amount: String,
) -> Result<PrivacyPoolOperation, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    // Note: This returns immutable reference, but join_pool needs mutable
    // In production, we'd use RefCell or redesign the API
    // For now, this is a placeholder showing the interface

    Err("Pool operations require mutable access - to be implemented".to_string())
}

/// Exit from a privacy pool
#[tauri::command]
pub async fn exit_privacy_pool(
    state: State<'_, AppState>,
    pool_id: String,
    withdraw_address: String,
) -> Result<PrivacyPoolOperation, String> {
    let privacy = state.privacy.lock().await;
    let _manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    Err("Pool operations require mutable access - to be implemented".to_string())
}

/// Swap within privacy pool
#[tauri::command]
pub async fn privacy_pool_swap(
    state: State<'_, AppState>,
    pool_id: String,
    from_token: String,
    to_token: String,
    amount: String,
) -> Result<PrivacyPoolOperation, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    manager
        .privacy_pools()
        .swap_in_pool(&pool_id, &from_token, &to_token, &amount)
        .await
        .map_err(|e| e.to_string())
}

/// Generate ZK proof
#[tauri::command]
pub async fn generate_zk_proof(
    state: State<'_, AppState>,
    proof_type: String,
    public_inputs: Vec<String>,
    private_inputs: Vec<String>,
) -> Result<Vec<u8>, String> {
    let privacy = state.privacy.lock().await;
    let manager = privacy
        .as_ref()
        .ok_or("Privacy features not initialized".to_string())?;

    // Parse proof type
    use crate::privacy::ProofType;
    let ptype = match proof_type.as_str() {
        "shield" => ProofType::Shield,
        "transfer" => ProofType::Transfer,
        "unshield" => ProofType::Unshield,
        "pool_membership" => ProofType::PoolMembership,
        "compliance" => ProofType::Compliance,
        _ => return Err(format!("Invalid proof type: {}", proof_type)),
    };

    manager
        .zk_generator()
        .generate_proof(ptype, public_inputs, private_inputs)
        .await
        .map_err(|e| e.to_string())
}

/// Get proof generation time estimate
#[tauri::command]
pub fn estimate_proof_time(proof_type: String) -> Result<u64, String> {
    use crate::privacy::ProofType;

    let ptype = match proof_type.as_str() {
        "shield" => ProofType::Shield,
        "transfer" => ProofType::Transfer,
        "unshield" => ProofType::Unshield,
        "pool_membership" => ProofType::PoolMembership,
        "compliance" => ProofType::Compliance,
        _ => return Err(format!("Invalid proof type: {}", proof_type)),
    };

    // This would come from ZKProofGenerator, but we'll hardcode for now
    let time = match ptype {
        ProofType::Shield => 8,
        ProofType::Transfer => 20,
        ProofType::Unshield => 10,
        ProofType::PoolMembership => 15,
        ProofType::Compliance => 25,
    };

    Ok(time)
}

// ============================================================================
// RAILGUN WALLET MANAGEMENT COMMANDS
// ============================================================================

/// Create a new RAILGUN wallet
#[tauri::command]
pub async fn create_railgun_wallet(
    encryption_key: String,
    mnemonic: Option<String>,
) -> Result<serde_json::Value, String> {
    use crate::privacy::wallet;

    tracing::info!("Creating RAILGUN wallet");
    tracing::debug!(
        "Encryption key: {}...",
        &encryption_key[..10.min(encryption_key.len())]
    );

    let response = wallet::create_railgun_wallet(&encryption_key, mnemonic.as_deref())
        .await
        .map_err(|e| {
            tracing::error!("Wallet creation failed: {}", e);
            e.to_string()
        })?;

    Ok(serde_json::json!({
        "success": true,
        "railgunWalletId": response.railgun_wallet_id,
        "railgunAddress": response.railgun_address,
        "mnemonic": response.mnemonic,
    }))
}

/// Get shield private key for a RAILGUN wallet
#[tauri::command]
pub async fn get_shield_key(railgun_wallet_id: String) -> Result<serde_json::Value, String> {
    use crate::privacy::wallet;

    tracing::info!(
        "get_shield_key called with wallet_id: {}",
        railgun_wallet_id
    );

    let response = wallet::get_shield_private_key(&railgun_wallet_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "success": true,
        "shieldPrivateKey": response.shield_private_key,
    }))
}
