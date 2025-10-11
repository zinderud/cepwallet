# Kohaku Entegrasyon Örnek Projesi

Bu klasör, Ethereum Kohaku ekosisteminin CepWallet'a entegrasyonu için örnek kod ve rehberler içerir.

## 📚 Dokümantasyon

- **[Ana Rehber (README.md)](./README.md)** - Genel bakış ve kurulum
- **[Railgun Entegrasyonu](./RAILGUN_INTEGRATION.md)** - Gizlilik protokolü kullanımı
- **[Cüzdan İşlemleri](./WALLET_OPERATIONS.md)** - Temel cüzdan fonksiyonları
- **[Humanizer Kullanımı](./HUMANIZER_USAGE.md)** - İşlem açıklamaları
- **[DeFi Entegrasyonu](./DEFI_INTEGRATION.md)** - DeFi protokolleri
- **[Hata Yönetimi](./ERROR_HANDLING.md)** - Error handling

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükle

```bash
npm install @ethereum/kohaku @ethereum/kohaku-commons ethers@^6.0.0
```

### 2. Temel Kullanım

```typescript
import { RailgunAccount } from '@ethereum/kohaku/railgun'
import { humanize } from '@ambire-common/libs/humanizer'
import { Portfolio } from '@ambire-common/libs/portfolio'

// Railgun hesabı oluştur
const account = RailgunAccount.fromMnemonic(mnemonic, 0, 1n)

// Portföy verilerini al
const portfolio = new Portfolio(fetch, networks, VELCRO_URL)
const data = await portfolio.get({ account, network })

// İşlemleri humanize et
const humanized = await humanize({ accountOp, humanizerInfo, network })
```

## 📁 Proje Yapısı

```
docs/kohaku/
├── README.md                    # Ana dokümantasyon
├── RAILGUN_INTEGRATION.md       # Railgun kullanımı
├── WALLET_OPERATIONS.md         # Cüzdan işlemleri
├── HUMANIZER_USAGE.md          # Humanizer rehberi
├── DEFI_INTEGRATION.md         # DeFi protokolleri
├── ERROR_HANDLING.md           # Hata yönetimi
└── INDEX.md                    # Bu dosya
```

## 🔑 Ana Özellikler

### 1. Gizlilik (Railgun)
- Zero-knowledge proofs ile gizli transferler
- Shield/Unshield işlemleri
- Viewing keys ile salt okunur hesaplar

### 2. Portföy Yönetimi
- Token ve NFT takibi
- DeFi pozisyonları
- Otomatik fiyat güncelleme

### 3. İşlem Humanizer
- Kullanıcı dostu işlem açıklamaları
- 20+ protokol desteği
- Özel modül ekleme

### 4. DeFi Entegrasyonu
- Aave lending/borrowing
- Uniswap V2/V3 swaps
- Cross-chain bridges

## 🎯 Kullanım Senaryoları

### Senaryo 1: Gizli Transfer

```typescript
// 1. Railgun hesabı oluştur
const account = RailgunAccount.fromMnemonic(mnemonic, 0, chainId)

// 2. Token'ları shield et
const shieldTx = await account.generateShieldTx({
  token: USDC_ADDRESS,
  amount: parseUnits('100', 6)
})

// 3. Gizli transfer yap
const transferTx = await account.generateTransferTx({
  to: recipientAddress,
  token: USDC_ADDRESS,
  amount: parseUnits('50', 6)
})

// 4. Unshield et
const unshieldTx = await account.generateUnshieldTx({
  token: USDC_ADDRESS,
  amount: parseUnits('50', 6),
  unshieldTo: normalAddress
})
```

### Senaryo 2: DeFi Lending

```typescript
// 1. Aave'ye supply
const supplyTx = await createSupplyTx({
  token: USDC_ADDRESS,
  amount: parseUnits('1000', 6),
  account: account.addr
})

// 2. Borç al
const borrowTx = await createBorrowTx({
  token: DAI_ADDRESS,
  amount: parseEther('500'),
  interestRateMode: 2 // Variable
})

// 3. Health factor kontrol et
const positions = await defiPositions.getPositions({
  accountAddr: account.addr,
  chainId: 1n
})

const aavePosition = positions.find(p => p.protocol === 'AAVE v3')
console.log('Health Factor:', aavePosition.healthFactor)
```

### Senaryo 3: Swap & Bridge

```typescript
// 1. Quote al
const quote = await swapAndBridge.getQuote({
  fromChainId: 1,        // Ethereum
  toChainId: 137,        // Polygon
  fromToken: USDC_ETH,
  toToken: USDC_POLYGON,
  fromAmount: parseUnits('100', 6)
})

// 2. Route seç ve işlemi yap
const route = quote.routes[0]
await swapAndBridge.executeRoute({ route, account, signer })
```

## 🔐 Güvenlik

### Özel Anahtar Yönetimi

```typescript
// ✅ Doğru
const account = RailgunAccount.fromMnemonic(
  process.env.MNEMONIC!,
  0,
  chainId
)

// ❌ Yanlış - Hardcode etmeyin!
const account = RailgunAccount.fromMnemonic(
  'your twelve word phrase...',
  0,
  chainId
)
```

### RPC Gizliliği

```typescript
// Özel RPC kullanın
const provider = new ethers.JsonRpcProvider(
  process.env.PRIVATE_RPC_URL
)

// Veya lightclient kullanın (önerilen)
import { Helios } from '@a16z/helios'
const helios = new Helios({ network: 'mainnet' })
```

## 📊 Performans İpuçları

1. **Cache Kullanın**: Humanizer metadata'sını cache'leyin
2. **Batch İşlemler**: Birden fazla işlemi tek transaction'da yapın
3. **Lazy Loading**: Portföy verilerini ihtiyaç halinde yükleyin
4. **Optimistic Updates**: UI'ı transaction confirmation'dan önce güncelleyin

## 🐛 Debugging

### Hata Ayıklama Modu

```typescript
// Detaylı loglar için
process.env.DEBUG = 'kohaku:*'

// Sadece hatalar için
process.env.LOG_LEVEL = 'error'
```

### Simulation

```typescript
// İşlemi göndermeden önce simüle edin
const simulation = await accountOpController.simulate({
  accountOp,
  account,
  network
})

if (!simulation.success) {
  console.error('Simulation failed:', simulation.error)
}
```

## 📖 Ek Kaynaklar

- [Kohaku GitHub](https://github.com/ethereum/kohaku)
- [Railgun Docs](https://docs.railgun.org)
- [Ethers.js Docs](https://docs.ethers.org)
- [EIP-4337 Spec](https://eips.ethereum.org/EIPS/eip-4337)

## ❓ SSS

**S: Railgun tüm ağlarda çalışır mı?**
C: Railgun belirli EVM ağlarını destekler. Desteklenen ağları kontrol edin.

**S: Humanizer özel kontratlarımı destekliyor mu?**
C: Evet! Özel humanizer modülü ekleyebilirsiniz. [Rehbere bakın](./HUMANIZER_USAGE.md#özel-modüller).

**S: Gas ücretleri nasıl hesaplanır?**
C: Gas tahmini için `estimateGas` kullanın veya simulation sonuçlarını kontrol edin.

**S: DeFi pozisyonlarım nerede saklanır?**
C: Pozisyonlar on-chain'dedir. Kohaku sadece bunları okur ve gösterir.

## 🤝 Katkıda Bulunma

Hata bulduysanız veya iyileştirme öneriniz varsa lütfen issue açın!

## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakınız.
