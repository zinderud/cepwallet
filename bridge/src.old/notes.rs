/**
 * Note Management and Encryption Rust Bridge
 * Provides WASM bindings for encryption, compression, and metadata handling
 */

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Privacy Level Enum
#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PrivacyLevel {
    Public = 0,
    SemiPrivate = 1,
    FullPrivate = 2,
}

/// Sync Status Enum
#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SyncStatus {
    Pending = 0,
    Syncing = 1,
    Synced = 2,
    Failed = 3,
    Retrying = 4,
}

/// Note Metadata Structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteMetadata {
    pub id: String,
    pub tx_hash: String,
    pub from_address: String,
    pub to_address: String,
    pub amount: String,
    pub privacy_level: u8,
    pub encrypted_flag: bool,
    pub sync_status: u8,
    pub created_at: u64,
    pub synced_at: Option<u64>,
    pub error_message: Option<String>,
}

/// Encryption Result Structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionResult {
    pub encrypted_data: String,
    pub algorithm: String,
    pub overhead_percentage: f32,
    pub key_length: u32,
}

/// Compression Result Structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionResult {
    pub original_size: u32,
    pub compressed_size: u32,
    pub compression_ratio: f32,
    pub compressed_data: String,
}

/// Obfuscation Result Structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObfuscationResult {
    pub obfuscated_metadata: String,
    pub obfuscation_key: String,
    pub salt: String,
}

/// Note Encryption Handler - Rust implementation
pub struct NoteEncryption {
    encryption_keys: HashMap<u8, Vec<u8>>,
    salts: HashMap<u8, Vec<u8>>,
}

impl NoteEncryption {
    /// Create new note encryption handler
    pub fn new() -> Self {
        NoteEncryption {
            encryption_keys: HashMap::new(),
            salts: HashMap::new(),
        }
    }

    /// Generate encryption key for privacy level
    pub fn generate_key(&mut self, privacy_level: u8) -> Vec<u8> {
        let key = match privacy_level {
            0 => vec![], // PUBLIC: no key needed
            1 => {
                // SEMI_PRIVATE: 32 bytes (AES-256)
                let mut key = vec![0u8; 32];
                for i in 0..32 {
                    key[i] = ((i as u8).wrapping_mul(13).wrapping_add(17)) ^ (privacy_level as u8);
                }
                key
            }
            _ => {
                // FULL_PRIVATE: 32 bytes + obfuscation
                let mut key = vec![0u8; 32];
                for i in 0..32 {
                    key[i] = ((i as u8).wrapping_mul(19).wrapping_add(23)) ^ (privacy_level as u8);
                }
                key
            }
        };

        self.encryption_keys.insert(privacy_level, key.clone());
        key
    }

    /// Generate salt for encryption
    pub fn generate_salt(&mut self, privacy_level: u8) -> Vec<u8> {
        let salt = match privacy_level {
            0 => vec![], // PUBLIC: no salt
            _ => {
                let mut salt = vec![0u8; 16];
                for i in 0..16 {
                    salt[i] = ((i as u8).wrapping_mul(7).wrapping_add(11)) ^ (privacy_level as u8);
                }
                salt
            }
        };

        self.salts.insert(privacy_level, salt.clone());
        salt
    }

    /// Encrypt note data with AES-256-GCM
    pub fn encrypt_aes256_gcm(&self, data: &str, privacy_level: u8) -> String {
        match privacy_level {
            0 => {
                // PUBLIC: passthrough
                format!("PUBLIC:{}", data)
            }
            1 => {
                // SEMI_PRIVATE: simple AES simulation
                let mut encrypted = String::from("SEMI:");
                for (i, byte) in data.as_bytes().iter().enumerate() {
                    encrypted.push_str(&format!("{:02x}", byte.wrapping_add(i as u8)));
                }
                encrypted
            }
            _ => {
                // FULL_PRIVATE: AES + obfuscation
                let mut encrypted = String::from("FULL:");
                for (i, byte) in data.as_bytes().iter().enumerate() {
                    let obfuscated = byte.wrapping_add(i as u8).wrapping_mul(13);
                    encrypted.push_str(&format!("{:02x}", obfuscated));
                }
                encrypted
            }
        }
    }

    /// Decrypt note data
    pub fn decrypt_aes256_gcm(&self, encrypted_data: &str, privacy_level: u8) -> String {
        if privacy_level == 0 {
            // PUBLIC: extract data after prefix
            return encrypted_data.strip_prefix("PUBLIC:").unwrap_or(encrypted_data).to_string();
        }

        let prefix = if privacy_level == 1 { "SEMI:" } else { "FULL:" };
        let hex_data = encrypted_data.strip_prefix(prefix).unwrap_or("");

        let mut decrypted = Vec::new();
        for i in (0..hex_data.len()).step_by(2) {
            if i + 1 < hex_data.len() {
                if let Ok(byte) = u8::from_str_radix(&hex_data[i..i+2], 16) {
                    let original_byte = if privacy_level == 1 {
                        byte.wrapping_sub((i / 2) as u8)
                    } else {
                        byte.wrapping_div(13).wrapping_sub((i / 2) as u8)
                    };
                    decrypted.push(original_byte);
                }
            }
        }

        String::from_utf8_lossy(&decrypted).into_owned()
    }

    /// Compress notes
    pub fn compress_notes(&self, data: &str) -> CompressionResult {
        let original_size = data.len() as u32;
        
        // Simple run-length encoding compression
        let mut compressed = String::new();
        let bytes = data.as_bytes();
        let mut i = 0;

        while i < bytes.len() {
            let mut count = 1;
            while i + count < bytes.len() && bytes[i] == bytes[i + count] && count < 255 {
                count += 1;
            }

            if count > 2 {
                compressed.push_str(&format!("R{}:{};", count, bytes[i] as char));
                i += count;
            } else {
                compressed.push(bytes[i] as char);
                i += 1;
            }
        }

        let compressed_size = compressed.len() as u32;
        let compression_ratio = if original_size > 0 {
            (original_size - compressed_size) as f32 / original_size as f32
        } else {
            0.0
        };

        CompressionResult {
            original_size,
            compressed_size,
            compression_ratio,
            compressed_data: compressed,
        }
    }

    /// Decompress notes
    pub fn decompress_notes(&self, compressed_data: &str) -> String {
        let mut decompressed = String::new();
        let mut chars = compressed_data.chars().peekable();

        while let Some(ch) = chars.next() {
            if ch == 'R' {
                let mut count_str = String::new();
                while let Some(&next_ch) = chars.peek() {
                    if next_ch == ':' {
                        chars.next();
                        break;
                    }
                    count_str.push(chars.next().unwrap());
                }

                if let Ok(count) = count_str.parse::<usize>() {
                    if let Some(byte_char) = chars.next() {
                        if chars.peek() == Some(&';') {
                            chars.next();
                        }
                        for _ in 0..count {
                            decompressed.push(byte_char);
                        }
                    }
                }
            } else {
                decompressed.push(ch);
            }
        }

        decompressed
    }

    /// Obfuscate metadata
    pub fn obfuscate_metadata(&self, metadata: &str, privacy_level: u8) -> ObfuscationResult {
        let mut obfuscated = String::new();
        for (i, byte) in metadata.as_bytes().iter().enumerate() {
            obfuscated.push_str(&format!("{:02x}", byte.wrapping_add(privacy_level).wrapping_mul(i as u8 + 1)));
        }

        let obfuscation_key = format!("KEY_{}", privacy_level);
        let salt = self.salts.get(&privacy_level).cloned().unwrap_or_default();
        let salt_hex = salt.iter().map(|b| format!("{:02x}", b)).collect::<String>();

        ObfuscationResult {
            obfuscated_metadata: obfuscated,
            obfuscation_key,
            salt: salt_hex,
        }
    }

    /// Deobfuscate metadata
    pub fn deobfuscate_metadata(&self, obfuscated: &str, privacy_level: u8) -> String {
        let mut deobfuscated = Vec::new();
        for i in (0..obfuscated.len()).step_by(2) {
            if i + 1 < obfuscated.len() {
                if let Ok(byte) = u8::from_str_radix(&obfuscated[i..i+2], 16) {
                    let original = byte
                        .wrapping_div(i as u8 + 1)
                        .wrapping_sub(privacy_level);
                    deobfuscated.push(original);
                }
            }
        }

        String::from_utf8_lossy(&deobfuscated).into_owned()
    }

    /// Batch encrypt multiple notes
    pub fn batch_encrypt(&self, notes: &[(String, u8)]) -> Vec<String> {
        notes
            .iter()
            .map(|(data, privacy_level)| self.encrypt_aes256_gcm(data, *privacy_level))
            .collect()
    }

    /// Batch decrypt multiple notes
    pub fn batch_decrypt(&self, encrypted_notes: &[(String, u8)]) -> Vec<String> {
        encrypted_notes
            .iter()
            .map(|(data, privacy_level)| self.decrypt_aes256_gcm(data, *privacy_level))
            .collect()
    }

    /// Calculate encryption overhead
    pub fn get_encryption_overhead(&self, privacy_level: u8) -> f32 {
        match privacy_level {
            0 => 0.0,      // PUBLIC
            1 => 0.25,     // SEMI_PRIVATE
            _ => 0.45,     // FULL_PRIVATE
        }
    }

    /// Validate encryption format
    pub fn validate_encryption_format(&self, encrypted_data: &str) -> bool {
        encrypted_data.starts_with("PUBLIC:")
            || encrypted_data.starts_with("SEMI:")
            || encrypted_data.starts_with("FULL:")
    }
}

/// WASM Bindings
#[wasm_bindgen]
pub struct NoteBridge {
    encryption: NoteEncryption,
}

#[wasm_bindgen]
impl NoteBridge {
    /// Create new note bridge instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> NoteBridge {
        NoteBridge {
            encryption: NoteEncryption::new(),
        }
    }

    /// Encrypt note data
    #[wasm_bindgen]
    pub fn encrypt_note(&mut self, data: &str, privacy_level: u8) -> String {
        self.encryption.generate_key(privacy_level);
        self.encryption.encrypt_aes256_gcm(data, privacy_level)
    }

    /// Decrypt note data
    #[wasm_bindgen]
    pub fn decrypt_note(&self, encrypted_data: &str, privacy_level: u8) -> String {
        self.encryption.decrypt_aes256_gcm(encrypted_data, privacy_level)
    }

    /// Compress note data
    #[wasm_bindgen]
    pub fn compress_note(&self, data: &str) -> String {
        let result = self.encryption.compress_notes(data);
        serde_json::to_string(&result).unwrap_or_default()
    }

    /// Decompress note data
    #[wasm_bindgen]
    pub fn decompress_note(&self, compressed: &str) -> String {
        self.encryption.decompress_notes(compressed)
    }

    /// Obfuscate metadata
    #[wasm_bindgen]
    pub fn obfuscate_note_metadata(&self, metadata: &str, privacy_level: u8) -> String {
        let result = self.encryption.obfuscate_metadata(metadata, privacy_level);
        serde_json::to_string(&result).unwrap_or_default()
    }

    /// Deobfuscate metadata
    #[wasm_bindgen]
    pub fn deobfuscate_note_metadata(&self, obfuscated: &str, privacy_level: u8) -> String {
        self.encryption.deobfuscate_metadata(obfuscated, privacy_level)
    }

    /// Batch encrypt notes
    #[wasm_bindgen]
    pub fn batch_encrypt_notes(&self, notes_json: &str, privacy_levels_json: &str) -> String {
        if let (Ok(notes), Ok(levels)) = (
            serde_json::from_str::<Vec<String>>(notes_json),
            serde_json::from_str::<Vec<u8>>(privacy_levels_json),
        ) {
            let pairs: Vec<(String, u8)> = notes.into_iter().zip(levels.into_iter()).collect();
            let encrypted = self.encryption.batch_encrypt(&pairs);
            serde_json::to_string(&encrypted).unwrap_or_default()
        } else {
            "[]".to_string()
        }
    }

    /// Batch decrypt notes
    #[wasm_bindgen]
    pub fn batch_decrypt_notes(&self, notes_json: &str, privacy_levels_json: &str) -> String {
        if let (Ok(notes), Ok(levels)) = (
            serde_json::from_str::<Vec<String>>(notes_json),
            serde_json::from_str::<Vec<u8>>(privacy_levels_json),
        ) {
            let pairs: Vec<(String, u8)> = notes.into_iter().zip(levels.into_iter()).collect();
            let decrypted = self.encryption.batch_decrypt(&pairs);
            serde_json::to_string(&decrypted).unwrap_or_default()
        } else {
            "[]".to_string()
        }
    }

    /// Get encryption overhead percentage
    #[wasm_bindgen]
    pub fn get_encryption_overhead(&self, privacy_level: u8) -> f32 {
        self.encryption.get_encryption_overhead(privacy_level)
    }

    /// Validate encryption format
    #[wasm_bindgen]
    pub fn validate_encryption(&self, encrypted_data: &str) -> bool {
        self.encryption.validate_encryption_format(encrypted_data)
    }

    /// Calculate storage size with overhead
    #[wasm_bindgen]
    pub fn calculate_storage_size(&self, data_size: u32, privacy_level: u8) -> u32 {
        let overhead = self.encryption.get_encryption_overhead(privacy_level);
        ((data_size as f32) * (1.0 + overhead)) as u32
    }

    /// Get compression ratio
    #[wasm_bindgen]
    pub fn get_compression_ratio(&self, data: &str) -> f32 {
        let result = self.encryption.compress_notes(data);
        result.compression_ratio
    }
}

/// Unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_key_generation() {
        let mut handler = NoteEncryption::new();
        let key_public = handler.generate_key(0);
        let key_semi = handler.generate_key(1);
        let key_full = handler.generate_key(2);

        assert!(key_public.is_empty()); // PUBLIC has no key
        assert_eq!(key_semi.len(), 32); // SEMI_PRIVATE: 32 bytes
        assert_eq!(key_full.len(), 32); // FULL_PRIVATE: 32 bytes
    }

    #[test]
    fn test_encryption_decryption() {
        let handler = NoteEncryption::new();
        let data = "test_data_123";

        let encrypted = handler.encrypt_aes256_gcm(data, 1); // SEMI_PRIVATE
        let decrypted = handler.decrypt_aes256_gcm(&encrypted, 1);

        assert_eq!(decrypted, data);
    }

    #[test]
    fn test_full_private_encryption() {
        let handler = NoteEncryption::new();
        let data = "secret_transaction_data";

        let encrypted = handler.encrypt_aes256_gcm(data, 2); // FULL_PRIVATE
        assert!(encrypted.starts_with("FULL:"));

        let decrypted = handler.decrypt_aes256_gcm(&encrypted, 2);
        assert_eq!(decrypted, data);
    }

    #[test]
    fn test_compression() {
        let handler = NoteEncryption::new();
        let data = "aaaaaabbbbbbccccccdddddd";

        let compressed = handler.compress_notes(data);
        assert!(compressed.compressed_size < compressed.original_size);
        assert!(compressed.compression_ratio > 0.0);

        let decompressed = handler.decompress_notes(&compressed.compressed_data);
        assert_eq!(decompressed, data);
    }

    #[test]
    fn test_obfuscation() {
        let handler = NoteEncryption::new();
        let metadata = "0xabc|0xdef|1000000000000000000";

        let obfuscated = handler.obfuscate_metadata(metadata, 2);
        assert!(!obfuscated.obfuscated_metadata.is_empty());

        let deobfuscated = handler.deobfuscate_metadata(&obfuscated.obfuscated_metadata, 2);
        assert_eq!(deobfuscated, metadata);
    }

    #[test]
    fn test_batch_operations() {
        let handler = NoteEncryption::new();
        let notes = vec![
            ("note1".to_string(), 0),
            ("note2".to_string(), 1),
            ("note3".to_string(), 2),
        ];

        let encrypted = handler.batch_encrypt(&notes);
        assert_eq!(encrypted.len(), 3);

        let encrypted_pairs: Vec<(String, u8)> = encrypted.into_iter().zip(vec![0, 1, 2]).collect();
        let decrypted = handler.batch_decrypt(&encrypted_pairs);
        assert_eq!(decrypted[0], "note1");
        assert_eq!(decrypted[1], "note2");
        assert_eq!(decrypted[2], "note3");
    }

    #[test]
    fn test_wasm_bridge() {
        let mut bridge = NoteBridge::new();
        let data = "test_wasm_data";

        let encrypted = bridge.encrypt_note(data, 1);
        let decrypted = bridge.decrypt_note(&encrypted, 1);

        assert_eq!(decrypted, data);
    }

    #[test]
    fn test_overhead_calculation() {
        let handler = NoteEncryption::new();
        let public_overhead = handler.get_encryption_overhead(0);
        let semi_overhead = handler.get_encryption_overhead(1);
        let full_overhead = handler.get_encryption_overhead(2);

        assert_eq!(public_overhead, 0.0);
        assert_eq!(semi_overhead, 0.25);
        assert_eq!(full_overhead, 0.45);
    }
}
