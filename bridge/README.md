# CepWallet Bridge

Hardware abstraction layer for Trezor device communication via WebSocket.

## Architecture

```
┌─────────────────────────────────────────┐
│   Electron Application (port 3000)      │
│   ├── preload.ts (secure bridge)        │
│   └── renderer (React UI)               │
└─────────────────┬───────────────────────┘
                  │ WebSocket
                  ▼
┌─────────────────────────────────────────┐
│  CepWallet Bridge (port 21325)          │
│  ├── main.rs (server loop)              │
│  ├── handlers (sign_tx, sign_msg)       │
│  ├── device.rs (USB/HID)                │
│  └── session.rs (connection tracking)   │
└─────────────────┬───────────────────────┘
                  │ USB/HID
                  ▼
┌─────────────────────────────────────────┐
│   Trezor Hardware Device                │
│   ├── Secure storage                    │
│   ├── Key derivation                    │
│   └── Transaction signing               │
└─────────────────────────────────────────┘
```

## Building

### Prerequisites
- Rust 1.70+ ([https://rustup.rs/](https://rustup.rs/))
- libusb (macOS: `brew install libusb`)

### Build

```bash
cd bridge
cargo build --release
```

### Run

```bash
cargo run
```

Server will listen on `127.0.0.1:21325`

## Message Protocol

### Request Format
```json
{
  "id": "unique-id-123",
  "message_type": "get_public_key",
  "payload": {
    "path": "m/44'/60'/0'/0/0"
  }
}
```

### Response Format
```json
{
  "id": "unique-id-123",
  "status": "success",
  "result": {
    "public_key": "0x...",
    "address": "0x..."
  },
  "error": null
}
```

## Supported Messages

### System
- **ping** - Connection check
  - Response: `{ pong: true }`

### Device Management
- **get_device_info** - Device model, firmware, serial
  - Response: `{ model, firmware, serial_number, connected }`

- **connect_device** - Initialize USB connection
  - Response: `{ connected: true }`

### Key Management
- **get_public_key** - Derive and return public key
  - Payload: `{ path: "m/44'/60'/0'/0/0" }`
  - Response: `{ public_key, address, chain_code }`

### Transaction Signing
- **sign_transaction** - Sign Ethereum transaction
  - Payload: `{ to, from, value, data, gas_limit, gas_price }`
  - Response: `{ signature, v, r, s }`

- **sign_message** - Sign arbitrary message
  - Payload: `{ message, path }`
  - Response: `{ signature, address }`

## Security Model

1. **No private key exposure**: Bridge never returns private keys
2. **Signed operations only**: All device operations require explicit signing
3. **Session tracking**: Each connection maintains a session
4. **Type safety**: Rust's type system prevents memory issues
5. **USB isolation**: USB communication isolated in device module

## Development

### Add new handler

1. Create function in `handlers.rs`
2. Add message type case in `main.rs`
3. Call handler and return response

### USB debugging

Set environment variable:
```bash
RUST_LOG=debug cargo run
```

## Testing

```bash
cargo test
```

Mock device responses in tests for CI/CD environments.

## Module Structure

- **main.rs** - WebSocket server, message routing (250 lines)
- **trezor.rs** - Trezor Manager, device communication (300 lines)
  - `TrezorManager` - Device connection and operations
  - `DerivationPath` - BIP-44 HD wallet paths
  - `PublicKeyResponse` - Public key and address info
  - `SignatureResponse` - Transaction signature
  - `MessageSignatureResponse` - Message signature
- **transaction.rs** - Transaction and message types (NEW - 350 lines)
  - `EthereumTransaction` - Signing transactions with validation
  - `SignableMessage` - EIP-191 message signing support
  - Fee calculation, format validation
- **handlers.rs** - Request handlers (150 lines, UPDATED)
  - `get_public_key()` - Retrieve public key
  - `sign_transaction()` - Sign Ethereum transaction
  - `sign_message()` - Sign arbitrary message
  - Validation functions
- **device.rs** - USB/HID abstraction (30 lines, deprecated)
- **session.rs** - Connection session management (30 lines)
- **messages.rs** - Message type definitions (20 lines)

## PHASE 1 Implementation

### Step 1: Trezor Integration ✅ (NEW)

**TrezorManager Features:**
- `connect()` - Device detection and connection
- `disconnect()` - Clean disconnect
- `get_device_info()` - Firmware, model info
- `get_public_key(path)` - HD wallet derivation (BIP-44)
- `sign_transaction(path, data)` - Transaction signing
- `sign_message(path, message)` - Message signing
- **Security:** Private keys NEVER leave device

**Supported Paths:**
```
Ethereum: m/44'/60'/0'/0/0 (standard)
Custom: m/44'/coin_type'/account'/change/address_index
```

### Message Handling

**New Messages:**
- `connect_device` - Initiate connection
  - Response: `{ model, firmware, serial_number, connected }`

- `disconnect_device` - Close connection
  - Response: `{ disconnected: true }`

**Existing Messages (Updated):**
- `get_public_key` - Now uses Trezor integration
- `sign_transaction` - Uses Trezor signing
- `sign_message` - Uses Trezor signing
