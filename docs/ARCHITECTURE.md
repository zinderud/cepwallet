# CepWallet - Teknik Mimari Detayları

## 🏛️ Sistem Mimarisi: 3-Katman Modeli

CepWallet **3 ana katmanı** koordine ederek çalışır:

```
┌─────────────────────────────────────────────────────────────────┐
│                 LAYER 3: APPLICATION (Desktop App)              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ React + Electron                                          │  │
│  │ ├─ Wallet Dashboard       ├─ DApp Browser                │  │
│  │ ├─ Transaction UI         ├─ Web3 Injector              │  │
│  │ └─ Settings               └─ Account Management          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓↑ IPC                                 │
│  ┌─── Electron Main Process ────────────────────────────────┐  │
│  │ • Window Management     • Bridge WebSocket Client         │  │
│  │ • IPC Handlers          • Web3 Provider Implementation    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓↑ WebSocket
┌─────────────────────────────────────────────────────────────────┐
│              LAYER 2: BRIDGE (Hardware Communication)            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Rust Daemon (localhost:8000)                              │  │
│  │ ├─ WebSocket Server       ├─ USB Device Handler           │  │
│  │ ├─ Message Protocol       ├─ Protobuf Serialization      │  │
│  │ └─ Crypto Operations      └─ Session Management          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓↑ USB
┌─────────────────────────────────────────────────────────────────┐
│          LAYER 1: HARDWARE (Trezor + Kohaku Integration)        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Trezor Device (USB/HID)                                   │  │
│  │ ├─ BIP-32/39/44 HD Wallet   ├─ Transaction Signing        │  │
│  │ ├─ Private Key Storage      ├─ Message Verification       │  │
│  │ ├─ Secure Element (ATECC608A) ├─ Firmware Updates        │  │
│  │ └─ Recovery Phrase Management  └─ PIN Protection          │  │
│  │                                                             │  │
│  │ Kohaku Privacy Layer (Ethereu Integration)                │  │
│  │ ├─ RAILGUN Protocol         ├─ Zero-Knowledge Proofs     │  │
│  │ ├─ Privacy Pools            ├─ Viewing Keys              │  │
│  │ └─ Shielded Operations      └─ Note Tree Management       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 İletişim Protokolü Akışı

```
USER ACTION:
   "Send 1 ETH Privately"
         ↓
   ┌──────────────────────────────────────────────────┐
   │ LAYER 3 - APP (React)                            │
   │ • Shields 1 ETH to RAILGUN pool (Kohaku)        │
   │ • Prepares private transfer tx                    │
   │ • Sends to Bridge via WebSocket                  │
   └──────────────────────────────────────────────────┘
         ↓ WebSocket JSON
   ┌──────────────────────────────────────────────────┐
   │ LAYER 2 - BRIDGE (Rust)                         │
   │ • Converts JSON to Protobuf                       │
   │ • Prepares USB HID packets                        │
   │ • Sends to Trezor device                          │
   └──────────────────────────────────────────────────┘
         ↓ USB/HID Protocol
   ┌──────────────────────────────────────────────────┐
   │ LAYER 1 - HARDWARE (Trezor)                      │
   │ • Displays tx details on secure screen            │
   │ • Asks user PIN (if not already verified)        │
   │ • Signs transaction with private key (never leaves device)  │
   │ • Returns signature (v, r, s components)         │
   └──────────────────────────────────────────────────┘
         ↑ USB/HID Signature
   ┌──────────────────────────────────────────────────┐
   │ LAYER 2 - BRIDGE (Rust)                         │
   │ • Converts Protobuf to JSON                       │
   │ • Broadcasts to Ethereum node                     │
   └──────────────────────────────────────────────────┘
         ↑ JSON-RPC Response
   ┌──────────────────────────────────────────────────┐
   │ LAYER 3 - APP (React)                            │
   │ • Shows "Transaction Sent" confirmation           │
   │ • Displays tx hash and block explorer link        │
   └──────────────────────────────────────────────────┘
```

---

## 🏗️ Detaylı Katman Mimarisi

### LAYER 3: Application (Desktop App)

**Konum:** `packages/desktop/`

**İçeriği:**
- **Electron Main Process** (`src/main/index.ts`)
  - Window yönetimi
  - IPC message routing
  - System tray integrasyonu
  - Auto-update mekanizması

- **React Renderer** (`src/renderer/`)
  - Dashboard component'leri
  - Transaction UI
  - Settings paneli
  - DApp browser

- **Web3 Provider** (`src/main/web3-provider.ts`)
  - EIP-1193 standard implementation
  - Request signing ve validation
  - Wallet detection (metamask compatibility)

**Teknoloji Stack:**
```typescript
// package.json dependencies
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "electron": "^28.0.0",
  "ethers": "^6.10.0",        // Web3 library
  "zustand": "^4.4.0",         // State management
  "@cepwallet/shared": "*"      // Shared types & utils
}
```

**IPC Communication Example:**
```typescript
// Renderer → Main
ipcRenderer.send('trezor:sign-transaction', {
  to: '0x...',
  value: '1000000000000000000',  // 1 ETH in wei
  data: '0x...'
});

// Main → Renderer
ipcMain.on('trezor:sign-transaction', async (event, tx) => {
  const bridge = new BridgeClient('ws://localhost:8000');
  const signature = await bridge.signTransaction(tx);
  event.reply('trezor:sign-result', signature);
});
```

---

### LAYER 2: Bridge (Rust Daemon)

**Konum:** `bridge/` (standalone Rust project)

**Port:** localhost:21325 (WebSocket)

**Sorumlulukları:**
1. **USB Device Communication** - Trezor ile USB/HID iletişimi
2. **Protocol Translation** - WebSocket JSON ↔ USB Protobuf
3. **Message Queueing** - Concurrent request handling
4. **Error Recovery** - Device disconnect/reconnect
5. **Session Management** - Multi-client support

**Teknoloji Stack:**
```toml
# Cargo.toml dependencies
[dependencies]
tokio = { version = "1", features = ["full"] }        # Async runtime
tokio-tungstenite = "0.21"                            # WebSocket
rusb = "0.9"                                           # USB library
hidapi = "2.0"                                         # USB HID
prost = "0.12"                                         # Protobuf
serde_json = "1"                                       # JSON
```

**WebSocket API Example:**
```json
// Client → Bridge (Sign Transaction)
{
  "method": "ethereum_signTransaction",
  "id": "msg-uuid-123",
  "params": {
    "bip44_path": "m/44'/60'/0'/0/0",
    "tx": {
      "to": "0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6",
      "value": "1000000000000000000",
      "data": "0x",
      "chainId": 1
    }
  }
}

// Bridge → Client (Signature Response)
{
  "result": {
    "v": "0x1b",
    "r": "0x123abc...",
    "s": "0x456def...",
    "txHash": "0x789ghi..."
  },
  "id": "msg-uuid-123"
}
```

**Multi-Client Handling:**
```rust
// bridge/src/main.rs
async fn handle_connection(
    stream: TcpStream,
    device: Arc<Mutex<HardwareDevice>>,
) {
    let ws_stream = accept_async(stream).await?;
    let (mut write, mut read) = ws_stream.split();
    
    let session_id = Uuid::new_v4();
    
    while let Some(msg) = read.next().await {
        let response = process_message(msg?, &device, session_id).await;
        write.send(response).await?;
    }
}
```

---

### LAYER 1: Hardware & Privacy

#### A. Trezor Hardware Wallet

**İletişim Protokolü:**
```
USB HID Protocol (64-byte frames)
┌──────────────┬────────────────────────────────┐
│ Frame Type   │ Payload (63 bytes)              │
│ (1 byte)     │                                 │
├──────────────┼────────────────────────────────┤
│ 0x3F         │ Protobuf-encoded message        │
│ (data frame) │ (continuation)                  │
└──────────────┴────────────────────────────────┘
```

**Trezor'a Gönderilen Mesajlar:**
```protobuf
// Ethereum Transaction Signing
message EthereumSignTx {
  repeated uint32 address_n = 1;    // Path: m/44'/60'/0'/0/0
  bytes nonce = 2;                   // Account nonce
  bytes gas_price = 3;               // Gas price (wei)
  bytes gas_limit = 4;               // Gas limit
  bytes to = 5;                      // Recipient address
  bytes value = 6;                   // Transfer amount
  bytes data = 7;                    // Contract data
  uint32 chain_id = 8;               // Mainnet (1) vs Testnet (11155111)
}

// Response: Signature
message EthereumTxSignature {
  bytes signature_v = 1;             // Recovery ID
  bytes signature_r = 2;             // Signature component
  bytes signature_s = 3;             // Signature component
}
```

**BIP-44 Derivation Path:**
```
m / purpose / coin_type / account / change / address_index
  /   44'   /    60'    /   0'    /   0   /     0
                                           (first address)

Örnek:
- m/44'/60'/0'/0/0  → First Ethereum account (most common)
- m/44'/60'/1'/0/0  → Second account
- m/44'/60'/0'/1/0  → Change address
```

#### B. Kohaku Privacy Layer

**RAILGUN Shield/Unshield Flow:**
```
                    ┌─────────────────┐
                    │ Public Ethereum │
                    │  (user address) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ RAILGUN Shield  │  (converts to private)
                    │ (deposit)       │
                    └────────┬────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Private RAILGUN Pool  │
                    │ (shielded balance)    │
                    └────────┬──────────────┘
                             │
                    ┌────────▼─────────────┐
                    │ Private Transfer     │  (ZK proof)
                    │ (0x000 recipient)    │
                    └────────┬─────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ RAILGUN Unshield     │  (converts to public)
                    │ (withdrawal)         │
                    └────────┬──────────────┘
                             │
                    ┌────────▼─────────────┐
                    │ Public Ethereum     │
                    │ (recipient address) │
                    └─────────────────────┘
```

**Kohaku Type Tanımları:**
```typescript
// packages/shared/src/types/kohaku.ts

// Shield işlemi (public → private)
export interface ShieldOperation {
  token: string;              // Token contract address
  amount: BigNumber;          // Amount to shield
  recipientShield: string;    // Recipient's 0x-prefixed RAILGUN address
  senderToken?: string;       // Alternative sender token (e.g., wrapped)
}

// Private transfer (private → private)
export interface PrivateTransfer {
  to: string;                 // Recipient RAILGUN address
  amount: BigNumber;          // Private amount (hidden in proof)
  token: string;
  fee?: BigNumber;            // Network fee
}

// Unshield işlemi (private → public)
export interface UnshieldOperation {
  token: string;
  amount: BigNumber;
  senderShield: string;       // Sender's RAILGUN address
  recipient: string;          // Public Ethereum address
}

// Privacy Pool (compliance)
export interface PrivacyPoolConfig {
  tier: 'tier1' | 'tier2';    // Compliance tier
  allowlist?: string[];       // Allowed destinations
}
```

---

## 🔐 Security Architecture

### 1. Private Key Management

```
┌──────────────────────────────────────────┐
│  TREZOR HARDWARE WALLET                  │
│  ┌──────────────────────────────────────┐│
│  │ Secure Enclave (ATECC608A)           ││
│  │ ├─ Private Keys (NEVER EXPORTED)     ││
│  │ ├─ Key Derivation (BIP-32)           ││
│  │ ├─ Transaction Signing               ││
│  │ └─ Recovery Phrase Verification      ││
│  └──────────────────────────────────────┘│
│                                          │
│  Private Key Never Leaves Device!       │
│  ✓ USB Communication: Encrypted         │
│  ✓ Signing: Done on device              │
│  ✓ Only signature returned to app       │
└──────────────────────────────────────────┘
```

### 2. Transaction Verification

```typescript
// Trezor → Bridge → App verification flow

// 1. User initiates transaction
const tx = {
  to: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
  value: ethers.parseEther('1.0'),
  data: '0x',
  gasLimit: 21000,
  gasPrice: ethers.parseUnits('20', 'gwei')
};

// 2. Trezor displays on secure screen
//    User sees: "Send 1 ETH to 0x742d..."
//    User confirms with PIN

// 3. Trezor signs (private key used)
const signature = {
  v: 27,
  r: '0x...',
  s: '0x...'
};

// 4. App reconstructs transaction
const signedTx = ethers.Transaction.from({
  ...tx,
  signature: signature,
  from: userAddress  // Recovered from signature
});

// 5. Broadcast to network
const txHash = await provider.broadcastTransaction(
  signedTx.serialized
);
```

### 3. Kohaku Privacy Guarantees

```
┌──────────────────────────────────────┐
│ PRIVACY PROPERTIES (RAILGUN v3.0)    │
├──────────────────────────────────────┤
│ ✓ Sender Privacy                     │
│   └─ Transaction sender hidden       │
│                                      │
│ ✓ Recipient Privacy                  │
│   └─ Recipient address hidden        │
│                                      │
│ ✓ Amount Privacy                     │
│   └─ Transfer amount hidden          │
│                                      │
│ ✓ On-Chain Privacy                   │
│   └─ Only ZK proof visible           │
│                                      │
│ ✓ Zero-Knowledge Proof               │
│   └─ Proving knowledge without       │
│       revealing information          │
└──────────────────────────────────────┘
```

---

## 📊 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────┐
│ DESKTOP APP (Electron + React)                      │
│ ┌───────────┬──────────────┬────────────────────┐  │
│ │ Dashboard │ Transaction  │ DApp Browser       │  │
│ │ Component │ Builder      │ (Web3 injected)    │  │
│ └─────┬─────┴────┬─────────┴────────┬───────────┘  │
│       │          │                  │              │
│ ┌─────▼──────────▼──────────────────▼───────────┐  │
│ │ Wallet Management Service (React Hooks)       │  │
│ │ • useWallet() - Account state                 │  │
│ │ • useBridge() - Bridge connection             │  │
│ │ • useTransactions() - Tx history              │  │
│ └──────────┬──────────────────────────────────┬─┘  │
└────────────┼──────────────────────────────────┼────┘
             │                                  │
             │ IPC Messages (JSON)              │
             ▼                                  │
┌────────────────────────────────────────────────┐
│ ELECTRON MAIN PROCESS                          │
│ • IPC Handlers                                 │
│ • Bridge Client (WebSocket)                    │
│ • Web3 Provider                                │
│ • System Integration                           │
└────────────┬──────────────────────────────────┘
             │
             │ WebSocket JSON
             ▼
┌────────────────────────────────────────────────┐
│ RUST BRIDGE (localhost:21325)                  │
│ • Protocol Translation (JSON ↔ Protobuf)      │
│ • USB Device Communication                     │
│ • Session Management                           │
│ • Error Handling & Recovery                    │
└────────────┬──────────────────────────────────┘
             │
             │ USB HID Protocol
             ▼
┌────────────────────────────────────────────────┐
│ TREZOR HARDWARE + KOHAKU                       │
│ • Secure Element (ATECC608A)                   │
│ • BIP-44 Key Derivation                        │
│ • Transaction Signing                          │
│ • RAILGUN Privacy Operations                   │
└────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Örnek 1: Normal ETH Transfer

```typescript
// 1. User inputs in React UI
const transfer = {
  to: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
  amount: ethers.parseEther('1.0')
};

// 2. Transaction Builder prepares tx
const tx = await walletManager.buildTransaction({
  to: transfer.to,
  value: transfer.amount,
  gasLimit: 21000,
  gasPrice: await provider.getGasPrice()
});

// 3. IPC message to Main process
window.electron.send('trezor:sign-tx', tx);

// 4. Main process forwards to Bridge
const bridge = new BridgeClient();
const signature = await bridge.signTransaction(tx);

// 5. Bridge sends to Trezor via USB
// [Trezor displays tx on screen, user confirms]

// 6. Signature returns to App
const signedTx = ethers.Transaction.from({
  ...tx,
  signature: signature
});

// 7. Broadcast
const txHash = await provider.broadcastTransaction(signedTx.serialized);
console.log(`Sent! Hash: ${txHash}`);
```

### Örnek 2: Kohaku Shield Operation

```typescript
// 1. User wants to shield 10 USDC privately
const shield = {
  token: USDC_ADDRESS,      // 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
  amount: ethers.parseUnits('10', 6),
  recipient: railgunAddress  // 0x...
};

// 2. App prepares Shield transaction
const tx = await kohakuManager.createShieldTx(shield);

// 3. Trezor signs (same flow as normal transfer)
const signature = await bridge.signTransaction(tx);

// 4. Transaction broadcast (USDC locked in RAILGUN pool)
const txHash = await provider.broadcastTransaction(signedTx.serialized);

// 5. RAILGUN pool now holds 10 USDC as shielded balance
console.log(`Shielded! User can now make private transfers`);
```

---

## ⚡ Performance Considerations

| Operasyon | Latency | Aşamalar |
|-----------|---------|----------|
| Get Public Key | 500ms | Bridge → Device → Bridge |
| Sign Simple Tx | 3-5s | Bridge → Device → User Confirm → Sign → Bridge |
| Sign Kohaku Op | 5-10s | Same + ZK Proof generation |
| Broadcast to Network | 1-2s | RPC call |
| Block Confirmation | 12-15s | Network (Ethereum) |
| **Total (simple transfer)** | **18-22s** | Start to confirmation |
| **Total (kohaku shield)** | **20-27s** | Start to confirmation |

---

## 🧪 Testing Architecture

```
┌─────────────────────────────────────┐
│ UNIT TESTS                          │
│ ├─ Type definitions (TypeScript)    │
│ ├─ Utility functions (Jest)         │
│ ├─ Crypto operations (Node.js)      │
│ └─ Bridge protocol (Rust/Tokio)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ INTEGRATION TESTS                   │
│ ├─ App ↔ Bridge communication       │
│ ├─ Bridge ↔ Trezor Emulator         │
│ ├─ Transaction signing flow         │
│ └─ Error recovery scenarios         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ E2E TESTS (Playwright)              │
│ ├─ Full transaction flow            │
│ ├─ Trezor device simulation         │
│ ├─ UI interactions                  │
│ └─ Error scenarios                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ MANUAL TESTING                      │
│ ├─ Real Trezor device               │
│ ├─ Ethereum testnet (Sepolia)       │
│ ├─ Gas estimation accuracy          │
│ └─ UI/UX verification               │
└─────────────────────────────────────┘
```

---

## 📋 Migration Plan (Current → Faz 1)

```
FAZ 0 (Bu hafta):
├─ ✓ Architecture defined
├─ ✓ Setup documentation
├─ Package.json files
├─ Basic TypeScript types
└─ Build pipeline ready

FAZ 1 (2-3 hafta):
├─ @cepwallet/shared complete
├─ Electron window + React components
├─ Bridge basic WebSocket
├─ Trezor mock device testing
└─ GitHub Actions CI/CD

FAZ 2 (4-6 hafta):
├─ Kohaku integration
├─ RAILGUN shield/transfer
├─ Privacy Pools
└─ Full E2E testing
```

Bu dokümantasyon güncellenmeye devam edecek! 🚀

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
