# CepWallet - Proje Yapısı

## 🏗️ Monorepo Mimarisi (pnpm Workspace)

CepWallet, **pnpm workspaces** kullanarak 3 bağımsız modülü yönetir:

```
cepwallet/                                    # Root monorepo
│
├── 📄 pnpm-workspace.yaml                   # Workspace tanımı
├── 📄 package.json                          # Root package (shared deps)
├── 📄 tsconfig.json                         # Root TypeScript config
├── 📄 eslint.config.js                      # Root ESLint config
├── 📄 jest.config.js                        # Root Jest config
├── 📄 Cargo.toml                            # Rust Bridge for native
│
├── 📄 README.md                             # Ana proje açıklaması
├── 📄 QUICKSTART.md                         # Hızlı başlangıç
├── 📄 LICENSE                               # GPL v3 lisans
├── 📄 CONTRIBUTING.md                       # Katkıda bulunma rehberi
├── 📄 CHANGELOG.md                          # Versiyon değişiklikleri
│
├── 📁 docs/                                 # Dokümantasyon
│   ├── 📄 INDEX.md                          # Dokümantasyon indeksi
│   ├── 📄 GETTING_STARTED.md                # Detaylı başlangıç rehberi
│   ├── 📄 ARCHITECTURE.md                   # Teknik mimari detayları
│   ├── 📄 PROJECT_STRUCTURE.md              # Bu dosya
│   ├── 📄 PRIVACY_FEATURES.md               # Kohaku entegrasyonu
│   ├── 📄 HARDWARE.md                       # Hardware rehberi
│   ├── 📄 ROADMAP.md                        # Geliştirme yol haritası
│   ├── 📄 TREZOR_KOHAKU_INTEGRATION.md      # Entegrasyon detayları
│   ├── 📄 SETUP_CI_CD.md                    # CI/CD pipeline
│   └── 📁 kohaku/                           # Kohaku özel dokümantasyon
│       ├── 📄 README.md
│       ├── 📄 RAILGUN_INTEGRATION.md
│       ├── 📄 WALLET_OPERATIONS.md
│       └── ...
│
├── 📁 packages/                             # pnpm workspaces
│   │
│   ├── 📁 shared/                           # Ortak TypeScript utility'ler
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   │
│   │   ├── 📁 src/
│   │   │   ├── � types/
│   │   │   │   ├── wallet.ts                # Wallet type tanımları
│   │   │   │   ├── transaction.ts           # Transaction types
│   │   │   │   ├── bridge.ts                # Bridge protocol types
│   │   │   │   ├── kohaku.ts                # Kohaku/RAILGUN types
│   │   │   │   └── index.ts                 # Export all
│   │   │   │
│   │   │   ├── 📁 utils/
│   │   │   │   ├── ethereum.ts              # ethers.js helpers
│   │   │   │   ├── formatting.ts            # Address/amount formatting
│   │   │   │   ├── validation.ts            # Input validation
│   │   │   │   ├── constants.ts             # Global constants
│   │   │   │   ├── errors.ts                # Error definitions
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 crypto/
│   │   │   │   ├── keys.ts                  # Key derivation (BIP-32/39/44)
│   │   │   │   ├── signing.ts               # Signing algorithms
│   │   │   │   ├── zk.ts                    # ZK proof utilities
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 bridge/
│   │   │   │   ├── protocol.ts              # Bridge message protocol
│   │   │   │   ├── serialization.ts         # Protobuf serialization
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 kohaku/
│   │   │   │   ├── railgun.ts               # RAILGUN operations
│   │   │   │   ├── privacy-pools.ts         # Privacy Pool utils
│   │   │   │   ├── humanizer.ts             # Transaction humanizer
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 rpc/
│   │   │   │   ├── eip1193.ts               # EIP-1193 provider standard
│   │   │   │   ├── web3.ts                  # ethers.js provider
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts                     # Main export
│   │   │
│   │   ├── 📁 __tests__/
│   │   │   ├── utils.test.ts
│   │   │   ├── crypto.test.ts
│   │   │   └── kohaku.test.ts
│   │   │
│   │   └── 📄 README.md
│   │
│   ├── 📁 desktop/                          # Desktop uygulama (Electron)
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 webpack.config.js
│   │   ├── 📄 electron-builder.yml          # Electron Builder config
│   │   │
│   │   ├── 📁 src/
│   │   │   ├── 📁 main/                     # Electron main process
│   │   │   │   ├── index.ts                 # Entry point
│   │   │   │   ├── window.ts                # Window management
│   │   │   │   ├── ipc.ts                   # IPC handlers
│   │   │   │   ├── bridge-client.ts         # Bridge WebSocket client
│   │   │   │   └── web3-provider.ts         # Web3 EIP-1193 provider
│   │   │   │
│   │   │   ├── 📁 preload/                  # Preload script (security)
│   │   │   │   ├── index.ts
│   │   │   │   └── context-bridge.ts
│   │   │   │
│   │   │   ├── 📁 renderer/                 # React frontend
│   │   │   │   ├── index.tsx                # Entry point
│   │   │   │   ├── App.tsx                  # Root component
│   │   │   │   ├── App.css
│   │   │   │   │
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 Wallet/
│   │   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   │   ├── AccountList.tsx
│   │   │   │   │   │   ├── Balance.tsx
│   │   │   │   │   │   ├── TransactionHistory.tsx
│   │   │   │   │   │   ├── SendTransaction.tsx
│   │   │   │   │   │   └── ShieldToken.tsx   # Kohaku shield UI
│   │   │   │   │   │
│   │   │   │   │   ├── 📁 Browser/
│   │   │   │   │   │   ├── DAppBrowser.tsx
│   │   │   │   │   │   ├── AddressBar.tsx
│   │   │   │   │   │   ├── Tabs.tsx
│   │   │   │   │   │   ├── Bookmarks.tsx
│   │   │   │   │   │   └── Web3Request.tsx   # Web3 request UI
│   │   │   │   │   │
│   │   │   │   │   ├── 📁 Device/
│   │   │   │   │   │   ├── Status.tsx
│   │   │   │   │   │   ├── Connect.tsx
│   │   │   │   │   │   ├── TransactionConfirm.tsx
│   │   │   │   │   │   └── FirmwareUpdate.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── 📁 Settings/
│   │   │   │   │   │   ├── General.tsx
│   │   │   │   │   │   ├── Network.tsx
│   │   │   │   │   │   ├── Security.tsx
│   │   │   │   │   │   └── About.tsx
│   │   │   │   │   │
│   │   │   │   │   └── 📁 Common/
│   │   │   │   │       ├── Button.tsx
│   │   │   │   │       ├── Input.tsx
│   │   │   │   │       ├── Modal.tsx
│   │   │   │   │       └── Loading.tsx
│   │   │   │   │
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── useBridge.ts
│   │   │   │   │   ├── useWallet.ts
│   │   │   │   │   ├── useWeb3.ts
│   │   │   │   │   └── useKohaku.ts          # Kohaku hook
│   │   │   │   │
│   │   │   │   ├── 📁 stores/
│   │   │   │   │   ├── wallet.ts             # Zustand wallet store
│   │   │   │   │   ├── ui.ts                 # UI state
│   │   │   │   │   ├── bridge.ts             # Bridge connection state
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── 📁 pages/
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Transactions.tsx
│   │   │   │   │   └── Settings.tsx
│   │   │   │   │
│   │   │   │   ├── 📁 types/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── 📁 assets/
│   │   │   │       ├── icons/
│   │   │   │       ├── images/
│   │   │   │       └── styles/
│   │   │   │
│   │   │   └── 📁 utils/
│   │   │       ├── ipc-client.ts             # IPC communication
│   │   │       ├── bridge-api.ts             # Bridge REST API
│   │   │       └── logger.ts
│   │   │
│   │   ├── 📁 public/
│   │   │   ├── index.html
│   │   │   ├── icon.icns                    # macOS icon
│   │   │   ├── icon.ico                     # Windows icon
│   │   │   └── icon.png                     # Generic icon
│   │   │
│   │   ├── 📁 build/                        # Build output (generated)
│   │   │   ├── mac/
│   │   │   ├── win/
│   │   │   └── linux/
│   │   │
│   │   └── � README.md
│   │
│   └── �📁 bridge/                           # Hardware bridge (Rust)
│       ├── 📄 Cargo.toml
│       ├── 📄 Cargo.lock
│       │
│       ├── 📁 src/
│       │   ├── main.rs                      # Entry point
│       │   ├── lib.rs
│       │   ├── device.rs                    # USB device communication
│       │   ├── protocol.rs                  # Message protocol
│       │   ├── server.rs                    # WebSocket server
│       │   ├── handlers.rs                  # Request handlers
│       │   ├── crypto.rs                    # Crypto operations
│       │   └── error.rs                     # Error types
│       │
│       ├── 📁 proto/
│       │   ├── messages.proto               # Protobuf schema
│       │   └── build.rs                     # Protobuf compilation
│       │
│       ├── 📁 tests/
│       │   ├── device_integration.rs
│       │   └── protocol.rs
│       │
│       └── 📄 README.md
│
├── 📁 .github/                              # GitHub configuration
│   ├── � workflows/
│   │   ├── lint.yml                         # ESLint + Prettier
│   │   ├── test.yml                         # Unit tests (Jest + Cargo test)
│   │   ├── e2e.yml                          # Playwright + Emulator
│   │   └── build.yml                        # Build desktop + mobile
│   │
│   └── 📁 ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── 📁 .vscode/                              # VS Code settings
│   ├── settings.json                        # Workspace settings
│   ├── extensions.json                      # Recommended extensions
│   └── launch.json                          # Debug configuration
│
├── � .gitignore
├── 📄 .prettierrc
├── 📄 tsconfig.json                         # Root TypeScript config
└── � turbo.json                            # Turbo build cache (optional)
│
├── 📁 firmware/                          # Özel hardware firmware
│   ├── 📄 README.md
│   ├── 📄 Makefile
│   │
│   ├── 📁 bootloader/                    # Bootloader
│   │   ├── bootloader.c
│   │   └── bootloader.h
│   │
│   ├── 📁 firmware/                      # Ana firmware
│   │   ├── main.c
│   │   ├── usb.c
│   │   ├── oled.c
│   │   ├── buttons.c
│   │   ├── crypto.c
│   │   ├── storage.c
│   │   └── signing.c
│   │
│   ├── 📁 drivers/                       # Hardware drivers
│   │   ├── stm32f4/
│   │   ├── atecc608a/
│   │   └── ssd1306/
│   │
│   └── 📁 build/                         # Build output
│       ├── bootloader.bin
│       └── firmware.bin
│
├── 📁 hardware/                          # Hardware tasarımı
│   ├── 📁 schematic/                     # Devre şeması
│   │   ├── cepwallet.kicad_pro
│   │   ├── cepwallet.kicad_sch
│   │   └── cepwallet.pdf
│   │
│   ├── 📁 pcb/                           # PCB layout
│   │   ├── cepwallet.kicad_pcb
│   │   └── gerber/                       # Üretim dosyaları
│   │
│   ├── 📁 case/                          # Kasa tasarımı
│   │   ├── cepwallet.step
│   │   ├── cepwallet.stl
│   │   └── renders/
│   │
│   └── 📁 bom/                           # Bill of Materials
│       ├── bom.csv
│       └── suppliers.md
│
├── 📁 extension/                         # Browser extension (opsiyonel)
│   ├── 📄 manifest.json
│   ├── 📁 src/
│   │   ├── background.js
│   │   ├── content.js
│   │   └── popup/
│   │
│   └── 📁 dist/
│       ├── chrome/
│       ├── firefox/
│       └── edge/
│
├── 📁 packages/                          # Paylaşılan paketler
│   ├── 📁 types/                         # TypeScript types
│   ├── 📁 utils/                         # Utilities
│   └── 📁 constants/                     # Constants
│
├── 📁 docs/                              # Dokümantasyon
│   ├── 📁 user-guide/
│   │   ├── installation.md
│   │   ├── getting-started.md
│   │   ├── using-dapps.md
│   │   └── troubleshooting.md
│   │
│   ├── 📁 developer-guide/
│   │   ├── architecture.md
│   │   ├── api-reference.md
│   │   ├── plugin-development.md
│   │   └── contributing.md
│   │
│   ├── 📁 security/
│   │   ├── security-model.md
│   │   ├── audit-reports/
│   │   └── bug-bounty.md
│   │
│   └── 📁 api/
│       ├── bridge-api.md
│       ├── web3-provider.md
│       └── protocol-spec.md
│
├── 📁 tests/                             # Test dosyaları
│   ├── 📁 unit/
│   │   ├── wallet-manager.test.ts
│   │   ├── crypto.test.ts
│   │   └── formatting.test.ts
│   │
│   ├── 📁 integration/
│   │   ├── bridge-communication.test.ts
│   │   ├── transaction-signing.test.ts
│   │   └── dapp-interaction.test.ts
│   │
│   └── 📁 e2e/
│       ├── wallet-setup.spec.ts
│       ├── send-transaction.spec.ts
│       └── swap-tokens.spec.ts
│
├── 📁 scripts/                           # Build ve deploy scriptleri
│   ├── build-all.sh
│   ├── release.sh
│   ├── test.sh
│   └── deploy.sh
│
├── 📁 .github/                           # GitHub yapılandırması
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── security.yml
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   │
│   └── PULL_REQUEST_TEMPLATE.md
│
└── 📁 assets/                            # Proje varlıkları
    ├── logo/
    │   ├── logo.svg
    │   ├── logo.png
    │   └── logo-variants/
    │
    ├── screenshots/
    │   ├── dashboard.png
    │   ├── browser.png
    │   └── transaction.png
    │
    └── marketing/
        ├── banners/
        └── social-media/
```

---

## 🔑 Önemli Dosyalar Açıklaması

### Root Level

| Dosya | Açıklama |
|-------|----------|
| `README.md` | Proje hakkında genel bilgi, özellikler, kurulum |
| `ROADMAP.md` | Geliştirme yol haritası ve milestone'lar |
| `GETTING_STARTED.md` | Hızlı başlangıç rehberi |
| `TECHNICAL_ARCHITECTURE.md` | Detaylı teknik mimari |
| `HARDWARE_DEVELOPMENT.md` | Özel hardware geliştirme rehberi |
| `LICENSE` | Açık kaynak lisansı (GPL v3) |

### Desktop App

| Dosya | Açıklama |
|-------|----------|
| `electron/main.js` | Electron ana process, window yönetimi |
| `electron/web3-handler.js` | Web3 request'leri işleme |
| `src/App.tsx` | Ana React komponenti |
| `src/services/bridge-client.ts` | Bridge ile iletişim |
| `src/services/wallet-manager.ts` | Cüzdan yönetimi logic |

### Bridge

| Dosya | Açıklama |
|-------|----------|
| `src/main.rs` | Rust bridge daemon entry point |
| `src/device.rs` | USB cihaz iletişimi |
| `src/protocol.rs` | Protocol Buffer handler |
| `proto/messages.proto` | Protocol tanımları |

### Firmware (Özel Hardware)

| Dosya | Açıklama |
|-------|----------|
| `bootloader/bootloader.c` | Güvenli bootloader |
| `firmware/main.c` | Ana firmware loop |
| `firmware/signing.c` | İşlem imzalama |
| `drivers/atecc608a/` | Secure element driver |

---

## 📦 Build Artifacts

### Development

```
desktop/
└── node_modules/              # npm dependencies
└── dist/                      # Webpack output

bridge/
└── target/debug/              # Rust debug build
└── cepwallet-bridge           # Executable

firmware/
└── build/
    ├── bootloader.bin
    └── firmware.bin
```

### Production

```
desktop/build/
├── CepWallet-1.0.0.dmg        # macOS installer
├── CepWallet-1.0.0.exe        # Windows installer
└── CepWallet-1.0.0.AppImage   # Linux AppImage

bridge/target/release/
├── cepwallet-bridge-macos
├── cepwallet-bridge-windows.exe
└── cepwallet-bridge-linux

mobile/
├── ios/CepWallet.ipa
└── android/app-release.apk
```

---

## 🚀 Çalıştırma Komutları

### Desktop Development

```bash
cd desktop

# Install dependencies
npm install

# Start dev server
npm run dev

# Start Electron (different terminal)
npm run electron

# Or run both together
npm run electron:dev

# Build for production
npm run build
npm run dist
```

### Bridge Development

```bash
cd bridge

# Build
cargo build

# Run
cargo run

# Build for release
cargo build --release

# Test
cargo test
```

### Firmware Development

```bash
cd firmware

# Build bootloader
make bootloader

# Build firmware
make firmware

# Flash (requires ST-Link)
make flash

# Clean
make clean
```

---

## 🧪 Test Komutları

```bash
# Desktop tests
cd desktop
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests

# Bridge tests
cd bridge
cargo test

# Full test suite
npm run test:all
```

---

---

## � pnpm Workspace Yapılandırması

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'bridge'

catalogs:
  default:
    # TypeScript & Build Tools
    typescript: '^5.3.0'
    webpack: '^5.89.0'
    webpack-dev-server: '^4.15.0'
    
    # React & Electron
    react: '^18.2.0'
    react-dom: '^18.2.0'
    electron: '^28.0.0'
    
    # Web3 & Blockchain
    ethers: '^6.10.0'
    '@ethereum/kohaku': '^1.0.0'
    '@railgun-community/engine': '^3.0.0'
    
    # Utilities
    zustand: '^4.4.0'
    axios: '^1.6.0'
    
    # Testing
    jest: '^29.7.0'
    '@testing-library/react': '^14.0.0'
    vitest: '^0.34.0'
```

### `package.json` (Root)

```json
{
  "name": "cepwallet",
  "version": "0.1.0",
  "description": "Privacy-First Hardware Wallet with Kohaku",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "install:all": "pnpm install",
    "build": "pnpm -r build",
    "build:shared": "pnpm -F @cepwallet/shared build",
    "build:desktop": "pnpm -F @cepwallet/desktop build",
    "dev:desktop": "pnpm -F @cepwallet/desktop dev",
    "dev:bridge": "pnpm -F bridge dev",
    "start:bridge": "cd packages/bridge && cargo run",
    "test": "pnpm -r test",
    "test:desktop": "pnpm -F @cepwallet/desktop test",
    "test:e2e": "pnpm -F @cepwallet/desktop test:e2e",
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "type-check": "pnpm -r type-check",
    "clean": "pnpm -r clean && rm -rf node_modules"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.2.0"
  }
}
```

### `packages/shared/package.json`

```json
{
  "name": "@cepwallet/shared",
  "version": "0.1.0",
  "description": "Shared TypeScript utilities",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./utils": "./dist/utils/index.js",
    "./crypto": "./dist/crypto/index.js",
    "./kohaku": "./dist/kohaku/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "ethers": "^6.10.0",
    "@ethereum/kohaku": "^1.0.0",
    "@railgun-community/engine": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

### `packages/desktop/package.json`

```json
{
  "name": "@cepwallet/desktop",
  "version": "0.1.0",
  "description": "CepWallet Desktop Application",
  "main": "dist/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "concurrently \"npm run react-dev\" \"wait-on http://localhost:3000 && npm run electron-dev\"",
    "react-dev": "webpack serve --mode development",
    "electron-dev": "electron dist/main.js",
    "build": "pnpm build:shared && npm run build:react && npm run build:electron",
    "build:react": "webpack --mode production",
    "build:electron": "tsc --project src/main",
    "dist": "electron-builder",
    "test": "jest",
    "test:e2e": "playwright test",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist build out"
  },
  "dependencies": {
    "@cepwallet/shared": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "electron-squirrel-startup": "^1.1.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.6.0",
    "typescript": "^5.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "concurrently": "^8.2.0"
  }
}
```

### `packages/bridge/Cargo.toml`

```toml
[package]
name = "cepwallet-bridge"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
tokio-tungstenite = "0.21"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
prost = "0.12"
tonic = "0.11"
rusb = "0.9"
thiserror = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
sha2 = "0.10"
curve25519-dalek = "4.1"

[dev-dependencies]
tokio-test = "0.4"

[[bin]]
name = "cepwallet-bridge"
path = "src/main.rs"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

---

## 🔗 Workspace İlişkileri

```
┌─────────────────────────────────────┐
│    ROOT (pnpm-workspace.yaml)       │
│  • TypeScript config                │
│  • ESLint + Prettier config         │
│  • Jest config                      │
│  • GitHub Actions workflows         │
└──────────────┬──────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
    SHARED  DESKTOP  BRIDGE
    (TypeScript) (Electron+React) (Rust)
       │       │       │
       └───────┴───────┘
           ↓
      Built Applications
```

### Dependency Graph

```
desktop/
├── depends on: @cepwallet/shared
├── depends on: ethers.js
├── depends on: @ethereum/kohaku
└── depends on: bridge (WebSocket connection)

shared/
├── provides: types/
├── provides: utils/
├── provides: crypto/
├── provides: kohaku/
└── provides: rpc/

bridge/
├── written in: Rust
├── communicates with: Trezor (USB)
├── serves: WebSocket API
└── listens on: localhost:8000 (default)
```

---

## 📋 Workspace Komutları

### Build

```bash
# Build everything
pnpm build

# Build only shared package
pnpm build:shared

# Build desktop with shared dependency
pnpm -F @cepwallet/desktop build

# Filter recursively
pnpm -r build --filter="@cepwallet/*"

# Build with dependencies
pnpm build --filter="@cepwallet/desktop..."
```

### Development

```bash
# Watch mode for shared
pnpm -F @cepwallet/shared dev

# Run desktop dev server + Electron
pnpm dev:desktop

# Run bridge dev server
pnpm dev:bridge

# Run both in parallel (requires tmux or concurrently)
pnpm dev
```

### Testing

```bash
# Test everything
pnpm test

# Test specific workspace
pnpm -F @cepwallet/desktop test

# Test with coverage
pnpm -F @cepwallet/shared test -- --coverage

# Watch mode
pnpm -F @cepwallet/shared test -- --watch
```

### Maintenance

```bash
# Update dependencies
pnpm update

# Add dependency to workspace
pnpm -F @cepwallet/shared add lodash

# Add dev dependency
pnpm -F @cepwallet/desktop add -D @testing-library/react

# Install peer dependencies
pnpm install --force

# Clean node_modules
pnpm clean
pnpm install
```

---

## �📊 Kod İstatistikleri (Tahmini)

````

```
Desktop App:
├── TypeScript/TSX:    ~15,000 LOC
├── CSS:              ~2,000 LOC
├── Tests:            ~5,000 LOC
└── Total:            ~22,000 LOC

Bridge:
├── Rust:             ~3,000 LOC
├── Protocol Buffers: ~500 LOC
└── Tests:            ~1,000 LOC

Firmware (opsiyonel):
├── C:                ~10,000 LOC
├── Assembly:         ~500 LOC
└── Total:            ~10,500 LOC

Documentation:
└── Markdown:         ~5,000 LOC

Grand Total:          ~40,000+ LOC
```

---

## 🔄 Git Workflow

### Branch Yapısı

```
main                    # Production-ready kod
  ├── develop           # Development branch
  │   ├── feature/*     # Yeni özellikler
  │   ├── bugfix/*      # Bug fix'ler
  │   └── hotfix/*      # Acil düzeltmeler
  └── release/*         # Release branches
```

### Commit Convention

```
feat: Yeni özellik
fix: Bug düzeltmesi
docs: Dokümantasyon
style: Kod formatı
refactor: Refactoring
test: Test ekleme
chore: Build, config vb.

Örnek:
feat(wallet): add multi-account support
fix(bridge): resolve connection timeout issue
docs(readme): update installation instructions
```

---

## 📋 Checklist - Proje Setup

### İlk Kurulum
- [ ] Repository oluştur (GitHub)
- [ ] README.md hazırla
- [ ] LICENSE ekle
- [ ] .gitignore yapılandır
- [ ] Desktop klasörünü oluştur
- [ ] package.json setup
- [ ] TypeScript config
- [ ] Electron config

### Development Environment
- [ ] Node.js 18+ kurulu
- [ ] Trezor Bridge kurulu
- [ ] VS Code extensions
- [ ] Git hooks (pre-commit, pre-push)
- [ ] ESLint + Prettier

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Automated tests
- [ ] Build pipeline
- [ ] Release automation

---

Bu yapı, profesyonel bir açık kaynak projesi için gerekli tüm bileşenleri içermektedir! 🚀
