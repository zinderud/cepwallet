# Railgun Gizlilik Protokolü Entegrasyonu

Railgun, zero-knowledge proof teknolojisi kullanarak Ethereum'da gizli işlemler yapmanızı sağlar.

## İçindekiler

1. [Railgun Nedir?](#railgun-nedir)
2. [Temel Kavramlar](#temel-kavramlar)
3. [Hesap Oluşturma](#hesap-oluşturma)
4. [Gizli İşlemler](#gizli-i̇şlemler)
5. [Bakiye Sorgulama](#bakiye-sorgulama)

## Railgun Nedir?

Railgun, Ethereum üzerinde çalışan bir gizlilik protokolüdür:

- **Zero-Knowledge Proofs**: İşlem detaylarını gizler
- **Merkle Tree**: İşlem geçmişini kriptografik olarak saklar
- **Smart Contract**: On-chain gizlilik sağlar
- **Multi-chain**: Birden fazla EVM ağını destekler

### Nasıl Çalışır?

```
1. Shield (Gizle)    → Token'ları gizli havuza koy
2. Transfer (Aktar)  → Gizli havuz içinde transfer yap
3. Unshield (Aç)     → Token'ları gizli havuzdan çıkar
```

## Temel Kavramlar

### 1. Notes (Notlar)

Railgun'da her işlem bir "note" (not) oluşturur. Notlar şunları içerir:
- Token adresi
- Miktar
- Sahip bilgisi (şifreli)

```typescript
interface Note {
  npk: bigint              // Nullifier public key
  token: TokenData
  value: bigint
  merkleRoot: string
}
```

### 2. Merkle Tree

İşlem geçmişini tutan kriptografik ağaç yapısı:

```typescript
class MerkleTree {
  leaves: string[]         // Yapraklar (notlar)
  root: string            // Ağaç kökü
  depth: number           // Ağaç derinliği
}
```

### 3. Nullifiers

Çift harcamayı önleyen benzersiz tanımlayıcılar:

```typescript
// Bir not harcanınca nullifier oluşturulur
const nullifier = hash(note.npk, note.merkleRoot)
```

## Hesap Oluşturma

### Yöntem 1: Mnemonic'ten Oluşturma

```typescript
import { RailgunAccount } from '@ethereum/kohaku/railgun'

// Mnemonic'ten hesap oluştur
const account = RailgunAccount.fromMnemonic(
  'your twelve word mnemonic phrase here...',
  0,        // Hesap indeksi
  1n        // Chain ID (1n = Ethereum Mainnet)
)

// Hesap adresi
console.log('Railgun Address:', account.getAddress())
```

### Yöntem 2: Özel Anahtarlardan Oluşturma

```typescript
const account = RailgunAccount.fromPrivateKeys(
  spendingPrivateKey,
  viewingPrivateKey,
  chainId,
  ethPrivateKey  // Shield işlemleri için (opsiyonel)
)
```

### Hesap Yapısı

```typescript
class RailgunAccount {
  // Harcama için kullanılan node
  private spendingNode: WalletNode
  
  // Görüntüleme için kullanılan node
  private viewingNode: WalletNode
  
  // Merkle tree'ler (her ağ için)
  private merkleTrees: MerkleTree[]
  
  // Not defterleri
  private noteBooks: NoteBook[]
}
```

## Gizli İşlemler

### 1. Shield (Token'ları Gizle)

Token'ları normal Ethereum'dan Railgun'a transfer et:

```typescript
// Shield işlemi için TX oluştur
const shieldTx = await account.generateShieldTx({
  token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: ethers.parseUnits('100', 6),  // 100 USDC
  shieldTo: account.getAddress()
})

// TX'i gönder
const provider = new ethers.JsonRpcProvider(RPC_URL)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
const receipt = await wallet.sendTransaction(shieldTx)
await receipt.wait()
```

### 2. Gizli Transfer

Railgun içinde gizli transfer yap:

```typescript
const transferTx = await account.generateTransferTx({
  to: recipientRailgunAddress,
  token: USDC_ADDRESS,
  amount: ethers.parseUnits('50', 6),  // 50 USDC
  
  // Opsiyonel: Memo ekle (şifreli)
  memo: 'Payment for services'
})

const receipt = await wallet.sendTransaction(transferTx)
```

### 3. Unshield (Token'ları Geri Al)

Token'ları Railgun'dan normal Ethereum'a transfer et:

```typescript
const unshieldTx = await account.generateUnshieldTx({
  token: USDC_ADDRESS,
  amount: ethers.parseUnits('25', 6),
  unshieldTo: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Normal Ethereum adresi
  
  // Unshield ücreti
  fee: ethers.parseUnits('0.1', 6)
})

const receipt = await wallet.sendTransaction(unshieldTx)
```

## Bakiye Sorgulama

### Toplam Bakiye

```typescript
// Senkronizasyonu bekle
await account.syncWithLogs(logs)

// Toplam bakiye (tüm token'lar)
const totalBalance = account.getTotalBalance()

console.log('Total Balance:', ethers.formatEther(totalBalance))
```

### Token Bazlı Bakiye

```typescript
// Belirli bir token için bakiye
const usdcBalance = await account.getBalance(
  merkleTree,
  {
    tokenType: 0,  // ERC20
    tokenAddress: USDC_ADDRESS,
    tokenSubID: 0n
  }
)

console.log('USDC Balance:', ethers.formatUnits(usdcBalance, 6))
```

### Harcanmamış Notlar

```typescript
// Kullanılabilir notları getir
const unspentNotes = await account.getUnspentNotes(
  merkleTree,
  tokenData
)

console.log('Unspent notes:', unspentNotes.length)
unspentNotes.forEach(note => {
  console.log(`Note value: ${ethers.formatUnits(note.value, 6)}`)
})
```

## Log Senkronizasyonu

Railgun hesabınızın güncel olması için blockchain log'larını senkronize etmelisiniz:

```typescript
import { getAllLogs } from '@ethereum/kohaku/railgun'

// RPC provider
const provider = new ethers.JsonRpcProvider(RPC_URL)

// Log'ları çek
const logs = await getAllLogs(
  provider,
  chainId,
  startBlock,
  endBlock
)

// Hesabı senkronize et
await account.syncWithLogs(logs, false)

console.log('Account synced!')
```

### Otomatik Senkronizasyon

```typescript
// Periyodik senkronizasyon
setInterval(async () => {
  const latestBlock = await provider.getBlockNumber()
  const logs = await getAllLogs(
    provider,
    chainId,
    lastSyncedBlock,
    latestBlock
  )
  
  await account.syncWithLogs(logs)
  lastSyncedBlock = latestBlock
}, 10000) // Her 10 saniyede bir
```

## İşlem Geçmişi

### Gelen İşlemler

```typescript
// Gelen notları getir
const receivedNotes = account.noteBooks[0].notes.filter(
  note => note.isReceived
)

receivedNotes.forEach(note => {
  console.log(`Received: ${ethers.formatUnits(note.value, 6)} USDC`)
  console.log(`From: ${note.sender}`) // Şifreli
})
```

### Giden İşlemler

```typescript
// Giden notları getir
const sentNotes = account.noteBooks[0].notes.filter(
  note => note.isSpent
)

sentNotes.forEach(note => {
  console.log(`Sent: ${ethers.formatUnits(note.value, 6)} USDC`)
})
```

## Gelişmiş Özellikler

### 1. Batch İşlemler

Birden fazla işlemi tek bir transaction'da yapın:

```typescript
const batchTx = await account.generateBatchTransferTx([
  {
    to: recipient1,
    token: USDC_ADDRESS,
    amount: ethers.parseUnits('10', 6)
  },
  {
    to: recipient2,
    token: DAI_ADDRESS,
    amount: ethers.parseEther('20')
  }
])
```

### 2. Adapt Contracts

Railgun içinden DeFi protokolleri ile etkileşim:

```typescript
const swapTx = await account.generateAdaptTx({
  adaptContract: UNISWAP_ADAPTER,
  adaptParams: encodeSwapParams({
    tokenIn: USDC_ADDRESS,
    tokenOut: DAI_ADDRESS,
    amountIn: ethers.parseUnits('100', 6)
  })
})
```

### 3. Viewing Keys

Hesabınızı salt okunur olarak paylaşın:

```typescript
// Viewing key'i al
const viewingKey = account.getShareableViewingKey()

// Başka bir yerde viewing key ile hesap oluştur
const viewOnlyAccount = RailgunAccount.fromViewingKey(
  viewingKey,
  chainId
)

// Sadece bakiye görüntülenebilir, harcama yapılamaz
const balance = await viewOnlyAccount.getBalance(merkleTree, tokenData)
```

## Güvenlik Notları

1. **Özel Anahtarlar**: Spending ve viewing anahtarlarınızı güvende tutun
2. **RPC Gizliliği**: Özel RPC kullanın veya VPN/Tor kullanın
3. **Log Senkronizasyonu**: Düzenli senkronizasyon yapın
4. **Gas Ücretleri**: Unshield ve transfer işlemleri gas ücreti gerektirir
5. **Nullifier Kontrolü**: Çift harcamayı önlemek için nullifier'ları kontrol edin

## Örnek Uygulama

Tam çalışan bir örnek:

```typescript
import { RailgunAccount, getAllLogs } from '@ethereum/kohaku/railgun'
import { ethers } from 'ethers'

async function main() {
  // 1. Hesap oluştur
  const account = RailgunAccount.fromMnemonic(
    process.env.MNEMONIC!,
    0,
    1n
  )
  
  // 2. Provider ayarla
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
  
  // 3. Log'ları senkronize et
  const logs = await getAllLogs(provider, 1n, 18000000, 'latest')
  await account.syncWithLogs(logs)
  
  // 4. Bakiye kontrol et
  const balance = account.getTotalBalance()
  console.log('Balance:', ethers.formatEther(balance))
  
  // 5. Transfer yap
  const tx = await account.generateTransferTx({
    to: RECIPIENT_ADDRESS,
    token: USDC_ADDRESS,
    amount: ethers.parseUnits('10', 6)
  })
  
  // 6. TX gönder
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
  const receipt = await wallet.sendTransaction(tx)
  await receipt.wait()
  
  console.log('Transfer completed!')
}

main()
```

## Sonraki Adımlar

- [Cüzdan İşlemleri](./WALLET_OPERATIONS.md) - Temel cüzdan fonksiyonları
- [DeFi Entegrasyonu](./DEFI_INTEGRATION.md) - Railgun ile DeFi kullanımı
- [Privacy Best Practices](./PRIVACY_FEATURES.md) - Gizlilik en iyi uygulamaları
