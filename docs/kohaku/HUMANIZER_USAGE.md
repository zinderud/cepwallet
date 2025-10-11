# Humanizer Kullanım Rehberi

İşlemleri ve mesajları kullanıcı dostu metinlere dönüştürme kılavuzu.

## İçindekiler

1. [Humanizer Nedir?](#humanizer-nedir)
2. [Temel Kullanım](#temel-kullanım)
3. [Desteklenen Protokoller](#desteklenen-protokoller)
4. [Özel Modüller](#özel-modüller)
5. [Mesaj Humanizer](#mesaj-humanizer)

## Humanizer Nedir?

Humanizer, blockchain işlemlerini ve mesajlarını insan tarafından okunabilir formata çeviren bir kütüphanedir.

### Örnek Dönüşüm

**Ham İşlem:**
```
to: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
data: 0x38ed1739000000000000000000000000000000000000000000000000
```

**Humanized Çıktı:**
```
Swap 100 USDC for approximately 0.05 ETH on Uniswap V2
Minimum received: 0.049 ETH
Deadline: in 20 minutes
```

## Temel Kullanım

### Kurulum

```typescript
import { humanize, getHumanizerInfo } from '@ambire-common/libs/humanizer'

// Humanizer metadata'sını yükle
const humanizerInfo = await getHumanizerInfo(
  fetch,
  'https://humanizer-api.ambire.com'
)
```

### İşlem Humanize Etme

```typescript
import { AccountOp } from '@ambire-common/libs/accountOp'

const accountOp: AccountOp = {
  accountAddr: '0x123...',
  networkId: 'ethereum',
  calls: [{
    to: UNISWAP_ROUTER,
    value: 0n,
    data: swapCalldata
  }],
  meta: null
}

// Humanize et
const result = await humanize({
  accountOp,
  humanizerInfo,
  network,
  chainId: 1n
})

// Sonucu kullan
console.log(result.calls[0].fullVisualization)
```

### Visualization Types

```typescript
type HumanizerVisualization = 
  | { type: 'action', content: string }
  | { type: 'token', address: string, value: bigint, chainId?: bigint }
  | { type: 'address', address: string }
  | { type: 'label', content: string, isBold?: boolean }
  | { type: 'deadline', content: string }
  | { type: 'chain', chainId: bigint }
  | { type: 'link', url: string, content: string }
```

### Visualization'ları Render Etme

```tsx
function RenderVisualization({ viz }: { viz: HumanizerVisualization }) {
  switch (viz.type) {
    case 'action':
      return <strong>{viz.content}</strong>

    case 'token':
      return (
        <TokenDisplay 
          address={viz.address} 
          amount={viz.value}
          chainId={viz.chainId}
        />
      )

    case 'address':
      return <AddressDisplay address={viz.address} />

    case 'label':
      return viz.isBold ? 
        <strong>{viz.content}</strong> : 
        <span>{viz.content}</span>

    case 'deadline':
      return <DeadlineDisplay time={viz.content} />

    case 'chain':
      return <ChainBadge chainId={viz.chainId} />

    case 'link':
      return <a href={viz.url}>{viz.content}</a>

    default:
      return null
  }
}
```

## Desteklenen Protokoller

### 1. Uniswap

```typescript
// Uniswap V2 Swap
{
  fullVisualization: [
    { type: 'action', content: 'Swap on Uniswap V2' },
    { type: 'token', address: USDC, value: parseUnits('100', 6) },
    { type: 'label', content: 'for at least' },
    { type: 'token', address: WETH, value: parseEther('0.049') },
    { type: 'deadline', content: '20 minutes' }
  ]
}

// Uniswap V3 Add Liquidity
{
  fullVisualization: [
    { type: 'action', content: 'Add liquidity to Uniswap V3' },
    { type: 'token', address: USDC, value: parseUnits('1000', 6) },
    { type: 'label', content: 'and' },
    { type: 'token', address: WETH, value: parseEther('0.5') },
    { type: 'label', content: 'Price range: 1800-2000' }
  ]
}
```

### 2. Aave

```typescript
// Aave Supply
{
  fullVisualization: [
    { type: 'action', content: 'Supply to Aave V3' },
    { type: 'token', address: USDC, value: parseUnits('1000', 6) },
    { type: 'label', content: 'on behalf of' },
    { type: 'address', address: account.addr }
  ]
}

// Aave Borrow
{
  fullVisualization: [
    { type: 'action', content: 'Borrow from Aave V3' },
    { type: 'token', address: DAI, value: parseEther('500') },
    { type: 'label', content: 'Interest rate: Variable' }
  ]
}

// Aave Repay
{
  fullVisualization: [
    { type: 'action', content: 'Repay Aave V3 debt' },
    { type: 'token', address: DAI, value: parseEther('500') }
  ]
}
```

### 3. ERC20 Tokens

```typescript
// Token Transfer
{
  fullVisualization: [
    { type: 'action', content: 'Transfer' },
    { type: 'token', address: USDC, value: parseUnits('100', 6) },
    { type: 'label', content: 'to' },
    { type: 'address', address: recipient }
  ]
}

// Token Approval
{
  fullVisualization: [
    { type: 'action', content: 'Grant approval' },
    { type: 'token', address: USDC, value: MaxUint256 },
    { type: 'label', content: 'to' },
    { type: 'address', address: UNISWAP_ROUTER }
  ],
  warnings: [{
    content: 'Unlimited approval. Be careful!',
    level: 'warning'
  }]
}
```

### 4. NFTs (ERC721)

```typescript
// NFT Transfer
{
  fullVisualization: [
    { type: 'action', content: 'Transfer NFT' },
    { type: 'label', content: 'Collection:' },
    { type: 'address', address: NFT_CONTRACT },
    { type: 'label', content: 'Token ID: 1234' },
    { type: 'label', content: 'to' },
    { type: 'address', address: recipient }
  ]
}

// NFT Approval
{
  fullVisualization: [
    { type: 'action', content: 'Approve NFT operator' },
    { type: 'address', address: OPENSEA_CONDUIT },
    { type: 'label', content: 'for collection' },
    { type: 'address', address: NFT_CONTRACT }
  ]
}
```

### 5. ENS Domains

```typescript
// ENS Registration
{
  fullVisualization: [
    { type: 'action', content: 'Register ENS domain' },
    { type: 'label', content: 'example.eth', isBold: true },
    { type: 'label', content: 'for 1 year' },
    { type: 'label', content: 'Commitment required first' }
  ]
}

// ENS Renewal
{
  fullVisualization: [
    { type: 'action', content: 'Renew ENS domain' },
    { type: 'label', content: 'example.eth', isBold: true },
    { type: 'label', content: 'for 2 years' }
  ]
}
```

### 6. LiFi (Swap & Bridge)

```typescript
// Cross-chain swap
{
  fullVisualization: [
    { type: 'action', content: 'Swap and bridge via LiFi' },
    { type: 'token', address: USDC_ETH, value: parseUnits('100', 6) },
    { type: 'label', content: 'on' },
    { type: 'chain', chainId: 1n },
    { type: 'label', content: 'for' },
    { type: 'token', address: USDC_POLYGON, value: parseUnits('99.5', 6) },
    { type: 'label', content: 'on' },
    { type: 'chain', chainId: 137n }
  ]
}
```

## Özel Modüller

### Yeni Protokol Ekleme

```typescript
import { HumanizerCallModule, IrCall } from '@ambire-common/libs/humanizer'

const myProtocolModule: HumanizerCallModule = (
  accountOp,
  calls,
  humanizerMeta,
  options
) => {
  return calls.map(call => {
    // Protokol kontratı değilse, atla
    if (call.to?.toLowerCase() !== MY_PROTOCOL_ADDRESS.toLowerCase()) {
      return call
    }

    const selector = call.data?.slice(0, 10)

    // Stake fonksiyonu
    if (selector === '0xa694fc3a') { // stake(uint256)
      const amount = BigInt('0x' + call.data.slice(10, 74))
      
      return {
        ...call,
        fullVisualization: [
          { type: 'action', content: 'Stake tokens' },
          { type: 'token', address: STAKE_TOKEN, value: amount },
          { type: 'label', content: 'to MyProtocol' }
        ]
      }
    }

    // Unstake fonksiyonu
    if (selector === '0x2e1a7d4d') { // unstake(uint256)
      const amount = BigInt('0x' + call.data.slice(10, 74))
      
      return {
        ...call,
        fullVisualization: [
          { type: 'action', content: 'Unstake tokens' },
          { type: 'token', address: STAKE_TOKEN, value: amount },
          { type: 'label', content: 'from MyProtocol' }
        ]
      }
    }

    // Bilinmeyen fonksiyon
    return {
      ...call,
      fullVisualization: [
        { type: 'action', content: 'Interact with MyProtocol' },
        { type: 'label', content: `Function: ${selector}` }
      ]
    }
  })
}

// Modülü kaydet
registerHumanizerModule('myProtocol', myProtocolModule)
```

### Warning Ekleme

```typescript
const dangerousApprovalModule: HumanizerCallModule = (accountOp, calls) => {
  return calls.map(call => {
    const selector = call.data?.slice(0, 10)
    
    // ERC20 approve kontrolü
    if (selector === '0x095ea7b3') {
      const amount = BigInt('0x' + call.data.slice(74, 138))
      
      // Sınırsız onay uyarısı
      if (amount > parseEther('1000000')) {
        return {
          ...call,
          warnings: [{
            content: 'You are granting unlimited token approval. This is risky!',
            level: 'danger'
          }]
        }
      }
    }

    return call
  })
}
```

## Mesaj Humanizer

### Typed Messages (EIP-712)

```typescript
import { humanizeTypedMessage } from '@ambire-common/libs/humanizer'

const typedMessage = {
  domain: {
    name: 'Uniswap',
    version: '2',
    chainId: 1,
    verifyingContract: PERMIT2_ADDRESS
  },
  types: {
    PermitSingle: [
      { name: 'details', type: 'PermitDetails' },
      { name: 'spender', type: 'address' },
      { name: 'sigDeadline', type: 'uint256' }
    ],
    PermitDetails: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint160' },
      { name: 'expiration', type: 'uint48' },
      { name: 'nonce', type: 'uint48' }
    ]
  },
  primaryType: 'PermitSingle',
  message: {
    details: {
      token: USDC_ADDRESS,
      amount: MaxUint160,
      expiration: Math.floor(Date.now() / 1000) + 86400,
      nonce: 0
    },
    spender: UNISWAP_ROUTER,
    sigDeadline: Math.floor(Date.now() / 1000) + 1800
  }
}

const humanized = humanizeTypedMessage(typedMessage)

// Çıktı:
{
  fullVisualization: [
    { type: 'action', content: 'Permit token approval' },
    { type: 'token', address: USDC_ADDRESS, value: MaxUint160 },
    { type: 'label', content: 'to' },
    { type: 'address', address: UNISWAP_ROUTER },
    { type: 'deadline', content: '30 minutes' }
  ],
  warnings: [{
    content: 'This signature allows unlimited token spending',
    level: 'warning'
  }]
}
```

### Plain Text Messages

```typescript
// Personal sign
const message = 'Sign this message to prove ownership of your wallet'

const humanized = humanizePlainMessage(message)

// Çıktı:
{
  fullVisualization: [
    { type: 'action', content: 'Sign message' },
    { type: 'text', content: message }
  ]
}
```

## Batch İşlemler

### Çoklu İşlem Humanize

```typescript
const batchOp: AccountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [
    // 1. USDC approve
    {
      to: USDC_ADDRESS,
      value: 0n,
      data: approveCalldata
    },
    // 2. Uniswap swap
    {
      to: UNISWAP_ROUTER,
      value: 0n,
      data: swapCalldata
    },
    // 3. Aave supply
    {
      to: AAVE_POOL,
      value: 0n,
      data: supplyCalldata
    }
  ],
  meta: null
}

const humanized = await humanize({ accountOp, humanizerInfo, network })

// Her işlemi ayrı göster
humanized.calls.forEach((call, index) => {
  console.log(`Step ${index + 1}:`)
  call.fullVisualization?.forEach(viz => {
    console.log(renderVisualization(viz))
  })
  console.log()
})

// Çıktı:
// Step 1:
// Grant approval 100 USDC to 0x7a25...
//
// Step 2:
// Swap on Uniswap V2 100 USDC for at least 0.049 ETH
//
// Step 3:
// Supply to Aave V3 0.049 ETH
```

## Post-Processing

### Transaction Summary

```typescript
function generateTransactionSummary(
  humanized: HumanizedAccountOp
): string {
  const actions = humanized.calls
    .map(call => {
      const actionViz = call.fullVisualization?.find(v => v.type === 'action')
      return actionViz?.content || 'Unknown action'
    })

  if (actions.length === 1) {
    return actions[0]
  }

  return `Batch transaction with ${actions.length} steps: ${actions.join(', ')}`
}

// Kullanım
const summary = generateTransactionSummary(humanized)
console.log(summary)
// "Batch transaction with 3 steps: Grant approval, Swap on Uniswap V2, Supply to Aave V3"
```

### Risk Assessment

```typescript
function assessRisk(humanized: HumanizedAccountOp): {
  level: 'low' | 'medium' | 'high'
  reasons: string[]
} {
  let level: 'low' | 'medium' | 'high' = 'low'
  const reasons: string[] = []

  humanized.calls.forEach(call => {
    // Sınırsız onay kontrolü
    const hasUnlimitedApproval = call.fullVisualization?.some(
      viz => viz.type === 'token' && viz.value >= MaxUint256 / 2n
    )
    if (hasUnlimitedApproval) {
      level = 'high'
      reasons.push('Unlimited token approval detected')
    }

    // Warning kontrolü
    call.warnings?.forEach(warning => {
      if (warning.level === 'danger') {
        level = 'high'
        reasons.push(warning.content)
      } else if (warning.level === 'warning' && level !== 'high') {
        level = 'medium'
        reasons.push(warning.content)
      }
    })
  })

  return { level, reasons }
}
```

## Gelişmiş Özellikler

### Custom Token Info

```typescript
// Özel token bilgisi ekle
const customTokens = {
  [MY_TOKEN_ADDRESS.toLowerCase()]: {
    symbol: 'MTK',
    decimals: 18,
    name: 'My Token'
  }
}

const humanizerInfo = {
  ...baseHumanizerInfo,
  knownAddresses: {
    ...baseHumanizerInfo.knownAddresses,
    ...customTokens
  }
}
```

### Known Address Labels

```typescript
// Bilinen adreslere label ekle
const knownLabels = {
  [VITALIK_ADDRESS.toLowerCase()]: {
    name: 'Vitalik Buterin'
  },
  [UNISWAP_ROUTER.toLowerCase()]: {
    name: 'Uniswap V2 Router',
    isSC: { abiName: 'UniswapV2Router02' }
  }
}

const humanizerInfo = {
  ...baseHumanizerInfo,
  knownAddresses: {
    ...baseHumanizerInfo.knownAddresses,
    ...knownLabels
  }
}
```

## Test Etme

### Unit Test Örneği

```typescript
import { describe, test, expect } from 'vitest'

describe('Uniswap Humanizer', () => {
  test('should humanize swap correctly', async () => {
    const accountOp = {
      accountAddr: TEST_ACCOUNT,
      networkId: 'ethereum',
      calls: [{
        to: UNISWAP_ROUTER,
        value: 0n,
        data: swapExactTokensForTokensCalldata
      }]
    }

    const result = await humanize({
      accountOp,
      humanizerInfo: testHumanizerInfo,
      network: ethereumNetwork
    })

    const viz = result.calls[0].fullVisualization
    expect(viz).toBeDefined()
    expect(viz[0]).toMatchObject({
      type: 'action',
      content: expect.stringContaining('Swap')
    })
  })
})
```

## En İyi Uygulamalar

1. **Önizleme Göster**: Her zaman humanize edilmiş işlemi kullanıcıya gösterin
2. **Warning'leri Vurgula**: Tehlikeli işlemleri belirgin gösterin
3. **Fallback**: Humanize edilemeyen işlemler için ham veriyi gösterin
4. **Cache**: Humanizer metadata'sını cache'leyin
5. **Update**: Humanizer modüllerini düzenli güncelleyin

## Sonraki Adımlar

- [DeFi Entegrasyonu](./DEFI_INTEGRATION.md) - DeFi protokolleri ile çalışma
- [Wallet Operations](./WALLET_OPERATIONS.md) - Temel cüzdan fonksiyonları
- [Error Handling](./ERROR_HANDLING.md) - Hata yönetimi
