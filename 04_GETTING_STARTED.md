# CepWallet - Başlangıç Rehberi

## 🚀 Hızlı Başlangıç

Bu rehber, Trezor hardware wallet kullanarak CepWallet sisteminin prototipini oluşturmanız için adım adım talimatlar içerir.

---

## 📋 Ön Gereksinimler

### Donanım
- [ ] **Trezor One** veya **Trezor Model T** (test için)
- [ ] USB kablo
- [ ] Geliştirme bilgisayarı (Windows/macOS/Linux)

### Yazılım
- [ ] **Node.js** 18+ ve npm
- [ ] **Rust** 1.70+ (Bridge için)
- [ ] **Git**
- [ ] **VS Code** veya tercih ettiğiniz IDE

### API Keys
- [ ] **Infura** veya **Alchemy** hesabı (Ethereum RPC için)
- [ ] **Etherscan** API key (opsiyonel, tx history için)

---

## 🛠️ Kurulum Adımları

### 1. Trezor Cihazı Hazırlama

```bash
# Trezor Bridge'i yükle (cihaz iletişimi için)
# macOS:
brew install trezor-bridge

# Linux:
wget https://data.trezor.io/bridge/2.0.33/trezor-bridge_2.0.33_amd64.deb
sudo dpkg -i trezor-bridge_2.0.33_amd64.deb

# Windows:
# https://data.trezor.io/bridge/2.0.33/trezor-bridge-2.0.33-win32-install.exe
```

**Trezor Kurulumu:**
1. Trezor'u bilgisayara bağla
2. https://trezor.io/start adresine git
3. Firmware güncellemesi yap
4. Yeni cüzdan oluştur veya geri yükle
5. Recovery phrase'i güvenli bir yere kaydet (24 kelime)
6. PIN ayarla

### 2. Proje Klasör Yapısını Oluşturma

```bash
cd /Users/muratonurkaradeniz/workspace/sade/code/cepwallet

# Ana dizinleri oluştur
mkdir -p desktop/{electron,src,public}
mkdir -p desktop/src/{components,services,hooks,utils}
mkdir -p desktop/src/components/{Wallet,Browser,Device}
mkdir -p bridge/src
mkdir -p docs
```

### 3. Desktop App Kurulumu (Electron + React)

```bash
cd desktop

# package.json oluştur
npm init -y

# Gerekli paketleri yükle
npm install --save \
  react \
  react-dom \
  @trezor/connect-web \
  ethers \
  electron

# Dev dependencies
npm install --save-dev \
  @types/react \
  @types/react-dom \
  @types/node \
  typescript \
  electron-builder \
  webpack \
  webpack-cli \
  webpack-dev-server \
  html-webpack-plugin \
  ts-loader \
  css-loader \
  style-loader

# TypeScript config
npx tsc --init
```

**package.json scripts:**
```json
{
  "name": "cepwallet-desktop",
  "version": "0.1.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  }
}
```

### 4. Basit Electron Main Process

Dosya: `desktop/electron/main.js`

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Development modunda
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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
