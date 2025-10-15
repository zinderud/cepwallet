# PHASE 2: Privacy Katmanı ve Web3 Tarayıcı

**Başlangıç:** 16 Ekim 2025  
**Süre:** 6-8 hafta  
**Durum:** 🔵 PLANNED

---

## PHASE 2 Hedefleri

| Hedef | Açıklama | Priorite |
|-------|----------|----------|
| Railgun Entegrasyonu | Shield/Transfer/Unshield işlemleri | 🔴 CRITICAL |
| dApp Tarayıcısı | Ethereum Web3 dApps desteği | 🔴 CRITICAL |
| İşlem Açıklama | Humanizer ile işlem özetleri | 🟡 HIGH |
| Gizlilik Seviyeleri | Public/RAILGUN/Privacy Pool | 🟡 HIGH |
| Not Senkronizasyonu | Merkle tree senkronizasyonu | 🟢 MEDIUM |

---

## PHASE 2 Adımları (6 Step)

### STEP 1: Railgun Kontrat Entegrasyonu (1-2 hafta)
**Amaç:** Railgun protokolüyle shield/transfer/unshield işlemleri yapabilme

#### Yapılacaklar

**A. Railgun SDK Kurulumu**
```typescript
// packages/shared/src/railgun/index.ts
- initializeRailgun()
- getRailgunEngine()
- getShieldingFee()
- getUnshieldingFee()
```

**B. Shield İşlem Akışı**
```typescript
// packages/shared/src/railgun/shield.ts
- createShieldTx(amount, token, recipient)
- estimateGasShield(tx)
- simulateShield(tx)
- validateShieldInputs(inputs)
```

**C. Transfer İşlem Akışı**
```typescript
// packages/shared/src/railgun/transfer.ts
- createPrivateTransfer(fromRailgun, toRailgun, amount, token)
- estimateGasTransfer(tx)
- simulateTransfer(tx)
- validateTransferInputs(inputs)
```

**D. Unshield İşlem Akışı**
```typescript
// packages/shared/src/railgun/unshield.ts
- createUnshieldTx(amount, token, recipient)
- estimateGasUnshield(tx)
- simulateUnshield(tx)
- validateUnshieldInputs(inputs)
```

**E. Testler**
```typescript
// packages/shared/src/__tests__/railgun.test.ts
- 15 test case (shield, transfer, unshield, validation, errors)
```

**Deliverables:**
- `@cepwallet/shared` içinde Railgun modülü (500+ satır)
- 15 test case, %95 coverage
- Typechain kontrat interfaces
- Railgun SDK bağımlılıkları

**Status:** ⏳ NOT STARTED

---

### STEP 2: Bridge Railgun Handlerleri (1-2 hafta)
**Amaç:** Bridge ile Railgun işlemleri iletişim kurabilme

#### Yapılacaklar

**A. Bridge Railgun Handler'ları**
```rust
// bridge/src/railgun.rs
- handle_shield_request(params) -> Result<TxData>
- handle_transfer_request(params) -> Result<TxData>
- handle_unshield_request(params) -> Result<TxData>
- handle_relay_adapt_request(params) -> Result<TxData>
- estimate_railgun_gas(params) -> Result<u128>
```

**B. IPC Handler'ları**
```typescript
// packages/desktop/src/main/railgun.ts
- bridge:shield-request
- bridge:transfer-request
- bridge:unshield-request
- bridge:relay-adapt-request
- bridge:estimate-railgun
```

**C. Testler**
```rust
// bridge/tests/railgun_integration.rs
- 12 test case (happy path, errors, edge cases)
```

**Deliverables:**
- Rust bridge modülü (300+ satır)
- 5 IPC handler (100+ satır)
- 12 integration test
- Railgun protokol dokumentasyonu

**Status:** ⏳ NOT STARTED

---

### STEP 3: dApp Tarayıcısı UI (2-3 hafta)
**Amaç:** Ethereum Web3 dApps ile interaksiyon yapabilme

#### Yapılacaklar

**A. Browser Komponenti**
```typescript
// packages/desktop/src/renderer/components/dAppBrowser.tsx
- DAppBrowser (BrowserView wrapper)
  - URL bar
  - Navigation buttons
  - Refresh/Stop buttons
  - Loading indicator
- DAppTabs (Tab management)
  - Add new tab
  - Close tab
  - Switch tab
  - Tab history
```

**B. EIP-1193 Provider Injection**
```typescript
// packages/desktop/src/utils/web3Provider.ts
- injectWeb3Provider()
- handleProviderRequest(method, params)
- requestAccounts()
- sendTransaction(tx)
- signMessage(message)
- switchChain(chainId)
```

**C. İzin ve Önizleme UI**
```typescript
// packages/desktop/src/renderer/components/PermissionModal.tsx
- PermissionRequest
  - Requested permissions
  - Approve/Reject buttons
  - Always allow checkbox
- TransactionPreview
  - Recipient
  - Amount
  - Fee estimation
  - Data preview
```

**D. Tarayıcı Tabı Yönetimi**
```typescript
// packages/desktop/src/utils/useBrowser.ts
- useBrowser() React hook
  - activeTab
  - tabs[]
  - navigate()
  - addTab()
  - closeTab()
  - goBack()/goForward()
```

**E. Testler**
```typescript
// packages/desktop/src/__tests__/browser.test.tsx
- 20 test case (rendering, navigation, permissions, transactions)
```

**Deliverables:**
- 3 React component (300+ satır)
- Web3 provider injection (150+ satır)
- React hook (100+ satır)
- 20 component test
- Browser UI styling (200+ satır CSS)

**Status:** ⏳ NOT STARTED

---

### STEP 4: Gizlilik Seviyeleri State Management (1-2 hafta)
**Amaç:** Public/RAILGUN/Privacy Pool seçimleri yönetebilme

#### Yapılacaklar

**A. Privacy State Context**
```typescript
// packages/desktop/src/context/PrivacyContext.tsx
- PrivacyProvider
- usePrivacy() hook
  - privacyLevel: 'public' | 'railgun' | 'privacypool'
  - setPrivacyLevel()
  - complianceProof?: string
  - relayAdapter?: string
```

**B. Privacy Pool Integration**
```typescript
// packages/shared/src/privacy/pools.ts
- getPrivacyPools()
- joinPrivacyPool(poolId, amount)
- generateComplianceProof(account, pool)
- validatePoolMembership(account, pool)
```

**C. Humanizer Integration**
```typescript
// packages/shared/src/privacy/humanizer.ts
- humanizeTransaction(tx, privacyLevel)
- humanizeError(error, privacyLevel)
- humanizeGasEstimate(gas, privacyLevel)
- generateTransactionSummary(tx)
```

**D. Privacy UI Components**
```typescript
// packages/desktop/src/renderer/components/
- PrivacySelector.tsx (3 level seçim)
- ComplianceProofUI.tsx (Proof gösterimi)
- PrivacyPoolInfo.tsx (Pool bilgisi)
```

**E. Testler**
```typescript
// packages/shared/src/__tests__/privacy.test.ts
// packages/desktop/src/__tests__/privacy.test.tsx
- 18 test case (context, pools, humanizer, UI)
```

**Deliverables:**
- Privacy context (150+ satır)
- Privacy pool modülü (200+ satır)
- Humanizer integration (250+ satır)
- 3 React component (200+ satır)
- 18 test case
- Privacy level documentation

**Status:** ⏳ NOT STARTED

---

### STEP 5: Not ve Senkronizasyon Servisi (2 hafta)
**Amaç:** Railgun not'larını senkronize edip saklamak

#### Yapılacaklar

**A. Not Yönetimi**
```typescript
// packages/shared/src/notes/index.ts
- Note interface (commitment, nullifier, encryptedData)
- NoteManager class
  - addNote(note)
  - removeNote(commitment)
  - getNotes()
  - decryptNote(encryptedData, key)
  - encryptNote(note, key)
```

**B. Senkronizasyon Servisi**
```typescript
// packages/shared/src/sync/noteSync.ts
- NoteSyncManager class
  - syncNotes() - Merkle tree'den not çek
  - watchChain() - Yeni notları izle
  - validateMerkleProof(proof)
  - insertNotes(notes)
```

**C. Yerel Depolama**
```typescript
// packages/desktop/src/db/notes.ts
- initNotesDB()
- storeNote(note)
- retrieveNotes(filter)
- deleteNote(id)
- getNotesForAccount(account)
```

**D. Not Senkronizasyon UI**
```typescript
// packages/desktop/src/renderer/components/
- NoteSyncStatus.tsx (Sinkron duruşu göster)
- NotesList.tsx (Not'ları listele)
```

**E. Testler**
```typescript
// packages/shared/src/__tests__/notes.test.ts
- 16 test case (encrypt/decrypt, sync, merkle proof, storage)
```

**Deliverables:**
- Not yönetimi modülü (300+ satır)
- Senkronizasyon servisi (250+ satır)
- Yerel depolama (150+ satır)
- 2 React component (150+ satır)
- 16 test case
- Senkronizasyon protokol dokumentasyonu

**Status:** ⏳ NOT STARTED

---

### STEP 6: Entegrasyon ve Testler (2 hafta)
**Amaç:** Tüm PHASE 2 bileşenlerini birlikte çalıştırmak

#### Yapılacaklar

**A. End-to-End Akışlar**
```typescript
// packages/desktop/src/__tests__/e2e.test.ts
- E2E Shield: Account → dApp → Shield işlemi → Başarılı
- E2E Transfer: dApp → Private Transfer → Başarılı
- E2E Unshield: Private Account → dApp → Unshield → Başarılı
- E2E PrivacyPool: Join → Proof → Compliance → Başarılı
```

**B. Integration Test Suite**
```
- Railgun ↔ Bridge integration
- dApp Browser ↔ Web3 Provider
- Privacy State ↔ UI Components
- Note Sync ↔ Storage ↔ UI
- Error handling ve recovery
```

**C. Performance Testing**
```typescript
// packages/desktop/src/__tests__/performance.test.ts
- Shield işlem süresi < 3 saniye
- Transfer işlem süresi < 2 saniye
- Not senkronizasyonu < 5 saniye
- dApp yükleme süresi < 2 saniye
```

**D. Security Testing**
```typescript
// packages/desktop/src/__tests__/security.test.ts
- XSS prevention in dApp browser
- CSRF protection for Web3 requests
- Sensitive data encryption
- Permission validation
- Transaction replay protection
```

**E. Dokumentasyon**
```markdown
- PHASE_2_COMPLETE.md (Overview)
- RAILGUN_INTEGRATION.md (Nasıl yapılır)
- DAPP_BROWSER.md (Kullana benüşü)
- PRIVACY_FEATURES.md (Gizlilik seviyeleri)
- TESTING_GUIDE.md (Test çalıştırma)
```

**Deliverables:**
- 20+ integration test
- 10+ E2E test
- 8+ performance test
- 8+ security test
- 5 documentation file
- CI/CD pipeline updates
- 95%+ test coverage

**Status:** ⏳ NOT STARTED

---

## PHASE 2 Mimarisi

```
┌─────────────────────────────────────────┐
│       Desktop App (Electron + React)    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   dApp Browser (BrowserView)    │   │
│  │   - URL Bar, Tabs, Navigation   │   │
│  │   - Web3 Provider Injection     │   │
│  │   - Permission Modal             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Privacy Levels                │   │
│  │   - Public / RAILGUN / PrivPool │   │
│  │   - Humanizer (işlem açıklama)  │   │
│  │   - Compliance Proof Generator  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Note Sync Manager             │   │
│  │   - Merkle Proof Validation     │   │
│  │   - Local Storage               │   │
│  │   - Encryption/Decryption       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         ↓ IPC / WebSocket
┌─────────────────────────────────────────┐
│         Bridge (Rust WebSocket)         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Railgun Handler               │   │
│  │   - Shield / Transfer / Unshield│   │
│  │   - Gas Estimation              │   │
│  │   - Relay Adapter Integration   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Note Sync Worker              │   │
│  │   - Chain Listener              │   │
│  │   - Merkle Tree Sync            │   │
│  │   - Storage Manager             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         ↓ USB / Network
┌─────────────────────────────────────────┐
│    Trezor Device + Ethereum Node        │
└─────────────────────────────────────────┘
```

---

## Bağımlılıklar ve Kütüphaneler

### Railgun
```json
{
  "@railgun-community/engine": "^1.0.0",
  "@railgun-community/wallet-sdk": "^1.0.0",
  "@railgun-community/types": "^1.0.0"
}
```

### dApp Browser
```json
{
  "ethers": "^6.10.0",
  "@metamask/detect-provider": "^2.0.0",
  "web3": "^4.0.0"
}
```

### Privacy & Humanizer
```json
{
  "@ethereum/kohaku": "^0.1.0",
  "@ethereum/kohaku-commons": "^0.1.0"
}
```

### Storage & Sync
```json
{
  "sqlite3": "^5.1.0",
  "dexie": "^3.2.0",
  "axios": "^1.6.0"
}
```

---

## PHASE 2 Timeline

```
Week 1-2:  STEP 1 (Railgun SDK)
Week 2-3:  STEP 2 (Bridge Handlers)
Week 3-4:  STEP 3 (dApp Browser)
Week 4-5:  STEP 4 (Privacy Levels)
Week 5-6:  STEP 5 (Note Sync)
Week 6-7:  STEP 6 (Testing & Docs)
Week 7-8:  Buffer & Polish
```

---

## Success Criteria

| Kriter | Hedef | Status |
|--------|-------|--------|
| Railgun Shield | İşlem yapabilme | ⏳ |
| Railgun Transfer | Private transfer | ⏳ |
| Railgun Unshield | Para çıkabilme | ⏳ |
| dApp Browser | Tarayıcıda dApp çalıştırılabilme | ⏳ |
| Privacy Levels | 3 seviye seçim yapılabilme | ⏳ |
| Compliance Proof | Proof generate edilebilme | ⏳ |
| Note Sync | Notlar otomatik senkronize | ⏳ |
| Test Coverage | %95 coverage | ⏳ |
| Documentation | Tüm özellikler dokumente | ⏳ |

---

## Risk Analizi

| Risk | Olasılık | Etki | Mitigation |
|------|----------|------|-----------|
| Railgun API değişikliği | MEDIUM | HIGH | SDK doküman takibi |
| Web3 provider complexity | HIGH | MEDIUM | MetaMask örneklerini takip |
| Not sinkronizasyon gecikme | MEDIUM | MEDIUM | Cache stratejisi |
| dApp browser sandbox issues | MEDIUM | HIGH | Content Security Policy |
| Performance bottleneck | MEDIUM | HIGH | Profiling ve optimization |

---

## Not Almaklar

- Railgun mainnet entegrasyonu için test network'te önce test edilecek
- dApp browser için örnek entegrasyon: Uniswap, AAVE, Curve
- Privacy pool entegrasyonu compliance requirements gerektiriyor
- Not sinkronizasyonu için indexed provider gerekebilir

---

**Next:** "devam" yazarak PHASE 2 STEP 1'i başlatın 🚀
