# Trezor + RAILGUN Güvenlik Analizi

## 🎯 Executive Summary

Bu doküman, CepWallet'ın Trezor hardware wallet entegrasyonunda **neden private key'lerin asla cihazdan çıkmaması gerektiğini** ve **RAILGUN key derivation'ın nasıl güvenli yapılacağını** detaylı olarak açıklar.

## ❌ YANLIŞ YAKLAŞIM (GÜVENLİK AÇIĞI)

### Hatalı Implementasyon

```typescript
// ⚠️ ASLA BÖYLE YAPMAYIN!
async function createRailgunWallet() {
  // ❌ Private key'i Trezor'dan çıkartmak
  const privateKey = await trezor.getPrivateKey();
  
  // ❌ Memory'de private key tutmak
  const railgunWallet = createWallet(privateKey);
  
  // ❌ Private key ile işlem imzalamak (software wallet gibi)
  const signature = signTransaction(privateKey, transaction);
  
  return { wallet: railgunWallet, signature };
}
```

### Neden Yanlış?

1. **Hardware Wallet'ın Amacını Bozar**
   - Trezor'ın tüm amacı private key'i korumaktır
   - Private key çıktığı anda hardware wallet'ın değeri kalmaz
   - Yazılımsal saldırılara açık hale gelir

2. **Memory'de Private Key Riski**
   - RAM'de private key tutmak tehlikelidir
   - Malware/spyware okuyabilir
   - Memory dump'larda görülebilir
   - Swap file'a yazılabilir

3. **Multi-Layer Security Kaybolur**
   - Fiziksel onay mekanizması bypass edilir
   - Kullanıcı işlem detaylarını göremez
   - Unauthorized transaction mümkün olur

## ✅ DOĞRU YAKLAŞIM (GÜVENLİ)

### Güvenli Implementasyon

```typescript
// ✅ DOĞRU YÖNTEM
import TrezorConnect from '@trezor/connect-web';

async function createRailgunWalletSecure() {
  const walletId = crypto.randomUUID();
  
  // ✅ Deterministik key derivation (private key çıkmaz)
  const spendingKey = await TrezorConnect.cipherKeyValue({
    path: "m/44'/60'/0'/0/0",
    key: `RAILGUN_SPENDING_KEY_${walletId}`,
    value: padTo16Bytes(walletId),
    encrypt: true,
    askOnEncrypt: true, // Trezor'da onay
  });
  
  const viewingKey = await TrezorConnect.cipherKeyValue({
    path: "m/44'/60'/0'/0/0",
    key: `RAILGUN_VIEWING_KEY_${walletId}`,
    value: padTo16Bytes(walletId),
    encrypt: true,
    askOnEncrypt: true,
  });
  
  // ✅ Türetilmiş key'lerle RAILGUN wallet oluştur
  const railgunWallet = {
    id: walletId,
    spendingKey: spendingKey.payload.value,
    viewingKey: viewingKey.payload.value,
    // Private key yok, sadece derived keys
  };
  
  return railgunWallet;
}

// ✅ Transaction signing (Trezor cihazda)
async function signTransactionSecure(transaction) {
  // ✅ Trezor cihazda imzalama
  const result = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: transaction.to,
      value: transaction.value,
      gasLimit: transaction.gasLimit,
      gasPrice: transaction.gasPrice,
      nonce: transaction.nonce,
      data: transaction.data,
      chainId: transaction.chainId,
    },
  });
  
  // ✅ Sadece signature döner (private key asla çıkmaz)
  return {
    r: result.payload.r,
    s: result.payload.s,
    v: result.payload.v,
  };
}
```

## 🔬 Trezor cipherKeyValue API Analizi

### SLIP-0011 Standardı

Trezor'ın `cipherKeyValue()` fonksiyonu [SLIP-0011](https://github.com/satoshilabs/slips/blob/master/slip-0011.md) standardını takip eder:

```
Encryption Key = HMAC-SHA256(
  key = node.private_key,
  msg = "Encrypt" || key_name
)

IV = HMAC-SHA256(
  key = encryption_key,
  msg = "IV" || key_name
)[:16]  # İlk 16 byte
```

**Önemli Özellikler:**
- Deterministik: Aynı input → Aynı output
- Güvenli: Private key asla exposed olmaz
- Onaylanabilir: `askOnEncrypt` ile kullanıcı kontrolü
- Path-sensitive: Farklı BIP-32 path → Farklı key

### Key Derivation Grafiği

```
┌─────────────────────────────────────────────────┐
│         Trezor Secure Element                   │
│                                                  │
│  BIP-39 Seed                                    │
│       │                                          │
│       ▼                                          │
│  BIP-32 Master Key                              │
│       │                                          │
│       ▼                                          │
│  m/44'/60'/0'/0/0                               │
│       │                                          │
│       ├──► HMAC-SHA256("RAILGUN_SPENDING_KEY")  │
│       │    │                                     │
│       │    └──► Spending Encryption Key ────────┼──► Output
│       │                                          │
│       ├──► HMAC-SHA256("RAILGUN_VIEWING_KEY")   │
│       │    │                                     │
│       │    └──► Viewing Encryption Key ─────────┼──► Output
│       │                                          │
│       └──► HMAC-SHA256("RAILGUN_NULLIFYING_KEY")│
│            │                                     │
│            └──► Nullifying Key ─────────────────┼──► Output
│                                                  │
│  ⚠️ Private Key NEVER leaves this box           │
└─────────────────────────────────────────────────┘
```

## 🛡️ RAILGUN Key Architecture

### RAILGUN Dual-Key System

RAILGUN wallets use two private keys (research from Perplexity MCP):

1. **Spending Key**
   - Functions like a traditional private key
   - Authorizes transactions
   - Required for sending tokens
   - Encoded in 0zk address

2. **Viewing Key**
   - Provides audit capability
   - View-only access to transactions
   - No spending authority
   - Can be scoped to block ranges
   - Encoded in 0zk address

### BIP-32/BIP-39 Integration

RAILGUN follows standard hierarchical deterministic wallet principles:

```
12-24 Word Mnemonic (BIP-39)
       │
       ▼
Seed Phrase (512-bit master key)
       │
       ▼
BIP-32 Derivation Tree
       │
       ├──► Spending Key Branch
       └──► Viewing Key Branch
```

### 0zk Address Structure

```
0zk1q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0
│  │                                            │
│  └─── Public Spending Key Component          │
└────── Public Viewing Key Component ──────────┘
```

**Neden Uzun?**
- İki ayrı public key encode edilir
- Standard 0x adresleri sadece tek public key içerir
- Privacy garantileri için gerekli

## 🔐 Security Comparison

### Hardware Wallet vs Software Wallet

| Özellik | Hardware Wallet (Trezor) | Software Wallet |
|---------|--------------------------|-----------------|
| Private Key Storage | Secure Element chip | Encrypted file |
| Key Exposure | NEVER | During operations |
| Physical Approval | Required | Optional |
| Memory Attack | Resistant | Vulnerable |
| Malware Attack | Resistant | Vulnerable |
| Transaction Display | On device | On screen |
| Plausible Deniability | Yes (Secret Wallet) | Limited |

### Trezor + RAILGUN = Maximum Privacy

```
Layer 1: Hardware Isolation (Trezor)
    │
    ├─── Private keys in Secure Element
    └─── Physical button confirmation
         │
         ▼
Layer 2: Secret Wallet (Passphrase)
    │
    ├─── BIP-39 passphrase
    └─── Hidden wallet derivation
         │
         ▼
Layer 3: Deterministic Derivation (SLIP-0011)
    │
    ├─── cipherKeyValue API
    └─── No private key export
         │
         ▼
Layer 4: RAILGUN Privacy (ZK Proofs)
    │
    ├─── Shielded transactions
    └─── On-chain privacy
         │
         ▼
Layer 5: Encrypted Storage (LevelDOWN)
    │
    ├─── Local database encryption
    └─── Trezor-derived keys
```

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Attempting Private Key Export

```typescript
// ❌ YANLIŞ - Böyle bir API yok (ve olmamalı!)
const privateKey = await TrezorConnect.getPrivateKey();

// ✅ DOĞRU - Deterministik derivation
const derivedKey = await TrezorConnect.cipherKeyValue({
  path: "m/44'/60'/0'/0/0",
  key: "RAILGUN_KEY",
  value: "...",
  encrypt: true,
});
```

### Pitfall 2: Signing Without Device Approval

```typescript
// ❌ YANLIŞ - Software signing
const signature = ethers.Wallet.signTransaction(tx);

// ✅ DOĞRU - Hardware signing
const signature = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: tx,
});
```

### Pitfall 3: Ignoring 16-Byte Alignment

```typescript
// ❌ YANLIŞ - Padding eksik
await TrezorConnect.cipherKeyValue({
  value: "some-random-string", // ❌ 16-byte aligned değil
});

// ✅ DOĞRU - PKCS7 padding
function padTo16Bytes(str: string): string {
  const blockSize = 16;
  const bytes = Buffer.from(str, 'utf8');
  const paddingLength = blockSize - (bytes.length % blockSize);
  const padding = Buffer.alloc(paddingLength, paddingLength);
  return Buffer.concat([bytes, padding]).toString('hex');
}

await TrezorConnect.cipherKeyValue({
  value: padTo16Bytes("some-random-string"), // ✅
});
```

### Pitfall 4: Not Handling User Rejection

```typescript
// ❌ YANLIŞ - Error handling yok
const result = await TrezorConnect.signTransaction(...);
const signature = result.payload; // ❌ Reject durumu handle edilmedi

// ✅ DOĞRU - Proper error handling
const result = await TrezorConnect.signTransaction(...);
if (!result.success) {
  if (result.payload.error === 'Action cancelled by user') {
    throw new UserRejectedError();
  }
  throw new TrezorError(result.payload.error);
}
const signature = result.payload;
```

## 📚 References & Standards

### BIP Standards
- **BIP-32**: Hierarchical Deterministic Wallets
- **BIP-39**: Mnemonic Code for Generating Deterministic Keys
- **BIP-44**: Multi-Account Hierarchy for Deterministic Wallets
- **SLIP-0011**: Symmetric Encryption of Key-Value Pairs

### RAILGUN Documentation
- RAILGUN SDK follows BIP-32 for key derivation
- Dual-key system: Spending + Viewing keys
- Zero-knowledge proofs for transaction privacy
- 0zk addresses encode both public key components

### Trezor Connect API
- `cipherKeyValue()`: Symmetric encryption/decryption on device
- `ethereumSignTransaction()`: Transaction signing on device
- `signMessage()`: Message signing for authentication
- `getDeviceState()`: Session management with passphrase

## ✅ Security Checklist

**Before Implementation:**
- [ ] Understand that private keys NEVER leave Trezor
- [ ] Study SLIP-0011 specification
- [ ] Review RAILGUN key derivation mechanism
- [ ] Plan deterministik key derivation strategy

**During Implementation:**
- [ ] Use `cipherKeyValue()` for key derivation
- [ ] Implement proper 16-byte padding (PKCS7)
- [ ] Add user confirmation (`askOnEncrypt: true`)
- [ ] Handle user rejection gracefully
- [ ] Test with different BIP-32 paths
- [ ] Verify deterministic output

**After Implementation:**
- [ ] Code review: No private key exports
- [ ] Security audit: All signing on device
- [ ] Test: User can reject operations
- [ ] Verify: Session timeout works
- [ ] Document: Key derivation scheme
- [ ] Penetration test: Memory analysis

## 🎓 Key Takeaways

1. **Never Extract Private Keys**
   - Trezor'ın amacını bozar
   - Hardware wallet'ı software wallet'a dönüştürür
   - Güvenlik garantilerini yok eder

2. **Use Deterministic Derivation**
   - `cipherKeyValue()` ile SLIP-0011 standardı
   - Private key cihaz içinde kalır
   - Deterministik output (aynı input = aynı output)

3. **Leverage RAILGUN's Dual-Key System**
   - Spending Key: Transaction yetkisi
   - Viewing Key: Audit capability
   - Her ikisi de Trezor'dan türetilir

4. **Require Physical Approval**
   - Her critical operation için onay
   - Trezor ekranında detaylar gösterilir
   - Unauthorized işlemler engellenmiş olur

5. **Follow Standards**
   - BIP-32/39 for wallet derivation
   - SLIP-0011 for encryption
   - RAILGUN for privacy
   - Trezor Connect API best practices

---

**Kritik Sonuç:** Trezor + RAILGUN entegrasyonunda private key'ler **ASLA** cihazdan çıkmamalıdır. Tüm kriptografik işlemler Trezor'un Secure Element'inde yapılmalı, sadece deterministik türetilmiş key'ler ve signature'lar dışarı çıkmalıdır.

**Versiyon:** 1.0  
**Tarih:** 18 Ekim 2025  
**Yazar:** CepWallet Security Team
