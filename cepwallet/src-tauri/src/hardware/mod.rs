pub mod device;
pub mod trezor;

// Re-export commonly used types
pub use trezor::{TrezorManager, TrezorDevice as DeviceInfo, DerivationPath, PublicKeyResponse, SignatureResponse};
pub use device::{detect_devices, is_trezor_device};
