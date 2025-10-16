# Privacy UI Guide

Bu dokümantasyon, CepWallet uygulamasına eklenen privacy özelliklerinin kullanımını açıklar.

## 📦 Eklenen Componentler

### 1. **PrivacyControl** (`src/components/Privacy/PrivacyControl.tsx`)

Privacy sistemini başlatır ve gizlilik seviyesi seçimi yapar.

**Özellikler:**
- Privacy initialization (RAILGUN + Privacy Pools + ZK-SNARKs)
- Privacy seviyesi seçimi:
  - 🔓 **Public** - Normal blockchain işlemi (1.0x ücret)
  - 🛡️ **Railgun** - RAILGUN ile korumalı işlem (1.5x ücret)
  - 🏊 **PrivacyPool** - Uyumluluk sağlayan privacy pools (2.0x ücret)
  - 🔒 **Maximum** - Tüm privacy özellikleri aktif (4.5x ücret)

**API Calls:**
```typescript
await invoke('initialize_privacy');      // Privacy sistemini başlat
await invoke('is_privacy_ready');        // Privacy hazır mı?
```

### 2. **ShieldedBalance** (`src/components/Privacy/ShieldedBalance.tsx`)

Shielded (korumalı) token bakiyelerini gösterir.

**Desteklenen Tokenlar:**
- ⟠ ETH
- 💵 USDC
- 💰 USDT
- 💎 DAI

**API Calls:**
```typescript
await invoke('get_shielded_balance', { 
  token: '0x...' 
});
```

### 3. **PrivacyTransactionForm** (`src/components/Privacy/PrivacyTransactionForm.tsx`)

Privacy işlemlerini gerçekleştirir.

**İşlem Tipleri:**
- 🛡️ **Shield** - Public → Private (token'ları gizle)
- 🔀 **Transfer** - Private → Private (gizli transfer)
- 🔓 **Unshield** - Private → Public (token'ları açığa çıkar)

**Özellikler:**
- Token seçimi (ETH, USDC, USDT, DAI)
- Tutar girişi
- Alıcı adresi (transfer ve unshield için)
- ZK-SNARK proof süresi tahmini

**API Calls:**
```typescript
// Shield (Public → Private)
await invoke('shield_transaction', { 
  token: '0x...', 
  amount: '1.5' 
});

// Private Transfer
await invoke('private_transfer', { 
  recipient: '0x...', 
  token: '0x...', 
  amount: '0.5' 
});

// Unshield (Private → Public)
await invoke('unshield_transaction', { 
  token: '0x...', 
  amount: '1.0', 
  recipient: '0x...' 
});

// Proof time estimate
await invoke('estimate_proof_time', { 
  proofType: 'Shield' 
});
```

### 4. **PrivacyPoolManager** (`src/components/Privacy/PrivacyPoolManager.tsx`)

Privacy pool yönetimi.

**Operasyonlar:**
- ➕ **Join** - Pool'a katıl
- ➖ **Exit** - Pool'dan çık
- 🔄 **Swap** - Pool içinde swap yap

**Mevcut Pool'lar:**
- ETH Privacy Pool (1,234 ETH TVL, 156 üye)
- USDC Privacy Pool (567,890 USDC TVL, 89 üye)
- DAI Privacy Pool (234,567 DAI TVL, 67 üye)

**API Calls:**
```typescript
// Join pool
await invoke('join_privacy_pool', { 
  poolId: 'pool-eth-001', 
  token: '0x...', 
  depositAmount: '1.0' 
});

// Exit pool
await invoke('exit_privacy_pool', { 
  poolId: 'pool-eth-001', 
  withdrawAddress: '0x...' 
});

// Swap in pool
await invoke('privacy_pool_swap', { 
  poolId: 'pool-eth-001', 
  fromToken: '0x...', 
  toToken: '0x...', 
  amount: '1.0' 
});
```

---

## 🎨 UI Layoutu

App.tsx'te privacy componentleri şu şekilde organize edilmiş:

```tsx
<App>
  {/* Test Section */}
  <TestCommands />
  
  {/* Wallet Section */}
  <Grid>
    <WalletConnect />
    <TrezorConnect />
  </Grid>
  
  {/* Privacy Features Section */}
  <h2>🔐 Privacy Features</h2>
  
  <Grid>
    <PrivacyControl />
    <ShieldedBalance />
  </Grid>
  
  <Grid>
    <PrivacyTransactionForm />
    <PrivacyPoolManager />
  </Grid>
  
  {/* Transactions */}
  <TransactionList />
</App>
```

---

## 🔧 Backend Komutları

Privacy modülü 11 Tauri command sağlar:

### Initialization
- `initialize_privacy()` - RAILGUN, Privacy Pools ve ZK-SNARK sistemlerini başlat
- `is_privacy_ready()` - Privacy sisteminin hazır olup olmadığını kontrol et

### RAILGUN Operations
- `shield_transaction(token, amount)` - Token'ları shield et
- `unshield_transaction(token, amount, recipient)` - Token'ları unshield et
- `private_transfer(recipient, token, amount)` - Private transfer yap
- `get_shielded_balance(token)` - Shielded bakiyeyi getir

### Privacy Pools
- `join_privacy_pool(poolId, token, depositAmount)` - Pool'a katıl
- `exit_privacy_pool(poolId, withdrawAddress)` - Pool'dan çık
- `privacy_pool_swap(poolId, fromToken, toToken, amount)` - Pool içinde swap

### ZK-SNARKs
- `generate_zk_proof(proofType, publicInputs, privateInputs)` - ZK proof üret
- `estimate_proof_time(proofType)` - Proof süresi tahmini

---

## 📊 Proof Generation Times

| Proof Type | Estimated Time |
|------------|----------------|
| Shield | 8 seconds |
| Transfer | 20 seconds |
| Unshield | 10 seconds |
| PoolMembership | 15 seconds |
| Compliance | 25 seconds |

---

## 🚀 Kullanım Akışı

### 1. Privacy Başlatma
```
1. Uygulamayı aç
2. "Initialize Privacy" butonuna tıkla
3. Privacy sistemi hazırlanıyor... (~5 saniye)
4. ✅ Privacy hazır
```

### 2. Token Shield Etme
```
1. Privacy seviyesi seç (örn: Railgun)
2. Privacy Transaction Form'da "Shield" seç
3. Token seç (örn: ETH)
4. Tutar gir (örn: 1.5)
5. "Shield Transaction" butonuna tıkla
6. Proof oluşturuluyor... (~8 saniye)
7. ✅ Transaction başarılı
```

### 3. Private Transfer
```
1. Privacy Transaction Form'da "Transfer" seç
2. Alıcı adresi gir
3. Token ve tutar seç
4. "Transfer Transaction" butonuna tıkla
5. Proof oluşturuluyor... (~20 saniye)
6. ✅ Private transfer tamamlandı
```

### 4. Privacy Pool Kullanımı
```
1. Privacy Pool Manager'da pool seç
2. "Join" operasyonunu seç
3. Deposit miktarı gir
4. "Join Pool" butonuna tıkla
5. ✅ Pool'a katıldınız
```

---

## ⚠️ Önemli Notlar

### Placeholder Implementation
**ŞU ANDA TÜM PRIVACY ÖZELLİKLERİ PLACEHOLDER (YER TUTUCU) OLARAK ÇALIŞMAKTADIR!**

Gerçek implementasyon için gerekli:
1. **RAILGUN SDK** entegrasyonu
2. **Privacy Pools** smart contract'ları
3. **ZK-SNARK** library (ark-groth16 veya bellman)
4. **Ethereum provider** bağlantısı

### Test Amaçlı
Mevcut implementasyon:
- ✅ UI akışını test eder
- ✅ Component mimarisini gösterir
- ✅ Tauri IPC'yi doğrular
- ❌ Gerçek blockchain işlemleri yapmaz
- ❌ Gerçek ZK-SNARK proof'ları üretmez

### Gelecek Adımlar
1. RAILGUN Rust SDK entegrasyonu
2. Privacy Pools smart contract deployment
3. ZK-SNARK circuit implementation
4. Trezor ile privacy transaction signing
5. Gerçek blockchain testnet üzerinde test

---

## 🔐 Güvenlik

### Privacy Garantileri (Tam implementasyon sonrası)
- 🛡️ **RAILGUN**: Zero-knowledge shielded transactions
- 🏊 **Privacy Pools**: Compliant privacy with selective disclosure
- 🔒 **ZK-SNARKs**: Matematiksel gizlilik kanıtları
- 🔐 **Trezor**: Hardware wallet imzalama

### Ücret Çarpanları
- Public: 1.0x (normal blockchain ücreti)
- Railgun: 1.5x (+50% ZK-SNARK maliyeti)
- PrivacyPool: 2.0x (+100% pool maliyeti)
- Maximum: 4.5x (+350% tam gizlilik)

---

## 📝 Örnek Senaryolar

### Senaryo 1: Basit Private Transfer
```typescript
// 1. Privacy başlat
await invoke('initialize_privacy');

// 2. Token shield et
const shieldTx = await invoke('shield_transaction', {
  token: '0x0000000000000000000000000000000000000000', // ETH
  amount: '1.5'
});

// 3. Private transfer yap
const transferTx = await invoke('private_transfer', {
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  token: '0x0000000000000000000000000000000000000000',
  amount: '0.5'
});

// 4. Kalan bakiyeyi kontrol et
const balance = await invoke('get_shielded_balance', {
  token: '0x0000000000000000000000000000000000000000'
});
console.log('Shielded balance:', balance); // "1.0 ETH"
```

### Senaryo 2: Privacy Pool ile Swap
```typescript
// 1. ETH pool'una katıl
await invoke('join_privacy_pool', {
  poolId: 'pool-eth-001',
  token: '0x0000000000000000000000000000000000000000',
  depositAmount: '2.0'
});

// 2. Pool içinde ETH → USDC swap
await invoke('privacy_pool_swap', {
  poolId: 'pool-eth-001',
  fromToken: '0x0000000000000000000000000000000000000000',
  toToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  amount: '1.0'
});

// 3. Pool'dan çık
await invoke('exit_privacy_pool', {
  poolId: 'pool-eth-001',
  withdrawAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
});
```

---

## 🐛 Bilinen Sorunlar

### Mutable Access Issue
`join_privacy_pool` ve `exit_privacy_pool` komutları mutable erişim gerektiriyor ancak mevcut `Mutex<Option<PrivacyManager>>` tasarımı immutable referans veriyor.

**Çözüm:** RefCell veya interior mutability pattern kullanılacak (gelecek commit).

### Placeholder Data
Tüm işlemler şu anda mock data döndürüyor. Gerçek implementasyon için RAILGUN ve Privacy Pools SDK'ları gerekli.

---

## 📚 İlgili Dokümantasyon

- [PRIVACY_FEATURES.md](./PRIVACY_FEATURES.md) - Privacy mimarisi
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Geliştirme ortamı kurulumu
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Genel mimari
- [TREZOR_KOHAKU_INTEGRATION.md](./TREZOR_KOHAKU_INTEGRATION.md) - Trezor entegrasyonu

---

**Son Güncelleme:** 17 Ekim 2025  
**Versiyon:** 0.1.0 (Privacy UI MVP)  
**Durum:** ✅ UI Complete, ⚠️ Backend Placeholder
