# Trezor Entegrasyon Dokümanları - Hızlı Referans

## 📋 Doküman Özeti

Bu doküman seti, CepWallet'ın Trezor hardware wallet entegrasyonunu **doğru ve güvenli** bir şekilde implementasyonunuz için hazırlanmıştır.

## 🚨 KRİTİK GÜVENLİK DEĞİŞİKLİĞİ

**Versiyon 2.0'da yapılan kritik düzeltme:**

❌ **YANLIŞ (v1.0 - GÜVENLİK AÇIĞI):**
```
"Secret Wallet'tan private key alınır"
```

✅ **DOĞRU (v2.0 - GÜVENLİ):**
```
"Trezor'dan deterministik key derivation yapılır"
"Private key ASLA cihazdan çıkmaz"
```

## 📚 Doküman Listesi

### 1. [README.md](./README.md)
**Ana başlangıç rehberi - İlk buradan başlayın**

- Quick start guide
- Kod örnekleri (copy-paste ready)
- Güvenlik prensipleri özeti
- Test scenarios
- Implementation roadmap

**Kim okumalı:** Tüm geliştiriciler

---

### 2. [TREZOR_SECRET_WALLET_INTEGRATION.md](./TREZOR_SECRET_WALLET_INTEGRATION.md)
**Detaylı implementasyon rehberi**

- 6 adımlı kullanıcı akışı
- UI/UX mockup'ları
- TypeScript kod örnekleri
- React hooks ve components
- İmplementasyon planı (5 faz, 8-13 gün)

**Kim okumalı:** Frontend ve backend geliştiriciler

**Önemli Bölümler:**
- Adım 3: RAILGUN Wallet Oluşturma (GÜNCELLENDİ ✅)
- TrezorSecretWalletService class
- useTrezorSecretWallet hook
- WalletPage component

---

### 3. [SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md)
**Güvenlik mimarisi ve analizi**

- ❌ Yanlış yaklaşımlar (ne YAPILMAMALI)
- ✅ Doğru yaklaşımlar (ne YAPILMALI)
- SLIP-0011 standardı detayları
- RAILGUN dual-key system açıklaması
- Common pitfalls & solutions
- Security checklist

**Kim okumalı:** Tüm geliştiriciler, security reviewers

**Kritik Konular:**
- Hardware wallet vs software wallet karşılaştırması
- Trezor cipherKeyValue API detayları
- RAILGUN key architecture
- 5 katmanlı güvenlik modeli

---

### 4. [TREZOR_CONNECT.md](./TREZOR_CONNECT.md)
**Trezor Connect API referansı**

- TrezorConnect.init()
- Device connection
- PIN entry
- Transaction signing
- Message signing

**Kim okumalı:** API entegrasyonu yapan geliştiriciler

---

### 5. [SIGNING.md](./SIGNING.md)
**Transaction ve message signing**

- Ethereum transaction signing
- EIP-712 typed data
- Message signing
- Signature verification

**Kim okumalı:** Blockchain transaction işlemleri yapan geliştiriciler

---

## 🎯 Hangi Dokümanı Okumalıyım?

### Yeni Başlıyorsanız
```
1. README.md (bu dosya) - Overview + quick start
2. SECURITY_ANALYSIS.md - Güvenlik prensipleri
3. TREZOR_SECRET_WALLET_INTEGRATION.md - İmplementasyon
```

### Frontend Geliştiriyorsanız
```
1. README.md - Quick start
2. TREZOR_SECRET_WALLET_INTEGRATION.md - UI/UX + React hooks
3. TREZOR_CONNECT.md - API referansı
```

### Backend Geliştiriyorsanız
```
1. SECURITY_ANALYSIS.md - Güvenlik modeli
2. TREZOR_SECRET_WALLET_INTEGRATION.md - Service layer
3. SIGNING.md - Transaction handling
```

### Security Review Yapıyorsanız
```
1. SECURITY_ANALYSIS.md - Tam analiz
2. TREZOR_SECRET_WALLET_INTEGRATION.md - İmplementasyon detayları
3. README.md - Güvenlik checklist
```

---

## 🔑 Temel Konseptler

### 1. Private Key Protection

**Altın Kural:**
> Private key'ler ASLA Trezor cihazdan çıkmaz. Tüm kriptografik işlemler Secure Element içinde yapılır.

```typescript
// ❌ ASLA BÖYLE YAPMAYIN
const privateKey = await trezor.getPrivateKey(); // Bu API yok!

// ✅ DOĞRU YÖNTEM
const derivedKey = await TrezorConnect.cipherKeyValue({
  path: "m/44'/60'/0'/0/0",
  key: "RAILGUN_SPENDING_KEY",
  value: padTo16Bytes(walletId),
  encrypt: true,
  askOnEncrypt: true, // Fiziksel onay
});
```

### 2. Secret Wallet (Passphrase)

**Ne İşe Yarar:**
- Her passphrase tamamen farklı bir wallet oluşturur
- Plausible deniability (makul inkar edilebilirlik)
- Sınırsız hidden wallet

```
Aynı Trezor Seed + Farklı Passphrase = Farklı Wallet
```

**Örnek:**
```
PIN + Passphrase ""      → Standard Wallet (0x1234...)
PIN + Passphrase "Alice" → Secret Wallet A (0xABCD...)
PIN + Passphrase "Bob"   → Secret Wallet B (0x5678...)
```

### 3. RAILGUN Key Derivation

**3 Farklı Key Türü:**

1. **Spending Key** - İşlem yetkisi
   - `cipherKeyValue("RAILGUN_SPENDING_KEY")`
   - Token gönderme yetkisi
   - 0zk address'ine encoded

2. **Viewing Key** - Görüntüleme yetkisi
   - `cipherKeyValue("RAILGUN_VIEWING_KEY")`
   - Sadece işlemleri görme
   - Harcama yetkisi YOK
   - 0zk address'ine encoded

3. **Nullifying Key** - Privacy işlemleri
   - `cipherKeyValue("RAILGUN_NULLIFYING_KEY")`
   - Zero-knowledge proofs için
   - Double-spending önleme

### 4. Physical Approval

**Her Kritik İşlemde:**
```typescript
{
  askOnEncrypt: true,  // Key derivation için onay
  askOnDecrypt: true,  // Decryption için onay
  showOnTrezor: true,  // Trezor ekranında göster
}
```

**Kullanıcı Akışı:**
1. İşlem başlatılır (app)
2. Detaylar Trezor ekranında gösterilir
3. Kullanıcı fiziksel butona basar (✓ veya ✗)
4. İşlem onaylanır veya reddedilir

---

## 🛡️ Güvenlik Katmanları (5-Layer Model)

```
Layer 5: Encrypted Storage (LevelDOWN + AES-256)
    ↑
Layer 4: RAILGUN Privacy (Zero-Knowledge Proofs)
    ↑
Layer 3: Deterministic Derivation (SLIP-0011)
    ↑
Layer 2: Secret Wallet (BIP-39 Passphrase)
    ↑
Layer 1: Hardware Isolation (Trezor Secure Element)
```

**Her katman bir öncekini güçlendirir:**
- Layer 1: Private key'leri korur
- Layer 2: Hidden wallet'lar oluşturur
- Layer 3: Güvenli key derivation
- Layer 4: On-chain privacy
- Layer 5: Local storage encryption

---

## 📊 Implementation Checklist

### Faz 1: Temel Trezor Bağlantısı ⏱️ 1-2 gün
- [ ] @trezor/connect-web kurulumu
- [ ] TrezorConnect.init() implementasyonu
- [ ] Device connection test
- [ ] PIN entry flow
- [ ] Error handling

### Faz 2: Secret Wallet ⏱️ 2-3 gün
- [ ] Passphrase flow UI
- [ ] Device state management
- [ ] Wallet derivation logic
- [ ] User warnings & education
- [ ] UI/UX polish

### Faz 3: RAILGUN Entegrasyonu ⏱️ 2-3 gün
- [ ] cipherKeyValue implementation
- [ ] 3 key türü derivation (spending, viewing, nullifying)
- [ ] 16-byte padding (PKCS7)
- [ ] Wallet creation flow
- [ ] Storage encryption

### Faz 4: Transaction Signing ⏱️ 2-3 gün
- [ ] ethereumSignTransaction implementation
- [ ] Trezor approval flow
- [ ] Transaction builder
- [ ] Error scenarios
- [ ] User feedback UI

### Faz 5: Test & Polish ⏱️ 1-2 gün
- [ ] End-to-end testing
- [ ] User rejection scenarios
- [ ] Session timeout
- [ ] Memory cleanup
- [ ] Security review

**Toplam:** 8-13 gün

---

## 🧪 Test Scenarios

### ✅ Test 1: İlk Kurulum
```
1. Trezor bağla → ✅ Connected
2. PIN gir → ✅ Unlocked
3. Secret Wallet aktive et → ✅ Passphrase entered
4. RAILGUN keys türet → ✅ 3 keys derived
5. Wallet oluştur → ✅ 0zk address
6. İşlem yap → ✅ Trezor onayı
```

### ✅ Test 2: Tekrar Bağlanma
```
1. Aynı Trezor + PIN + Passphrase → ✅ Same wallet
2. Balance kontrolü → ✅ Correct balance
3. Transaction history → ✅ All transactions
```

### ✅ Test 3: Farklı Secret Wallets
```
1. Passphrase "A" → Wallet A (0xAAAA...)
2. Passphrase "B" → Wallet B (0xBBBB...)
3. Karşılaştır → ✅ Completely different
```

### ✅ Test 4: User Rejection
```
1. İşlem başlat
2. Trezor'da RED et (✗ button)
3. App → ✅ "Transaction cancelled by user"
```

### ✅ Test 5: Session Timeout
```
1. Bağlan
2. 30 dakika bekle
3. App → ✅ "Session expired"
4. Tekrar bağlan → ✅ Works
```

---

## 🚨 Common Mistakes (Kaçınılması Gerekenler)

### ❌ Mistake 1: Private Key Export
```typescript
// YANLIŞ
const pk = await trezor.exportPrivateKey();
```
**Neden yanlış:** Hardware wallet'ın amacını bozar

### ❌ Mistake 2: Silent Signing
```typescript
// YANLIŞ
{ askOnEncrypt: false }
```
**Neden yanlış:** Kullanıcı bilmeden işlem yapılır

### ❌ Mistake 3: No Padding
```typescript
// YANLIŞ
cipherKeyValue({ value: "unpaddedString" })
```
**Neden yanlış:** 16-byte alignment gerekli

### ❌ Mistake 4: No Error Handling
```typescript
// YANLIŞ
const result = await TrezorConnect.sign(...);
return result.payload; // User rejection handle edilmedi!
```

### ❌ Mistake 5: Memory Leak
```typescript
// YANLIŞ
let key = await deriveKey();
// key hala memory'de!
```
**Neden yanlış:** Sensitive data temizlenmeli

---

## 📞 Yardım & Destek

### Dokümantasyon
- 📁 `/docs/trezor/` - Tüm dokümanlar
- 📖 `README.md` - Ana rehber
- 🔐 `SECURITY_ANALYSIS.md` - Güvenlik
- 🛠️ `TREZOR_SECRET_WALLET_INTEGRATION.md` - İmplementasyon

### Dış Kaynaklar
- [Trezor Suite Repo](https://github.com/trezor/trezor-suite)
- [Trezor Connect Docs](https://github.com/trezor/connect)
- [SLIP-0011](https://github.com/satoshilabs/slips/blob/master/slip-0011.md)
- [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

### İletişim
- **GitHub Issues:** Teknik sorular
- **Security:** security@cepwallet.com
- **Support:** support@cepwallet.com

---

## 🎓 Sonuç

### Temel Prensipler

1. **Private Key Protection**
   - ASLA cihazdan çıkarma
   - Deterministik derivation kullan
   - SLIP-0011 standardına uy

2. **User Control**
   - Her kritik işlemde onay iste
   - Trezor ekranında göster
   - User rejection'ı handle et

3. **Security Layers**
   - 5 katmanlı mimari
   - Her katman bağımsız
   - Birlikte maksimum güvenlik

4. **Standards Compliance**
   - BIP-32/39 for wallets
   - SLIP-0011 for encryption
   - EIP-712 for signing
   - RAILGUN for privacy

### Next Steps

1. ✅ README.md oku (bu dosya)
2. ✅ SECURITY_ANALYSIS.md oku
3. ✅ TREZOR_SECRET_WALLET_INTEGRATION.md'ye geç
4. ✅ Kod yazmaya başla
5. ✅ Test senaryolarını çalıştır
6. ✅ Security review yap

---

**Version:** 2.0  
**Last Updated:** 18 Ekim 2025  
**Team:** CepWallet Security & Development  
**Status:** ✅ Güvenlik Revizyonu Tamamlandı
