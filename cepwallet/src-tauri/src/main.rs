#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod error;
mod hardware;
mod crypto;
mod utils;

use commands::{
    connect_device, disconnect_device, get_address, get_addresses, get_device_info,
    get_public_key, sign_message, sign_transaction, sign_typed_data, AppState,
};
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            trezor: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            // Device Commands
            connect_device,
            disconnect_device,
            get_device_info,
            // Wallet Commands
            get_public_key,
            get_address,
            get_addresses,
            // Transaction Commands
            sign_transaction,
            sign_message,
            sign_typed_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
