# ⚠️ DEPRECATED: Bridge Klasörü

Bu klasör **artık kullanılmıyor**. CepWallet artık **Tauri** mimarisini kullanıyor.

## 🔄 Geçiş Tamamlandı

**Eski Mimari (Electron + Bridge):**
```
React → Electron IPC → WebSocket → Bridge (Rust) → USB
```

**Yeni Mimari (Tauri):**
```
React → Tauri IPC (Native) → Rust Backend → USB
```

## 📁 Yeni Dosya Konumları

| Eski Dosya | Yeni Dosya |
|------------|------------|
| `bridge/src/trezor.rs` | `cepwallet/src-tauri/src/hardware/trezor.rs` |
| `bridge/src/device.rs` | `cepwallet/src-tauri/src/hardware/device.rs` |
| `bridge/src/handlers.rs` | `cepwallet/src-tauri/src/commands.rs` |
| `bridge/src/transaction.rs` | `cepwallet/src-tauri/src/crypto/` |

## 🚀 Yeni Kullanım

```bash
# Eski yöntem (KULLANILMIYOR):
# Terminal 1: cargo run --release
# Terminal 2: pnpm dev:desktop

# Yeni yöntem (TEK KOMUT):
pnpm tauri dev
```

## 📚 Daha Fazla Bilgi

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Yeni mimari
- [GETTING_STARTED.md](../docs/GETTING_STARTED.md) - Kurulum rehberi
- [PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) - Dosya yapısı

---

**Not:** Bu klasör gelecekte silinecektir. Lütfen yeni Tauri mimarisini kullanın.
