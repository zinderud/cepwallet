# PHASE 1 IMPLEMENTATION PLAN

**Başlangıç:** 16 Ekim 2025  
**Hedef:** Trezor cihaz entegrasyonu ve temel bridge işlevselliği  
**Tahmini Süre:** 3-4 hafta

## PHASE 1 Genel Bakış

PHASE 0'da kurulan foundation üzerinde şimdi gerçek işlevsellik ekleyeceğiz.

```
Layer 1: Hardware (Trezor)
    ↓ USB/HID
Layer 2: Bridge (Rust) ← ⚙️ PHASE 1 FOCUS
    ↓ WebSocket
Layer 3: Application (Electron+React) ← ⚙️ PHASE 2
```

## PHASE 1 Adımları

### PHASE 1 - ADIM 1: Trezor Connect Integration ⭐ START HERE
**Hedef:** Trezor cihazı ile iletişim kurma  
**Bileşenler:**
- Trezor Connect kütüphanesi
- Device detection
- USB connectivity
- Public key derivation
- Message signing

**Dosyalar:**
- `bridge/src/trezor.rs` - Trezor Connect wrapper (NEW)
- `bridge/src/device.rs` - Device abstraction (UPDATE)
- `bridge/Cargo.toml` - trezor-connect dependency (UPDATE)

**Deliverable:** Cihaz bağlantısı ve key derivation

---

### PHASE 1 - ADIM 2: Bridge Handlers Implementation
**Hedef:** Transaction ve message signing
**Bileşenler:**
- Transaction building
- Gas estimation
- Message formatting
- Signature validation

**Dosyalar:**
- `bridge/src/handlers.rs` - Gerçek implement (UPDATE)
- `bridge/src/transaction.rs` - TX types (NEW)
- Tests for handlers

**Deliverable:** Tam signing flow

---

### PHASE 1 - ADIM 3: @cepwallet/shared Utils
**Hedef:** Electron-Bridge iletişimi için utilities
**Bileşenler:**
- Crypto functions (keccak256, etc)
- Address derivation
- RPC client (ethers.js)
- Type validation

**Dosyalar:**
- `packages/shared/src/crypto/index.ts` - Implement (UPDATE)
- `packages/shared/src/rpc/index.ts` - Implement (UPDATE)
- `packages/shared/src/utils/index.ts` - Implement (UPDATE)
- Unit tests

**Deliverable:** Bridge client ready

---

### PHASE 1 - ADIM 4: Bridge-Electron IPC Integration
**Hedef:** Desktop uygulaması bridge ile iletişim
**Bileşenler:**
- IPC message handlers
- State management
- Error handling
- Device connection listener

**Dosyalar:**
- `packages/desktop/src/main/handlers.ts` - IPC impl (NEW)
- `packages/desktop/src/renderer/hooks/useWallet.ts` - Hook (NEW)
- Update main.ts with handlers

**Deliverable:** UI-Bridge communication working

---

### PHASE 1 - ADIM 5: Basic UI Implementation
**Hedef:** Cüzdan temel UI
**Bileşenler:**
- Connect device button
- Account list display
- Balance fetching
- Account switching

**Dosyalar:**
- `packages/desktop/src/renderer/pages/Wallet.tsx` (NEW)
- `packages/desktop/src/renderer/pages/Connect.tsx` (NEW)
- `packages/desktop/src/renderer/hooks/` (NEW)
- Styles

**Deliverable:** Cüzdan görülüyor, hesaplar listeleniyor

---

### PHASE 1 - ADIM 6: Testing & Integration
**Hedef:** End-to-end test
**Bileşenler:**
- Mock device for testing
- Integration tests
- Error scenarios
- CI/CD verification

**Dosyalar:**
- `bridge/tests/integration_test.rs` (NEW)
- `packages/shared/tests/` (NEW)
- Mock device implementation

**Deliverable:** Tüm testler geçiyor, mock device çalışıyor

---

## PHASE 1 Timeline

```
Hafta 1:
  ├─ ADIM 1: Trezor Connect integration (3 gün)
  └─ ADIM 2: Bridge handlers (2 gün)

Hafta 2:
  ├─ ADIM 3: Shared utils (2 gün)
  └─ ADIM 4: Bridge-Electron IPC (2 gün)

Hafta 3:
  ├─ ADIM 5: Basic UI (2 gün)
  └─ Test & debug (2 gün)

Hafta 4:
  └─ Integration & final testing
```

## Success Criteria

✅ **ADIM 1:** Trezor cihazı detect edilebiliyor  
✅ **ADIM 2:** Transaction signing çalışıyor  
✅ **ADIM 3:** Shared utilities 100% coverage  
✅ **ADIM 4:** IPC messages geçiyor  
✅ **ADIM 5:** UI responsive ve functional  
✅ **ADIM 6:** Tüm testler geçiyor  

## Key Metrics

| Metric | Target |
|--------|--------|
| Code coverage | >80% |
| Build time | <3 minutes |
| Test time | <30 seconds |
| Device connection | <2 seconds |
| Transaction sign | <5 seconds |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| USB driver issues | Mock device for CI/CD |
| Trezor API changes | Pin specific version |
| IPC race conditions | Queue-based message system |
| Type mismatches | Strict TypeScript validation |

## Dependencies

- **trezor-connect** - Trezor device library
- **ethers.js** - Ethereum utilities (already in desktop)
- **@types/node** - Node types
- **tokio-util** - Async utilities

## Getting Started

Şimdi ADIM 1'e başlayacağız:

```bash
# 1. Bridge'i güncelle
cd bridge
cargo add trezor-connect

# 2. Trezor wrapper yazacağız
# 3. Device detection implement edilecek
# 4. Test edilecek
```

---

**PHASE 1 ADIM 1'e başlamaya hazır mısınız?**

Cevap verin: `başlayalım` veya `evet`
