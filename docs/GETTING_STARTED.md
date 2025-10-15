# CepWallet - Başlangıç Rehberi

## 🚀 Hızlı Başlangıç

Bu rehber, **pnpm workspace** kullanarak CepWallet'i geliştirme ortamında ayarlamanız için adım adım talimatlar içerir. Yaklaşık **30-45 dakika** sürer.

---

## 📋 Ön Gereksinimler

### Donanım
- [ ] **Trezor One**, **Trezor Model T**, veya **Trezor Safe 3** (test için)
- [ ] USB kablo
- [ ] Geliştirme bilgisayarı (Windows/macOS/Linux)

### Yazılım
- [ ] **Node.js** 18+ (https://nodejs.org)
- [ ] **pnpm** 8.0+ (`npm install -g pnpm`)
- [ ] **Rust** 1.70+ (Bridge için - https://rustup.rs/)
- [ ] **Git** (https://git-scm.com)
- [ ] **VS Code** (https://code.visualstudio.com) - Önerilir

### İnternet Hizmetleri
- [ ] **Infura** veya **Alchemy** hesabı (Ethereum RPC)
  - Kaydol: https://infura.io veya https://www.alchemy.com
  - API key'i elde et (sonra kullanacağız)

---

## ⚙️ Adım 1: Gerekli Yazılımları Kur

### 1.1 pnpm Kurulumu

```bash
# pnpm global olarak yükle
npm install -g pnpm

# Sürümü doğrula (8.0+ olmalı)
pnpm --version

# OPTIONAL: pnpm için shell completion
pnpm install-completion
```

### 1.2 Rust Kurulumu (Bridge için)

```bash
# Rust installer'ını indir ve çalıştır
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Source'u güncelle
source $HOME/.cargo/env

# Sürümü doğrula
rustc --version  # 1.70+ olmalı
cargo --version

# OPTIONAL: Rust optimization flags
rustup update
```

### 1.3 Node.js Versiyonu Kontrol Et

```bash
node --version    # 18.0+ olmalı
npm --version

# OPTIONAL: nvm ile version yönetimine geçebilirsin
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

---

## 📁 Adım 2: Proje Klasörünü Setup Et

### 2.1 Repository'yi Clone Et

```bash
# Proje klasörüne git
cd /Users/muratonurkaradeniz/workspace/sade/code

# Repository'yi clone et
git clone https://github.com/zinderud/cepwallet.git
cd cepwallet

# Yapı doğrula
ls -la  # görmelisin: packages/, docs/, .github/, vb.
```

### 2.2 pnpm Workspace'i Başlat

```bash
# Root klasörden çalış
cd /Users/muratonurkaradeniz/workspace/sade/code/cepwallet

# 1. pnpm-workspace.yaml oluştur (eğer yoksa)
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'bridge'
EOF

# 2. Root package.json'u oluştur/doğrula
# (ayrı bir bölüm olacak - PROJECT_STRUCTURE.md'ye bak)

# 3. Tüm bağımlılıkları yükle
pnpm install

# Yüklemeyi doğrula
ls -la node_modules/.pnpm  # pnpm cache görünmelidir
```

### 2.3 Workspace Klasörlerini Oluştur

```bash
# packages/ klasörleri için alt dizinler
mkdir -p packages/shared/src/{types,utils,crypto,kohaku,rpc,bridge}
mkdir -p packages/shared/__tests__
mkdir -p packages/shared/dist

mkdir -p packages/desktop/src/{main,preload,renderer,utils}
mkdir -p packages/desktop/public
mkdir -p packages/desktop/build

mkdir -p bridge/src
mkdir -p bridge/proto
mkdir -p bridge/tests
```

---

## 🔌 Adım 3: Trezor Kurulumu

### 3.1 Trezor Bridge Yükle

**macOS:**
```bash
brew install trezor-bridge
# Başlat: launchctl start io.trezor.bridge
```

**Linux (Debian/Ubuntu):**
```bash
wget https://data.trezor.io/bridge/2.0.33/trezor-bridge_2.0.33_amd64.deb
sudo dpkg -i trezor-bridge_2.0.33_amd64.deb
```

**Windows:**
- https://data.trezor.io/bridge/2.0.33/trezor-bridge-2.0.33-win32-install.exe adresinden indir
- Exe'yi çalıştır ve yüklemeyi tamamla

### 3.2 Trezor Cihazını Hazırla

```bash
# Trezor'u USB'ye bağla

# Web arayüzüne git: https://suite.trezor.io
# VEYA CLI ile:

npm install -g @trezor/trezor-suite

# Adımlar:
# 1. "Get Started" / "Başla"'yı tıkla
# 2. Firmware'i güncelle (varsa)
# 3. "Yeni cüzdan oluştur" veya "Geri yükle" seçeneğini seç
# 4. Ekranda gösterilen 24 kelimelik recovery phrase'i YÖNETİYLE YERLERE YAZ
# 5. PIN ayarla (geliştirme için: 1234)
# 6. Setup tamamlandı!

# Kontrol et (CLI):
npm install -g @trezor/connect-web
# Trezor bağlı mı kontrol et
```

### 3.3 Test Et

```bash
# Browser'da test et
# https://trezor.io/learn/a/where-to-find-my-xpub-address
# Trezor'u bağlı tutup testa tıkla
# Cihazda onay verdiğinde başarılı oldu

# Adres öğren (ilk hesap)
# Bu adresi not et (sonra test işlemleri için kullanacağız)
```

---

## 📦 Adım 4: Workspace Paketlerini Kur

### 4.1 Root Package.json Oluştur

Dosya: `package.json` (root)

```json
{
  "name": "cepwallet",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "install:all": "pnpm install",
    "build": "pnpm -r build",
    "build:shared": "pnpm -F @cepwallet/shared build",
    "build:desktop": "pnpm -F @cepwallet/desktop build",
    "dev": "concurrently \"pnpm dev:desktop\" \"pnpm dev:bridge\"",
    "dev:desktop": "pnpm -F @cepwallet/desktop dev",
    "dev:bridge": "pnpm -F bridge dev",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "clean": "pnpm -r clean"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0"
  }
}
```

### 4.2 @cepwallet/shared Setup

```bash
cd packages/shared

# package.json oluştur
pnpm init

# Güncelle:
cat > package.json << 'EOF'
{
  "name": "@cepwallet/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "ethers": "^6.10.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
EOF

# Bağımlılıkları yükle (root'tan)
cd ../..
pnpm install
```

### 4.3 @cepwallet/desktop Setup

```bash
cd packages/desktop

# package.json oluştur
pnpm init

# Güncelle (aşağıya bakıncıya kadar şimdilik basic version):
pnpm add electron react react-dom ethers
pnpm add -D @types/react @types/node typescript webpack webpack-cli webpack-dev-server
```

### 4.4 Bridge (Rust) Setup

```bash
cd bridge

# Cargo.toml oluştur
cargo init --name cepwallet-bridge

# Bağımlılıkları ekle
cargo add tokio --features full
cargo add tokio-tungstenite
cargo add serde serde_json
```

---

## 🚀 Adım 5: İlk Çalıştırma

### 5.1 Shared Package'i Build Et

```bash
pnpm build:shared

# Doğrula
ls packages/shared/dist/  # index.js ve index.d.ts görmelidir
```

### 5.2 Bridge'i Başlat (Terminal 1)

```bash
cd bridge
cargo run

# Output şöyle olmalı:
# Compiling cepwallet-bridge v0.1.0
# Finished...
# Listening on ws://localhost:8000
```

### 5.3 Desktop App'ı Başlat (Terminal 2)

```bash
cd packages/desktop
pnpm dev

# Webpack dev server başlatmalı
# http://localhost:3000 açılmalı

# Yeni bir terminal açıp (Terminal 3):
cd packages/desktop
pnpm electron

# Electron penceresi açılmalı
```

### 5.4 Trezor'u Bağla

```bash
# Trezor'u USB'ye bağla
# Desktop app'ında "Connect Device" butonuna tıkla
# Trezor cihazında onay ver
# Hesaplar görüntülenmeli
```

---

## 🧪 Adım 6: İlk Test İşlemi

### 6.1 Test Ağında (Ethereum Sepolia)

```bash
# Sepolia test ETH elde et
# https://sepoliafaucet.com adresine git
# Trezor'dan aldığın adresi gir
# Birkaç dakika bekle (ETH gelmeli)

# İşlem gönder
# 1. "Send" butonuna tıkla
# 2. Test ETH miktarını gir
# 3. Alıcı adresi: 0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6
# 4. İşlemi gönder
# 5. Trezor'da onay ver
# 6. Block Explorer'da işlem sorgula:
#    https://sepolia.etherscan.io/tx/[TX_HASH]
```

### 6.2 Kohaku Shield İşlemi (Faz 2'de)

```bash
# Faz 1'de bu kullanılamaz
# Faz 2'de adım adım rehber eklenecek
# Şimdilik normal ETH transferi test et
```

---

## 🐛 Troubleshooting

### Problem: "pnpm: command not found"

```bash
# Çözüm: Global kurulumu kontrol et
npm install -g pnpm

# VEYA npm kullanıcı cache'ini temizle
npm cache clean --force
npm install -g pnpm@latest
```

### Problem: "Trezor bağlantı bulunamadı"

```bash
# 1. Bridge servisi çalışıyor mu?
ps aux | grep trezor-bridge

# 2. macOS'te başlat:
launchctl start io.trezor.bridge

# 3. Linux'te başlat:
sudo systemctl start trezor-bridge

# 4. Trezor'u USB'den çıkart ve yeniden tak
```

### Problem: Webpack "entry point not found"

```bash
# Çözüm: TypeScript dosyalarını oluştur
touch packages/desktop/src/index.tsx
touch packages/desktop/src/App.tsx
touch packages/desktop/src/main/index.ts
```

### Problem: "Cannot find module '@cepwallet/shared'"

```bash
# Çözüm 1: Workspace linkage'ini kontrol et
pnpm install

# Çözüm 2: pnpm-workspace.yaml'ı doğrula
cat pnpm-workspace.yaml

# Çözüm 3: node_modules yeniden kur
pnpm clean
pnpm install
```

### Problem: Bridge Rust compile error

```bash
# Çözüm: Rust toolchain güncellemesi
rustup update
rustup update nightly

# Cargo cache temizle
cargo clean
cargo build
```

---

## ✅ Başarı Kontrolü

Aşağıdaki tüm adımları tamamladıysan, hazırsın! ✅

- [ ] pnpm kuruldu (`pnpm --version`)
- [ ] Node.js 18+ kuruldu (`node --version`)
- [ ] Rust kuruldu (`rustc --version`)
- [ ] Repository clone edildi
- [ ] `pnpm install` başarılı oldu
- [ ] Trezor Bridge çalışıyor
- [ ] Trezor cihazı bağlı ve hazır
- [ ] Bridge WebSocket sunucusu çalışıyor (`cargo run`)
- [ ] Desktop app başlıyor (`pnpm dev:desktop`)
- [ ] Electron penceresi açılıyor
- [ ] Trezor'a bağlanabiliyor
- [ ] İlk işlem gönderilebildi

---

## 📚 Sonraki Adımlar

### Hemen Sonra
1. **ARCHITECTURE.md** oku - Sistem mimarisi
2. **TREZOR_KOHAKU_INTEGRATION.md** oku - Entegrasyon detayları
3. **packages/shared** TypeScript types'ı yazmeye başla

### Faz 1 (Geliştiriciler)
1. Wallet Dashboard UI bileşenleri oluştur
2. Bridge WebSocket client'ı tamamla
3. Trezor Connect entegrasyonunu genişlet
4. Unit tests yaz (Jest)

### Faz 2 (Privacy)
1. Kohaku entegrasyonunu ekle
2. RAILGUN Shield işlemini uygula
3. Privacy Pool desteğini ekle
4. Humanizer başlat

---

## 📖 İlgili Belgeler

| Belge | Açıklama |
|-------|----------|
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Proje dosya organizasyonu |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Teknik sistem mimarisi |
| [TREZOR_KOHAKU_INTEGRATION.md](TREZOR_KOHAKU_INTEGRATION.md) | Entegrasyon detayları |
| [SETUP_CI_CD.md](SETUP_CI_CD.md) | CI/CD pipeline kurulumu |
| [HARDWARE.md](HARDWARE.md) | Trezor hardware rehberi |
| [PRIVACY_FEATURES.md](PRIVACY_FEATURES.md) | Kohaku privacy özellikleri |

Sorularınız mı var? [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasına bakın veya issue açın! 🎉

````
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
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
