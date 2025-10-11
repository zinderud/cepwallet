# Hata Yönetimi ve Error Handling

Blockchain işlemlerinde karşılaşılan hataları kullanıcı dostu şekilde yönetme rehberi.

## İçindekiler

1. [Error Humanizer](#error-humanizer)
2. [Hata Tipleri](#hata-tipleri)
3. [Simulation Hataları](#simulation-hataları)
4. [Gas Tahmini Hataları](#gas-tahmini-hataları)
5. [En İyi Uygulamalar](#en-i̇yi-uygulamalar)

## Error Humanizer

### Temel Kullanım

```typescript
import { humanizeError } from '@ambire-common/libs/errorHumanizer'

try {
  await provider.sendTransaction(tx)
} catch (error) {
  const humanized = humanizeError(error, {
    network,
    humanizerInfo,
    isUserOp: false
  })
  
  // Kullanıcıya göster
  console.error(humanized.message)
  
  // Detaylar
  humanized.reasons.forEach(reason => {
    console.log(`Reason: ${reason}`)
  })
}
```

### ErrorHumanizerError Interface

```typescript
interface ErrorHumanizerError {
  reasons: string[]        // Hata nedenleri listesi
  message: string         // Ana hata mesajı (kullanıcı dostu)
  isExactMatch?: boolean  // Tam eşleşme bulundu mu?
}
```

## Hata Tipleri

### 1. EXECUTION_REVERTED

İşlem simülasyonunda başarısız oldu:

```typescript
enum ErrorType {
  EXECUTION_REVERTED = 'EXECUTION_REVERTED'
}

// Örnek hata
{
  type: 'EXECUTION_REVERTED',
  reason: 'ERC20: transfer amount exceeds balance',
  message: 'İşlem yetersiz bakiye nedeniyle başarısız oldu'
}
```

**Yaygın Nedenler:**
- Yetersiz token bakiyesi
- Onay eksikliği
- Slippage toleransı aşıldı
- Deadline geçti
- Kontrat mantık hatası

**Örnek İşleyici:**

```typescript
function handleExecutionReverted(error: any): string {
  const reason = error.reason?.toLowerCase() || ''
  
  if (reason.includes('insufficient')) {
    return 'Yetersiz bakiye. Lütfen bakiyenizi kontrol edin.'
  }
  
  if (reason.includes('allowance') || reason.includes('approved')) {
    return 'Token onayı gerekli. Lütfen önce onay verin.'
  }
  
  if (reason.includes('slippage')) {
    return 'Slippage toleransı aşıldı. Slippage değerini artırın veya tekrar deneyin.'
  }
  
  if (reason.includes('expired') || reason.includes('deadline')) {
    return 'İşlem süresi doldu. Lütfen tekrar deneyin.'
  }
  
  // Genel mesaj
  return `İşlem başarısız: ${error.reason || 'Bilinmeyen neden'}`
}
```

### 2. INSUFFICIENT_FUNDS

Yetersiz ETH bakiyesi (gas için):

```typescript
{
  type: 'INSUFFICIENT_FUNDS',
  message: 'Yetersiz ETH bakiyesi. Gas ücreti için yeterli ETH ekleyin.'
}
```

**Çözümler:**
- Gas Tank kullan (sponsorship)
- Hesaba ETH ekle
- Gas fiyatını düşür

```typescript
function handleInsufficientFunds(account: Account): string {
  const gasTankBalance = account.gasTankBalance || 0n
  
  if (gasTankBalance > 0n) {
    return 'Gas Tank bakiyenizi kullanmayı deneyin veya hesabınıza ETH ekleyin.'
  }
  
  return 'İşlem için yeterli ETH yok. Lütfen hesabınıza ETH ekleyin.'
}
```

### 3. NONCE_TOO_LOW

Nonce çakışması:

```typescript
{
  type: 'NONCE_TOO_LOW',
  message: 'İşlem zaten gönderilmiş. Lütfen bekleyin.'
}
```

**Çözüm:**

```typescript
async function handleNonceTooLow(
  provider: Provider,
  account: string
): Promise<bigint> {
  // Güncel nonce'u al
  const currentNonce = await provider.getTransactionCount(account, 'latest')
  
  // Pending işlemleri kontrol et
  const pendingNonce = await provider.getTransactionCount(account, 'pending')
  
  if (pendingNonce > currentNonce) {
    console.log('Pending işlemler var. Lütfen bekleyin.')
    return pendingNonce
  }
  
  return currentNonce
}
```

### 4. GAS_LIMIT_EXCEEDED

Gas limiti aşıldı:

```typescript
{
  type: 'GAS_LIMIT_EXCEEDED',
  message: 'İşlem çok karmaşık. Gas limitini artırın veya işlemi basitleştirin.'
}
```

### 5. NETWORK_ERROR

Ağ bağlantı hatası:

```typescript
{
  type: 'NETWORK_ERROR',
  message: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.'
}
```

**Retry Mekanizması:**

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error.code !== 'NETWORK_ERROR' || i === maxRetries - 1) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, i)
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error('Max retries exceeded')
}
```

## Simulation Hataları

### AccountOp Simulation

```typescript
import { AccountOpController } from '@ambire-common/controllers/accountOp'

try {
  const simulation = await accountOpController.simulate({
    accountOp,
    account,
    network
  })
  
  if (simulation.success) {
    console.log('Simulation successful!')
  } else {
    console.error('Simulation failed:', simulation.error)
  }
} catch (error) {
  const humanized = humanizeError(error, {
    network,
    humanizerInfo
  })
  
  console.error(humanized.message)
}
```

### Simulation Sonuçlarını Kullanma

```typescript
interface SimulationResult {
  success: boolean
  error?: string
  gasUsed?: bigint
  changes?: StateChange[]
  warnings?: string[]
}

function handleSimulationResult(result: SimulationResult) {
  if (!result.success) {
    // Hata mesajı göster
    showError(result.error || 'Simulation failed')
    return
  }
  
  // Uyarıları göster
  result.warnings?.forEach(warning => {
    showWarning(warning)
  })
  
  // State değişikliklerini göster
  result.changes?.forEach(change => {
    console.log(`${change.type}: ${change.description}`)
  })
  
  // Gas tahminini göster
  if (result.gasUsed) {
    const gasCost = result.gasUsed * gasPrice
    console.log(`Estimated gas cost: ${formatEther(gasCost)} ETH`)
  }
}
```

## Gas Tahmini Hataları

### Gas Estimation

```typescript
async function estimateGasWithFallback(
  provider: Provider,
  tx: TransactionRequest
): Promise<bigint> {
  try {
    // Normal gas tahmini
    const estimate = await provider.estimateGas(tx)
    
    // %20 buffer ekle
    return estimate * 120n / 100n
    
  } catch (error: any) {
    console.warn('Gas estimation failed:', error.message)
    
    // Fallback: Sabit değer
    return 200000n
  }
}
```

### Gas Fiyatı Kontrolü

```typescript
async function checkGasPrice(
  provider: Provider,
  maxGasPrice: bigint = parseUnits('100', 'gwei')
): Promise<void> {
  const feeData = await provider.getFeeData()
  
  const currentGasPrice = feeData.maxFeePerGas || feeData.gasPrice || 0n
  
  if (currentGasPrice > maxGasPrice) {
    throw new Error(
      `Gas price too high: ${formatUnits(currentGasPrice, 'gwei')} gwei ` +
      `(max: ${formatUnits(maxGasPrice, 'gwei')} gwei)`
    )
  }
}
```

## Custom Error Handler

### Kapsamlı Hata İşleyici

```typescript
class TransactionErrorHandler {
  constructor(
    private network: Network,
    private humanizerInfo: HumanizerInfo
  ) {}

  async handle(error: any, context?: {
    accountOp?: AccountOp
    isUserOp?: boolean
  }): Promise<{
    title: string
    message: string
    suggestions: string[]
    canRetry: boolean
  }> {
    // Error humanizer kullan
    const humanized = humanizeError(error, {
      network: this.network,
      humanizerInfo: this.humanizerInfo,
      isUserOp: context?.isUserOp
    })
    
    // Hata tipine göre öneriler
    const suggestions: string[] = []
    let canRetry = false
    
    switch (error.code) {
      case 'EXECUTION_REVERTED':
        suggestions.push('İşlem detaylarını kontrol edin')
        suggestions.push('Bakiye ve onayları doğrulayın')
        canRetry = true
        break
        
      case 'INSUFFICIENT_FUNDS':
        suggestions.push('Hesabınıza ETH ekleyin')
        suggestions.push('Gas Tank kullanmayı deneyin')
        canRetry = false
        break
        
      case 'NONCE_TOO_LOW':
        suggestions.push('Pending işlemlerin tamamlanmasını bekleyin')
        canRetry = true
        break
        
      case 'NETWORK_ERROR':
        suggestions.push('İnternet bağlantınızı kontrol edin')
        suggestions.push('Farklı bir RPC endpoint deneyin')
        canRetry = true
        break
        
      case 'TIMEOUT':
        suggestions.push('İşlem zaman aşımına uğradı')
        suggestions.push('Tekrar deneyin')
        canRetry = true
        break
        
      default:
        suggestions.push('Daha sonra tekrar deneyin')
        canRetry = true
    }
    
    return {
      title: this.getErrorTitle(error.code),
      message: humanized.message,
      suggestions,
      canRetry
    }
  }
  
  private getErrorTitle(code: string): string {
    const titles: Record<string, string> = {
      'EXECUTION_REVERTED': 'İşlem Başarısız',
      'INSUFFICIENT_FUNDS': 'Yetersiz Bakiye',
      'NONCE_TOO_LOW': 'İşlem Çakışması',
      'NETWORK_ERROR': 'Bağlantı Hatası',
      'TIMEOUT': 'Zaman Aşımı',
      'GAS_LIMIT_EXCEEDED': 'Gas Limiti Aşıldı'
    }
    
    return titles[code] || 'Bir Hata Oluştu'
  }
  
  async extractRevertReason(error: any): Promise<string> {
    if (!error.data) return 'Unknown reason'
    
    try {
      // Standard Error(string) decode
      const iface = new Interface(['error Error(string)'])
      const decoded = iface.parseError(error.data)
      return decoded?.args[0] || error.data
    } catch {
      // Custom error decode
      return error.data
    }
  }
}
```

### Kullanım Örneği

```typescript
const errorHandler = new TransactionErrorHandler(network, humanizerInfo)

async function sendTransaction(tx: TransactionRequest) {
  try {
    const receipt = await provider.sendTransaction(tx)
    return receipt
  } catch (error) {
    const handled = await errorHandler.handle(error, {
      isUserOp: false
    })
    
    // UI'da göster
    showErrorDialog({
      title: handled.title,
      message: handled.message,
      suggestions: handled.suggestions,
      actions: handled.canRetry ? ['Retry', 'Cancel'] : ['OK']
    })
    
    throw error
  }
}
```

## Specific Error Patterns

### Slippage Hatası

```typescript
function handleSlippageError(error: any): {
  newSlippage: number
  message: string
} {
  const currentSlippage = 0.5 // %0.5
  const suggestedSlippage = Math.min(currentSlippage + 0.5, 5.0) // Max %5
  
  return {
    newSlippage: suggestedSlippage,
    message: `Slippage toleransı %${currentSlippage} iken işlem başarısız oldu. ` +
             `%${suggestedSlippage} ile tekrar denemek ister misiniz?`
  }
}
```

### Deadline Hatası

```typescript
function createNewDeadline(minutes: number = 20): number {
  return Math.floor(Date.now() / 1000) + (minutes * 60)
}

function handleDeadlineError(): {
  newDeadline: number
  message: string
} {
  return {
    newDeadline: createNewDeadline(30), // 30 dakika
    message: 'İşlem süresi doldu. Yeni deadline ile tekrar deneyin.'
  }
}
```

### Approval Hatası

```typescript
async function handleApprovalError(
  token: string,
  spender: string,
  amount: bigint
): Promise<Call> {
  const erc20Interface = new Interface([
    'function approve(address spender, uint256 amount)'
  ])
  
  return {
    to: token,
    value: 0n,
    data: erc20Interface.encodeFunctionData('approve', [spender, amount])
  }
}
```

## En İyi Uygulamalar

### 1. Hataları Loglama

```typescript
class ErrorLogger {
  static log(error: any, context?: any) {
    const errorData = {
      timestamp: new Date().toISOString(),
      code: error.code,
      message: error.message,
      stack: error.stack,
      context
    }
    
    // Console
    console.error('[ERROR]', errorData)
    
    // Analytics (opsiyonel)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(errorData)
    }
  }
  
  private static sendToAnalytics(data: any) {
    // Sentry, Datadog, vb.
  }
}
```

### 2. Hata Kategorileri

```typescript
enum ErrorCategory {
  USER_ERROR = 'USER_ERROR',           // Kullanıcı hatası
  NETWORK_ERROR = 'NETWORK_ERROR',     // Ağ hatası
  CONTRACT_ERROR = 'CONTRACT_ERROR',   // Kontrat hatası
  SYSTEM_ERROR = 'SYSTEM_ERROR'        // Sistem hatası
}

function categorizeError(error: any): ErrorCategory {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return ErrorCategory.USER_ERROR
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return ErrorCategory.NETWORK_ERROR
  }
  
  if (error.code === 'EXECUTION_REVERTED') {
    return ErrorCategory.CONTRACT_ERROR
  }
  
  return ErrorCategory.SYSTEM_ERROR
}
```

### 3. Kullanıcı Bildirimleri

```tsx
function ErrorNotification({ error }: { error: any }) {
  const errorHandler = useErrorHandler()
  const [details, setDetails] = useState<any>(null)
  
  useEffect(() => {
    errorHandler.handle(error).then(setDetails)
  }, [error])
  
  if (!details) return null
  
  return (
    <div className={`error-notification ${getCategoryClass(error)}`}>
      <h3>{details.title}</h3>
      <p>{details.message}</p>
      
      {details.suggestions.length > 0 && (
        <div className="suggestions">
          <h4>Öneriler:</h4>
          <ul>
            {details.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      {details.canRetry && (
        <button onClick={onRetry}>Tekrar Dene</button>
      )}
    </div>
  )
}
```

### 4. Graceful Degradation

```typescript
async function fetchWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await primaryFn()
  } catch (primaryError) {
    console.warn('Primary method failed, trying fallback:', primaryError)
    
    try {
      return await fallbackFn()
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return defaultValue
    }
  }
}

// Kullanım
const balance = await fetchWithFallback(
  () => portfolio.getBalance(account),           // Primary
  () => provider.getBalance(account.addr),       // Fallback
  0n                                             // Default
)
```

## Sonraki Adımlar

- [Testing Strategies](./TESTING.md) - Test stratejileri
- [Advanced Patterns](./ADVANCED_PATTERNS.md) - İleri seviye patternler
- [Performance](./PERFORMANCE.md) - Performans optimizasyonu
