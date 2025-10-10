# CepWallet - Kohaku Tabanlı Gizlilik Odaklı Hardware Wallet

<div align="center">

![CepWallet Logo](assets/logo/logo.png)

**Güvenli • Gizlilik Odaklı • Web3 Native • Trezor Powered**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Kohaku](https://img.shields.io/badge/Powered%20by-Kohaku-purple.svg)](https://github.com/ethereum/kohaku)
[![Trezor](https://img.shields.io/badge/Hardware-Trezor-green.svg)](https://trezor.io)

[Hızlı Başlangıç](#-hızlı-başlangıç) •
[Kohaku Entegrasyonu](#-kohaku-gizlilik-protokolü) •
[Dokümantasyon](#-dokümantasyon) •
[Roadmap](09_ROADMAP.md)

</div>

---

## 🎯 Proje Genel Bakış

**CepWallet**, Ethereum Foundation'ın **Kohaku** gizlilik protokolünü, **Trezor** hardware wallet güvenliği ile birleştirerek, kullanıcılara hem **maksimum güvenlik** hem de **tam gizlilik** sunan yeni nesil bir soğuk cüzdan sistemidir.

### 🔑 Ana Bileşenler

1. **Kohaku Privacy Protocols** (Ethereum Foundation)
   - 🔒 RAILGUN Privacy Protocol
   - 🌊 Privacy Pools
   - 🛡️ Zero-knowledge proofs
   - 🎭 Transaction privacy

2. **Trezor Hardware Wallet** (Açık Kaynak)
   - 🔐 Hardware-based key storage
   - ✍️ Secure transaction signing
   - 🔓 PIN & recovery phrase protection
   - 🖥️ Cross-platform support

3. **Custom Frontend Application** (CepWallet)
   - 🌐 Built-in Web3 browser
   - 🎨 Modern UI/UX
   - 🔗 Direct dApp integration
   - 📱 Cross-platform (Desktop & Mobile)

---

## 🌟 Neden CepWallet?

### vs Standard Trezor
- ✅ **Gizlilik**: Kohaku protokolü ile private transactions
- ✅ **Modern UI**: Custom uygulama, Trezor Suite değil
- ✅ **Web3 Odaklı**: Built-in browser ile direkt dApp erişimi

### vs MetaMask
- ✅ **Hardware Güvenlik**: Private key'ler USB cihazda
- ✅ **Gizlilik**: Transaction privacy (Kohaku)
- ✅ **Standalone**: Browser extension değil, tam uygulama

### vs Diğer Privacy Wallets
- ✅ **Hardware Security**: Yazılım cüzdanlardan daha güvenli
- ✅ **Kanıtlanmış Protokol**: Ethereum Foundation desteği
- ✅ **Açık Kaynak**: Tamamen şeffaf

---

## 🔐 Kohaku Gizlilik Protokolü

### RAILGUN Integration

RAILGUN, Ethereum üzerinde **zero-knowledge proof** tabanlı gizlilik sağlar.

**Nasıl Çalışır:**

```
Normal İşlem:
Alice → [100 ETH görünür] → Bob
❌ Herkes görüyor: kimden kime, ne kadar

RAILGUN ile:
Alice → [Shield] → [Private Pool] → [Unshield] → Bob
✅ Sadece Alice ve Bob biliyor miktarı
✅ On-chain sadece proof görünür
```

**CepWallet Entegrasyonu:**

```typescript
// RAILGUN transaction via Trezor
import { RailgunWallet } from '@kohaku-eth/railgun';
import TrezorConnect from '@trezor/connect-web';

async function sendPrivateTransaction(to: string, amount: string) {
  // 1. RAILGUN ile private tx oluştur
  const privateTx = await RailgunWallet.generateShieldedTransfer({
    to,
    amount,
    token: '0x0000...', // ETH
  });

  // 2. Trezor ile imzala
  const signature = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: privateTx.unsignedTx
  });

  // 3. Private tx'i gönder
  const result = await RailgunWallet.broadcastShieldedTransaction(
    signature.payload
  );

  return result; // ✅ Private transaction completed
}
```

### Privacy Pools Integration

Privacy Pools, **compliance** ile **privacy**'yi dengeler.

**Özellikler:**
- ✅ Kullanıcılar privacy poollarına katılır
- ✅ Her pool kendi compliance rules'una sahip
- ✅ Zero-knowledge proofs ile privacy korunur
- ✅ Regülatörlere gerektiğinde proof sağlanabilir

**CepWallet'ta Kullanımı:**

```typescript
// Privacy Pool ile private swap
import { PrivacyPools } from '@kohaku-eth/privacy-pools';

async function privateSwap(fromToken: string, toToken: string, amount: string) {
  // 1. Privacy pool'a katıl
  const pool = await PrivacyPools.joinPool({
    poolId: 'compliant-defi-pool',
    credentials: userProof
  });

  // 2. Pool içinde swap yap (private)
  const swapTx = await pool.swap({
    from: fromToken,
    to: toToken,
    amount
  });

  // 3. Trezor ile imzala
  const signed = await signWithTrezor(swapTx);

  // 4. Private swap tamamla
  return await pool.broadcast(signed);
}
```

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                         KULLANICI CİHAZI                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              CepWallet Desktop/Mobile App               │     │
│  │  ┌─────────────────────────────────────────────────┐   │     │
│  │  │         Custom Web3 Browser                     │   │     │
│  │  │  (Chromium/WebKit + Privacy Features)           │   │     │
│  │  │  • Uniswap, Aave, OpenSea                       │   │     │
│  │  │  • Privacy Pools UI                             │   │     │
│  │  │  • RAILGUN Integration                          │   │     │
│  │  └─────────────────────────────────────────────────┘   │     │
│  │                           ↕                             │     │
│  │  ┌─────────────────────────────────────────────────┐   │     │
│  │  │       Kohaku Privacy Layer                      │   │     │
│  │  │  • @kohaku-eth/railgun                          │   │     │
│  │  │  • @kohaku-eth/privacy-pools                    │   │     │
│  │  │  • Zero-knowledge proof generation              │   │     │
│  │  │  • Shielded transaction builder                 │   │     │
│  │  └─────────────────────────────────────────────────┘   │     │
│  │                           ↕                             │     │
│  │  ┌─────────────────────────────────────────────────┐   │     │
│  │  │       Trezor Integration Layer                  │   │     │
│  │  │  • Trezor Connect API                           │   │     │
│  │  │  • Transaction signing                          │   │     │
│  │  │  • Account management                           │   │     │
│  │  └─────────────────────────────────────────────────┘   │     │
│  └────────────────────────────────────────────────────────┘     │
│                               ↕ USB                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │            TREZOR HARDWARE WALLET                      │     │
│  │  • Trezor One / Model T                                │     │
│  │  • Private key storage (NEVER leaves device)          │     │
│  │  • Secure transaction signing                         │     │
│  │  • PIN protection                                     │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                ↕ HTTPS
              ┌──────────────────────────────────┐
              │     Ethereum Network              │
              │  • Regular transactions           │
              │  • RAILGUN shielded txs           │
              │  • Privacy Pools contracts        │
              │  • Multi-chain support            │
              └──────────────────────────────────┘
```

---

## ✨ Özellikler

### 🔒 Maksimum Güvenlik (Trezor)
- ✅ Hardware-based private key storage
- ✅ Transaction signing on device
- ✅ PIN protection & recovery phrase
- ✅ Phishing detection
- ✅ Open-source firmware

### 🎭 Tam Gizlilik (Kohaku)
- ✅ RAILGUN private transactions
- ✅ Privacy Pools membership
- ✅ Zero-knowledge proofs
- ✅ Shielded transfers
- ✅ Compliance-friendly privacy

### 🌐 Web3 Native
- ✅ Built-in DApp browser
- ✅ Automatic Web3 injection
- ✅ Uniswap, OpenSea, Aave desteği
- ✅ Privacy Pools UI integration
- ✅ Multi-chain support

### 💼 Gelişmiş Cüzdan Özellikleri
- ✅ Multi-account support (BIP44)
- ✅ ERC-20 token management
- ✅ NFT viewing & transfer
- ✅ Private transaction history
- ✅ Portfolio tracking (privacy-aware)

### 🖥️ Cross-Platform
- ✅ Windows, macOS, Linux (Electron)
- ✅ iOS & Android (WalletConnect)
- ✅ Custom Trezor Bridge integration

---

## 🛠️ Teknoloji Stack

### Frontend (Custom App)
```typescript
{
  "framework": "Electron",
  "ui": "React + TypeScript + Tailwind CSS",
  "web3": "ethers.js",
  "privacy": {
    "railgun": "@kohaku-eth/railgun",
    "privacyPools": "@kohaku-eth/privacy-pools"
  },
  "hardware": "@trezor/connect-web",
  "browser": "Chromium Embedded Framework"
}
```

### Backend/Bridge
```rust
// Trezor Bridge (Rust or Node.js)
{
  "protocol": "WebSocket + Protocol Buffers",
  "usb": "libusb / hidapi",
  "privacy": "ZK proof verification"
}
```

### Privacy Layer (Kohaku)
```typescript
{
  "zkp": "snarkjs (zero-knowledge proofs)",
  "railgun": "Shielded transactions",
  "privacyPools": "Compliance-friendly privacy",
  "contracts": "Ethereum smart contracts"
}
```

---

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

```bash
# Hardware
✅ Trezor One veya Trezor Model T

# Software
✅ Node.js 18+
✅ Trezor Bridge
✅ pnpm (Kohaku için)
```

### Kurulum

```bash
# 1. Repository'yi clone et
git clone https://github.com/yourusername/cepwallet.git
cd cepwallet

# 2. Kohaku dependencies yükle
pnpm install

# 3. Desktop app setup
cd desktop
npm install

# 4. Kohaku privacy libraries
npm install @kohaku-eth/railgun @kohaku-eth/privacy-pools

# 5. Trezor Connect
npm install @trezor/connect-web

# 6. Uygulamayı başlat
npm run dev
```

### İlk Kullanım

```typescript
// src/App.tsx
import { RailgunWallet } from '@kohaku-eth/railgun';
import TrezorConnect from '@trezor/connect-web';

async function initializeWallet() {
  // 1. Trezor'a bağlan
  const trezor = await TrezorConnect.ethereumGetAddress({
    path: "m/44'/60'/0'/0/0"
  });

  // 2. RAILGUN wallet oluştur
  const railgunWallet = await RailgunWallet.create({
    address: trezor.payload.address,
    signer: (tx) => signWithTrezor(tx) // Trezor signing
  });

  // 3. Privacy pool'a katıl
  await railgunWallet.joinPrivacyPool('default-pool');

  console.log('✅ Wallet ready with privacy features!');
}
```

---

## 📚 Dokümantasyon

| Doküman | Açıklama |
|---------|----------|
| [📖 Kohaku Integration Guide](07_KOHAKU_INTEGRATION.md) | Kohaku protokollerini entegre etme |
| [🔐 Trezor Setup](TREZOR_SETUP.md) | Trezor hardware wallet kurulumu |
| [🏗️ Technical Architecture](06_TECHNICAL_ARCHITECTURE.md) | Detaylı sistem mimarisi |
| [🚀 Getting Started](04_GETTING_STARTED.md) | Hızlı başlangıç rehberi |
| [🗺️ Roadmap](09_ROADMAP.md) | Geliştirme yol haritası |

---

## 🔐 Güvenlik ve Gizlilik Modeli

### Katmanlı Güvenlik

```
Layer 1: Trezor Hardware
├── Private keys NEVER leave device
├── Secure element (tamper-resistant)
├── PIN protection (brute-force resistant)
└── Recovery phrase backup

Layer 2: Kohaku Privacy
├── Zero-knowledge proofs
├── Shielded transactions (RAILGUN)
├── Privacy pools membership
└── Compliance when needed

Layer 3: Application Security
├── Encrypted local storage
├── Secure communication (TLS)
├── Phishing detection
└── Transaction simulation
```

### Privacy Özellikleri

**1. RAILGUN Private Transfers**
```typescript
// Normal transfer: Herkes görür
await wallet.transfer(to, amount); // ❌ Public

// RAILGUN transfer: Gizli kalır
await railgunWallet.shieldedTransfer(to, amount); // ✅ Private
```

**2. Privacy Pools**
```typescript
// Pool'a katıl
await privacyPool.join({
  poolId: 'compliant-defi',
  proof: zkProof // Compliance proof
});

// Pool içinde işlem yap (gizli)
await privacyPool.swap(tokenA, tokenB, amount);
```

**3. Transaction Privacy Levels**
- 🟢 **Public**: Normal Ethereum transaction
- 🟡 **Shielded**: RAILGUN protected
- 🔵 **Pool**: Privacy Pool içinde
- 🟣 **Maximum**: RAILGUN + Privacy Pool

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Private DeFi Trading
```typescript
// Uniswap'te private swap
async function privateUniswapSwap() {
  // 1. Privacy pool'a ETH shield et
  await railgun.shield({ token: 'ETH', amount: '10' });

  // 2. Pool içinde swap yap (kimse görmesin)
  const swapTx = await privacyPool.swap({
    from: 'ETH',
    to: 'USDC',
    amount: '10'
  });

  // 3. Trezor'da onayla
  await signWithTrezor(swapTx);

  // 4. USDC'yi unshield et (istersen)
  await railgun.unshield({ token: 'USDC', to: myAddress });
}
```

### Senaryo 2: Private NFT Purchase
```typescript
// OpenSea'de NFT al ama kimse bilmesin
async function buyNFTPrivately() {
  // ETH'yi shield et
  await railgun.shield({ token: 'ETH', amount: '2' });

  // Private olarak NFT contract'ına gönder
  const purchaseTx = await railgun.shieldedTransfer({
    to: nftContractAddress,
    amount: '2',
    data: buyNFTCalldata
  });

  await signWithTrezor(purchaseTx);
}
```

### Senaryo 3: Compliant Privacy
```typescript
// Regülatöre kanıt göster ama transaction private kalsın
async function compliantPrivateTransfer() {
  // Privacy pool'a gir (KYC'li)
  await privacyPool.join({
    poolId: 'kyc-compliant-pool',
    kycProof: myKYCCredentials
  });

  // Private transfer yap
  await privacyPool.transfer(to, amount);

  // Gerekirse regülatöre kanıt sun
  const proof = await privacyPool.generateComplianceProof({
    txHash: txHash,
    authority: regulatorAddress
  });
}
```

---

## 🗺️ Roadmap

### ✅ Faz 1: MVP (4-6 hafta)
- [x] Trezor Connect entegrasyonu
- [x] Kohaku libraries kurulumu
- [ ] Basic RAILGUN integration
- [ ] Simple private transfer UI
- [ ] Beta release

### 🔄 Faz 2: Privacy Features (6-8 hafta)
- [ ] Full RAILGUN integration
- [ ] Privacy Pools UI
- [ ] Private DeFi dashboard
- [ ] Compliance tools
- [ ] v1.0.0 release

### 📅 Faz 3: Advanced Features (8-10 hafta)
- [ ] Multi-chain privacy
- [ ] Private NFT support
- [ ] Advanced privacy pools
- [ ] Mobile apps
- [ ] v2.0.0 release

Detaylı roadmap: [09_ROADMAP.md](09_ROADMAP.md)

---

## 🤝 Kohaku ve Trezor Entegrasyonu

### Neden Bu Kombinasyon Mükemmel?

**Trezor:**
- ✅ Açık kaynak (firmware, hardware, API)
- ✅ USB ile kolay entegrasyon
- ✅ Trezor Connect API (custom app desteği)
- ✅ Web3 dApp uyumluluğu
- ✅ Cross-platform

**Kohaku:**
- ✅ Ethereum Foundation projesi
- ✅ Production-ready privacy protocols
- ✅ TypeScript libraries
- ✅ Zero-knowledge proofs
- ✅ Compliance-friendly

**Birlikte:**
- ✅ Hardware güvenlik + Privacy
- ✅ Custom UI (Trezor Suite değil)
- ✅ Web3 native
- ✅ DeFi odaklı
- ✅ Açık kaynak

---

## 💰 Maliyet Tahmini

### MVP (Trezor + Kohaku Integration)
```
Development:              $35,000 - $50,000
- Trezor integration:     $10,000
- Kohaku integration:     $15,000 - $20,000
- UI/UX:                  $10,000 - $20,000

Timeline:                 6-8 hafta
Team:                     2-3 developers
```

### Production (Full Features)
```
Additional:               $40,000 - $60,000
Total:                    $75,000 - $110,000
Timeline:                 4-5 ay
```

Detaylı maliyet analizi: [09_ROADMAP.md](09_ROADMAP.md)

---

## 🎓 Öğrenme Kaynakları

### Kohaku
- [Kohaku GitHub](https://github.com/ethereum/kohaku)
- [Kohaku Commons](https://github.com/ethereum/kohaku-commons)
- [RAILGUN Documentation](https://docs.railgun.org/)
- [Privacy Pools Paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)

### Trezor
- [Trezor Connect Docs](https://github.com/trezor/connect)
- [Trezor Firmware](https://github.com/trezor/trezor-firmware)
- [Hardware Wallet Guide](https://wiki.trezor.io/)

### Privacy Tech
- [Zero-Knowledge Proofs](https://z.cash/technology/zksnarks/)
- [Ethereum Privacy](https://ethereum.org/en/privacy/)

---

## 🔒 Lisans

Bu proje [GNU General Public License v3.0](LICENSE) altında lisanslanmıştır.

**Bağımlılıklar:**
- Kohaku: MIT License
- Trezor Connect: LGPL v3
- Trezor Firmware: GPL v3

---

## 🌟 Topluluk

- 💬 **Discord**: [discord.gg/cepwallet](https://discord.gg/cepwallet)
- 🐦 **Twitter**: [@cepwallet](https://twitter.com/cepwallet)
- 📧 **Email**: hello@cepwallet.com
- 🛡️ **Privacy**: privacy@cepwallet.com

---

## 🙏 Teşekkürler

- **Ethereum Foundation** - Kohaku protokolü
- **Trezor/SatoshiLabs** - Hardware wallet
- **RAILGUN** - Privacy protocol
- **Privacy Pools** - Compliant privacy research

---

<div align="center">

**[⬆ Başa Dön](#cepwallet---kohaku-tabanlı-gizlilik-odaklı-hardware-wallet)**

Made with ❤️ & 🔒 by CepWallet Team

**Privacy is a right, not a privilege.**

</div>
