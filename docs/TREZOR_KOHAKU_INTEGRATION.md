# 🔗 Trezor + Kohaku Entegrasyon Mimarisi

**Versiyon:** 1.0  
**Durum:** Complete  
**Son Güncelleme:** 15 Ekim 2025  

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Mimariyel Katmanlar](#mimarideki-katmanlar)
3. [Entegrasyon Akışları](#entegrasyon-akışları)
4. [Güvenlik ve Gizlilik](#güvenlik-ve-gizlilik)
5. [Kod Implementasyonu](#kod-implementasyonu)
6. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## 🎯 Genel Bakış

CepWallet, iki farklı güvenlik ve gizlilik modelini birleştirir:

- **Trezor (Hardware):** Private key'ler USB cihazında saklanır, hiçbir zaman çıkmaz
- **Kohaku (Software Privacy):** On-chain smart contract'lerde zero-knowledge proof ile gizlilik

Bu dokümantasyon, bu iki sistemi nasıl koordine ettiğini açıklar.

### 🔄 Temel Prensip

```
Kullanıcı İşlemi
    ↓
[Trezor Layer] → İmza sorumluluğu (hardware)
    ↓
[Kohaku Layer] → Gizlilik katmanı (smart contract)
    ↓
Ethereum Ağı
```

---

## 🏗️ Mimarideki Katmanlar

### Layer 1: Trezor Hardware

**Sorumluluklar:**
- Ethereum adresleri türetme (HD wallet)
- İşlem imzalama (ECDSA)
- PIN ve passphrase yönetimi

**Teknik Detaylar:**

```typescript
// BIP-32/39/44 yolu
const hdPath = "m/44'/60'/0'/0/x"
// m: master seed'den
// 44': BIP-44 (HD wallet)
// 60': Ethereum coin type
// 0': First account
// 0': External chain (deposit addresses)
// x: Address index (0, 1, 2, ...)

// Örnek:
const addressPath = "m/44'/60'/0'/0/0"  // İlk Ethereum adresi
const addressPath = "m/44'/60'/0'/0/1"  // İkinci Ethereum adresi
```

**Trezor Çıktıları:**
- Ethereum address: `0x123...abc`
- Public key: `0x04abc...` (uncompressed)
- Chain code: `0xdef...` (BIP-32)
- Signatures: `(v, r, s)` tuples

**Örnek Trezor İşlem İmzası:**

```typescript
import TrezorConnect from '@trezor/connect'

// Adres alma
const addressResult = await TrezorConnect.ethereumGetAddress({
  path: "m/44'/60'/0'/0/0",
  showOnTrezor: false // Silent mode (geliştirme)
})

const myAddress = addressResult.payload.address
// Result: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

// Transaction imzalama
const signResult = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: {
    to: railgunContractAddress,
    value: '0',
    gasLimit: '250000',
    gasPrice: '20000000000',
    nonce: 0,
    chainId: 1,
    data: shieldTransactionData
  }
})

const signedTx = signResult.payload
// Result: { v, r, s } → signed transaction
```

---

### Layer 2: Kohaku Privacy

**Sorumluluklar:**
- Gizlilik hesabı yönetimi (note'ler, nullifier'lar)
- Zero-knowledge proof oluşturma
- Merkle tree senkronizasyonu

**Teknik Detaylar:**

```typescript
// Kohaku Hesabı = Trezor Address + Privacy Keys

interface CepWalletAccount {
  // Layer 1: Trezor
  trezorAddress: string        // Normal Ethereum adresi
  trezorPublicKey: string      // Cihazdan
  
  // Layer 2: Kohaku
  railgunAddress: string       // Railgun v3.0 address
  spendingPrivateKey: string   // Only in app (şifreli)
  viewingPrivateKey: string    // For balance viewing (şifreli)
  spendingPublicKey: string    // On-chain
  
  // State
  notes: Note[]                // Shielded UTXO'lar
  nullifiers: string[]         // Harcanan notes
  merkleSyncBlock: number      // Last synced block
}

interface Note {
  npk: string                  // Nullifier public key
  value: bigint                // Token amount
  tokenAddress: string         // ERC-20 or 0x0 (ETH)
  merkleRoot: string           // Proof içinde
  spent: boolean               // Harcanmış mı?
}
```

**Kohaku Hesap Oluşturma:**

```typescript
import { RailgunAccount } from '@ethereum/kohaku/railgun'

// Trezor'dan adresi aldık
const trezorAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

// Kohaku hesabı ayrı mnemonic'ten veya derivation'dan
// ⚠️ GÜVENLIK: Trezor private key'sini ASLA Kohaku'ya kullanma!

// Seçenek 1: Ayrı seed from trezor mnemonic
const spendingSeed = deriveFromMaster(trezorMnemonic, "railgun/spending")
const viewingSeed = deriveFromMaster(trezorMnemonic, "railgun/viewing")

const railgunAccount = RailgunAccount.fromSeeds(
  spendingSeed,
  viewingSeed,
  chainId
)

const railgunAddress = railgunAccount.getAddress()
// Result: 0zk1q... (Railgun v3.0 format)
```

---

### Layer 3: Application Logic

**Sorumluluklar:**
- İki layer'ı koordine etme
- UI privacy level seçimi
- Transaction routing

```typescript
interface PrivacyLevel {
  PUBLIC: 'public',           // Normal Ethereum (Trezor imzası)
  RAILGUN: 'railgun',         // Shielded (Kohaku proof)
  POOL: 'privacy_pool'        // Compliance-friendly (future)
}

// Wallet service
class CepWallet {
  private trezor: TrezorManager
  private railgun: RailgunService
  private app: AppService

  async sendTransaction(tx: Transaction, privacyLevel: PrivacyLevel) {
    switch (privacyLevel) {
      case 'public':
        return this.sendPublicTx(tx)
      case 'railgun':
        return this.sendShieldedTx(tx)
      case 'privacy_pool':
        return this.sendPoolTx(tx)
    }
  }
}
```

---

## 🔄 Entegrasyon Akışları

### Akış 1: Shield (Token'ları Gizle)

**Amaç:** Normal Ethereum adresinden Railgun pool'a transfer

**Katmanlar:**
- **Layer 1 (Trezor):** İşlem imzalama
- **Layer 2 (Kohaku):** Not oluşturma
- **Layer 3 (App):** Koordinasyon

**Step-by-Step:**

```
┌─────────────────────────────────────────────┐
│  1. User: "Shield 10 ETH"                    │
│     [Privacy Level: RAILGUN seçildi]        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. App: RAILGUN contract'e transfer TX      │
│     oluştur                                  │
│     to: 0xbd9Ad4e259...  (RAILGUN)          │
│     value: 10 ETH                           │
│     data: shieldFunctionCall(...)           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. Trezor: İşlemi imzala                    │
│     User cihazda "APPROVE" basıyor           │
│     Signature: (v, r, s) üretiliyor         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. App: Signed TX'i Ethereum'a gönder      │
│     → Blockchain confirms                    │
│     → 10 ETH RAILGUN contract'te             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. App: Merkle tree güncellemeleri indir   │
│     (log senkronizasyonu)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  6. Kohaku: Note oluştur ve ekle            │
│     Note {                                   │
│       value: 10 ETH                         │
│       token: 0x0 (ETH)                      │
│       merkleRoot: latest                    │
│       spent: false                          │
│     }                                        │
└─────────────────────────────────────────────┘
                    ↓
         ✅ SUCCESS: 10 ETH gizli havuzda
```

**Kod Implementasyonu:**

```typescript
async function shieldTokens(
  tokenAddress: string,
  amount: bigint,
  privacyLevel: 'railgun'
) {
  // 1. Miktar ve token validate et
  const decimals = await getTokenDecimals(tokenAddress)
  const validatedAmount = validateAmount(amount, decimals)

  // 2. RAILGUN contract address'i al
  const railgunContract = RAILGUN_CONTRACTS[chainId]

  // 3. Trezor'dan signature iste
  const shieldTx = {
    to: railgunContract,
    value: tokenAddress === ETH ? validatedAmount : '0',
    data: encodeShieldCall({
      token: tokenAddress,
      amount: validatedAmount,
      shieldTo: railgunAccount.getAddress()
    }),
    gasLimit: 300000,
    gasPrice: await estimateGasPrice(),
    nonce: await getNonce(),
    chainId: 1
  }

  // 4. Trezor ile imzala
  const signResult = await trezor.sign(shieldTx)

  // 5. TX gönder
  const receipt = await provider.sendTransaction(signResult.signedTx)
  await receipt.wait()

  // 6. Logs indir ve senkronize et
  const logs = await getAllLogs(
    provider,
    chainId,
    receipt.blockNumber - 1,
    receipt.blockNumber
  )

  // 7. Railgun account'a ekle
  await railgun.syncWithLogs(logs)
  
  console.log('✅ Shielded successfully')
  return receipt.hash
}
```

---

### Akış 2: Private Transfer (Gizli Transfer)

**Amaç:** Railgun pool içinde transfer (miktar gizli)

**Katmanlar:**
- **Layer 1 (Trezor):** İmza YALNIZCA IF recipient'den Ethereum'a çıkarsa
- **Layer 2 (Kohaku):** ZK proof oluşturma, note harcanması
- **Layer 3 (App):** Koordinasyon

**Step-by-Step:**

```
┌──────────────────────────────────────────────────┐
│  1. User: "Alice'e 5 ETH gönder" (private)      │
│     [Privacy Level: RAILGUN seçildi]            │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│  2. App: Merkle tree'yi indir (en yeni)          │
│     Senkronizasyon kritik!                       │
│     lastMerkleRoot = latest()                    │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│  3. Kohaku: ZK proof oluştur                     │
│     proof = GenerateTransactionProof({           │
│       inputs: [10 ETH note]    (gönderici)      │
│       outputs: [5 ETH (Alice), 5 ETH (change)]  │
│       merkleRoot: lastRoot                       │
│       nullifier: hash(note, root)               │
│     })                                            │
│     ⚠️ ZK: Miktar & alıcı gizli tutulur         │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│  4. App: RAILGUN'a gönder (proof + public data) │
│     TX: RelayerTransfer({                        │
│       proof: 0x...,                              │
│       publicInputs: [root, nullifier, fee]       │
│       encryptedOutput: {...}  (Alice'in key'i)  │
│     })                                            │
│                                                   │
│     ⚠️ KILIT: Miktar & alıcı ON-CHAIN GİZLİ!   │
└──────────────────────────────────────────────────┘
                       ↓
         ✅ SUCCESS: Transfer tamamlandı
            Herkes: "Birileri gizli transfer yaptı"
            Ama: Kimin ne kadar gönderdiği gizli!
```

**Kod Implementasyonu:**

```typescript
async function privateTransfer(
  recipientRailgunAddress: string,
  amount: bigint,
  tokenAddress: string
) {
  // 1. Gönderici'nin unspent notes'larını al
  const unspentNotes = await railgun.getUnspentNotes(
    tokenAddress,
    minimumAmount: amount
  )

  if (unspentNotes.length === 0) {
    throw new Error('Insufficient shielded balance')
  }

  // 2. En yeni Merkle root'u al (senkronizasyon!)
  const latestRoot = await railgun.getMerkleRoot()
  const latestTree = await railgun.getMerkleTree(latestRoot)

  // 3. ZK proof oluştur (snarkjs ile)
  const proof = await railgun.generateTransactionProof({
    spendingKey: railgunAccount.spendingKey,
    viewingKey: railgunAccount.viewingKey,
    
    // Input: Harcayacağı note
    inputs: [
      {
        note: unspentNotes[0],
        merkleIndex: await getMerkleIndex(unspentNotes[0]),
        merkleRoot: latestRoot
      }
    ],
    
    // Output: Recipient + change
    outputs: [
      {
        npk: recipientRailgunAddress,
        value: amount,
        token: tokenAddress,
        memo: 'Private transfer' // Şifreli
      },
      {
        npk: railgunAccount.railgunAddress,
        value: BigInt(unspentNotes[0].value) - amount,
        token: tokenAddress,
        memo: 'Change'
      }
    ]
  })

  // 4. Public inputs hazırla (ZK proof'tan)
  const publicInputs = {
    merkleRoot: latestRoot,
    nullifier: proof.nullifier,
    outCommitments: proof.outCommitments,
    encryptedOutputs: proof.encryptedOutputs
  }

  // 5. RAILGUN contract'e gönder
  const transferTx = {
    to: RAILGUN_CONTRACT,
    value: '0',
    data: encodeTransferCall({
      proof: proof.proof,
      publicInputs,
      relayerFee: parseEther('0.01')
    }),
    gasLimit: 500000,
    gasPrice: await estimateGasPrice(),
    nonce: await getNonce(),
    chainId: 1
  }

  // 6. Trezor imzalama - ONLY eğer relayer ise
  // (Private transfer Trezor'a gitmez normalde)
  // Relayer'ın imzası veya multisig yeterli

  // 7. TX gönder
  const receipt = await provider.sendTransaction(
    await relayer.relayTransaction(transferTx)
  )

  console.log('✅ Private transfer completed')
  return receipt.hash
}
```

**Gizlilik Modeli:**

```
On-Chain Görünen:
✅ RAILGUN contract calldata
✅ Gas cost
✅ Timestamp
❌ Gönderici (gizli)
❌ Alıcı (gizli)
❌ Miktar (gizli)
❌ Token (gizli)
```

---

### Akış 3: Unshield (Gizliyi Açma)

**Amaç:** Railgun pool'dan normal Ethereum adresine çıkma

**Katmanlar:**
- **Layer 1 (Trezor):** İşlem imzalama (opsiyonel - public pool'dan)
- **Layer 2 (Kohaku):** Note harcanması, proof
- **Layer 3 (App):** Koordinasyon

```
┌────────────────────────────────────────┐
│  1. User: "5 ETH withdraw"              │
│     [Privacy Level: RAILGUN]            │
│     Target: 0xMyNormalAddress           │
└────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────┐
│  2. Kohaku: Unshield proof oluştur     │
│     proof = GenerateWithdrawalProof({  │
│       note: 5 ETH                       │
│       merkleRoot: latest                │
│       to: 0xMyNormalAddress             │
│     })                                   │
└────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────┐
│  3. App: RAILGUN'a unshield TX gönder  │
│     TX: Unshield({                     │
│       proof,                            │
│       to: 0xMyNormalAddress             │
│     })                                   │
│                                         │
│     ⚠️ TO address artık PUBLIC!         │
└────────────────────────────────────────┘
                   ↓
        ✅ SUCCESS: 5 ETH withdrew
           Normal adreste ETH var
           (Block explorer'da görünür!)
```

**Kod Implementasyonu:**

```typescript
async function unshieldTokens(
  tokenAddress: string,
  amount: bigint,
  targetAddress: string  // Normal Ethereum address
) {
  // 1. Unspent note al
  const note = await railgun.selectNoteForWithdrawal(
    tokenAddress,
    amount
  )

  if (!note) {
    throw new Error('No suitable note found')
  }

  // 2. Merkle proof oluştur
  const merkleRoot = await railgun.getMerkleRoot()
  const merkleProof = await railgun.generateMerkleProof(note, merkleRoot)

  // 3. ZK proof oluştur
  const withdrawalProof = await railgun.generateWithdrawalProof({
    note,
    merkleRoot,
    merkleProof,
    to: targetAddress,
    fee: parseEther('0.01')
  })

  // 4. Contract call hazırla
  const unshieldTx = {
    to: RAILGUN_CONTRACT,
    value: '0',
    data: encodeUnshieldCall({
      proof: withdrawalProof.proof,
      publicInputs: {
        merkleRoot: withdrawalProof.merkleRoot,
        nullifier: withdrawalProof.nullifier,
        token: tokenAddress,
        amount,
        to: targetAddress
      }
    }),
    gasLimit: 300000,
    gasPrice: await estimateGasPrice(),
    nonce: await getNonce(),
    chainId: 1
  }

  // 5. TX gönder
  const receipt = await provider.sendTransaction(unshieldTx)
  await receipt.wait()

  // 6. Logs senkronize et
  const logs = await getAllLogs(provider, chainId, receipt.blockNumber - 1, receipt.blockNumber)
  await railgun.syncWithLogs(logs)

  console.log(`✅ Unshielded ${amount} to ${targetAddress}`)
  return receipt.hash
}
```

---

## 🔐 Güvenlik ve Gizlilik

### Trezor Layer Güvenliği

#### ✅ Korunan
- Private key'ler USB cihazında
- İmzalar cihazda yapılır
- Kullanıcı cihazda onaylıyor (2FA gibi)

#### ⚠️ Dış Katmanlara Verilen Sorumluluk
- Doğru adrese transfer sağlama
- Gas price makul kontrol
- Network mismatch kontrol

**Best Practice:**

```typescript
// Transaction approval'dan önce HER ZAMAN:
function validateBeforeSigning(tx: Transaction) {
  // 1. Network check
  if (tx.chainId !== expectedChainId) {
    throw new Error('Wrong network!')
  }

  // 2. Address whitelist (trust)
  const trustedAddresses = [
    RAILGUN_CONTRACT,
    UNISWAP_ROUTER,
    AAVE_LENDING_POOL
  ]
  if (!trustedAddresses.includes(tx.to)) {
    // Show warning to user
    console.warn('Unknown contract!')
  }

  // 3. Gas price sanity
  const maxGasPrice = await getRecommendedGasPrice() * 2n
  if (BigInt(tx.gasPrice) > maxGasPrice) {
    throw new Error('Gas price too high!')
  }

  // 4. Value check
  if (tx.value > '0' && tx.to !== MAINNET_CONTRACTS) {
    throw new Error('Unusual ETH transfer!')
  }
}
```

---

### Kohaku Layer Güvenliği

#### ✅ Korunan
- Miktar ve alıcı gizli (ZK proof)
- Merkle tree ile history gizli
- Nullifier ile double-spend engelleme

#### ⚠️ Açık Noktalar
1. **Spending Key Yönetimi**
   - App'te şifreli saklanmalı (libsodium)
   - Backup kullanıcının sorumluluğu

2. **RPC Gizliliği**
   - Özel endpoint kullanılmalı
   - Log senkronizasyonu batch'te

3. **Merkle Tree Sync**
   - Tüm log'ları indirmeli (sybil koruması)
   - Kendi node'u idealdir

**Best Practice:**

```typescript
// Spending key şifrelemesi
import sodium from 'libsodium.js'

class EncryptedRailgunAccount {
  private encryptedSpendingKey: string
  private masterPassword: string

  encryptSpendingKey(spendingKey: string, password: string) {
    const key = sodium.crypto_pwhash(
      sodium.crypto_secretbox_KEYBYTES,
      password,
      sodium.randombytes(sodium.crypto_pwhash_SALTBYTES),
      sodium.crypto_pwhash_OPSLIMIT_MODERATE,
      sodium.crypto_pwhash_MEMLIMIT_MODERATE,
      sodium.crypto_pwhash_ALG_DEFAULT
    )

    this.encryptedSpendingKey = sodium.crypto_secretbox(
      spendingKey,
      sodium.randombytes(sodium.crypto_secretbox_NONCEBYTES),
      key
    )
  }

  decryptSpendingKey(password: string): string {
    // ...decryption...
  }
}
```

---

### RPC Gizliliği

**Sorun:** Regular RPC'ye loglama şu bilgileri verir:
- Hangi account'lar sorgulanıyor
- Ne kadar ETH var?
- Token balances
- Smart contract interactions

**Çözüm:**

```typescript
// Seçenek 1: Private RPC (Alchemy, Infura)
const privateProvider = new ethers.JsonRpcProvider(
  'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  { privacy: 'private' }
)

// Seçenek 2: Özel düğüm (ultra-private)
const ownNodeProvider = new ethers.JsonRpcProvider(
  'http://localhost:8545'
)

// Seçenek 3: VPN tunnel
const vpnProvider = new ethers.JsonRpcProvider(
  'https://eth-rpc.cepwallet.app', // Kendi relay'i
  { proxy: true }
)

// Seçenek 4: Tor/Proxy
const torProvider = new ethers.JsonRpcProvider(
  'http://localhost:9050' // Tor SOCKS5
)
```

---

## 💻 Kod Implementasyonu

### Manager Class Mimarisi

```typescript
// Unified manager - her iki katmanı koordine eder
class CepWalletManager {
  private trezor: TrezorManager
  private railgun: RailgunService
  private provider: ethers.Provider

  // Trezor adresini initialize et
  async initTrezor(): Promise<void> {
    await this.trezor.connect()
    this.trezorAddress = await this.trezor.getAddress()
  }

  // Kohaku hesabını initialize et
  async initRailgun(mnemonic: string): Promise<void> {
    this.railgun = new RailgunService(mnemonic, this.chainId)
    this.railgunAddress = this.railgun.getAddress()
  }

  // Privacy seçimiyle transfer
  async send(
    recipient: string,
    amount: bigint,
    tokenAddress: string,
    privacyLevel: 'public' | 'railgun' | 'pool'
  ): Promise<string> {
    switch (privacyLevel) {
      case 'public':
        return this.sendPublic(recipient, amount, tokenAddress)
      case 'railgun':
        return this.sendRailgun(recipient, amount, tokenAddress)
      case 'pool':
        return this.sendPrivacyPool(recipient, amount, tokenAddress)
    }
  }

  // Cascade privacy: kullanıcı seçimi sonra otomatik fallback
  async smartSend(
    recipient: string,
    amount: bigint,
    tokenAddress: string,
    preferredLevel: 'public' | 'railgun' = 'railgun'
  ): Promise<string> {
    try {
      // Kişinin tercihini dene
      return await this.send(recipient, amount, tokenAddress, preferredLevel)
    } catch (error) {
      // Failover: bir level aşağısına git
      console.warn(`${preferredLevel} failed, falling back...`)
      
      if (preferredLevel === 'railgun') {
        return this.send(recipient, amount, tokenAddress, 'public')
      }
      
      throw error
    }
  }
}
```

---

## ❓ Sık Sorulan Sorular

### S: Trezor'u kaybettiğim ne olur?
**C:** Trezor'ları sadece normal Ethereum adreslerine transfer etmek için kullanıyorsanız, recovery phrase ile başka bir cihazdan kurtarabilirsiniz. Kohaku private key'leriniz ayrı şifrelenmiş yedek almalı tutulmalıdır.

### S: Kohaku'da double-spend mümkün mü?
**C:** Hayır. Nullifier mekanizması engeller. Her harcanan note bir nullifier oluşturur ve on-chain registry'de kaydedilir.

### S: RPC provider'a gizlilik konusunda güvenmeli miyim?
**C:** Hayır. İdeal olarak kendi Ethereum light client'ı çalıştırmalısınız veya privacy-focused provider (Alchemy, Infura private relay) kullanmalısınız.

### S: Trezor'un network seçimi nasıl kontrol edilir?
**C:** TrezorConnect manifest'inde. CepWallet'ın yalnızca Ethereum'a izin vermesini ayarlayabilirsiniz.

### S: Privacy level'ı değiştirebilir miyim?
**C:** Evet, anytime. Ancak bir shield işlemi zaten yapıldıysa, o pool'da kalmış tokens'ı o şekilde kullanmaya devam edersiniz.

### S: Multi-signature desteği var mı?
**C:** Faz 2'de planlıyoruz. Şu an sadece single-sig Trezor+Kohaku destekleniyor.

### S: Passphrase ile daha fazla account açabilir miyim?
**C:** Evet! Trezor passphrase feature'ıyla. Her passphrase farklı bir complete wallet tree'si oluşturur. CepWallet'ta passsphrase başına yeni Kohaku hesabı da oluştur.

---

## 🔗 İlgili Dokümantasyon

- [docs/ARCHITECTURE.md](ARCHITECTURE.md) - Teknik mimari
- [docs/kohaku/RAILGUN_INTEGRATION.md](kohaku/RAILGUN_INTEGRATION.md) - Railgun detayları
- [docs/trezor/README.md](trezor/README.md) - Trezor yapısı
- [docs/SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md) - Güvenlik rehberi
- [docs/PRIVACY_FEATURES.md](PRIVACY_FEATURES.md) - Privacy özellikleri

---

**Versiyon Tarihi:** 15 Ekim 2025  
**Sonraki Güncelleme:** Q1 2026 (Multi-sig entegrasyonu)

