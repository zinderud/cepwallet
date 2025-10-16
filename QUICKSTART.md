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
**Süre: 20-30 dakika**

#### Adım 1: Gerekli Araçları Kurun
```bash
# Node.js 18+ kurulu olmalı
node --version

# pnpm kurulumu
npm install -g pnpm

# Rust kurulumu (Tauri için gerekli)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Trezor Bridge (opsiyonel, gerçek cihaz kullanıyorsanız)
# macOS:
brew install trezor-bridge
```

#### Adım 2: Projeyi Klonlayın
```bash
git clone https://github.com/zinderud/cepwallet.git
cd cepwallet
```

#### Adım 3: Tauri App'i Başlatın
```bash
# Bağımlılıkları kur
pnpm install

# Tauri development server'ı başlat
pnpm tauri dev
```

#### Adım 4: Uygulamayı Test Edin
1. Tauri penceresi otomatik açılacak
2. React frontend localhost:5173'te çalışıyor
3. Mock Trezor implementasyonu hazır
4. "Connect Wallet" butonunu test edebilirsiniz!

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

### Development (Tauri 2.x)
```bash
# Tauri desktop app
pnpm install
pnpm tauri dev           # Full stack (Vite + Rust)
pnpm dev                 # Frontend only (Vite)

# Rust backend
cd src-tauri
cargo check              # Check code
cargo test               # Run tests
cargo build --release    # Production build
```

### Testing
```bash
# Type checking
pnpm tsc --noEmit

# Rust tests
cd src-tauri
cargo test

# Frontend tests (future)
pnpm test
```

### Build (Production)
```bash
# Build for current platform
pnpm tauri build

# Platform-specific builds
pnpm tauri build --target aarch64-apple-darwin      # macOS ARM64
pnpm tauri build --target x86_64-pc-windows-msvc    # Windows
pnpm tauri build --target x86_64-unknown-linux-gnu  # Linux
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
