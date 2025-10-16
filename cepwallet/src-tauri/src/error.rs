use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error, Serialize, Deserialize)]
#[serde(tag = "type", content = "message")]
pub enum CepWalletError {
    #[error("Device not found")]
    DeviceNotFound,
    
    #[error("Device not connected")]
    DeviceNotConnected,
    
    #[error("USB error: {0}")]
    UsbError(String),
    
    #[error("Trezor error: {0}")]
    TrezorError(String),
    
    #[error("Transaction error: {0}")]
    TransactionError(String),
    
    #[error("Invalid parameters: {0}")]
    InvalidParameters(String),
    
    #[error("Session error: {0}")]
    SessionError(String),
    
    #[error("Signature error: {0}")]
    SignatureError(String),
    
    #[error("Encoding error: {0}")]
    EncodingError(String),
}

pub type Result<T> = std::result::Result<T, CepWalletError>;

impl From<&str> for CepWalletError {
    fn from(s: &str) -> Self {
        CepWalletError::TrezorError(s.to_string())
    }
}

impl From<String> for CepWalletError {
    fn from(s: String) -> Self {
        CepWalletError::TrezorError(s)
    }
}

// Convert to string for Tauri error handling
impl From<CepWalletError> for String {
    fn from(err: CepWalletError) -> Self {
        err.to_string()
    }
}
