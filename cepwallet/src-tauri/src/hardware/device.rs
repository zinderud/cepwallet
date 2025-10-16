// Device utilities - USB device management

use crate::error::{CepWalletError, Result};

/// USB device detection
pub async fn detect_devices() -> Result<Vec<String>> {
    // TODO: Implement real USB device detection with hidapi
    Ok(vec!["Trezor Model T (mock)".to_string()])
}

/// Check if device is a Trezor
pub fn is_trezor_device(vendor_id: u16, product_id: u16) -> bool {
    // Trezor vendor ID: 0x534C (SatoshiLabs)
    // Trezor One: 0x0001
    // Trezor Model T: 0x0004
    vendor_id == 0x534C && (product_id == 0x0001 || product_id == 0x0004)
}
