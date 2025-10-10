# CepWallet - Teknik Mimari Detayları

## 📐 Sistem Mimarisi Derinlemesine

### 1. Katmanlı Mimari

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (UI)                                      │
├─────────────────────────────────────────────────────────────┤
│ - Electron App (Desktop)                                     │
│ - React Native App (Mobile)                                  │
│ - Chromium Embedded Browser                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                            │
├─────────────────────────────────────────────────────────────┤
│ - Wallet Management (Account, Balance, History)             │
│ - Transaction Builder                                        │
│ - Web3 Provider                                              │
│ - DApp Detector & Injector                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│ INTEGRATION LAYER                                            │
├─────────────────────────────────────────────────────────────┤
│ - Hardware Bridge/Daemon                                     │
│ - Blockchain RPC Client                                      │
│ - Token/NFT Discovery Services                               │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│ HARDWARE LAYER                                               │
├─────────────────────────────────────────────────────────────┤
│ - USB/Bluetooth Communication                                │
│ - Firmware Protocol                                          │
│ - Secure Element                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL SERVICES                                            │
├─────────────────────────────────────────────────────────────┤
│ - Blockchain Nodes (Ethereum, BSC, Polygon, etc.)           │
│ - Price Feeds (CoinGecko, CoinMarketCap)                    │
│ - Token Lists (Uniswap, Trust Wallet)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Hardware Bridge - Detaylı Tasarım

### Protocol Buffer Tanımları

```protobuf
// protocol/messages.proto

syntax = "proto3";

package cepwallet;

// Genel mesaj zarfı
message Message {
  string message_id = 1;
  MessageType type = 2;
  bytes payload = 3;
}

enum MessageType {
  PING = 0;
  INITIALIZE = 1;
  GET_PUBLIC_KEY = 2;
  SIGN_TRANSACTION = 3;
  SIGN_MESSAGE = 4;
  GET_ADDRESS = 5;
  // ... diğer mesaj tipleri
}

// Ethereum işlem imzalama
message EthereumSignTx {
  repeated uint32 address_n = 1;  // BIP44 path: m/44'/60'/0'/0/0
  bytes nonce = 2;
  bytes gas_price = 3;
  bytes gas_limit = 4;
  bytes to = 5;
  bytes value = 6;
  bytes data = 7;
  uint32 chain_id = 8;
}

message EthereumTxSignature {
  bytes signature_v = 1;
  bytes signature_r = 2;
  bytes signature_s = 3;
}

// Public key isteme
message GetPublicKey {
  repeated uint32 address_n = 1;
  bool show_display = 2;
}

message PublicKey {
  bytes public_key = 1;
  string address = 2;
  string xpub = 3;
}
```

### Rust Bridge Implementation

```rust
// bridge/src/main.rs

use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::{StreamExt, SinkExt};
use hidapi::HidApi;
use prost::Message;

mod protocol;
mod device;

use protocol::*;
use device::HardwareDevice;

#[tokio::main]
async fn main() {
    // USB cihazı başlat
    let hid_api = HidApi::new().expect("Failed to create HID API");
    let device = Arc::new(Mutex::new(
        HardwareDevice::new(&hid_api).expect("Device not found")
    ));

    // WebSocket server başlat (localhost:21325)
    let listener = TcpListener::bind("127.0.0.1:21325").await.unwrap();
    println!("Bridge started on ws://127.0.0.1:21325");

    while let Ok((stream, _)) = listener.accept().await {
        let device = device.clone();
        
        tokio::spawn(async move {
            handle_connection(stream, device).await;
        });
    }
}

async fn handle_connection(
    stream: tokio::net::TcpStream,
    device: Arc<Mutex<HardwareDevice>>
) {
    let ws_stream = accept_async(stream).await.unwrap();
    let (mut write, mut read) = ws_stream.split();

    while let Some(msg) = read.next().await {
        if let Ok(msg) = msg {
            let response = process_message(msg.into_data(), &device).await;
            write.send(response.into()).await.unwrap();
        }
    }
}

async fn process_message(
    data: Vec<u8>,
    device: &Arc<Mutex<HardwareDevice>>
) -> Vec<u8> {
    let msg = protocol::Message::decode(&data[..]).unwrap();
    
    match msg.message_type() {
        MessageType::Ping => {
            // Pong response
            create_response(&msg.message_id, b"pong")
        }
        
        MessageType::GetPublicKey => {
            let request = GetPublicKey::decode(&msg.payload[..]).unwrap();
            let mut dev = device.lock().unwrap();
            let pubkey = dev.get_public_key(&request.address_n).unwrap();
            
            create_response(&msg.message_id, &pubkey.encode_to_vec())
        }
        
        MessageType::SignTransaction => {
            let request = EthereumSignTx::decode(&msg.payload[..]).unwrap();
            let mut dev = device.lock().unwrap();
            let signature = dev.sign_transaction(&request).unwrap();
            
            create_response(&msg.message_id, &signature.encode_to_vec())
        }
        
        _ => create_error_response(&msg.message_id, "Unknown message type")
    }
}

fn create_response(msg_id: &str, payload: &[u8]) -> Vec<u8> {
    let msg = protocol::Message {
        message_id: msg_id.to_string(),
        message_type: MessageType::Response as i32,
        payload: payload.to_vec(),
    };
    msg.encode_to_vec()
}
```

### Device Communication Layer

```rust
// bridge/src/device.rs

use hidapi::{HidApi, HidDevice};
use crate::protocol::*;

pub struct HardwareDevice {
    device: HidDevice,
    session_id: Vec<u8>,
}

impl HardwareDevice {
    pub fn new(api: &HidApi) -> Result<Self, String> {
        // VID:PID for CepWallet (örnek: 0x1209:0x5301)
        let device = api
            .open(0x1209, 0x5301)
            .map_err(|e| format!("Device open failed: {}", e))?;

        Ok(Self {
            device,
            session_id: vec![],
        })
    }

    pub fn get_public_key(&mut self, path: &[u32]) -> Result<PublicKey, String> {
        // Protocol message oluştur
        let request = GetPublicKey {
            address_n: path.to_vec(),
            show_display: false,
        };

        // Cihaza gönder
        self.send_message(MessageType::GetPublicKey, &request.encode_to_vec())?;

        // Response al
        let response = self.read_message()?;
        let pubkey = PublicKey::decode(&response[..])
            .map_err(|e| format!("Decode error: {}", e))?;

        Ok(pubkey)
    }

    pub fn sign_transaction(&mut self, tx: &EthereumSignTx) -> Result<EthereumTxSignature, String> {
        // İşlemi cihaza gönder
        self.send_message(MessageType::SignTransaction, &tx.encode_to_vec())?;

        // Kullanıcı cihazda onaylayacak...
        // Response bekle
        let response = self.read_message()?;
        let signature = EthereumTxSignature::decode(&response[..])
            .map_err(|e| format!("Decode error: {}", e))?;

        Ok(signature)
    }

    fn send_message(&mut self, msg_type: MessageType, payload: &[u8]) -> Result<(), String> {
        let msg = protocol::Message {
            message_id: uuid::Uuid::new_v4().to_string(),
            message_type: msg_type as i32,
            payload: payload.to_vec(),
        };

        let data = msg.encode_to_vec();
        
        // USB HID write (64 byte chunks)
        for chunk in data.chunks(63) {
            let mut buf = vec![0u8; 64];
            buf[0] = chunk.len() as u8;
            buf[1..chunk.len()+1].copy_from_slice(chunk);
            
            self.device
                .write(&buf)
                .map_err(|e| format!("Write failed: {}", e))?;
        }

        Ok(())
    }

    fn read_message(&mut self) -> Result<Vec<u8>, String> {
        let mut result = Vec::new();
        let mut buf = [0u8; 64];

        loop {
            self.device
                .read_timeout(&mut buf, 5000)
                .map_err(|e| format!("Read failed: {}", e))?;

            let len = buf[0] as usize;
            result.extend_from_slice(&buf[1..len+1]);

            // Son chunk'ı kontrol et
            if len < 63 {
                break;
            }
        }

        Ok(result)
    }
}
```

---

## 💻 Desktop Application - Electron

### Proje Yapısı

```
cepwallet-desktop/
├── package.json
├── electron/
│   ├── main.js              # Ana process
│   ├── preload.js           # Bridge API
│   └── browser-manager.js   # Web browser yönetimi
├── src/
│   ├── App.tsx              # Ana React komponenti
│   ├── components/
│   │   ├── Wallet/
│   │   │   ├── AccountList.tsx
│   │   │   ├── Balance.tsx
│   │   │   └── TransactionHistory.tsx
│   │   ├── Browser/
│   │   │   ├── DAppBrowser.tsx
│   │   │   ├── AddressBar.tsx
│   │   │   └── Web3Injector.tsx
│   │   └── Device/
│   │       ├── DeviceStatus.tsx
│   │       └── TransactionConfirm.tsx
│   ├── services/
│   │   ├── bridge-client.ts    # Bridge WebSocket client
│   │   ├── wallet-manager.ts   # Cüzdan yönetimi
│   │   ├── blockchain-rpc.ts   # RPC client
│   │   └── web3-provider.ts    # Custom Web3 provider
│   └── utils/
│       ├── ethereum.ts
│       └── formatting.ts
└── public/
    └── index.html
```

### Main Process (Electron)

```javascript
// electron/main.js

const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let bridgeProcess;
let browserView;

// Bridge daemon'u başlat
function startBridge() {
  const bridgePath = path.join(__dirname, '../bridge/cepwallet-bridge');
  bridgeProcess = spawn(bridgePath);
  
  bridgeProcess.stdout.on('data', (data) => {
    console.log(`Bridge: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // React app'i yükle
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // DApp Browser için BrowserView oluştur
  createBrowserView();
}

function createBrowserView() {
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'browser-preload.js')
    }
  });

  mainWindow.setBrowserView(browserView);
  
  // Boyut ayarla (wallet UI için alan bırak)
  const bounds = mainWindow.getBounds();
  browserView.setBounds({
    x: 300,  // Sol tarafta wallet UI
    y: 80,   // Üstte address bar
    width: bounds.width - 300,
    height: bounds.height - 80
  });

  browserView.setAutoResize({
    width: true,
    height: true
  });
}

// IPC handlers
const { ipcMain } = require('electron');

ipcMain.handle('browser:navigate', (event, url) => {
  browserView.webContents.loadURL(url);
});

ipcMain.handle('browser:back', () => {
  if (browserView.webContents.canGoBack()) {
    browserView.webContents.goBack();
  }
});

ipcMain.handle('browser:forward', () => {
  if (browserView.webContents.canGoForward()) {
    browserView.webContents.goForward();
  }
});

app.whenReady().then(() => {
  startBridge();
  setTimeout(createWindow, 2000); // Bridge'in başlamasını bekle
});

app.on('window-all-closed', () => {
  if (bridgeProcess) {
    bridgeProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### Web3 Provider Injection (Browser Preload)

```javascript
// electron/browser-preload.js

const { contextBridge, ipcRenderer } = require('electron');

class CepWalletProvider {
  constructor() {
    this.selectedAddress = null;
    this.chainId = '0x1';
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  async request({ method, params }) {
    console.log('Web3 Request:', method, params);

    // Bridge'e ilet
    const result = await ipcRenderer.invoke('web3:request', {
      method,
      params
    });

    return result;
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        callback(...args);
      });
    }
  }
}

// Provider'ı window'a inject et
const provider = new CepWalletProvider();

contextBridge.exposeInMainWorld('ethereum', provider);

// MetaMask compatibility
contextBridge.exposeInMainWorld('cepwallet', {
  isInstalled: true,
  version: '1.0.0'
});

// Event listener (main process'ten gelen olaylar)
ipcRenderer.on('web3:event', (event, { eventName, data }) => {
  provider.emit(eventName, data);
});

// Sayfa yüklendiğinde bildir
window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('dapp:loaded', window.location.href);
});
```

### Web3 Request Handler (Main Process)

```javascript
// electron/web3-handler.js

const { ipcMain } = require('electron');
const WebSocket = require('ws');
const { ethers } = require('ethers');

let bridgeWs;
let rpcProvider;

function initWeb3Handler() {
  // Bridge'e bağlan
  bridgeWs = new WebSocket('ws://localhost:21325');
  
  bridgeWs.on('open', () => {
    console.log('Connected to bridge');
  });

  // RPC provider
  rpcProvider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.infura.io/v3/YOUR-PROJECT-ID'
  );

  // Web3 isteklerini işle
  ipcMain.handle('web3:request', async (event, { method, params }) => {
    try {
      switch (method) {
        case 'eth_requestAccounts':
          return await requestAccounts();
        
        case 'eth_accounts':
          return await getAccounts();
        
        case 'eth_chainId':
          return '0x1'; // Ethereum mainnet
        
        case 'eth_sendTransaction':
          return await sendTransaction(params[0]);
        
        case 'personal_sign':
          return await signMessage(params);
        
        case 'eth_signTypedData_v4':
          return await signTypedData(params);
        
        default:
          // RPC node'a yönlendir
          return await rpcProvider.send(method, params);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

async function requestAccounts() {
  // Kullanıcıdan onay iste (dialog göster)
  const { dialog } = require('electron');
  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['İptal', 'Bağlan'],
    title: 'Cüzdan Bağlantısı',
    message: 'Bu site cüzdanınıza bağlanmak istiyor.'
  });

  if (result.response === 1) {
    // Bridge'den hesabı al
    const address = await getAddressFromBridge();
    return [address];
  } else {
    throw new Error('User rejected');
  }
}

async function getAccounts() {
  // Zaten bağlı hesapları döndür
  const address = await getAddressFromBridge();
  return [address];
}

async function sendTransaction(tx) {
  // 1. Nonce ve gas price'ı otomatik doldur
  const nonce = await rpcProvider.getTransactionCount(tx.from);
  const gasPrice = await rpcProvider.getGasPrice();

  const fullTx = {
    ...tx,
    nonce: tx.nonce || nonce,
    gasPrice: tx.gasPrice || gasPrice.toHexString(),
    gasLimit: tx.gas || tx.gasLimit || '0x5208',
    chainId: 1
  };

  // 2. Kullanıcıya göster ve onayla (UI dialog)
  const confirmed = await showTransactionDialog(fullTx);
  if (!confirmed) {
    throw new Error('User rejected transaction');
  }

  // 3. Hardware wallet'tan imza iste
  const signature = await signTransactionOnDevice(fullTx);

  // 4. İmzalı işlemi gönder
  const serializedTx = ethers.utils.serializeTransaction(fullTx, signature);
  const txResponse = await rpcProvider.sendTransaction(serializedTx);

  return txResponse.hash;
}

async function signTransactionOnDevice(tx) {
  return new Promise((resolve, reject) => {
    const msgId = Date.now().toString();
    
    const request = {
      message_id: msgId,
      message_type: 'SIGN_TRANSACTION',
      payload: {
        to: tx.to,
        value: tx.value || '0x0',
        gasPrice: tx.gasPrice,
        gasLimit: tx.gasLimit,
        nonce: tx.nonce,
        data: tx.data || '0x',
        chainId: tx.chainId
      }
    };

    bridgeWs.send(JSON.stringify(request));

    bridgeWs.once('message', (data) => {
      const response = JSON.parse(data);
      if (response.message_id === msgId) {
        resolve(response.payload);
      }
    });

    // Timeout
    setTimeout(() => reject(new Error('Timeout')), 60000);
  });
}

async function getAddressFromBridge() {
  return new Promise((resolve, reject) => {
    const msgId = Date.now().toString();
    
    const request = {
      message_id: msgId,
      message_type: 'GET_ADDRESS',
      payload: {
        path: [44, 60, 0, 0, 0] // m/44'/60'/0'/0/0
      }
    };

    bridgeWs.send(JSON.stringify(request));

    bridgeWs.once('message', (data) => {
      const response = JSON.parse(data);
      if (response.message_id === msgId) {
        resolve(response.payload.address);
      }
    });

    setTimeout(() => reject(new Error('Timeout')), 10000);
  });
}

module.exports = { initWeb3Handler };
```

---

## 🎨 React Frontend Components

### DApp Browser Component

```typescript
// src/components/Browser/DAppBrowser.tsx

import React, { useState, useEffect } from 'react';
import { useBridge } from '../../hooks/useBridge';
import AddressBar from './AddressBar';
import './DAppBrowser.css';

const DAppBrowser: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://uniswap.org');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const { connected, address } = useBridge();

  const navigate = (url: string) => {
    // URL'i düzenle
    let finalUrl = url;
    if (!url.startsWith('http')) {
      finalUrl = 'https://' + url;
    }

    // Electron'a gönder
    window.electron.browser.navigate(finalUrl);
    setCurrentUrl(finalUrl);
  };

  const goBack = () => {
    window.electron.browser.back();
  };

  const goForward = () => {
    window.electron.browser.forward();
  };

  const refresh = () => {
    window.electron.browser.refresh();
  };

  return (
    <div className="dapp-browser">
      <div className="browser-toolbar">
        <div className="navigation-buttons">
          <button onClick={goBack} disabled={!canGoBack}>
            ←
          </button>
          <button onClick={goForward} disabled={!canGoForward}>
            →
          </button>
          <button onClick={refresh}>
            ⟳
          </button>
        </div>

        <AddressBar
          url={currentUrl}
          onNavigate={navigate}
        />

        <div className="wallet-info">
          {connected ? (
            <>
              <span className="status-indicator connected"></span>
              <span className="address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </>
          ) : (
            <>
              <span className="status-indicator disconnected"></span>
              <span>Cihaz bağlı değil</span>
            </>
          )}
        </div>
      </div>

      {/* BrowserView burada render edilecek (Electron tarafından) */}
      <div className="browser-content" id="browser-view">
        {/* Electron BrowserView buraya yerleştirilir */}
      </div>
    </div>
  );
};

export default DAppBrowser;
```

### Wallet Manager Service

```typescript
// src/services/wallet-manager.ts

import { ethers } from 'ethers';
import { BridgeClient } from './bridge-client';

export interface Account {
  address: string;
  path: string;
  balance: string;
  index: number;
}

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export class WalletManager {
  private bridge: BridgeClient;
  private provider: ethers.providers.JsonRpcProvider;
  private accounts: Account[] = [];

  constructor(bridgeUrl: string, rpcUrl: string) {
    this.bridge = new BridgeClient(bridgeUrl);
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async connect(): Promise<void> {
    await this.bridge.connect();
  }

  async discoverAccounts(count: number = 5): Promise<Account[]> {
    const accounts: Account[] = [];

    for (let i = 0; i < count; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const address = await this.bridge.getAddress(path);
      const balance = await this.provider.getBalance(address);

      accounts.push({
        address,
        path,
        balance: ethers.utils.formatEther(balance),
        index: i
      });
    }

    this.accounts = accounts;
    return accounts;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async getTokenBalance(
    walletAddress: string,
    tokenAddress: string
  ): Promise<string> {
    const abi = [
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];

    const contract = new ethers.Contract(tokenAddress, abi, this.provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();

    return ethers.utils.formatUnits(balance, decimals);
  }

  async sendTransaction(
    from: string,
    to: string,
    value: string,
    data?: string
  ): Promise<string> {
    // Nonce ve gas fiyatı al
    const nonce = await this.provider.getTransactionCount(from);
    const gasPrice = await this.provider.getGasPrice();

    // Gas limit tahmin et
    const gasLimit = await this.provider.estimateGas({
      from,
      to,
      value: ethers.utils.parseEther(value),
      data: data || '0x'
    });

    const tx = {
      to,
      value: ethers.utils.parseEther(value),
      gasPrice: gasPrice.toHexString(),
      gasLimit: gasLimit.toHexString(),
      nonce,
      data: data || '0x',
      chainId: 1
    };

    // Hardware wallet'tan imza al
    const signature = await this.bridge.signTransaction(tx);

    // İşlemi gönder
    const serializedTx = ethers.utils.serializeTransaction(tx, signature);
    const txResponse = await this.provider.sendTransaction(serializedTx);

    return txResponse.hash;
  }

  async signMessage(address: string, message: string): Promise<string> {
    return await this.bridge.signMessage(address, message);
  }

  getAccounts(): Account[] {
    return this.accounts;
  }
}
```

### Bridge Client

```typescript
// src/services/bridge-client.ts

import { EventEmitter } from 'events';

interface BridgeMessage {
  message_id: string;
  message_type: string;
  payload: any;
}

export class BridgeClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private pendingRequests: Map<string, any> = new Map();

  constructor(url: string = 'ws://localhost:21325') {
    super();
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Bridge connected');
        this.emit('connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('Bridge error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('Bridge disconnected');
        this.emit('disconnected');
      };
    });
  }

  private handleMessage(message: BridgeMessage): void {
    const { message_id, payload } = message;

    if (this.pendingRequests.has(message_id)) {
      const { resolve, reject } = this.pendingRequests.get(message_id);
      
      if (payload.error) {
        reject(new Error(payload.error));
      } else {
        resolve(payload);
      }

      this.pendingRequests.delete(message_id);
    }
  }

  private async request(type: string, payload: any): Promise<any> {
    if (!this.ws) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const message_id = Date.now().toString() + Math.random();

      this.pendingRequests.set(message_id, { resolve, reject });

      const message: BridgeMessage = {
        message_id,
        message_type: type,
        payload
      };

      this.ws!.send(JSON.stringify(message));

      // Timeout (60 saniye)
      setTimeout(() => {
        if (this.pendingRequests.has(message_id)) {
          this.pendingRequests.delete(message_id);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  async getAddress(path: string): Promise<string> {
    const pathArray = path.split('/').slice(1).map(p => {
      return parseInt(p.replace("'", '')) | (p.includes("'") ? 0x80000000 : 0);
    });

    const response = await this.request('GET_ADDRESS', {
      path: pathArray,
      show_display: false
    });

    return response.address;
  }

  async signTransaction(tx: any): Promise<any> {
    const response = await this.request('SIGN_TRANSACTION', tx);
    return response;
  }

  async signMessage(address: string, message: string): Promise<string> {
    const response = await this.request('SIGN_MESSAGE', {
      address,
      message
    });

    return response.signature;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

---

## 📱 iOS Özel Çözümler

### WalletConnect Integration

iOS'ta USB desteği sınırlı olduğu için, WalletConnect protokolü kullanarak desktop/hardware wallet ile mobil app arasında bağlantı kurulabilir:

```typescript
// mobile/src/services/walletconnect-bridge.ts

import WalletConnect from '@walletconnect/client';
import { IWalletConnectSession } from '@walletconnect/types';

export class WalletConnectBridge {
  private connector: WalletConnect | null = null;

  async connect(): Promise<void> {
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      clientMeta: {
        description: 'CepWallet Mobile',
        url: 'https://cepwallet.com',
        icons: ['https://cepwallet.com/icon.png'],
        name: 'CepWallet'
      }
    });

    if (!this.connector.connected) {
      await this.connector.createSession();
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.connector) return;

    this.connector.on('session_request', (error, payload) => {
      if (error) throw error;

      // Oturum isteğini onayla
      this.connector!.approveSession({
        accounts: ['0x...'], // Desktop'tan alınan adres
        chainId: 1
      });
    });

    this.connector.on('call_request', async (error, payload) => {
      if (error) throw error;

      // İsteği desktop/hardware wallet'a yönlendir
      const result = await this.forwardToHardwareWallet(payload);

      // Sonucu geri gönder
      this.connector!.approveRequest({
        id: payload.id,
        result
      });
    });
  }

  private async forwardToHardwareWallet(payload: any): Promise<any> {
    // Desktop app ile iletişim (REST API veya WebSocket)
    // ...
  }

  getUri(): string {
    return this.connector?.uri || '';
  }
}
```

---

## 🔒 Güvenlik Best Practices

### 1. Phishing Koruması

```typescript
// Kullanıcıya her zaman işlem detaylarını göster
function showTransactionConfirmation(tx: Transaction): void {
  // Hardware wallet ekranında:
  // - Alıcı adres (tam)
  // - Miktar (ETH ve USD)
  // - Gas fee
  // - Total (miktar + fee)
  // - DApp origin (hangi siteden geldiği)
}
```

### 2. Firmware Integrity Check

```rust
// Her açılışta firmware imzasını kontrol et
fn verify_firmware_signature() -> Result<(), Error> {
    let firmware_hash = calculate_firmware_hash();
    let signature = read_signature_from_secure_element();
    
    if !verify_signature(firmware_hash, signature, PUBLIC_KEY) {
        panic!("Firmware integrity check failed!");
    }
    
    Ok(())
}
```

### 3. Secure Communication

```
- TLS 1.3 kullan (blockchain RPC için)
- USB iletişimi encrypted
- Bridge sadece localhost'ta dinle
- CORS politikaları (sadece local app)
```

---

## 📦 Dağıtım ve Paketleme

### Electron Builder Config

```json
// package.json
{
  "build": {
    "productName": "CepWallet",
    "appId": "com.cepwallet.app",
    "directories": {
      "output": "dist"
    },
    "files": [
      "build/**/*",
      "electron/**/*",
      "bridge/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.finance",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Finance"
    }
  }
}
```

---

Bu mimari, production-ready, güvenli ve ölçeklenebilir bir hardware wallet sistemi için temel oluşturur!
