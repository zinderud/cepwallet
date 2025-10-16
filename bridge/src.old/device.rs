use anyhow::Result;
use serde::{Deserialize, Serialize};
use log::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub model: String,
    pub firmware: String,
    pub serial_number: Option<String>,
    pub connected: bool,
}

pub async fn get_device_info() -> Result<DeviceInfo> {
    // TODO: Implement actual USB/HID scanning
    // For now, return a placeholder that will be replaced by Trezor integration
    info!("Fetching device info (mock)");
    Ok(DeviceInfo {
        model: "Trezor Model T (Mock)".to_string(),
        firmware: "2.6.0".to_string(),
        serial_number: Some("MOCK-001".to_string()),
        connected: false,
    })
}

pub async fn connect_device() -> Result<()> {
    // Deprecated - use trezor::TrezorManager::connect() instead
    info!("Direct connect_device called (deprecated)");
    Ok(())
}

pub async fn disconnect_device() -> Result<()> {
    // Deprecated - use trezor::TrezorManager::disconnect() instead
    info!("Direct disconnect_device called (deprecated)");
    Ok(())
}
