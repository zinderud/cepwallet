# ⚠️ DEPRECATED: Electron Preload Scripts

Bu klasör **artık kullanılmıyor**. Tauri'de preload scripts gerekli değildir.

## Neden Gerekli Değil?

**Electron'da:**
- Preload scripts, renderer ile main process arasında güvenli köprü oluşturur
- `contextBridge` ile API'ler expose edilir

**Tauri'de:**
- Rust backend doğrudan JavaScript'ten çağrılır
- `@tauri-apps/api` ile type-safe IPC
- Preload katmanına gerek yok

## Yeni Yöntem

```typescript
// Eski (Electron + Preload):
// preload/index.ts
contextBridge.exposeInMainWorld('cepwallet', {
  bridge: {
    connect: () => ipcRenderer.invoke('connect')
  }
});

// renderer:
window.cepwallet.bridge.connect();

// Yeni (Tauri - Preload YOK):
import { invoke } from '@tauri-apps/api/tauri';
await invoke('connect_device');
```

---

**Not:** Bu dosyalar silinebilir.
