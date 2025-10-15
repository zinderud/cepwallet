# 🚀 CepWallet - Uygulama Yol Haritası

**Tarih:** 15 Ekim 2025  
**Durum:** 🟡 Faz 0 → Faz 1'e Geçiş  
**Güncelleyen:** GitHub Copilot  

---

## 📊 Genel Bakış

```
FAZ 0 - Proje Kurulumu (DEVAM EDIYOR)
│
├─ ✅ Dokümantasyon incelemesi tamamlandı
├─ ✅ PROJECT_STRUCTURE.md güncellendi (pnpm)
├─ ✅ GETTING_STARTED.md güncellendi
├─ ⏳ ARCHITECTURE.md güncellenmesi gerekli
├─ ⏳ İlk package.json dosyaları oluşturulacak
│
└─ SONRA: FAZ 1 - Desktop Wallet Core (2-3 hafta)
```

---

## 🎯 FAZ 0 - Proje Kurulumu (Hafta 1-2)

### Amaç
Geliştirme ortamını tamamen hazırlayıp, ilk çalıştırabilir prototip elde etmek.

### Hedefler
- ✅ pnpm workspace yapısı kurulu
- ✅ 3 ana package başlatılmış (@cepwallet/shared, @cepwallet/desktop, bridge)
- ✅ İlk TypeScript types tanımlanmış
- ✅ Trezor bağlantısı test edilmiş
- ✅ CI/CD pipeline aktif

---

## 📝 Bugün Yapılacak İşler (15 Ekim 2025)

### Sıra 1: ARCHITECTURE.md'yi Güncelle
**Önem:** 🔴 Kritik  
**Tahmini Süre:** 2 saat  
**Başlayan:** GitHub Copilot

#### Yapılacak
```markdown
# İçindekiler:
1. 3-Layer Architecture (Trezor → Kohaku → App)
2. Component Diagram
3. Data Flow Diagram  
4. Communication Patterns (IPC, WebSocket, USB)
5. Security Model
6. Performance Considerations
```

#### Dosya
`docs/ARCHITECTURE.md` (300+ satır)

**Başlamadan Önce:**
- [ ] Mevcut ARCHITECTURE.md oku
- [ ] Faz 1 hedeflerini anla
- [ ] Entegrasyon dokümantasyonunu gözden geçir

**Bitirme Kriterleri:**
- [ ] 3-layer mimarisi açık şekilde açıklanmış
- [ ] Trezor-Kohaku entegrasyonu gösterilmiş
- [ ] WebSocket vs IPC vs USB iletişim anlatılmış
- [ ] Diagram'lar eklenmiş

---

### Sıra 2: Root package.json Oluştur
**Önem:** 🔴 Kritik  
**Tahmini Süre:** 1 saat  
**Başlayan:** GitHub Copilot

#### Yapılacak
```bash
# 1. Root pnpm-workspace.yaml oluştur
# 2. Root package.json oluştur (scripts ile)
# 3. tsconfig.json setup
# 4. .prettierrc ve .eslintrc oluştur
```

#### Dosya
```
package.json (root)
pnpm-workspace.yaml
tsconfig.json
.prettierrc
.eslintrc.json
```

**Komut:**
```bash
cd /Users/muratonurkaradeniz/workspace/sade/code/cepwallet

# Git durumu kontrol et
git status

# Dosyaları stage'le
git add docs/PROJECT_STRUCTURE.md docs/GETTING_STARTED.md

# Commit et
git commit -m "docs: update PROJECT_STRUCTURE with pnpm workspace and GETTING_STARTED with setup instructions"

# Yeni branch açabilirsin (opsiyonel)
git checkout -b feat/workspace-setup
```

---

### Sıra 3: packages/shared Paketi Oluştur
**Önem:** 🔴 Kritik (Desktop'ta kullanıldığı için)  
**Tahmini Süre:** 3 saat  
**Başlayan:** GitHub Copilot + Geliştirici

#### Yapılacak
```
packages/shared/
├── package.json
├── tsconfig.json
├── src/
│   ├── types/
│   │   ├── wallet.ts          # WalletType, Account, Balance
│   │   ├── transaction.ts      # Transaction, Fee, Status
│   │   ├── bridge.ts           # BridgeMessage types
│   │   ├── kohaku.ts           # Shield, Transfer, Unshield types
│   │   ├── ui.ts               # UI state types
│   │   └── index.ts
│   ├── utils/
│   │   ├── ethereum.ts         # Address validation, checksums
│   │   ├── formatting.ts       # Format amount, address, hash
│   │   ├── validation.ts       # Input validation
│   │   ├── constants.ts        # CHAINS, TOKENS, RPC endpoints
│   │   ├── errors.ts           # Error classes
│   │   └── index.ts
│   ├── crypto/
│   │   ├── keys.ts             # Key derivation (BIP32/39/44)
│   │   ├── signing.ts          # Transaction signing prep
│   │   └── index.ts
│   └── index.ts
└── README.md
```

#### Kod Örneği: `types/wallet.ts`
```typescript
// Wallet types tanımlanacak
export type WalletType = 'hardware' | 'software' | 'multi-sig';
export type AccountType = 'standard' | 'custom';
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export interface Account {
  id: string;
  type: AccountType;
  address: string;
  publicKey: string;
  name: string;
  balance: BigNumber;
  chainId: number;
}

export interface WalletState {
  connected: boolean;
  accounts: Account[];
  selectedAccount: Account | null;
  network: NetworkType;
}
```

**Başlamadan Önce:**
- [ ] TREZOR_KOHAKU_INTEGRATION.md'deki type tanımları incele
- [ ] ethers.js v6 type'larını öğren

**Bitirme Kriterleri:**
- [ ] Tüm kritik types tanımlanmış
- [ ] `pnpm build:shared` başarılı
- [ ] `npm run test` çalışıyor (0 test başarısız)

---

### Sıra 4: packages/desktop Setup
**Önem:** 🔴 Kritik  
**Tahmini Süre:** 2 saat  
**Başlayan:** GitHub Copilot + Geliştirici

#### Yapılacak
```
packages/desktop/
├── package.json
├── tsconfig.json
├── webpack.config.js
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts           # Entry point
│   │   ├── window.ts          # Window management
│   │   ├── ipc.ts             # IPC handlers
│   │   └── bridge-client.ts   # Bridge WebSocket
│   ├── preload/
│   │   └── index.ts           # Preload script
│   ├── renderer/
│   │   ├── index.tsx          # React entry
│   │   ├── App.tsx            # Root component
│   │   └── App.css
│   └── types/
│       └── global.d.ts
├── public/
│   ├── index.html
│   └── icon.png
└── README.md
```

**Başlamadan Önce:**
- [ ] PROJECT_STRUCTURE.md'deki desktop yapısını oku
- [ ] Electron 28 dokümentasyonunu gözden geçir

---

### Sıra 5: Bridge (Rust) Setup
**Önem:** 🟡 Yüksek (opsiyonel olarak sonra da yapılabilir)  
**Tahmini Süre:** 2 saat  
**Başlayan:** GitHub Copilot (Rust bilirse)

#### Yapılacak
```
bridge/
├── Cargo.toml
├── src/
│   ├── main.rs                # Entry point
│   ├── lib.rs
│   ├── server.rs              # WebSocket server
│   ├── device.rs              # USB device comm
│   ├── protocol.rs            # Message protocol
│   ├── handlers.rs            # Request handlers
│   └── error.rs               # Error types
├── proto/
│   └── messages.proto         # Protobuf (optional)
└── README.md
```

---

## 🔄 Hafta 1 Takvimi (15-19 Ekim 2025)

| Gün | Saat | Görev | Sorumlu | Durum |
|-----|------|-------|---------|-------|
| **Salı 15 Ekim** | 09:00-11:00 | ARCHITECTURE.md güncelle | 👤 Copilot | ⏳ |
| | 11:00-12:00 | Root package.json + workspace setup | 👤 Copilot | ⏳ |
| | 14:00-17:00 | packages/shared types yazma | 👤 Dev | ⏳ |
| **Çarş. 16 Ekim** | 09:00-11:00 | packages/shared utils yazma | 👤 Dev | ⏳ |
| | 11:00-13:00 | packages/desktop React setup | 👤 Copilot | ⏳ |
| | 14:00-17:00 | packages/desktop Electron main | 👤 Dev | ⏳ |
| **Perş. 17 Ekim** | 09:00-12:00 | Bridge Rust setup | 👤 Dev | ⏳ |
| | 14:00-17:00 | GitHub Actions CI/CD setup | 👤 Copilot | ⏳ |
| **Cum. 18 Ekim** | 09:00-12:00 | İlk build ve test çalıştırma | 👤 Dev | ⏳ |
| | 13:00-17:00 | Trezor bağlantı testi | 👤 Dev | ⏳ |
| **Cmt. 19 Ekim** | Gün | Haftalık review ve refactoring | 👤 Her ikisi | ⏳ |

---

## 📋 Faz 0 Checklist

### Proje Yapısı
- [ ] `pnpm-workspace.yaml` oluşturuldu
- [ ] Root `package.json` oluşturuldu
- [ ] `packages/shared` kuruldu
- [ ] `packages/desktop` kuruldu
- [ ] `bridge` kuruldu
- [ ] TypeScript config'leri hazır

### Type Tanımları
- [ ] `wallet.ts` yazıldı
- [ ] `transaction.ts` yazıldı
- [ ] `bridge.ts` yazıldı
- [ ] `kohaku.ts` yazıldı
- [ ] Utils dosyaları yazıldı

### Electron Setup
- [ ] Main process tamamlandı
- [ ] Preload script kuruldu
- [ ] React entry point hazır
- [ ] webpack.config.js yapılandırıldı

### Bridge (Rust)
- [ ] Cargo.toml kuruldu
- [ ] Main entry point yazıldı
- [ ] WebSocket server skeleton'u hazır
- [ ] USB device communication başlatıldı

### Testing & CI/CD
- [ ] `pnpm test` çalışıyor
- [ ] `pnpm build` başarılı
- [ ] GitHub Actions lint workflow aktif
- [ ] GitHub Actions test workflow aktif

### Trezor Entegrasyonu
- [ ] Trezor Bridge kurulu ve çalışıyor
- [ ] Trezor cihazı test edildi
- [ ] Bridge WebSocket bağlantısı çalışıyor
- [ ] İlk Trezor sorgusu başarılı oldu

---

## 🔗 İlişkili Belgeler

| Belge | Okunması Gereken | Kritiklik |
|-------|-----------------|-----------|
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Geliştirici | 🔴 Kritik |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Geliştirici | 🔴 Kritik |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Her ikisi | 🔴 Kritik |
| [TREZOR_KOHAKU_INTEGRATION.md](TREZOR_KOHAKU_INTEGRATION.md) | Dev | 🟡 Yüksek |
| [SETUP_CI_CD.md](SETUP_CI_CD.md) | DevOps | 🟡 Yüksek |
| [HARDWARE.md](HARDWARE.md) | Dev (Trezor katmanı) | 🟡 Yüksek |

---

## 📞 Kontrol Noktaları

### Checkpoint 1: Proje Yapısı (15 Ekim)
**Soru:** Tüm package.json dosyaları hazır mı?  
**Kontrol:** `pnpm install` hata vermeden tamamlanıyor mu?  
**Onay:** Geliştirici

### Checkpoint 2: Type Tanımları (16 Ekim)
**Soru:** `@cepwallet/shared` built edilebiliyor mi?  
**Kontrol:** `pnpm build:shared` başarılı?  
**Onay:** Geliştirici

### Checkpoint 3: Desktop Setup (17 Ekim)
**Soru:** Electron penceresi açılıyor mu?  
**Kontrol:** `pnpm dev:desktop` çalışıyor?  
**Onay:** Geliştirici

### Checkpoint 4: Bridge WebSocket (17 Ekim)
**Soru:** Bridge ws://localhost:8000'da dinliyor mu?  
**Kontrol:** `cargo run` başarısız olmadan başlıyor?  
**Onay:** Geliştirici

### Checkpoint 5: Trezor Bağlantı (18 Ekim)
**Soru:** Desktop app'ı Trezor'u görebiliyor mu?  
**Kontrol:** "Connect Device" başarılı?  
**Onay:** Geliştirici

### Checkpoint 6: İlk Build (18 Ekim)
**Soru:** Production build alınabiliyor mu?  
**Kontrol:** `pnpm build && pnpm dist` başarılı?  
**Onay:** Her ikisi

---

## 🚨 Risk Yönetimi

| Risk | İhtimal | Etki | Azaltma |
|------|---------|------|---------|
| pnpm workspace linked paketleri | Orta | Yüksek | `pnpm clean && pnpm install` |
| Trezor Bridge version incompatible | Düşük | Yüksek | Test öncesi version kontrol |
| Electron main process crash | Orta | Orta | Error logging + crash handler |
| Rust compile hataları | Yüksek | Düşük | Basit protocol ile başla |
| TypeScript type errors | Orta | Orta | `pnpm type-check` sık çalıştır |

---

## ✨ Başarı Metrikleri

### Hafta 1 Sonu Beklentileri

```
Code Coverage:
├── Type Coverage: 95%+ ✅
├── Unit Test Coverage: 50%+ ⏳
└── Integration Test Coverage: 10%+ ⏳

Build Status:
├── pnpm build: ✅ (0 errors)
├── TypeScript: ✅ (0 errors)
├── Electron dev: ✅ (window açılıyor)
└── Cargo build: ✅ (executable oluşuyor)

Feature Status:
├── Trezor bağlantı: ✅ (test edildi)
├── Account listeleme: ⏳ (WIP)
└── Simple transfer: ⏳ (WIP)

Documentation:
├── ARCHITECTURE.md: ✅ (tamamlandı)
├── API Docs: ⏳ (otomatik generated)
└── Setup Guide: ✅ (tamamlandı)
```

---

## 📞 Sorular ve Cevaplar

**S: pnpm kullanamıyorsam?**  
C: npm kullanabilirsin ama workspace'de problem olabilir. Tavsiye: `npm install -g pnpm`

**S: Trezor cihazım yok?**  
C: Trezor Emulator kullan: [TREZOR_KOHAKU_INTEGRATION.md](TREZOR_KOHAKU_INTEGRATION.md#test-ortamı-trezor-emulator)

**S: Rust öğrenmem gerekli mi?**  
C: İlk faz için hayır. Bridge temel olacak. Faz 2'de deepening önerilir.

**S: Ne zaman ilk release olacak?**  
C: Faz 1 (Desktop Core) bittiğinde alpha: ~6 hafta

---

Bu yol haritasını takip ederek **ilk çalıştırabilir prototip** 2-3 hafta içinde hazır olacak! 🚀

Güncellemeler gerekirse bu dosya düzenlenecektir.

**Son Güncelleme:** 15 Ekim 2025  
**Sonraki Güncelleme:** 19 Ekim 2025 (Haftalık Review)
