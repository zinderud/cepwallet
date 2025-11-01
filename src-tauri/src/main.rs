#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod crypto;
mod error;
mod hardware;
mod privacy;
mod utils;

use commands::{
    connect_device,
    // RAILGUN Wallet Management
    create_railgun_wallet,
    disconnect_device,
    estimate_proof_time,
    exit_privacy_pool,
    generate_zk_proof,
    get_address,
    get_addresses,
    get_device_info,
    get_public_key,
    get_shield_key,
    get_shielded_balance,
    greet,
    // Privacy commands
    initialize_privacy,
    is_privacy_ready,
    join_privacy_pool,
    privacy_pool_swap,
    private_transfer,
    scan_merkletree,
    shield_transaction,
    sign_message,
    sign_transaction,
    sign_typed_data,
    unshield_transaction,
    AppState,
};
use tokio::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            trezor: Mutex::new(None),
            privacy: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            // Test Commands
            greet,
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
            // Privacy Commands
            initialize_privacy,
            is_privacy_ready,
            shield_transaction,
            unshield_transaction,
            private_transfer,
            get_shielded_balance,
            scan_merkletree,
            join_privacy_pool,
            exit_privacy_pool,
            privacy_pool_swap,
            generate_zk_proof,
            estimate_proof_time,
            // RAILGUN Wallet Management
            create_railgun_wallet,
            get_shield_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
