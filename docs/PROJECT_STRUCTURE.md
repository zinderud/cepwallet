# CepWallet - Proje Yapısı (Tauri 2.x)

**Son Güncelleme:** 16 Ekim 2025  
**Mimari:** Tauri 2.8.5 Flat Structure

---

## 🏗️ Genel Yapı

```
cepwallet/
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
├── index.html              # HTML entry
├── src/                    # ⭐ React Frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── types/
└── src-tauri/              # ⭐ Rust Backend
    ├── Cargo.toml          # Rust dependencies
    ├── tauri.conf.json     # Tauri configuration
    ├── src/
    │   ├── main.rs
    │   ├── commands.rs
    │   ├── hardware/
    │   └── crypto/
    └── icons/
```

## 🚀 Komutlar

```bash
# Development
pnpm install
pnpm tauri dev

# Production build
pnpm tauri build
```

## 📝 Önemli Değişiklikler

- ✅ Electron → Tauri 2.x migration
- ✅ Monorepo (packages/) → Flat structure (src/)
- ✅ WebSocket bridge → Tauri IPC
- ✅ Default exports → Named exports
- ✅ std::sync::Mutex → tokio::sync::Mutex

Detaylı bilgi için [ARCHITECTURE.md](ARCHITECTURE.md) ve [GETTING_STARTED.md](GETTING_STARTED.md) dosyalarına bakın.
