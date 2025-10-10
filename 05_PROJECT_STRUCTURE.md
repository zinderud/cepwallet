# CepWallet - Proje Yapısı

## 📁 Dizin Organizasyonu

```
cepwallet/
│
├── 📄 01_README.md                       # Ana proje açıklaması
├── 📄 09_ROADMAP.md                      # Geliştirme yol haritası
├── 📄 GETTING_STARTED.md                 # Hızlı başlangıç rehberi
├── 📄 TECHNICAL_ARCHITECTURE.md          # Teknik mimari detayları
├── 📄 HARDWARE_DEVELOPMENT.md            # Özel hardware rehberi
├── 📄 LICENSE                            # GPL v3 lisans
├── 📄 CONTRIBUTING.md                    # Katkıda bulunma rehberi
├── 📄 CHANGELOG.md                       # Versiyon değişiklikleri
│
├── 📁 desktop/                           # Desktop uygulama (Electron)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 webpack.config.js
│   │
│   ├── 📁 electron/                      # Electron main process
│   │   ├── main.js                       # Ana process
│   │   ├── preload.js                    # Preload script
│   │   ├── browser-manager.js            # Web browser yönetimi
│   │   ├── web3-handler.js               # Web3 request handler
│   │   └── ipc-handlers.js               # IPC communication
│   │
│   ├── 📁 src/                           # React frontend
│   │   ├── index.tsx                     # Entry point
│   │   ├── App.tsx                       # Ana komponent
│   │   ├── App.css
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 Wallet/
│   │   │   │   ├── WalletDashboard.tsx
│   │   │   │   ├── AccountList.tsx
│   │   │   │   ├── Balance.tsx
│   │   │   │   ├── TransactionHistory.tsx
│   │   │   │   └── SendTransaction.tsx
│   │   │   │
│   │   │   ├── 📁 Browser/
│   │   │   │   ├── DAppBrowser.tsx
│   │   │   │   ├── AddressBar.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── Bookmarks.tsx
│   │   │   │
│   │   │   ├── 📁 Device/
│   │   │   │   ├── DeviceStatus.tsx
│   │   │   │   ├── DeviceConnect.tsx
│   │   │   │   ├── TransactionConfirm.tsx
│   │   │   │   └── FirmwareUpdate.tsx
│   │   │   │
│   │   │   ├── 📁 Settings/
│   │   │   │   ├── GeneralSettings.tsx
│   │   │   │   ├── NetworkSettings.tsx
│   │   │   │   ├── SecuritySettings.tsx
│   │   │   │   └── About.tsx
│   │   │   │
│   │   │   └── 📁 Common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Loader.tsx
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── bridge-client.ts          # Bridge WebSocket client
│   │   │   ├── wallet-manager.ts         # Cüzdan yönetimi
│   │   │   ├── blockchain-rpc.ts         # RPC client
│   │   │   ├── web3-provider.ts          # Custom Web3 provider
│   │   │   ├── token-service.ts          # ERC-20 token işlemleri
│   │   │   ├── nft-service.ts            # NFT işlemleri
│   │   │   └── price-service.ts          # Fiyat feed
│   │   │
│   │   ├── 📁 hooks/
│   │   │   ├── useBridge.ts              # Bridge connection hook
│   │   │   ├── useWallet.ts              # Wallet state hook
│   │   │   ├── useWeb3.ts                # Web3 hook
│   │   │   └── useTokens.ts              # Token listesi hook
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── ethereum.ts               # Ethereum utils
│   │   │   ├── formatting.ts             # Format helpers
│   │   │   ├── validation.ts             # Input validation
│   │   │   └── constants.ts              # Sabitler
│   │   │
│   │   ├── 📁 types/
│   │   │   ├── wallet.d.ts
│   │   │   ├── transaction.d.ts
│   │   │   ├── token.d.ts
│   │   │   └── bridge.d.ts
│   │   │
│   │   └── 📁 assets/
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   │
│   ├── 📁 public/
│   │   ├── index.html
│   │   ├── icon.png
│   │   └── manifest.json
│   │
│   └── 📁 build/                         # Build output
│       ├── mac/
│       ├── win/
│       └── linux/
│
├── 📁 bridge/                            # Hardware bridge daemon
│   ├── 📄 Cargo.toml                     # Rust project
│   ├── 📄 Cargo.lock
│   │
│   ├── 📁 src/
│   │   ├── main.rs                       # Entry point
│   │   ├── device.rs                     # Device communication
│   │   ├── protocol.rs                   # Protocol handler
│   │   ├── server.rs                     # WebSocket server
│   │   └── crypto.rs                     # Crypto operations
│   │
│   ├── 📁 proto/
│   │   └── messages.proto                # Protocol Buffer definitions
│   │
│   └── 📁 target/                        # Rust build output
│       ├── debug/
│       └── release/
│
├── 📁 mobile/                            # Mobile apps (React Native)
│   ├── 📄 package.json
│   ├── 📄 app.json
│   │
│   ├── 📁 ios/                           # iOS specific
│   │   ├── Podfile
│   │   └── CepWallet.xcodeproj
│   │
│   ├── 📁 android/                       # Android specific
│   │   ├── build.gradle
│   │   └── app/
│   │
│   └── 📁 src/
│       ├── App.tsx
│       ├── 📁 screens/
│       ├── 📁 components/
│       ├── 📁 services/
│       └── 📁 navigation/
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

## 📊 Kod İstatistikleri (Tahmini)

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
