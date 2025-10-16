use crate::hardware::{DeviceInfo, TrezorManager};
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub trezor: Mutex<Option<TrezorManager>>,
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
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

    manager
        .get_device_info()
        .await
        .map_err(|e| e.to_string())
}

/// Get public key for a derivation path
#[tauri::command]
pub async fn get_public_key(
    state: State<'_, AppState>,
    path: String,
) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

    let pubkey = manager
        .get_public_key(&path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(pubkey.public_key)
}

/// Get Ethereum address for a derivation path
#[tauri::command]
pub async fn get_address(
    state: State<'_, AppState>,
    path: String,
) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

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
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

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
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

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
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

    manager
        .sign_message(&path, &message)
        .await
        .map_err(|e| e.to_string())
}

/// Sign EIP-712 typed data
#[tauri::command]
pub async fn sign_typed_data(
    state: State<'_, AppState>,
    path: String,
    data: serde_json::Value,
) -> Result<String, String> {
    let trezor = state.trezor.lock().await;
    let manager = trezor
        .as_ref()
        .ok_or("Device not connected".to_string())?;

    manager
        .sign_typed_data(&path, data)
        .await
        .map_err(|e| e.to_string())
}
