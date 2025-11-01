pub mod device;
pub mod trezor;

// Re-export commonly used types
pub use device::{detect_devices, is_trezor_device};
pub use trezor::{
    DerivationPath, PublicKeyResponse, SignatureResponse, TrezorDevice as DeviceInfo, TrezorManager,
};
