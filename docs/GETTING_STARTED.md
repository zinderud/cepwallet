# CepWallet - Başlangıç Rehberi# CepWallet - Başlangıç Rehberi (Tauri)



**Son Güncelleme:** 17 Ekim 2025  ## 🚀 Hızlı Başlangıç

**Tauri Sürümü:** 2.8.5  

**Mimari:** Flat Structure (src/ + src-tauri/)Bu rehber, **Tauri framework** kullanarak CepWallet'i geliştirme ortamında ayarlamanız için adım adım talimatlar içerir. Yaklaşık **15-20 dakika** sürer.



> **Not:** Bu doküman Tauri 2.x için güncellenmiştir. Eski Electron/monorepo yapısı artık kullanılmamaktadır.---



---## 📋 Ön Gereksinimler



## 🚀 Hızlı Başlangıç (TL;DR)### Donanım

- [ ] **Trezor One**, **Trezor Model T**, veya **Trezor Safe 3** (test için)

```bash- [ ] USB kablo

# 1. Projeyi klonla- [ ] Geliştirme bilgisayarı (Windows/macOS/Linux)

git clone https://github.com/zinderud/cepwallet.git

cd cepwallet### Yazılım

- [ ] **Node.js** 18+ (https://nodejs.org)

# 2. Bağımlılıkları yükle- [ ] **pnpm** 8.0+ (`npm install -g pnpm`)

pnpm install- [ ] **Rust** 1.70+ (https://rustup.rs/)

- [ ] **Git** (https://git-scm.com)

# 3. Çalıştır!- [ ] **VS Code** (https://code.visualstudio.com) - Önerilir

pnpm tauri dev

```### İnternet Hizmetleri

- [ ] **Infura** veya **Alchemy** hesabı (Ethereum RPC)

İşte bu kadar! Tauri penceresi açılmalı ve uygulama çalışmalı.  - Kaydol: https://infura.io veya https://www.alchemy.com

  - API key'i elde et (sonra kullanacağız)

---

---

## 📋 Ön Gereksinimler

## ⚙️ Adım 1: Gerekli Yazılımları Kur

Aşağıdaki yazılımların sisteminizde kurulu olması gerekir:

### 1.1 pnpm Kurulumu

### Zorunlu

- **Node.js** `18.x` veya üzeri ([nodejs.org](https://nodejs.org))```bash

- **pnpm** `8.x` veya üzeri (npm yerine)# pnpm global olarak yükle

- **Rust** `1.70` veya üzeri ([rust-lang.org](https://www.rust-lang.org/tools/install))npm install -g pnpm

- **Git** ([git-scm.com](https://git-scm.com))

# Sürümü doğrula (8.0+ olmalı)

### Platform Bağımlılıklarıpnpm --version



**macOS:**# OPTIONAL: pnpm için shell completion

- Xcode Command Line Tools: `xcode-select --install`pnpm install-completion

```

**Linux (Debian/Ubuntu):**

```bash### 1.2 Rust Kurulumu (Tauri Backend için)

sudo apt update

sudo apt install libwebkit2gtk-4.0-dev \```bash

  build-essential \# Rust installer'ını indir ve çalıştır

  curl \curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

  wget \

  libssl-dev \# Source'u güncelle

  libgtk-3-dev \source $HOME/.cargo/env

  libayatana-appindicator3-dev \

  librsvg2-dev# Sürümü doğrula

```rustc --version  # 1.70+ olmalı

cargo --version

**Windows:**

- Visual Studio Build Tools 2019 veya üzeri# Tauri için sistem bağımlılıkları (macOS)

- WebView2 (genellikle Windows 10/11'de hazır)# Tauri CLI otomatik kontrol edecek



### İsteğe Bağlı# Linux için ek paketler:

- **VS Code** + Rust Analyzer + Tauri eklentileri# sudo apt update

- **Trezor Suite** (Trezor test için - cihaz kullanırken kapatmalısınız)# sudo apt install libwebkit2gtk-4.0-dev \

#   build-essential \

---#   curl \

#   wget \

## ⚙️ Adım 1: Gerekli Yazılımları Kur#   libssl-dev \

#   libgtk-3-dev \

### 1.1 pnpm Kur#   libayatana-appindicator3-dev \

#   librsvg2-dev \

```bash#   libusb-1.0-0-dev

# pnpm'i global olarak yükle

npm install -g pnpm# Windows için:

# WebView2 otomatik yüklenecek

# Sürümü doğrula (8.0+ olmalı)```

pnpm --version

---

# OPTIONAL: Shell completion

pnpm install-completion## 📁 Adım 2: Projeyi Klonla ve Kur

```

### 2.1 Repository'yi Clone Et

### 1.2 Rust Kur

```bash

```bash# Proje klasörüne git

# Rust installer'ını indir ve çalıştırcd ~/workspace

curl --proto='=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Repository'yi clone et

# Shell'i yeniden başlat veya:git clone https://github.com/zinderud/cepwallet.git

source $HOME/.cargo/envcd cepwallet



# Sürümü doğrula (1.70+ olmalı)# Yapı doğrula

rustc --versionls -la  # görmelisin: src/, src-tauri/, docs/, package.json, vb.

cargo --version```

```

### 2.2 Bağımlılıkları Kur

### 1.3 Tauri Sistem Gereksinimlerini Kontrol Et

```bash

```bash# Root klasörden tüm bağımlılıkları kur (frontend + Tauri)

# Önce projeyi klonla (gerekli çünkü package.json lazım)pnpm install

git clone https://github.com/zinderud/cepwallet.git

cd cepwallet# Bu komut:

pnpm install# 1. Root package.json bağımlılıklarını kurar

# 2. packages/desktop/ bağımlılıklarını kurar

# Tauri sistem bilgilerini kontrol et# 3. packages/shared/ bağımlılıklarını kurar

pnpm tauri info# 4. Tauri CLI'yi kurar (@tauri-apps/cli)



# Beklenen çıktı:# Kurulum başarılı mı kontrol et

# [✓] Environmentpnpm list --depth 0

#   - OS: macOS / Windows / Linux```

#   - Rust: 1.70+

#   - Node: 18+### 2.3 Tauri'yi Kontrol Et

#   - pnpm: 8+

# [✓] Packages```bash

#   - @tauri-apps/api: 2.x# Tauri CLI kurulu mu?

#   - @tauri-apps/cli: 2.xpnpm tauri --version

```

# Tauri sistem gereksinimlerini kontrol et

---pnpm tauri info



## 📦 Adım 2: Projeyi Klonla ve Kur# Çıktı şöyle olmalı:

# [✓] Environment

### 2.1 Repository'yi Clone Et#   - OS: macOS / Windows / Linux

#   - Rust: 1.70+

```bash#   - Node: 18+

# Repository'yi clone et#   - pnpm: 8+

git clone https://github.com/zinderud/cepwallet.git# [✓] Packages

cd cepwallet#   - tauri: 1.5.x

#   - tauri-cli: 1.5.x

# Yapı doğrula```

ls -la  # görmelisin: src/, src-tauri/, docs/, package.json, vb.

```---



### 2.2 Bağımlılıkları Kur## � Adım 3: Uygulamayı Çalıştır



```bash### 3.1 Development Modu (TEK KOMUT!)

# Root klasörden tüm bağımlılıkları kur (frontend + Tauri)

pnpm install```bash

# Root klasörden çalıştır

# Bu komut:pnpm tauri dev

# 1. Frontend bağımlılıklarını kurar (React, TypeScript, Vite)

# 2. Tauri CLI'yi kurar (@tauri-apps/cli)# Bu komut:

# 3. Tauri API'sini kurar (@tauri-apps/api)# 1. Rust backend'i derler (src-tauri/)

# 2. React frontend'i başlatır (packages/desktop/)

# Kurulum başarılı mı kontrol et# 3. Tauri window açar

pnpm list --depth 0# 4. Hot reload aktif (hem Rust hem React)

```

# İlk çalıştırmada biraz uzun sürebilir (Rust compile)

### 2.3 Tauri'yi Kontrol Et# Sonraki çalıştırmalar çok hızlı olur

```

```bash

# Tauri CLI kurulu mu?**Beklenen Çıktı:**

pnpm tauri --version```

   Compiling cepwallet v0.1.0

# Tauri sistem gereksinimlerini kontrol et    Finished dev [unoptimized + debuginfo] target(s) in 45.2s

pnpm tauri info  

  VITE v4.5.0  ready in 1234 ms

# Çıktı şöyle olmalı:  

# [✓] Environment  ➜  Local:   http://localhost:5173/

#   - OS: macOS / Windows / Linux  ➜  Network: use --host to expose

#   - Rust: 1.70+  

#   - Node: 18+  Tauri app started on http://localhost:1430

#   - pnpm: 8+```

# [✓] Packages

#   - tauri: 2.x### 3.2 Trezor'u Bağla ve Test Et

#   - tauri-cli: 2.x

```1. **Trezor cihazını USB'ye tak**

2. **Trezor Suite'i kapat** (eğer açıksa)

---3. **CepWallet'te "Connect Device" butonuna tıkla**

4. **PIN gir** (Trezor ekranında)

## 🎯 Adım 3: Uygulamayı Çalıştır5. **Başarılı!** Device bilgileri görünmeli



### 3.1 Development Modu (TEK KOMUT!)### 3.3 Production Build (Dağıtım)



```bash```bash

# Root klasörden çalıştır# Tüm platformlar için build

pnpm tauri devpnpm tauri build



# Bu komut:# Sadece current platform

# 1. Rust backend'i derler (src-tauri/)pnpm tauri build --target current

# 2. React frontend'i başlatır (Vite dev server - src/)

# 3. Tauri window açar# Çıktılar:

# 4. Hot reload aktif (hem Rust hem React)# macOS:   src-tauri/target/release/bundle/macos/CepWallet.app

#          src-tauri/target/release/bundle/dmg/CepWallet_0.1.0_x64.dmg

# İlk çalıştırmada biraz uzun sürebilir (Rust compile - 2-5 dakika)# Windows: src-tauri/target/release/bundle/msi/CepWallet_0.1.0_x64.msi

# Sonraki çalıştırmalar çok hızlı olur (~10 saniye)# Linux:   src-tauri/target/release/bundle/appimage/CepWallet_0.1.0_amd64.AppImage

``````

  - 'packages/*'

**Beklenen Çıktı:**  - 'bridge'

```EOF

   Compiling cepwallet v0.1.0

    Finished dev [unoptimized + debuginfo] target(s) in 45.2s# 2. Root package.json'u oluştur/doğrula

  # (ayrı bir bölüm olacak - PROJECT_STRUCTURE.md'ye bak)

  VITE v5.4.2  ready in 1234 ms

  # 3. Tüm bağımlılıkları yükle

  ➜  Local:   http://localhost:5173/pnpm install

  ➜  Network: use --host to expose

  # Yüklemeyi doğrula

  Tauri app startedls -la node_modules/.pnpm  # pnpm cache görünmelidir

``````



Uygulama otomatik olarak açılacak!### 2.3 Workspace Klasörlerini Oluştur



### 3.2 Hot Reload Test```bash

# packages/ klasörleri için alt dizinler

**Frontend değişikliklerini test et:**mkdir -p packages/shared/src/{types,utils,crypto,kohaku,rpc,bridge}

```bashmkdir -p packages/shared/__tests__

# src/App.tsx'i aç ve bir değişiklik yapmkdir -p packages/shared/dist

# Kaydet

# Tauri penceresi otomatik yenilenecek (instant!)mkdir -p packages/desktop/src/{main,preload,renderer,utils}

```mkdir -p packages/desktop/public

mkdir -p packages/desktop/build

**Backend değişikliklerini test et:**

```bashmkdir -p bridge/src

# src-tauri/src/commands.rs'i aç ve bir değişiklik yapmkdir -p bridge/proto

# Kaydetmkdir -p bridge/tests

# Rust yeniden compile olur (5-10 saniye)```

# Tauri penceresi otomatik yeniden başlar

```---



### 3.3 Tauri DevTools## 🔌 Adım 3: Trezor Kurulumu



Tauri penceresi açıkken:### 3.1 Trezor Bridge Yükle

- **macOS:** `Cmd + Option + I`

- **Windows/Linux:** `Ctrl + Shift + I`**macOS:**

```bash

Browser DevTools açılır. React component'leri, console.log, network requests görebilirsiniz.brew install trezor-bridge

# Başlat: launchctl start io.trezor.bridge

---```



## 🔌 Adım 4: Trezor Kurulumu (Opsiyonel)**Linux (Debian/Ubuntu):**

```bash

### 4.1 Trezor Bridge Yüklewget https://data.trezor.io/bridge/2.0.33/trezor-bridge_2.0.33_amd64.deb

sudo dpkg -i trezor-bridge_2.0.33_amd64.deb

**macOS:**```

```bash

brew install trezor-bridge**Windows:**

# Başlat: launchctl start io.trezor.bridge- https://data.trezor.io/bridge/2.0.33/trezor-bridge-2.0.33-win32-install.exe adresinden indir

```- Exe'yi çalıştır ve yüklemeyi tamamla



**Linux (Debian/Ubuntu):**### 3.2 Trezor Cihazını Hazırla

```bash

wget https://data.trezor.io/bridge/2.0.33/trezor-bridge_2.0.33_amd64.deb```bash

sudo dpkg -i trezor-bridge_2.0.33_amd64.deb# Trezor'u USB'ye bağla

```

# Web arayüzüne git: https://suite.trezor.io

**Windows:**# VEYA CLI ile:

- https://data.trezor.io/bridge/2.0.33/trezor-bridge-2.0.33-win32-install.exe

- Exe'yi çalıştır ve yüklemeyi tamamlanpm install -g @trezor/trezor-suite



### 4.2 Trezor'u Bağla ve Test Et# Adımlar:

# 1. "Get Started" / "Başla"'yı tıkla

1. **Trezor cihazını USB'ye tak**# 2. Firmware'i güncelle (varsa)

2. **Trezor Suite'i kapat** (eğer açıksa - aynı anda sadece bir uygulama kullanabilir)# 3. "Yeni cüzdan oluştur" veya "Geri yükle" seçeneğini seç

3. **CepWallet'i aç:** `pnpm tauri dev`# 4. Ekranda gösterilen 24 kelimelik recovery phrase'i YÖNETİYLE YERLERE YAZ

4. **"Connect Device" butonuna tıkla**# 5. PIN ayarla (geliştirme için: 1234)

5. **PIN gir** (Trezor ekranında)# 6. Setup tamamlandı!

6. **Başarılı!** Device bilgileri görünmeli

# Kontrol et (CLI):

---npm install -g @trezor/connect-web

# Trezor bağlı mı kontrol et

## 🏗️ Adım 5: Production Build```



### 5.1 Build Yap### 3.3 Test Et



```bash```bash

# Tüm platformlar için build# Browser'da test et

pnpm tauri build# https://trezor.io/learn/a/where-to-find-my-xpub-address

# Trezor'u bağlı tutup testa tıkla

# Sadece current platform# Cihazda onay verdiğinde başarılı oldu

pnpm tauri build --target current

# Adres öğren (ilk hesap)

# İlk build uzun sürebilir (5-10 dakika)# Bu adresi not et (sonra test işlemleri için kullanacağız)

# Rust tüm bağımlılıkları release mode'da compile eder```

```

---

### 5.2 Çıktılar

## 📦 Adım 4: Workspace Paketlerini Kur

**macOS:**

```### 4.1 Root Package.json Oluştur

src-tauri/target/release/bundle/macos/CepWallet.app

src-tauri/target/release/bundle/dmg/cepwallet_0.1.0_x64.dmgDosya: `package.json` (root)

```

```json

**Windows:**{

```  "name": "cepwallet",

src-tauri/target/release/bundle/msi/CepWallet_0.1.0_x64.msi  "version": "0.1.0",

src-tauri/target/release/cepwallet.exe  "private": true,

```  "type": "module",

  "engines": {

**Linux:**    "node": ">=18.0.0",

```    "pnpm": ">=8.0.0"

src-tauri/target/release/bundle/appimage/cep-wallet_0.1.0_amd64.AppImage  },

src-tauri/target/release/bundle/deb/cep-wallet_0.1.0_amd64.deb  "scripts": {

```    "install:all": "pnpm install",

    "build": "pnpm -r build",

### 5.3 Build'i Test Et    "build:shared": "pnpm -F @cepwallet/shared build",

    "build:desktop": "pnpm -F @cepwallet/desktop build",

```bash    "dev": "concurrently \"pnpm dev:desktop\" \"pnpm dev:bridge\"",

# macOS    "dev:desktop": "pnpm -F @cepwallet/desktop dev",

open src-tauri/target/release/bundle/macos/CepWallet.app    "dev:bridge": "pnpm -F bridge dev",

    "test": "pnpm -r test",

# Linux    "lint": "pnpm -r lint",

./src-tauri/target/release/bundle/appimage/cep-wallet_0.1.0_amd64.AppImage    "clean": "pnpm -r clean"

  },

# Windows  "devDependencies": {

.\src-tauri\target\release\cepwallet.exe    "concurrently": "^8.2.0",

```    "typescript": "^5.3.0",

    "eslint": "^8.54.0",

---    "prettier": "^3.1.0"

  }

## 🧪 Adım 6: Wallet Operasyonlarını Test Et}

```

### 6.1 Temel UI Test

### 4.2 @cepwallet/shared Setup

Uygulama açıkken:

- [ ] `WalletConnect` component'i görünüyor```bash

- [ ] `TransactionList` component'i görünüyorcd packages/shared

- [ ] `TrezorConnect` component'i görünüyor (hardware tab)

- [ ] UI responsive (pencere yeniden boyutlandır)# package.json oluştur

- [ ] Hot reload çalışıyor (bir dosyayı değiştir)pnpm init



### 6.2 Tauri IPC Test# Güncelle:

cat > package.json << 'EOF'

DevTools Console'da:{

```javascript  "name": "@cepwallet/shared",

// Tauri command test  "version": "0.1.0",

const { invoke } = window.__TAURI__.core;  "type": "module",

  "main": "./dist/index.js",

// Ping command (basit test)  "types": "./dist/index.d.ts",

await invoke('greet', { name: 'CepWallet' });  "scripts": {

// Çıktı: "Hello, CepWallet!"    "build": "tsc",

    "dev": "tsc --watch",

// Wallet oluştur (gerçek kriptografi)    "test": "jest",

const wallet = await invoke('create_wallet', {     "lint": "eslint src",

  password: 'test123456'     "clean": "rm -rf dist"

});  },

console.log(wallet);  "dependencies": {

// Çıktı: { address: "0x...", mnemonic: "word1 word2 ...", ... }    "ethers": "^6.10.0"

```  },

  "devDependencies": {

### 6.3 Trezor Operasyonları Test    "typescript": "^5.3.0",

    "jest": "^29.7.0",

```javascript    "@types/jest": "^29.5.0"

// Trezor cihazını bağla  }

const device = await invoke('connect_trezor');}

console.log(device);EOF

// Çıktı: { model: "Trezor One", features: {...}, ... }

# Bağımlılıkları yükle (root'tan)

// Ethereum adresi alcd ../..

const address = await invoke('get_ethereum_address', {pnpm install

  path: "m/44'/60'/0'/0/0"```

});

console.log(address);### 4.3 @cepwallet/desktop Setup

// Çıktı: "0x..."

```bash

// Transaction imzalacd packages/desktop

const signature = await invoke('sign_transaction', {

  to: "0x...",# package.json oluştur

  value: "1000000000000000000", // 1 ETH in weipnpm init

  nonce: 0,

  gasLimit: "21000",# Güncelle (aşağıya bakıncıya kadar şimdilik basic version):

  gasPrice: "20000000000"pnpm add electron react react-dom ethers

});pnpm add -D @types/react @types/node typescript webpack webpack-cli webpack-dev-server

console.log(signature);```

```

### 4.4 Bridge (Rust) Setup

---

```bash

## 📁 Proje Yapısı (Özet)cd bridge



```# Cargo.toml oluştur

cepwallet/cargo init --name cepwallet-bridge

├── src/                     # React Frontend

│   ├── App.tsx             # Ana component# Bağımlılıkları ekle

│   ├── main.tsx            # Entry pointcargo add tokio --features full

│   ├── components/         # UI componentscargo add tokio-tungstenite

│   │   ├── Wallet/cargo add serde serde_json

│   │   └── Hardware/```

│   ├── hooks/              # React hooks

│   ├── store/              # State management---

│   └── styles/             # CSS

│## 🚀 Adım 5: İlk Çalıştırma

├── src-tauri/              # Rust Backend

│   ├── src/### 5.1 Shared Package'i Build Et

│   │   ├── main.rs         # Tauri entry point

│   │   ├── commands.rs     # Tauri commands (IPC)```bash

│   │   ├── crypto/         # Kriptografipnpm build:shared

│   │   │   └── wallet.rs   # Wallet logic

│   │   └── hardware/       # Trezor# Doğrula

│   │       └── trezor.rs   # Trezor integrationls packages/shared/dist/  # index.js ve index.d.ts görmelidir

│   ├── Cargo.toml          # Rust dependencies```

│   └── tauri.conf.json     # Tauri config

│### 5.2 Bridge'i Başlat (Terminal 1)

├── docs/                   # Dokümantasyon

│   ├── GETTING_STARTED.md  # Bu dosya```bash

│   ├── PROJECT_STRUCTURE.mdcd bridge

│   └── ARCHITECTURE.mdcargo run

│

├── package.json            # Frontend dependencies# Output şöyle olmalı:

├── vite.config.ts          # Vite config# Compiling cepwallet-bridge v0.1.0

└── tsconfig.json           # TypeScript config# Finished...

```# Listening on ws://localhost:8000

```

Detaylı yapı için: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

### 5.3 Desktop App'ı Başlat (Terminal 2)

---

```bash

## 🛠️ Geliştirme Komutlarıcd packages/desktop

pnpm dev

### Frontend (React + TypeScript)

# Webpack dev server başlatmalı

```bash# http://localhost:3000 açılmalı

# Vite dev server (standalone - Tauri olmadan)

pnpm dev# Yeni bir terminal açıp (Terminal 3):

cd packages/desktop

# TypeScript type checkpnpm electron

pnpm type-check

# Electron penceresi açılmalı

# Linting```

pnpm lint

### 5.4 Trezor'u Bağla

# Build (sadece frontend)

pnpm build```bash

```# Trezor'u USB'ye bağla

# Desktop app'ında "Connect Device" butonuna tıkla

### Backend (Rust + Tauri)# Trezor cihazında onay ver

# Hesaplar görüntülenmeli

```bash```

# Rust format

cd src-tauri---

cargo fmt

## 🧪 Adım 6: İlk Test İşlemi

# Rust lint

cargo clippy### 6.1 Test Ağında (Ethereum Sepolia)



# Rust test```bash

cargo test# Sepolia test ETH elde et

# https://sepoliafaucet.com adresine git

# Rust build (release)# Trezor'dan aldığın adresi gir

cargo build --release# Birkaç dakika bekle (ETH gelmeli)



# Tauri command ekle# İşlem gönder

# src-tauri/src/commands.rs'e ekle# 1. "Send" butonuna tıkla

# src-tauri/src/main.rs'de register et# 2. Test ETH miktarını gir

```# 3. Alıcı adresi: 0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6

# 4. İşlemi gönder

### Tauri# 5. Trezor'da onay ver

# 6. Block Explorer'da işlem sorgula:

```bash#    https://sepolia.etherscan.io/tx/[TX_HASH]

# Development```

pnpm tauri dev

### 6.2 Kohaku Shield İşlemi (Faz 2'de)

# Production build

pnpm tauri build```bash

# Faz 1'de bu kullanılamaz

# Sistem bilgileri# Faz 2'de adım adım rehber eklenecek

pnpm tauri info# Şimdilik normal ETH transferi test et

```

# İkon güncelle

pnpm tauri icon path/to/icon.png---



# Config doğrula## 🐛 Troubleshooting

pnpm tauri info --config

```### Problem: "pnpm: command not found"



---```bash

# Çözüm: Global kurulumu kontrol et

## 🐛 Sorun Gidermenpm install -g pnpm



### Problem: `pnpm tauri dev` çalışmıyor# VEYA npm kullanıcı cache'ini temizle

npm cache clean --force

**Çözüm 1:** Tauri CLI kurulu mu?npm install -g pnpm@latest

```bash```

pnpm list @tauri-apps/cli

# Yoksa: pnpm install### Problem: "Trezor bağlantı bulunamadı"

```

```bash

**Çözüm 2:** Rust güncel mi?# 1. Bridge servisi çalışıyor mu?

```bashps aux | grep trezor-bridge

rustup update

rustc --version  # 1.70+ olmalı# 2. macOS'te başlat:

```launchctl start io.trezor.bridge



**Çözüm 3:** Sistem bağımlılıkları kurulu mu?# 3. Linux'te başlat:

```bashsudo systemctl start trezor-bridge

pnpm tauri info

# Eksik paketleri kur (platform'a göre)# 4. Trezor'u USB'den çıkart ve yeniden tak

``````



### Problem: Rust compile hatası### Problem: Webpack "entry point not found"



**Çözüm 1:** Cargo.lock'u temizle```bash

```bash# Çözüm: TypeScript dosyalarını oluştur

cd src-tauritouch packages/desktop/src/index.tsx

rm -rf target/touch packages/desktop/src/App.tsx

cargo cleantouch packages/desktop/src/main/index.ts

cd ..```

pnpm tauri dev

```### Problem: "Cannot find module '@cepwallet/shared'"



**Çözüm 2:** Bağımlılıkları güncelle```bash

```bash# Çözüm 1: Workspace linkage'ini kontrol et

cd src-tauripnpm install

cargo update

cd ..# Çözüm 2: pnpm-workspace.yaml'ı doğrula

pnpm tauri devcat pnpm-workspace.yaml

```

# Çözüm 3: node_modules yeniden kur

### Problem: Trezor bağlanamıyorpnpm clean

pnpm install

**Çözüm 1:** Trezor Suite kapalı mı?```

- Trezor Suite'i tamamen kapat

- CepWallet'i yeniden başlat### Problem: Bridge Rust compile error



**Çözüm 2:** Trezor Bridge çalışıyor mu?```bash

```bash# Çözüm: Rust toolchain güncellemesi

# macOSrustup update

launchctl list | grep trezorrustup update nightly

# Yoksa: launchctl start io.trezor.bridge

# Cargo cache temizle

# Linuxcargo clean

systemctl status trezord.servicecargo build

# Yoksa: sudo systemctl start trezord```

```

---

**Çözüm 3:** USB bağlantısı

- Trezor'u çıkar ve tekrar tak## ✅ Başarı Kontrolü

- Farklı bir USB port dene

- USB hub kullanıyorsan, direkt PC'ye bağlaAşağıdaki tüm adımları tamamladıysan, hazırsın! ✅



### Problem: Hot reload çalışmıyor- [ ] pnpm kuruldu (`pnpm --version`)

- [ ] Node.js 18+ kuruldu (`node --version`)

**Çözüm:**- [ ] Rust kuruldu (`rustc --version`)

```bash- [ ] Repository clone edildi

# Dev server'ı durdur (Ctrl+C)- [ ] `pnpm install` başarılı oldu

# Node modules'ü temizle- [ ] Trezor Bridge çalışıyor

rm -rf node_modules/ pnpm-lock.yaml- [ ] Trezor cihazı bağlı ve hazır

pnpm install- [ ] Bridge WebSocket sunucusu çalışıyor (`cargo run`)

pnpm tauri dev- [ ] Desktop app başlıyor (`pnpm dev:desktop`)

```- [ ] Electron penceresi açılıyor

- [ ] Trezor'a bağlanabiliyor

---- [ ] İlk işlem gönderilebildi



## 📚 İleri Okuma---



- **Proje Yapısı:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detaylı proje yapısı## 📚 Sonraki Adımlar

- **Mimari:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Sistem mimarisi

- **Tauri Dökümanları:** [tauri.app/v2](https://v2.tauri.app) - Resmi Tauri 2.x docs### Hemen Sonra

- **Trezor Entegrasyonu:** [docs/trezor/README.md](./trezor/README.md) - Trezor kullanımı1. **ARCHITECTURE.md** oku - Sistem mimarisi

- **Kohaku SDK:** [docs/kohaku/README.md](./kohaku/README.md) - DeFi operasyonları2. **TREZOR_KOHAKU_INTEGRATION.md** oku - Entegrasyon detayları

3. **packages/shared** TypeScript types'ı yazmeye başla

---

### Faz 1 (Geliştiriciler)

## ✅ Checklist: İlk Setup Tamamlandı mı?1. Wallet Dashboard UI bileşenleri oluştur

2. Bridge WebSocket client'ı tamamla

- [ ] Node.js 18+ kurulu3. Trezor Connect entegrasyonunu genişlet

- [ ] pnpm 8+ kurulu4. Unit tests yaz (Jest)

- [ ] Rust 1.70+ kurulu

- [ ] Repository clone edildi### Faz 2 (Privacy)

- [ ] `pnpm install` başarıyla tamamlandı1. Kohaku entegrasyonunu ekle

- [ ] `pnpm tauri dev` çalışıyor2. RAILGUN Shield işlemini uygula

- [ ] Tauri penceresi açılıyor3. Privacy Pool desteğini ekle

- [ ] UI component'leri görünüyor4. Humanizer başlat

- [ ] DevTools açılabiliyor

- [ ] Hot reload çalışıyor (bir dosyayı değiştirip test et)---

- [ ] (Opsiyonel) Trezor bağlanabiliyor

## 📖 İlgili Belgeler

Hepsi tamamsa, **hazırsın!** 🎉

| Belge | Açıklama |

---|-------|----------|

| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Proje dosya organizasyonu |

## 🚀 Bir Sonraki Adımlar| [ARCHITECTURE.md](ARCHITECTURE.md) | Teknik sistem mimarisi |

| [TREZOR_KOHAKU_INTEGRATION.md](TREZOR_KOHAKU_INTEGRATION.md) | Entegrasyon detayları |

1. **UI Geliştir:** `src/components/` altında yeni component'ler ekle| [SETUP_CI_CD.md](SETUP_CI_CD.md) | CI/CD pipeline kurulumu |

2. **Tauri Commands Ekle:** `src-tauri/src/commands.rs`'e yeni backend fonksiyonları ekle| [HARDWARE.md](HARDWARE.md) | Trezor hardware rehberi |

3. **Wallet Oluştur:** Temel wallet operasyonlarını test et| [PRIVACY_FEATURES.md](PRIVACY_FEATURES.md) | Kohaku privacy özellikleri |

4. **Trezor Test:** Hardware wallet entegrasyonunu dene

5. **DeFi:** Kohaku SDK ile DeFi protokollerini entegre etSorularınız mı var? [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasına bakın veya issue açın! 🎉



**Daha fazla detay için:** [ROADMAP.md](./ROADMAP.md)````

    app.quit();

---  }

});

**Son Güncelleme:** 17 Ekim 2025  

**Güncelleyen:** Tauri 2.x Migrasyon  app.on('activate', () => {

**Sorular?** GitHub Issues: https://github.com/zinderud/cepwallet/issues  if (BrowserWindow.getAllWindows().length === 0) {

    createWindow();
  }
});
```

### 5. React App - Basit Başlangıç

Dosya: `desktop/src/App.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import TrezorConnect from '@trezor/connect-web';
import { ethers } from 'ethers';
import './App.css';

// Trezor Connect'i başlat
TrezorConnect.init({
  lazyLoad: true,
  manifest: {
    email: 'developer@cepwallet.com',
    appUrl: 'http://localhost:3000'
  }
});

function App() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);

  useEffect(() => {
    // Ethereum provider oluştur
    const p = new ethers.providers.JsonRpcProvider(
      'https://mainnet.infura.io/v3/YOUR-INFURA-PROJECT-ID'
    );
    setProvider(p);
  }, []);

  const connectTrezor = async () => {
    try {
      const result = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0",
        showOnTrezor: false
      });

      if (result.success) {
        setAddress(result.payload.address);
        setConnected(true);

        // Bakiye al
        if (provider) {
          const bal = await provider.getBalance(result.payload.address);
          setBalance(ethers.utils.formatEther(bal));
        }
      } else {
        console.error('Error:', result.payload.error);
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const sendTransaction = async () => {
    if (!address) return;

    try {
      // Örnek: 0.001 ETH gönder
      const to = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const value = '0x38D7EA4C68000'; // 0.001 ETH in hex

      const result = await TrezorConnect.ethereumSignTransaction({
        path: "m/44'/60'/0'/0/0",
        transaction: {
          to,
          value,
          gasLimit: '0x5208', // 21000
          gasPrice: '0x3B9ACA00', // 1 Gwei
          nonce: '0x0',
          chainId: 1
        }
      });

      if (result.success) {
        const serializedTx = result.payload.serializedTx;
        
        // İmzalı tx'i gönder
        const txResponse = await provider!.sendTransaction(serializedTx);
        console.log('Transaction sent:', txResponse.hash);
        alert(`Transaction sent! Hash: ${txResponse.hash}`);
      }
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CepWallet Prototype</h1>
      </header>

      <main>
        <div className="wallet-section">
          <h2>Cüzdan</h2>
          
          {!connected ? (
            <button onClick={connectTrezor} className="btn-primary">
              Trezor'a Bağlan
            </button>
          ) : (
            <div className="wallet-info">
              <div className="info-row">
                <span className="label">Adres:</span>
                <span className="value">{address}</span>
              </div>
              <div className="info-row">
                <span className="label">Bakiye:</span>
                <span className="value">{balance} ETH</span>
              </div>

              <button onClick={sendTransaction} className="btn-secondary">
                Test İşlemi Gönder
              </button>
            </div>
          )}
        </div>

        <div className="browser-section">
          <h2>DApp Browser</h2>
          <p>Yakında...</p>
        </div>
      </main>
    </div>
  );
}

export default App;
```

Dosya: `desktop/src/App.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.App-header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.App-header h1 {
  font-size: 24px;
  color: #667eea;
  text-align: center;
}

main {
  flex: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.wallet-section,
.browser-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 20px;
  color: #667eea;
}

.btn-primary,
.btn-secondary {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #48bb78;
  color: white;
  margin-top: 20px;
}

.btn-secondary:hover {
  background: #38a169;
}

.wallet-info {
  margin-top: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 10px;
}

.info-row .label {
  font-weight: 600;
  color: #4a5568;
}

.info-row .value {
  color: #2d3748;
  font-family: 'Courier New', monospace;
}
```

### 6. Webpack Config

Dosya: `desktop/webpack.config.js`

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    port: 3000,
    hot: true
  }
};
```

### 7. Index Dosyaları

Dosya: `desktop/src/index.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Dosya: `desktop/public/index.html`

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CepWallet</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### 8. TypeScript Config

Dosya: `desktop/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "baseUrl": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🚀 Uygulamayı Çalıştırma

### Development Mode

```bash
cd desktop

# Terminal 1: React dev server
npm run dev

# Terminal 2: Electron app
npm run electron

# Veya tek komutla (concurrently ile)
npm install --save-dev concurrently wait-on
npm run electron:dev
```

### İlk Test

1. **Uygulamayı aç**
2. **Trezor'u bilgisayara bağla**
3. **"Trezor'a Bağlan" butonuna tıkla**
4. Trezor ekranında "Export public key?" mesajı çıkacak
5. **Onayla**
6. Uygulama adresinizi ve bakiyenizi gösterecek

---

## 🔧 Sonraki Adımlar

### Faz 1: Web Browser Entegrasyonu

```bash
# BrowserView ekle
# electron/browser-manager.js oluştur
```

**BrowserView ile Web3 Injection:**

```javascript
// electron/browser-preload.js
const { contextBridge } = require('electron');

// Custom Web3 Provider
contextBridge.exposeInMainWorld('ethereum', {
  isMetaMask: true,
  isCepWallet: true,
  
  request: async ({ method, params }) => {
    // Trezor'a yönlendir
    return window.electron.web3Request(method, params);
  },
  
  on: (event, callback) => {
    // Event listeners
  }
});
```

### Faz 2: Multi-Account Desteği

```typescript
// Birden fazla hesap keşfet
const accounts = [];
for (let i = 0; i < 5; i++) {
  const result = await TrezorConnect.ethereumGetAddress({
    path: `m/44'/60'/0'/0/${i}`,
    showOnTrezor: false
  });
  
  if (result.success) {
    accounts.push({
      index: i,
      address: result.payload.address,
      path: `m/44'/60'/0'/0/${i}`
    });
  }
}
```

### Faz 3: Token Desteği

```typescript
// ERC-20 token bakiyesi
const tokenAbi = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

const tokenContract = new ethers.Contract(
  tokenAddress,
  tokenAbi,
  provider
);

const balance = await tokenContract.balanceOf(walletAddress);
const symbol = await tokenContract.symbol();
const decimals = await tokenContract.decimals();
```

### Faz 4: DApp Browser

**Chromium Embedded Framework** ile tam özellikli browser:

```javascript
const { BrowserView } = require('electron');

const view = new BrowserView({
  webPreferences: {
    preload: path.join(__dirname, 'browser-preload.js')
  }
});

mainWindow.setBrowserView(view);
view.setBounds({ x: 0, y: 80, width: 1400, height: 820 });
view.webContents.loadURL('https://uniswap.org');
```

---

## 🐛 Troubleshooting

### Trezor Bridge Bulunamıyor
```bash
# Bridge çalışıyor mu kontrol et
ps aux | grep trezor

# Yeniden başlat
sudo systemctl restart trezord  # Linux
```

### USB İzinleri (Linux)
```bash
# udev rules ekle
sudo nano /etc/udev/rules.d/51-trezor.rules

# İçeriği:
# SUBSYSTEM=="usb", ATTR{idVendor}=="534c", ATTR{idProduct}=="0001", MODE="0660", GROUP="plugdev"

# udev'i yenile
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### Electron Security Warnings
```javascript
// nodeIntegration: false kullan (production için)
// contextBridge kullan
// Trezor Connect için CSP ayarla
```

---

## 📦 Production Build

```bash
# Build
npm run build

# Paketleme (macOS)
npm run dist

# Çıktı:
# dist/CepWallet-0.1.0.dmg
# dist/CepWallet-0.1.0-mac.zip
```

---

## 📚 Yararlı Komutlar

```bash
# Trezor firmware version kontrol
trezorctl get_features

# Trezor wipe (dikkat! tüm veriler silinir)
trezorctl wipe_device

# Recovery test
trezorctl recovery_device

# Ethereum address al (CLI)
trezorctl ethereum_get_address -n "m/44'/60'/0'/0/0"
```

---

## 🎯 Checklist - İlk Prototip

- [ ] Trezor cihazı kuruldu
- [ ] Trezor Bridge yüklendi
- [ ] Desktop app çalışıyor
- [ ] Trezor'a bağlanabiliyor
- [ ] Adres ve bakiye görüntüleniyor
- [ ] Test transaction gönderilebiliyor
- [ ] Trezor ekranında tx onaylanabiliyor

## 🎯 Checklist - Web3 Browser

- [ ] BrowserView entegre edildi
- [ ] Web3 provider injection çalışıyor
- [ ] Uniswap.org'da "Connect Wallet" görünüyor
- [ ] Swap işlemi yapılabiliyor
- [ ] İşlem Trezor'da onaylanabiliyor

---

## 💡 Pro Tips

1. **Development için Testnet kullanın**
   - Goerli veya Sepolia testnet
   - Bedava test ETH alın

2. **Trezor Emulator kullanın** (cihaz olmadan test)
   ```bash
   git clone https://github.com/trezor/trezor-firmware.git
   cd trezor-firmware/core
   poetry install
   poetry run ./emu.py
   ```

3. **Debug için Trezor Suite kullanın**
   - Cihaz durumunu kontrol edin
   - Firmware güncelleyin
   - Hesapları görüntüleyin

4. **Güvenlik**
   - Asla production private key'leri development'ta kullanmayın
   - Recovery phrase'i test cüzdanı için kaydedin
   - PIN kullanın (test cihazında bile)

---

## 📖 Sonraki Adımlar

1. ✅ Bu rehberi takip ederek basit prototipi oluşturun
2. ✅ Web browser entegrasyonunu ekleyin
3. ✅ Multi-chain desteği (BSC, Polygon)
4. ✅ NFT görüntüleme ve transfer
5. ✅ Swap aggregator (1inch, Paraswap)
6. ✅ DeFi dashboard (Aave, Compound)

Başarılar! 🚀
