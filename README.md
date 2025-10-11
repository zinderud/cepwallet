# CepWallet - Privacy-First Hardware Wallet

<div align="center">

**Güvenli • Privacy-First • Web3 Native • Trezor Powered**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)]()
[![Kohaku](https://img.shields.io/badge/privacy-Kohaku-purple.svg)]()

[Hızlı Başlangıç](QUICKSTART.md) •
[Dokümantasyon](docs/INDEX.md) •
[Privacy Features](#-gizlilik-özellikleri-kohaku) •
[Roadmap](docs/ROADMAP.md)

</div>

---

## 🎯 Proje Özeti

**CepWallet**, Trezor hardware wallet güvenliği ile **Ethereum Foundation'ın Kohaku** gizlilik protokollerini birleştirerek geliştirilmiş, **privacy-first** bir kripto cüzdan + Web3 browser uygulamasıdır.

### 🔐 Temel Özellikler

#### Hardware Güvenlik (Trezor)
- ✅ USB tabanlı hardware wallet (soğuk cüzdan)
- ✅ Private key'ler hiçbir zaman cihazdan çıkmaz
- ✅ İşlem imzalama tamamen offline
- ✅ PIN protection & recovery phrase
- ✅ BIP32/39/44 HD wallet desteği

#### 🕵️ Gizlilik Özellikleri (Kohaku)
- ✅ **RAILGUN Protocol**: Zero-knowledge shielded transactions
- ✅ **Privacy Pools**: Compliance-friendly privacy
- ✅ **Privacy Levels**: User-selectable modes
- ✅ **Anonymous DeFi**: Private swaps, lending, staking

#### 🌐 Web3 Integration
- ✅ Cross-platform desteği (Windows, macOS, Linux, iOS)
- ✅ Özelleştirilmiş web browser ile Web3 etkileşimi
- ✅ Uniswap, OpenSea gibi dApps ile doğrudan çalışma
- ✅ Multi-chain support (Ethereum, BSC, Polygon, Arbitrum)

---

## 🛡️ Gizlilik Özellikleri (Kohaku)

### Zero-Knowledge Privacy

CepWallet, Ethereum Foundation'ın **Kohaku** privacy tooling'ini kullanarak aşağıdaki özellikleri sağlar:

#### 1. RAILGUN Shielded Transactions

**RAILGUN**, Ethereum üzerinde zero-knowledge proof tabanlı gizlilik sağlar.

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

**Kod Örneği:**
```typescript
// Public ETH'yi RAILGUN private pool'a gönder
await wallet.shield({
  token: '0x0', // ETH
  amount: '1.0'
});

// Private transfer (miktar ve alıcı gizli)
await wallet.shieldedTransfer({
  to: '0xRECIPIENT_RAILGUN_ADDRESS',
  token: '0x0',
  amount: '0.5'
});

// Private pool'dan public address'e çıkar
await wallet.unshield({
  token: '0x0',
  amount: '0.3',
  to: '0xYOUR_PUBLIC_ADDRESS'
});
```

**Avantajlar:**
- 🔒 Transaction amounts tamamen gizli
- 🕵️ Recipient addresses anonim
- 📊 On-chain analizi imkansız
- ⚡ Gas-efficient ZK proofs

#### 2. Privacy Pools (Compliance-Friendly)

Privacy Pools, düzenleyici uyumluluk ile gizliliği birleştirir.

**Özellikler:**
- 🌊 Pool-based private transfers
- 📋 Regulatory compliance proofs
- 🔐 Zero-knowledge pool membership
- ⚖️ Hukuki güvence ile gizlilik

**Kod Örneği:**
```typescript
// Privacy pool'a katıl
await wallet.joinPool({
  poolId: 'compliance-pool-1',
  amount: '10.0',
  token: '0x0'
});

// Pool içinde private transfer
await wallet.poolTransfer({
  to: '0xRECIPIENT',
  amount: '2.5',
  includeComplianceProof: true
});
```

#### 3. Privacy Levels

Kullanıcılar gizlilik seviyelerini seçebilir:

| Seviye | Açıklama | Kullanım Alanı |
|--------|----------|----------------|
| 🌐 **Public** | Standard Ethereum | Normal işlemler |
| 🛡️ **RAILGUN** | Shielded transactions | Private DeFi |
| 🌊 **Privacy Pool** | Compliance-friendly | Kurumsal kullanım |
| 🔒 **Maximum** | RAILGUN + Privacy Pool | Maksimum gizlilik |

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

## 🚀 Hızlı Başlangıç

### Kullanıcılar İçin

1. **Trezor Cihazı Edinin**
   - Trezor One veya Model T satın alın
   - https://trezor.io adresinden

2. **CepWallet'i İndirin**
   - [Releases](https://github.com/zinderud/cepwallet/releases) sayfasından
   - Windows, macOS veya Linux sürümünü seçin

3. **Kurulum Yapın**
   - Trezor'u bilgisayara bağlayın
   - CepWallet'i başlatın
   - Cüzdan kurulumunu tamamlayın

4. **Web3 Kullanmaya Başlayın**
   - Built-in browser ile Uniswap, OpenSea gibi dApps'lere erişin
   - Privacy özelliklerini aktif edin
   - Güvenli işlem yapın!

### Geliştiriciler İçin

Detaylı kurulum ve geliştirme için:

👉 **[QUICKSTART.md](QUICKSTART.md)** - 10 dakikada başlangıç  
👉 **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Detaylı rehber

```bash
# Hızlı başlangıç
git clone https://github.com/zinderud/cepwallet.git
cd cepwallet
npm install
npm run dev
```

---

## 📁 Proje Yapısı

```
cepwallet/
├── README.md                    # Bu dosya
├── QUICKSTART.md               # Hızlı başlangıç
├── LICENSE                      # GPL v3
│
├── docs/                        # Dokümantasyon
│   ├── INDEX.md                # Dokümantasyon indeksi
│   ├── GETTING_STARTED.md      # Detaylı başlangıç
│   ├── ARCHITECTURE.md         # Teknik mimari
│   ├── PRIVACY_FEATURES.md     # Kohaku entegrasyonu
│   ├── HARDWARE.md             # Hardware geliştirme
│   ├── PROJECT_STRUCTURE.md    # Proje yapısı
│   └── ROADMAP.md              # Yol haritası
│
├── desktop/                     # Desktop uygulama (Electron)
│   ├── electron/               # Main process
│   ├── src/                    # React frontend
│   └── package.json
│
├── mobile/                      # Mobile uygulama (React Native)
├── bridge/                      # Hardware bridge (Rust)
└── contracts/                   # Smart contracts
```

Detaylı yapı için: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

---

## 💡 Kullanım Senaryoları

### 1. Private DeFi Trading
```
Senaryo: Alice, Uniswap'te swap yapmak istiyor ama işlemini gizli tutmak istiyor

1. Alice CepWallet'te RAILGUN modunu aktif eder
2. ETH'sini RAILGUN pool'a shield eder
3. Built-in browser'da Uniswap'i açar
4. Private pool'dan direkt swap yapar
5. Token'ları yine private pool'da tutar
→ Kimse Alice'in ne kadar swap yaptığını göremez
```

### 2. NFT Privacy
```
Senaryo: Bob, değerli bir NFT aldı ve kimlik gizliliğini korumak istiyor

1. Bob NFT'yi privacy pool'a transfer eder
2. Pool içinde NFT'yi yeni bir adrese taşır
3. Pool'dan çıkararak gerçek wallet'ına alır
→ NFT'nin orijinal alıcısı ile şu anki sahibi arasındaki bağlantı koptu
```

### 3. Corporate Compliance
```
Senaryo: Bir şirket, çalışan maaşlarını privacy ile ödemek istiyor ama denetlenebilir olmalı

1. Şirket Privacy Pool kullanır
2. Maaşları pool içinden dağıtır (tutarlar gizli)
3. Gerekirse compliance proof oluşturur
4. Denetçiye sadece gerekli bilgileri gösterir
→ Hem çalışan gizliliği korunur hem de denetim mümkün
```

---

## 🗺️ Roadmap

### Faz 1: MVP (4-6 hafta) - Şu An
- [x] Araştırma ve planlama
- [ ] Trezor entegrasyonu
- [ ] Desktop app (Electron + React)
- [ ] Web3 browser
- [ ] Temel privacy features

### Faz 2: Gelişmiş Özellikler (6-8 hafta)
- [ ] Multi-chain support
- [ ] Token & NFT yönetimi
- [ ] DeFi entegrasyonları
- [ ] Gelişmiş güvenlik

### Faz 3: Mobile & Beta (8-12 hafta)
- [ ] React Native app
- [ ] iOS/Android desteği
- [ ] Beta testing
- [ ] Community feedback

### Faz 4: Production (12+ hafta)
- [ ] v1.0 release
- [ ] Marketing
- [ ] Community growth
- [ ] Custom hardware (opsiyonel)

Detaylı roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)

---

 
## 🔒 Güvenlik

- **Hardware Isolation**: Private key'ler hiçbir zaman cihazdan çıkmaz
- **PIN Protection**: 10 yanlış denemeden sonra cihaz kilitlenir
- **Recovery Phrase**: 24 kelimelik BIP39 seed
- **Firmware Verification**: Signed firmware updates
- **Zero-Knowledge Proofs**: Transaction privacy
- **Open Source**: Topluluk tarafından denetlenebilir

Güvenlik raporları ve audits: [docs/SECURITY.md](docs/SECURITY.md)

---

## 🤝 Katkıda Bulunma

CepWallet açık kaynak bir projedir ve katkılarınızı bekliyoruz!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

Detaylı katkı rehberi: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📝 Lisans

Bu proje [GNU General Public License v3.0](LICENSE) ile lisanslanmıştır.

---

## 📞 İletişim

- **GitHub Issues**: [github.com/zinderud/cepwallet/issues](https://github.com/zinderud/cepwallet/issues)
- **Discord**: [discord.gg/cepwallet](https://discord.gg/cepwallet)
- **Twitter**: [@cepwallet](https://twitter.com/cepwallet)
- **Email**: dev@cepwallet.com

---

## 🙏 Teşekkürler

- **Trezor** - Açık kaynak hardware wallet firmware
- **Ethereum Foundation** - Kohaku privacy protocols
- **RAILGUN** - Zero-knowledge privacy protocol
- **Community** - Feedback ve katkılar

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by the CepWallet Team

</div>
