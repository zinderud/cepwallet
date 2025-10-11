# Ethereum Kohaku Projeleri Entegrasyon Rehberi

Bu dokümantasyon, Ethereum Kohaku ekosisteminin üç ana bileşenini (kohaku, kohaku-commons ve kohaku-extension) CepWallet uygulamasında nasıl kullanabileceğinizi detaylı olarak açıklar.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Proje Yapıları](#proje-yapıları)
3. [Kurulum ve Entegrasyon](#kurulum-ve-entegrasyon)
4. [Kullanım Örnekleri](#kullanım-örnekleri)
5. [Güvenlik ve Gizlilik](#güvenlik-ve-gizlilik)

## Genel Bakış

### Kohaku Nedir?

Kohaku, Ethereum ekosistemi için gizlilik odaklı araçlar sunan bir projedir. Üç ana bileşenden oluşur:

1. **@ethereum/kohaku** - Temel gizlilik protokolleri (Railgun, Privacy Pools)
2. **@ethereum/kohaku-commons** - Paylaşılan yardımcı kütüphaneler ve tipler
3. **@ethereum/kohaku-extension** - Tarayıcı uzantısı implementasyonu

### Neden Kohaku?

- ✅ **Gizlilik**: Zero-knowledge proof teknolojisi ile işlem gizliliği
- ✅ **Modülerlik**: Bağımsız kullanılabilen paketler
- ✅ **ERC-4337 Desteği**: Account Abstraction desteği
- ✅ **Multi-chain**: Birden fazla EVM ağını destekler

## Proje Yapıları

### 1. @ethereum/kohaku (Ana Paket)

```
packages/
├── railgun/          # Railgun gizlilik protokolü
│   ├── src/
│   │   ├── railgun-lib/      # Temel kütüphane
│   │   ├── railgun-logic/    # İş mantığı
│   │   └── account-utils/    # Hesap yardımcıları
│   └── README.md
└── privacy-pools/    # Privacy Pools protokolü
    └── src/
```

**Ana Bileşenler:**
- **Railgun Smart Wallet**: Gizli işlemler için akıllı sözleşme
- **Merkle Tree**: İşlem geçmişini gizleyen veri yapısı
- **Zero-Knowledge Proofs**: Gizlilik kanıtları

### 2. @ethereum/kohaku-commons (Ortak Kütüphaneler)

```
src/
├── libs/
│   ├── humanizer/          # İnsan okunabilir işlem açıklamaları
│   ├── portfolio/          # Portföy yönetimi
│   ├── accountOp/          # Hesap operasyonları
│   ├── defiPositions/      # DeFi pozisyonları
│   └── errorHumanizer/     # Hata mesajlarını anlaşılır hale getirme
├── interfaces/             # TypeScript arayüzleri
└── consts/                 # Sabitler
```

**Özellikler:**
- İşlem humanizer (işlemleri açıklayan)
- Token ve NFT yönetimi
- DeFi pozisyon takibi
- Hata yönetimi

### 3. @ethereum/kohaku-extension (Tarayıcı Uzantısı)

```
src/
├── web/
│   ├── extension-services/
│   │   ├── background/     # Arka plan servisleri
│   │   ├── inpage/         # Sayfa içi provider
│   │   └── messengers/     # Mesajlaşma katmanı
│   └── modules/
│       ├── hardware-wallet/ # Donanım cüzdan desteği
│       ├── auth/           # Kimlik doğrulama
│       └── transfer/       # Transfer modülü
└── legends/                # Legends ödül sistemi
```

**Temel Özellikler:**
- EIP-1193 uyumlu Ethereum Provider
- Ledger, Trezor donanım cüzdan desteği
- ERC-4337 Account Abstraction
- Swap & Bridge entegrasyonu

## Kurulum ve Entegrasyon

### Adım 1: Paketleri Yükleme

```bash
# Ana Kohaku paketi
npm install @ethereum/kohaku

# Ortak kütüphaneler
npm install @ethereum/kohaku-commons

# Uzantı bileşenleri (opsiyonel)
npm install @ethereum/kohaku-extension
```

### Adım 2: Temel Bağımlılıklar

```bash
npm install ethers@^6.0.0
npm install @lifi/sdk
npm install @ambire-common/account
```

### Adım 3: TypeScript Yapılandırması

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Kullanım Örnekleri

Detaylı kullanım örnekleri için aşağıdaki dokümanlara bakınız:

- [Railgun Entegrasyonu](./RAILGUN_INTEGRATION.md)
- [Cüzdan İşlemleri](./WALLET_OPERATIONS.md)
- [Humanizer Kullanımı](./HUMANIZER_USAGE.md)
- [DeFi Entegrasyonu](./DEFI_INTEGRATION.md)

## Güvenlik ve Gizlilik

### Railgun Gizlilik Modeli

```typescript
// Gizli transfer örneği
import { RailgunAccount } from '@ethereum/kohaku/railgun'

const account = RailgunAccount.fromMnemonic(
  mnemonic,
  accountIndex,
  chainId
)

// İşlem gizliliği sağlanır
await account.transfer({
  to: recipientAddress,
  amount: transferAmount,
  token: tokenAddress
})
```

### En İyi Uygulamalar

1. **Anahtar Yönetimi**: Özel anahtarları asla düz metin olarak saklamayın
2. **RPC Gizliliği**: Özel RPC endpoint kullanın veya lightclient kullanın
3. **İşlem Doğrulama**: Tüm işlemleri kullanıcıya göstermeden önce humanize edin
4. **Hata Yönetimi**: Kullanıcı dostu hata mesajları kullanın

## Sonraki Adımlar

1. [Railgun Entegrasyonu Rehberi](./RAILGUN_INTEGRATION.md) - Gizli işlemler nasıl yapılır
2. [Cüzdan İşlemleri Rehberi](./WALLET_OPERATIONS.md) - Temel cüzdan fonksiyonları
3. [Humanizer Kullanım Rehberi](./HUMANIZER_USAGE.md) - İşlemleri anlaşılır hale getirme
4. [DeFi Entegrasyon Rehberi](./DEFI_INTEGRATION.md) - DeFi protokolleri ile çalışma

## Kaynaklar

- [Kohaku GitHub](https://github.com/ethereum/kohaku)
- [Kohaku Commons GitHub](https://github.com/ethereum/kohaku-commons)
- [Kohaku Extension GitHub](https://github.com/ethereum/kohaku-extension)
- [Railgun Dokümantasyonu](https://docs.railgun.org)

## Lisans

Bu projeler MIT lisansı altında dağıtılmaktadır.
