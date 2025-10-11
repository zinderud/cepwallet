# Cüzdan İşlemleri ve Yönetimi

Bu dokümantasyon, Kohaku Commons kullanarak temel cüzdan işlemlerinin nasıl yapılacağını açıklar.

## İçindekiler

1. [Hesap Yönetimi](#hesap-yönetimi)
2. [Portföy Takibi](#portföy-takibi)
3. [İşlem Humanizer](#i̇şlem-humanizer)
4. [DeFi Pozisyonları](#defi-pozisyonları)
5. [Hata Yönetimi](#hata-yönetimi)

## Hesap Yönetimi

### Account Interface

```typescript
import { Account } from '@ambire-common/interfaces/account'

interface Account {
  addr: string                      // Hesap adresi
  associatedKeys: string[]          // İlişkili anahtarlar
  initialPrivileges: Privilege[]    // İlk yetkiler
  creation: {
    factoryAddr: string
    bytecode: string
    salt: string
  }
  preferences: AccountPreferences   // Kullanıcı tercihleri
}
```

### Hesap Oluşturma

```typescript
import { createAccount } from '@ambire-common/libs/account'

// Yeni hesap oluştur
const account: Account = {
  addr: computedAddress,
  associatedKeys: [signerAddress],
  initialPrivileges: [{
    addr: signerAddress,
    hash: privilegeHash
  }],
  creation: {
    factoryAddr: ACCOUNT_FACTORY,
    bytecode: accountBytecode,
    salt: randomSalt()
  },
  preferences: {
    label: 'Ana Hesabım',
    pfp: profilePictureUrl
  }
}
```

### Anahtar Yönetimi

```typescript
import { Key } from '@ambire-common/interfaces/keystore'

interface Key {
  addr: string
  type: 'internal' | 'external'
  dedicatedToOneSA?: boolean
  meta?: {
    name?: string
    deviceId?: string
  }
}

// Dahili anahtar ekleme
const internalKey: InternalKey = {
  addr: keyAddress,
  type: 'internal',
  dedicatedToOneSA: true,
  meta: {
    name: 'Ana Anahtar',
    isExported: false,
    isHidden: false
  }
}

// Harici anahtar (Ledger, Trezor)
const externalKey: ExternalKey = {
  addr: keyAddress,
  type: 'trezor',
  dedicatedToOneSA: false,
  meta: {
    name: 'Trezor Anahtar',
    deviceId: 'device-123',
    hdPathTemplate: "m/44'/60'/0'/0/{{index}}"
  }
}
```

## Portföy Takibi

### Portfolio Library Kullanımı

```typescript
import { Portfolio } from '@ambire-common/libs/portfolio'

// Portfolio instance oluştur
const portfolio = new Portfolio(
  fetch,                    // Fetch fonksiyonu
  networksWithProviders,    // RPC providers
  'https://velcro-api.com'  // Velcro API endpoint
)

// Portföy verilerini çek
const portfolioData = await portfolio.get({
  account,
  accountStates,
  network,
  useStorage,
  forceUpdate,
  blockTag
})
```

### Token Bakiyeleri

```typescript
interface TokenResult {
  address: string
  symbol: string
  decimals: number
  amount: bigint
  price: number
  value: number                    // USD değeri
  flags: {
    isGasTank?: boolean
    isHidden?: boolean
  }
}

// Token bakiyelerini görüntüle
portfolioData.tokens.forEach(token => {
  console.log(`${token.symbol}: ${formatUnits(token.amount, token.decimals)}`)
  console.log(`USD Value: $${token.value.toFixed(2)}`)
})

// Toplam değer
const totalValue = portfolioData.tokens.reduce(
  (sum, token) => sum + token.value, 
  0
)
console.log(`Total Portfolio: $${totalValue.toFixed(2)}`)
```

### NFT Koleksiyonları

```typescript
interface CollectionResult {
  address: string
  name: string
  symbol: string
  amount: bigint
  collectibles: bigint[]           // Token ID'leri
  totalFloorPrice: number
  isHidden: boolean
}

// NFT koleksiyonlarını görüntüle
portfolioData.collections.forEach(collection => {
  console.log(`${collection.name}:`)
  console.log(`  Token Count: ${collection.collectibles.length}`)
  console.log(`  Floor Price: ${collection.totalFloorPrice}`)
})
```

### Portföy Güncelleme

```typescript
// Otomatik güncelleme
class PortfolioManager {
  private updateInterval: NodeJS.Timer | null = null

  startAutoUpdate(intervalMs: number = 30000) {
    this.updateInterval = setInterval(async () => {
      try {
        const data = await portfolio.get({
          account,
          accountStates,
          network,
          forceUpdate: false
        })
        
        this.onPortfolioUpdate(data)
      } catch (error) {
        console.error('Portfolio update error:', error)
      }
    }, intervalMs)
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  private onPortfolioUpdate(data: PortfolioLibGetResult) {
    // UI'ı güncelle
    this.updateUI(data)
  }
}
```

## İşlem Humanizer

İşlemleri kullanıcı dostu metinlere dönüştürme:

### Temel Kullanım

```typescript
import { getHumanizerInfo, humanize } from '@ambire-common/libs/humanizer'

// Humanizer meta verilerini yükle
const humanizerInfo = await getHumanizerInfo(fetch, HUMANIZER_ENDPOINT)

// İşlemi humanize et
const accountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [{
    to: UNISWAP_ROUTER,
    value: 0n,
    data: swapCalldata
  }],
  meta: null
}

const humanized = await humanize({
  accountOp,
  humanizerInfo,
  network
})
```

### Humanizer Çıktısı

```typescript
interface HumanizerVisualization {
  type: 'action' | 'token' | 'address' | 'label'
  content?: string
  address?: string
  value?: bigint
  chainId?: bigint
}

// Görselleştirmeleri kullan
humanized.calls[0].fullVisualization?.forEach(viz => {
  switch (viz.type) {
    case 'action':
      console.log(`Action: ${viz.content}`)
      break
    case 'token':
      console.log(`Token: ${viz.address}`)
      console.log(`Amount: ${formatUnits(viz.value, decimals)}`)
      break
    case 'address':
      console.log(`Address: ${viz.address}`)
      break
  }
})
```

### Özel Humanizer Modülleri

```typescript
import { HumanizerCallModule } from '@ambire-common/libs/humanizer'

// Uniswap humanizer
const uniswapModule: HumanizerCallModule = (accountOp, calls) => {
  return calls.map(call => {
    if (call.to?.toLowerCase() !== UNISWAP_ROUTER.toLowerCase()) {
      return call
    }

    const selector = call.data.slice(0, 10)
    
    if (selector === '0x38ed1739') { // swapExactTokensForTokens
      return {
        ...call,
        fullVisualization: [
          { type: 'action', content: 'Swap tokens on Uniswap' },
          { type: 'token', address: tokenIn, value: amountIn },
          { type: 'label', content: 'for' },
          { type: 'token', address: tokenOut, value: expectedAmountOut }
        ]
      }
    }

    return call
  })
}
```

## DeFi Pozisyonları

### Pozisyon Takibi

```typescript
import { DefiPositionsController } from '@ambire-common/controllers/defiPositions'

const defiPositions = new DefiPositionsController({
  fetch,
  networks,
  accounts,
  VELCRO_API_URL
})

// Pozisyonları getir
const positions = await defiPositions.getPositions({
  accountAddr: account.addr,
  chainId: 1n
})
```

### Pozisyon Türleri

```typescript
enum AssetType {
  Liquidity,    // Likidite sağlama
  Collateral,   // Teminat
  Borrow,       // Borç
  Reward        // Ödül
}

interface Position {
  protocol: string              // Protokol adı (Aave, Uniswap)
  type: string                 // 'lending', 'liquidity', vb.
  assets: PositionAsset[]
  totalValueUSD: number
  healthFactor?: number        // Lending pozisyonları için
}

interface PositionAsset {
  address: string
  symbol: string
  amount: bigint
  valueUSD: number
  type: AssetType
  apy?: number
}
```

### Aave Pozisyonları

```typescript
// Aave lending pozisyonlarını görüntüle
const aavePositions = positions.filter(p => p.protocol === 'AAVE v3')

aavePositions.forEach(position => {
  console.log('Aave Position:')
  
  // Teminatlar
  const collaterals = position.assets.filter(a => a.type === AssetType.Collateral)
  console.log('Collaterals:')
  collaterals.forEach(asset => {
    console.log(`  ${asset.symbol}: $${asset.valueUSD}`)
  })
  
  // Borçlar
  const borrows = position.assets.filter(a => a.type === AssetType.Borrow)
  console.log('Borrows:')
  borrows.forEach(asset => {
    console.log(`  ${asset.symbol}: $${asset.valueUSD}`)
  })
  
  console.log(`Health Factor: ${position.healthFactor}`)
})
```

### Uniswap V3 Likidite

```typescript
// Uniswap V3 likidite pozisyonları
const uniswapPositions = positions.filter(p => p.protocol === 'Uniswap V3')

uniswapPositions.forEach(position => {
  console.log('Uniswap V3 LP Position:')
  
  position.assets.forEach(asset => {
    console.log(`  ${asset.symbol}: ${formatUnits(asset.amount, 18)}`)
    if (asset.apy) {
      console.log(`  APY: ${asset.apy.toFixed(2)}%`)
    }
  })
})
```

## Hata Yönetimi

### Error Humanizer

```typescript
import { humanizeError } from '@ambire-common/libs/errorHumanizer'

try {
  await sendTransaction(tx)
} catch (error) {
  const humanizedError = humanizeError(error, {
    network,
    humanizerInfo
  })
  
  // Kullanıcı dostu hata mesajı
  console.error(humanizedError.message)
  
  // Orijinal hata nedenleri
  humanizedError.reasons.forEach(reason => {
    console.log(`Reason: ${reason}`)
  })
}
```

### Hata Tipleri

```typescript
enum ErrorType {
  EXECUTION_REVERTED = 'EXECUTION_REVERTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  GAS_LIMIT_EXCEEDED = 'GAS_LIMIT_EXCEEDED',
  NONCE_TOO_LOW = 'NONCE_TOO_LOW',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Hata tipine göre işlem
switch (humanizedError.type) {
  case ErrorType.INSUFFICIENT_FUNDS:
    showMessage('Yetersiz bakiye. Lütfen hesabınıza token ekleyin.')
    break
  case ErrorType.GAS_LIMIT_EXCEEDED:
    showMessage('Gas limiti aşıldı. İşlem çok karmaşık olabilir.')
    break
  case ErrorType.EXECUTION_REVERTED:
    showMessage(`İşlem başarısız: ${humanizedError.message}`)
    break
}
```

### Özel Hata İşleyici

```typescript
class TransactionErrorHandler {
  async handleError(error: any, context: {
    accountOp: AccountOp
    network: Network
  }): Promise<string> {
    // Simulation hatası
    if (error.code === 'CALL_EXCEPTION') {
      const reason = await this.extractRevertReason(error)
      return `İşlem simülasyonu başarısız: ${reason}`
    }
    
    // Gas tahmini hatası
    if (error.code === -32000) {
      return 'Gas tahmini yapılamadı. İşlem muhtemelen başarısız olacak.'
    }
    
    // Network hatası
    if (error.code === 'NETWORK_ERROR') {
      return 'Ağ bağlantısı hatası. Lütfen bağlantınızı kontrol edin.'
    }
    
    // Varsayılan
    return error.message || 'Bilinmeyen bir hata oluştu'
  }

  private async extractRevertReason(error: any): Promise<string> {
    // Revert reason'ı decode et
    if (error.data) {
      try {
        const iface = new ethers.Interface(['error Error(string)'])
        const decoded = iface.parseError(error.data)
        return decoded?.args[0] || 'Unknown reason'
      } catch {
        return error.data
      }
    }
    return 'Unknown reason'
  }
}
```

## Swap ve Bridge

### LiFi Entegrasyonu

```typescript
import { SwapAndBridgeController } from '@ambire-common/controllers/swapAndBridge'

const swapAndBridge = new SwapAndBridgeController({
  fetch,
  LIFI_API_KEY,
  accounts,
  networks
})

// Quote al
const quote = await swapAndBridge.getQuote({
  fromChainId: 1,          // Ethereum
  toChainId: 137,          // Polygon
  fromToken: USDC_ETH,
  toToken: USDC_POLYGON,
  fromAmount: parseUnits('100', 6),
  fromAddress: account.addr
})

// Route seç
const selectedRoute = quote.routes[0]

// İşlemi yap
await swapAndBridge.executeRoute({
  route: selectedRoute,
  account,
  signer
})
```

## Aktivite Takibi

### İşlem Geçmişi

```typescript
import { ActivityController } from '@ambire-common/controllers/activity'

const activity = new ActivityController({
  fetch,
  networks,
  accounts
})

// İşlem geçmişini getir
const history = await activity.getHistory({
  accountAddr: account.addr,
  chainId: 1n,
  page: 0,
  pageSize: 20
})

// İşlemleri göster
history.txns.forEach(txn => {
  console.log(`${txn.timestamp}: ${txn.type}`)
  console.log(`Hash: ${txn.hash}`)
  console.log(`Status: ${txn.status}`)
})
```

## Sonraki Adımlar

- [Humanizer Kullanımı](./HUMANIZER_USAGE.md) - Detaylı humanizer rehberi
- [DeFi Entegrasyonu](./DEFI_INTEGRATION.md) - DeFi protokolleri
- [Railgun Entegrasyonu](./RAILGUN_INTEGRATION.md) - Gizlilik özellikleri
