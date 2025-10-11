# DeFi Protokolleri Entegrasyonu

Kohaku Commons kullanarak DeFi protokolleri ile etkileşim rehberi.

## İçindekiler

1. [Desteklenen Protokoller](#desteklenen-protokoller)
2. [Aave Lending](#aave-lending)
3. [Uniswap DEX](#uniswap-dex)
4. [Cross-chain Bridge](#cross-chain-bridge)
5. [Pozisyon Yönetimi](#pozisyon-yönetimi)

## Desteklenen Protokoller

Kohaku aşağıdaki DeFi protokollerini destekler:

- **Aave V3** - Lending & Borrowing
- **Uniswap V2/V3** - Token Swaps
- **SushiSwap** - DEX
- **Curve** - Stablecoin Swaps
- **LiFi** - Cross-chain Bridges
- **1inch** - Swap Aggregator
- **Pancakeswap** - BSC DEX

## Aave Lending

### Supply (Yatırma)

```typescript
import { Interface } from 'ethers'

const AAVE_POOL = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'

const aaveInterface = new Interface([
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)'
])

// Supply işlemi oluştur
const supplyCalldata = aaveInterface.encodeFunctionData('supply', [
  USDC_ADDRESS,              // Yatırılacak token
  parseUnits('1000', 6),     // Miktar: 1000 USDC
  account.addr,               // Kimden
  0                          // Referral code
])

const accountOp: AccountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [{
    to: AAVE_POOL,
    value: 0n,
    data: supplyCalldata
  }]
}

// Humanize edilmiş çıktı:
// "Supply to Aave V3 1,000 USDC on behalf of 0x123..."
```

### Borrow (Borç Alma)

```typescript
const borrowCalldata = aaveInterface.encodeFunctionData('borrow', [
  DAI_ADDRESS,               // Borç alınacak token
  parseEther('500'),         // Miktar: 500 DAI
  2,                         // Faiz tipi: 2 = Variable
  0,                         // Referral code
  account.addr               // Kimden
])

const accountOp: AccountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [{
    to: AAVE_POOL,
    value: 0n,
    data: borrowCalldata
  }]
}

// Humanize edilmiş çıktı:
// "Borrow from Aave V3 500 DAI (Variable interest rate)"
```

### Repay (Borç Ödeme)

```typescript
const repayCalldata = aaveInterface.encodeFunctionData('repay', [
  DAI_ADDRESS,               // Ödenecek borç token'ı
  parseEther('100'),         // Miktar: 100 DAI
  2,                         // Faiz tipi: Variable
  account.addr               // Kimden
])

const accountOp: AccountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [
    // 1. DAI approve
    {
      to: DAI_ADDRESS,
      value: 0n,
      data: approveCalldata
    },
    // 2. Repay
    {
      to: AAVE_POOL,
      value: 0n,
      data: repayCalldata
    }
  ]
}

// Humanize edilmiş çıktı:
// Step 1: "Grant approval 100 DAI to Aave Pool"
// Step 2: "Repay Aave V3 debt 100 DAI"
```

### Withdraw (Çekme)

```typescript
const withdrawCalldata = aaveInterface.encodeFunctionData('withdraw', [
  USDC_ADDRESS,              // Çekilecek token
  parseUnits('500', 6),      // Miktar: 500 USDC
  account.addr               // Kime
])

const accountOp: AccountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [{
    to: AAVE_POOL,
    value: 0n,
    data: withdrawCalldata
  }]
}

// Humanize edilmiş çıktı:
// "Withdraw from Aave V3 500 USDC"
```

### Health Factor Kontrolü

```typescript
import { DefiPositionsController } from '@ambire-common/controllers/defiPositions'

// DeFi pozisyonlarını getir
const positions = await defiPositions.getPositions({
  accountAddr: account.addr,
  chainId: 1n
})

// Aave pozisyonunu bul
const aavePosition = positions.find(p => p.protocol === 'AAVE v3')

if (aavePosition?.healthFactor) {
  console.log('Health Factor:', aavePosition.healthFactor)
  
  if (aavePosition.healthFactor < 1.2) {
    console.warn('⚠️ Health factor is low! Risk of liquidation!')
  } else if (aavePosition.healthFactor < 1.5) {
    console.warn('⚠️ Health factor is getting low')
  } else {
    console.log('✓ Health factor is safe')
  }
}
```

## Uniswap DEX

### Swap (V2)

```typescript
const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const uniV2Interface = new Interface([
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)'
])

// Swap işlemi
const swapCalldata = uniV2Interface.encodeFunctionData('swapExactTokensForTokens', [
  parseUnits('100', 6),      // 100 USDC
  parseEther('0.049'),       // Min 0.049 ETH
  [USDC_ADDRESS, WETH_ADDRESS], // Path
  account.addr,               // Alıcı
  Math.floor(Date.now() / 1000) + 1200  // 20 dakika deadline
])

const accountOp: AccountOp = {
  accountAddr: account.addr,
  networkId: 'ethereum',
  calls: [
    // 1. USDC approve
    {
      to: USDC_ADDRESS,
      value: 0n,
      data: approveCalldata
    },
    // 2. Swap
    {
      to: UNISWAP_V2_ROUTER,
      value: 0n,
      data: swapCalldata
    }
  ]
}

// Humanize edilmiş çıktı:
// "Swap on Uniswap V2 100 USDC for at least 0.049 ETH"
```

### Add Liquidity (V2)

```typescript
const addLiquidityCalldata = uniV2Interface.encodeFunctionData('addLiquidity', [
  USDC_ADDRESS,              // Token A
  WETH_ADDRESS,              // Token B
  parseUnits('1000', 6),     // 1000 USDC
  parseEther('0.5'),         // 0.5 ETH
  parseUnits('990', 6),      // Min 990 USDC
  parseEther('0.495'),       // Min 0.495 ETH
  account.addr,               // Alıcı
  Math.floor(Date.now() / 1000) + 1200
])

// Humanize edilmiş çıktı:
// "Add liquidity to Uniswap V2 1,000 USDC and 0.5 ETH"
```

### Uniswap V3 Swap

```typescript
const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

const uniV3Interface = new Interface([
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96))'
])

const params = {
  tokenIn: USDC_ADDRESS,
  tokenOut: WETH_ADDRESS,
  fee: 3000,                 // 0.3% fee tier
  recipient: account.addr,
  deadline: Math.floor(Date.now() / 1000) + 1200,
  amountIn: parseUnits('100', 6),
  amountOutMinimum: parseEther('0.049'),
  sqrtPriceLimitX96: 0n
}

const swapCalldata = uniV3Interface.encodeFunctionData('exactInputSingle', [params])

// Humanize edilmiş çıktı:
// "Swap on Uniswap V3 100 USDC for at least 0.049 ETH (0.3% fee pool)"
```

### Uniswap V3 Liquidity Position

```typescript
const UNISWAP_V3_NFT_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

const nftManagerInterface = new Interface([
  'function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline))'
])

const mintParams = {
  token0: USDC_ADDRESS,
  token1: WETH_ADDRESS,
  fee: 3000,
  tickLower: -887220,        // Price range lower bound
  tickUpper: -887210,        // Price range upper bound
  amount0Desired: parseUnits('1000', 6),
  amount1Desired: parseEther('0.5'),
  amount0Min: parseUnits('990', 6),
  amount1Min: parseEther('0.495'),
  recipient: account.addr,
  deadline: Math.floor(Date.now() / 1000) + 1200
}

const mintCalldata = nftManagerInterface.encodeFunctionData('mint', [mintParams])

// Humanize edilmiş çıktı:
// "Add liquidity to Uniswap V3 1,000 USDC and 0.5 ETH
//  Price range: 1800-2000"
```

## Cross-chain Bridge

### LiFi Bridge & Swap

```typescript
import { SwapAndBridgeController } from '@ambire-common/controllers/swapAndBridge'

const swapAndBridge = new SwapAndBridgeController({
  fetch,
  LIFI_API_KEY: process.env.LIFI_API_KEY,
  accounts,
  networks
})

// Quote al (Ethereum -> Polygon)
const quote = await swapAndBridge.getQuote({
  fromChainId: 1,                    // Ethereum
  toChainId: 137,                    // Polygon
  fromToken: USDC_ETH_ADDRESS,
  toToken: USDC_POLYGON_ADDRESS,
  fromAmount: parseUnits('100', 6),
  fromAddress: account.addr,
  toAddress: account.addr
})

console.log('Routes found:', quote.routes.length)

// En iyi route'u seç
const bestRoute = quote.routes[0]
console.log('Bridge:', bestRoute.steps[0].toolDetails.name)
console.log('Estimated time:', bestRoute.estimatedTime, 'seconds')
console.log('Expected output:', formatUnits(bestRoute.toAmount, 6), 'USDC')

// İşlemi gerçekleştir
const result = await swapAndBridge.executeRoute({
  route: bestRoute,
  account,
  signer
})

console.log('Transaction hash:', result.hash)

// Humanize edilmiş çıktı:
// "Swap and bridge via LiFi 100 USDC on Ethereum for 99.5 USDC on Polygon"
```

### Bridge İzleme

```typescript
// Active bridge işlemlerini izle
const activeBridges = await swapAndBridge.getActiveRoutes(account.addr)

activeBridges.forEach(route => {
  console.log(`Bridge: ${route.bridge}`)
  console.log(`From: ${route.fromChain} -> To: ${route.toChain}`)
  console.log(`Status: ${route.status}`)
  console.log(`Amount: ${formatUnits(route.amount, route.decimals)}`)
})

// Status'lara göre filtreleme
const pendingBridges = activeBridges.filter(r => r.status === 'PENDING')
const completedBridges = activeBridges.filter(r => r.status === 'DONE')
```

## Pozisyon Yönetimi

### DeFi Pozisyonları Getirme

```typescript
import { DefiPositionsController } from '@ambire-common/controllers/defiPositions'

const defiCtrl = new DefiPositionsController({
  fetch,
  networks,
  accounts,
  VELCRO_API_URL
})

// Tüm pozisyonları getir
const allPositions = await defiCtrl.getPositions({
  accountAddr: account.addr,
  chainId: 1n
})

console.log('Total DeFi positions:', allPositions.length)
```

### Pozisyon Detayları

```typescript
interface Position {
  protocol: string              // 'AAVE v3', 'Uniswap V3', etc.
  type: string                 // 'lending', 'liquidity', etc.
  iconUrl: string
  siteUrl: string
  chainId: bigint
  assets: PositionAsset[]
  totalValueUSD: number
  healthFactor?: number
}

interface PositionAsset {
  address: string
  symbol: string
  decimals: number
  amount: bigint
  valueUSD: number
  type: AssetType              // Liquidity, Collateral, Borrow, Reward
  apy?: number
  priceUSD?: number
}

// Lending pozisyonları
const lendingPositions = allPositions.filter(p => p.type === 'lending')

lendingPositions.forEach(position => {
  console.log(`\n${position.protocol} on ${position.chainId}`)
  
  // Teminatlar
  const collaterals = position.assets.filter(a => a.type === AssetType.Collateral)
  console.log('Collaterals:')
  collaterals.forEach(asset => {
    console.log(`  ${asset.symbol}: ${formatUnits(asset.amount, asset.decimals)} ($${asset.valueUSD})`)
    if (asset.apy) console.log(`    APY: ${asset.apy.toFixed(2)}%`)
  })
  
  // Borçlar
  const borrows = position.assets.filter(a => a.type === AssetType.Borrow)
  console.log('Borrows:')
  borrows.forEach(asset => {
    console.log(`  ${asset.symbol}: ${formatUnits(asset.amount, asset.decimals)} ($${asset.valueUSD})`)
    if (asset.apy) console.log(`    APY: ${asset.apy.toFixed(2)}%`)
  })
  
  // Health factor
  if (position.healthFactor) {
    console.log(`Health Factor: ${position.healthFactor.toFixed(2)}`)
  }
  
  console.log(`Total Value: $${position.totalValueUSD.toFixed(2)}`)
})
```

### Likidite Pozisyonları

```typescript
// Uniswap V3 likidite pozisyonları
const liquidityPositions = allPositions.filter(
  p => p.type === 'liquidity' && p.protocol === 'Uniswap V3'
)

liquidityPositions.forEach(position => {
  console.log(`\nUniswap V3 LP Position:`)
  
  position.assets.forEach(asset => {
    console.log(`  ${asset.symbol}: ${formatUnits(asset.amount, asset.decimals)}`)
    console.log(`    Value: $${asset.valueUSD.toFixed(2)}`)
    if (asset.apy) {
      console.log(`    APY: ${asset.apy.toFixed(2)}%`)
    }
  })
  
  console.log(`Total LP Value: $${position.totalValueUSD.toFixed(2)}`)
})
```

### Ödül Takibi

```typescript
// Claimable rewards
const rewardAssets = allPositions
  .flatMap(p => p.assets)
  .filter(a => a.type === AssetType.Reward && a.amount > 0n)

if (rewardAssets.length > 0) {
  console.log('\nClaimable Rewards:')
  rewardAssets.forEach(reward => {
    console.log(`  ${reward.symbol}: ${formatUnits(reward.amount, reward.decimals)}`)
    console.log(`    Value: $${reward.valueUSD.toFixed(2)}`)
  })
  
  const totalRewardValue = rewardAssets.reduce((sum, r) => sum + r.valueUSD, 0)
  console.log(`Total Rewards: $${totalRewardValue.toFixed(2)}`)
}
```

## Gelişmiş Örnekler

### Yield Farming Stratejisi

```typescript
async function autoCompound(account: Account) {
  // 1. Pozisyonları kontrol et
  const positions = await defiCtrl.getPositions({
    accountAddr: account.addr,
    chainId: 1n
  })
  
  // 2. Ödülleri topla
  const rewards = positions
    .flatMap(p => p.assets)
    .filter(a => a.type === AssetType.Reward && a.valueUSD > 10) // $10'dan fazla
  
  if (rewards.length === 0) {
    console.log('No rewards to compound')
    return
  }
  
  // 3. Claim ve swap işlemleri oluştur
  const calls: Call[] = []
  
  for (const reward of rewards) {
    // Claim
    calls.push({
      to: reward.protocol,
      value: 0n,
      data: claimRewardCalldata(reward)
    })
    
    // Swap reward -> USDC
    calls.push({
      to: UNISWAP_ROUTER,
      value: 0n,
      data: swapCalldata(reward.address, USDC_ADDRESS, reward.amount)
    })
  }
  
  // 4. USDC'yi Aave'ye yatır
  calls.push({
    to: AAVE_POOL,
    value: 0n,
    data: supplyCalldata(USDC_ADDRESS, totalUsdcAmount)
  })
  
  // 5. İşlemi gönder
  const accountOp: AccountOp = {
    accountAddr: account.addr,
    networkId: 'ethereum',
    calls
  }
  
  await executeAccountOp(accountOp)
  console.log('Auto-compound completed!')
}
```

### Risk Yönetimi

```typescript
async function checkRiskLevel(account: Account) {
  const positions = await defiCtrl.getPositions({
    accountAddr: account.addr,
    chainId: 1n
  })
  
  for (const position of positions) {
    if (position.type !== 'lending') continue
    
    const { healthFactor, protocol } = position
    
    if (!healthFactor) continue
    
    if (healthFactor < 1.2) {
      // Tehlikeli seviye - acil aksiyon gerekli
      console.error(`🚨 CRITICAL: ${protocol} health factor is ${healthFactor.toFixed(2)}`)
      
      // Otomatik repay önerisi
      const borrows = position.assets.filter(a => a.type === AssetType.Borrow)
      const largestBorrow = borrows.sort((a, b) => b.valueUSD - a.valueUSD)[0]
      
      console.log(`Suggestion: Repay ${largestBorrow.symbol} to increase health factor`)
      
    } else if (healthFactor < 1.5) {
      // Uyarı seviyesi
      console.warn(`⚠️ WARNING: ${protocol} health factor is ${healthFactor.toFixed(2)}`)
      console.log('Consider adding more collateral or repaying debt')
      
    } else {
      // Güvenli
      console.log(`✓ ${protocol} health factor is safe: ${healthFactor.toFixed(2)}`)
    }
  }
}
```

## Sonraki Adımlar

- [Error Handling](./ERROR_HANDLING.md) - Hata yönetimi
- [Advanced Patterns](./ADVANCED_PATTERNS.md) - İleri seviye patternler
- [Testing](./TESTING.md) - Test stratejileri
