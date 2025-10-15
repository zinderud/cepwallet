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

- **main.rs** - WebSocket server, message routing (230 lines)
- **device.rs** - USB/HID device communication (50 lines, stub)
- **handlers.rs** - Transaction/message signing (80 lines, stub)
- **session.rs** - Connection session management (30 lines)
- **messages.rs** - Message type definitions (20 lines)
