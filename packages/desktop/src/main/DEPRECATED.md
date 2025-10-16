# ⚠️ DEPRECATED: Electron Main Process

Bu klasör **artık kullanılmıyor**. CepWallet artık **Tauri** mimarisini kullanıyor.

## 🔄 Geçiş

**Eski Mimari (Electron):**
```
src/main/         ← Electron main process
src/preload/      ← Preload scripts
src/renderer/     ← React renderer
```

**Yeni Mimari (Tauri):**
```
packages/desktop/src/    ← React frontend
cepwallet/src-tauri/src/ ← Rust backend
```

## 📁 Dosya Dönüşümleri

| Eski Dosya | Yeni Konum |
|------------|------------|
| `main/index.ts` (Electron setup) | **SİLİNDİ** (Tauri otomatik) |
| `main/ipc/*.ts` (IPC handlers) | `src-tauri/src/commands.rs` |
| `main/railgun.ts` | `src-tauri/src/crypto/` |
| `main/privacy.ts` | `src-tauri/src/crypto/` |
| `preload/` | **SİLİNDİ** (Tauri'de gerek yok) |

## 🚀 Yeni Kullanım

```typescript
// Eski (Electron IPC):
ipcRenderer.invoke('trezor:connect')

// Yeni (Tauri):
import { tauriApi } from './utils/tauriApi';
await tauriApi.connectDevice();
```

---

**Not:** Bu dosyalar referans için tutulmuştur. Silinebilir.
