# ⚡ CepWallet - Hızlı Başlangıç

## 🎯 Ne Yapmak İstiyorsunuz?

### 📖 Projeyi Tanımak
**Süre: 5 dakika**

1. Ana [README.md](README.md) dosyasını okuyun
2. Privacy özelliklerini inceleyin
3. Kullanım senaryolarına göz atın

**Sonuç:** Projenin ne olduğunu, neyi çözdüğünü anlarsınız.

---

### 💻 Kod Yazmaya Başlamak
**Süre: 30-45 dakika**

#### Adım 1: Gerekli Araçları Kurun
```bash
# Node.js 18+ kurulu olmalı
node --version

# Trezor Bridge'i kurun (cihaz iletişimi için)
# macOS:
brew install trezor-bridge

# Linux:
wget https://data.trezor.io/bridge/2.0.33/trezor-bridge_2.0.33_amd64.deb
sudo dpkg -i trezor-bridge_2.0.33_amd64.deb
```

#### Adım 2: Projeyi Klonlayın
```bash
git clone https://github.com/zinderud/cepwallet.git
cd cepwallet
```

#### Adım 3: Desktop App'i Başlatın
```bash
cd desktop
npm install
npm run dev
```

#### Adım 4: Trezor'u Bağlayın
1. Trezor cihazınızı USB ile bağlayın
2. CepWallet uygulamasında "Connect Device" tıklayın
3. Trezor'da PIN girin
4. İşlem yapabilirsiniz!

**Detaylı rehber:** [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

### 🏗️ Sistem Mimarisini Anlamak
**Süre: 1-2 saat**

1. [README.md](README.md) - Genel bakış (15 dakika)
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Teknik detaylar (60 dakika)
3. [docs/PRIVACY_FEATURES.md](docs/PRIVACY_FEATURES.md) - Kohaku entegrasyonu (45 dakika)

**Sonuç:** Sistemin tüm katmanlarını ve bileşenlerini anlarsınız.

---

### 💼 Yatırım/İş Sunumu Hazırlamak
**Süre: 30 dakika**

1. [README.md](README.md) - Proje özeti ve özellikler (10 dakika)
2. [docs/ROADMAP.md](docs/ROADMAP.md) - Timeline ve milestone'lar (10 dakika)
3. Maliyet Analizi bölümü (10 dakika)

**Sonuç:** Pitch için tüm bilgiler hazır.

---

### 🔧 Özel Hardware Geliştirmek
**Süre: 2-3 saat**

1. [README.md](README.md) - Proje genel bakış (15 dakika)
2. [docs/HARDWARE.md](docs/HARDWARE.md) - Hardware tasarımı (120 dakika)
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Firmware mimari (60 dakika)

**Sonuç:** Kendi hardware cihazınızı tasarlayabilirsiniz.

**Not:** İlk aşamada Trezor kullanmanızı öneriyoruz.

---

## 📚 Dokümantasyon Yapısı

```
cepwallet/
├── README.md                    ⭐ BURADAN BAŞLAYIN
├── QUICKSTART.md               📖 Bu dosya
├── LICENSE                      📄 GPL v3
│
└── docs/                        📁 Detaylı dokümantasyon
    ├── INDEX.md                🗂️ Dokümantasyon indeksi
    ├── GETTING_STARTED.md      🚀 Detaylı başlangıç rehberi
    ├── ARCHITECTURE.md         🏗️ Teknik mimari
    ├── PRIVACY_FEATURES.md     🔒 Kohaku entegrasyonu
    ├── HARDWARE.md             🔧 Hardware geliştirme
    ├── PROJECT_STRUCTURE.md    📁 Proje yapısı
    └── ROADMAP.md              🗺️ Yol haritası
```

---

## 🎓 Öğrenme Yolu

### Seviye 1: Başlangıç (Herkes için)
1. ✅ [README.md](README.md)
2. ✅ Bu dosya (QUICKSTART.md)

### Seviye 2: Geliştirici (Developers)
1. ✅ [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
2. ✅ [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)
3. ✅ [docs/PRIVACY_FEATURES.md](docs/PRIVACY_FEATURES.md)

### Seviye 3: İleri Seviye (Advanced)
1. ✅ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. ✅ [docs/HARDWARE.md](docs/HARDWARE.md)

---

## 💡 Hızlı Komutlar

### Development
```bash
# Desktop app (Electron)
cd desktop
npm install
npm run dev

# Mobile app (React Native)
cd mobile
npm install
npm run ios    # iOS
npm run android # Android

# Hardware bridge (Rust)
cd bridge
cargo build
cargo run
```

### Testing
```bash
# Desktop tests
cd desktop
npm test

# E2E tests
npm run test:e2e

# Trezor emulator ile test
./scripts/test-with-emulator.sh
```

### Build
```bash
# Desktop build
cd desktop
npm run build:mac      # macOS
npm run build:win      # Windows
npm run build:linux    # Linux

# Mobile build
cd mobile
npm run build:ios
npm run build:android
```

---

## ❓ Sık Sorulan Sorular

### Trezor cihazım olmadan test edebilir miyim?
Evet! Trezor emulator kullanabilirsiniz:
```bash
# Trezor emulator'ı çalıştır
docker run -it -p 21324:21324 trezor/trezor-user-env
```

### Hangi Trezor modeli gerekli?
- **Trezor One**: Temel özellikler için yeterli
- **Trezor Model T**: Touchscreen, daha iyi UX

### Privacy features production'da mı?
- **RAILGUN**: Mainnet'te canlı ✅
- **Privacy Pools**: Testnet'te 🔄

### Mobile desteği ne zaman?
Faz 3'te (8-12 hafta), roadmap'e bakın: [docs/ROADMAP.md](docs/ROADMAP.md)

### Nasıl katkıda bulunabilirim?
[CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.

---

## 🔗 Yararlı Linkler

### Dokümantasyon
- 📘 [Dokümantasyon İndeksi](docs/INDEX.md)
- 🚀 [Detaylı Başlangıç](docs/GETTING_STARTED.md)
- 🏗️ [Teknik Mimari](docs/ARCHITECTURE.md)
- 🔒 [Privacy Özellikleri](docs/PRIVACY_FEATURES.md)

### Dış Kaynaklar
- 🔐 [Trezor Docs](https://docs.trezor.io)
- 🌐 [Trezor Connect](https://github.com/trezor/connect)
- 🕵️ [Kohaku GitHub](https://github.com/ethereum/kohaku)
- 🚂 [RAILGUN Docs](https://docs.railgun.org)

### Topluluk
- 💬 [Discord](https://discord.gg/cepwallet)
- 🐦 [Twitter](https://twitter.com/cepwallet)
- 📧 [Email](mailto:dev@cepwallet.com)

---

## 🎯 Sonraki Adımlar

### Yeni Başlayanlar
1. ✅ Bu dosyayı okudunuz
2. 👉 [README.md](README.md) okuyun
3. 👉 [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) ile koda başlayın

### Deneyimli Geliştiriciler
1. ✅ Bu dosyayı okudunuz
2. 👉 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) ile mimariyi öğrenin
3. 👉 Kod yazmaya başlayın!

### Project Managers / Investors
1. ✅ Bu dosyayı okudunuz
2. 👉 [README.md](README.md) özet bilgiler
3. 👉 [docs/ROADMAP.md](docs/ROADMAP.md) timeline & budget

---

<div align="center">

**Başlamaya hazır mısınız?**

[🚀 Detaylı Rehbere Git](docs/GETTING_STARTED.md) | [📖 README'yi Oku](README.md) | [💬 Discord'a Katıl](https://discord.gg/cepwallet)

Made with ❤️ by the CepWallet Team

</div>
