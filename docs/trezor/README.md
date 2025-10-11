# Trezor Entegrasyonu Dokümantasyonu

## İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Trezor Suite Mimarisi](#trezor-suite-mimarisi)
3. [Trezor Firmware Mimarisi](#trezor-firmware-mimarisi)
4. [Kurulum ve Bağımlılıklar](#kurulum-ve-bağımlılıklar)
5. [Dokümantasyon Yapısı](#dokümantasyon-yapısı)

## Proje Genel Bakış

Trezor ekosistemi, donanım cüzdan cihazları için gelişmiş bir altyapı sunar. İki ana bileşenden oluşur:

### 1. Trezor Suite
**Repository**: `trezor/trezor-suite`

Trezor Suite, Trezor donanım cüzdanları için resmi masaüstü ve web uygulamasıdır.

**Ana Özellikler:**
- 🔐 Multi-coin desteği (Bitcoin, Ethereum, Cardano, Solana, vb.)
- 🌐 Web ve masaüstü uygulaması
- 📱 React Native ile mobil uygulama
- 🔗 WalletConnect entegrasyonu
- 🏦 DeFi ve staking desteği
- 🔄 Blockchain link yönetimi

### 2. Trezor Firmware
**Repository**: `trezor/trezor-firmware`

Trezor cihazlarının firmware'i ve low-level kriptografik işlemleri.

**Ana Özellikler:**
- 🔒 Güvenli imza işlemleri
- 🔑 HD wallet key türetme
- 💾 Firmware güncelleme sistemi
- 🛡️ Bootloader güvenliği
- ⚡ Hardware güvenlik modülü

## Trezor Suite Mimarisi

### Monorepo Yapısı

```
trezor-suite/
├── packages/
│   ├── connect/              # @trezor/connect - API library
│   ├── connect-webextension/ # Browser extension proxy
│   ├── blockchain-link/      # Blockchain backends
│   └── suite/                # Main Suite app
├── suite-native/             # React Native mobile app
├── suite-common/             # Shared utilities
│   ├── wallet-core/          # Core wallet logic
│   ├── wallet-types/         # TypeScript types
│   ├── walletconnect/        # WalletConnect integration
│   └── token-definitions/    # Token metadata
└── docs/                     # Documentation
```

### Temel Paketler

#### @trezor/connect
Trezor cihazlarıyla iletişim kurmak için JavaScript/TypeScript API.

**Yetenekler:**
- Cihaz bağlantı yönetimi
- Transaction imzalama
- Mesaj imzalama/doğrulama
- Public key alma
- Address türetme

#### @trezor/blockchain-link
Blockchain backend'leriyle iletişim.

**Desteklenen Backend'ler:**
- Blockbook (Bitcoin, Ethereum)
- Electrum (Bitcoin)
- Ripple
- Blockfrost (Cardano)
- Solana RPC
- Stellar Horizon

## Trezor Firmware Mimarisi

### Firmware Yapısı

```
trezor-firmware/
├── core/                      # Trezor T firmware (Python)
│   ├── src/
│   │   ├── apps/              # Application modules
│   │   │   ├── bitcoin/       # Bitcoin signing
│   │   │   ├── ethereum/      # Ethereum signing
│   │   │   ├── cardano/       # Cardano support
│   │   │   └── misc/          # Misc operations
│   │   └── trezor/            # Core libraries
│   └── embed/                 # Embedded C code
├── legacy/                    # Trezor One firmware (C)
│   ├── firmware/              # Main firmware
│   ├── bootloader/            # Bootloader
│   └── signing/               # Transaction signing
├── python/                    # Python tools
│   └── src/trezorlib/         # Python client library
└── tests/                     # Device tests
```

### İmzalama Akışı

#### Bitcoin İmzalama
```
1. SignTx mesajı → Cihaz
2. Kullanıcı onayı
3. Input/Output doğrulama
4. Private key ile imzalama
5. İmza döndürme
```

#### Ethereum İmzalama
```
1. EthereumSignTx mesajı
2. Transaction parametreleri doğrulama
3. Chain ID kontrolü
4. Kullanıcı onayı
5. ECDSA imzalama (v, r, s)
6. EIP-155/EIP-1559 desteği
```

## Kurulum ve Bağımlılıklar

### Trezor Suite Kurulumu

```bash
# Repository klonlama
git clone https://github.com/trezor/trezor-suite.git
cd trezor-suite

# Bağımlılıkları yükleme
yarn install

# Development build
yarn build:libs
yarn workspace @trezor/suite-desktop dev
```

### Trezor Connect Kullanımı

```bash
# NPM ile kurulum
npm install @trezor/connect

# veya Yarn
yarn add @trezor/connect
```

#### TypeScript Örneği

```typescript
import TrezorConnect from '@trezor/connect';

// Initialization
TrezorConnect.init({
  manifest: {
    appUrl: 'https://your-app.com',
    email: 'developer@your-app.com',
  },
});

// Get Ethereum address
const result = await TrezorConnect.ethereumGetAddress({
  path: "m/44'/60'/0'/0/0",
  showOnTrezor: true,
});

if (result.success) {
  console.log('Address:', result.payload.address);
}

// Sign Ethereum transaction
const signResult = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: {
    to: '0x...',
    value: '0x0',
    gasLimit: '0x5208',
    gasPrice: '0x3b9aca00',
    nonce: '0x0',
    chainId: 1,
  },
});
```

## Dokümantasyon Yapısı

Bu klasördeki diğer dosyalar:

- **[TREZOR_CONNECT.md](./TREZOR_CONNECT.md)** - TrezorConnect API detayları
- **[SIGNING.md](./SIGNING.md)** - Transaction ve mesaj imzalama
- **[FIRMWARE.md](./FIRMWARE.md)** - Firmware yapısı ve güvenlik
- **[BLOCKCHAIN_LINK.md](./BLOCKCHAIN_LINK.md)** - Blockchain backend entegrasyonu
- **[WALLETCONNECT.md](./WALLETCONNECT.md)** - WalletConnect desteği
- **[MOBILE.md](./MOBILE.md)** - React Native mobil uygulama
- **[SECURITY.md](./SECURITY.md)** - Güvenlik best practices

## Hızlı Başlangıç

### 1. Temel Cüzdan İşlemleri

```typescript
import TrezorConnect from '@trezor/connect';

// BIP-32 path'ten address alma
async function getAddress(path: string) {
  const result = await TrezorConnect.getAddress({
    path,
    coin: 'btc',
  });
  
  return result.success ? result.payload.address : null;
}

// Public key alma
async function getPublicKey(path: string) {
  const result = await TrezorConnect.getPublicKey({
    path,
  });
  
  return result.success ? result.payload : null;
}
```

### 2. Transaction İmzalama

```typescript
// Bitcoin transaction
async function signBitcoinTx(inputs, outputs) {
  const result = await TrezorConnect.signTransaction({
    inputs,
    outputs,
    coin: 'btc',
  });
  
  return result.payload;
}

// Ethereum transaction (EIP-1559)
async function signEthereumTx(tx) {
  const result = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: tx.to,
      value: tx.value,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasLimit: tx.gasLimit,
      nonce: tx.nonce,
      chainId: tx.chainId,
      data: tx.data,
    },
  });
  
  return result.payload;
}
```

### 3. Mesaj İmzalama

```typescript
// Bitcoin mesaj imzalama
async function signMessage(message: string, path: string) {
  const result = await TrezorConnect.signMessage({
    path,
    message,
    coin: 'btc',
  });
  
  return result.payload.signature;
}

// Ethereum mesaj imzalama
async function signEthMessage(message: string, path: string) {
  const result = await TrezorConnect.ethereumSignMessage({
    path,
    message,
  });
  
  return result.payload.signature;
}

// Mesaj doğrulama
async function verifyMessage(address: string, message: string, signature: string) {
  const result = await TrezorConnect.verifyMessage({
    address,
    message,
    signature,
    coin: 'btc',
  });
  
  return result.payload.success;
}
```

## Desteklenen Coin'ler

### Bitcoin ve Türevleri
- Bitcoin (BTC)
- Bitcoin Cash (BCH)
- Bitcoin Gold (BTG)
- Litecoin (LTC)
- Dash (DASH)
- Zcash (ZEC)
- Dogecoin (DOGE)

### Ethereum ve EVM Zincirleri
- Ethereum (ETH)
- Ethereum Classic (ETC)
- Polygon (MATIC)
- Binance Smart Chain (BNB)
- Avalanche (AVAX)
- Fantom (FTM)
- Optimism (OP)
- Arbitrum (ARB)

### Diğer Blockchain'ler
- Cardano (ADA)
- Solana (SOL)
- Ripple (XRP)
- Stellar (XLM)
- Tezos (XTZ)
- EOS (EOS)
- NEM (XEM)

## Event Handling

```typescript
// Device event'lerini dinleme
TrezorConnect.on('DEVICE_EVENT', (event) => {
  if (event.type === 'device-connect') {
    console.log('Trezor connected:', event.payload);
  }
  
  if (event.type === 'device-disconnect') {
    console.log('Trezor disconnected:', event.payload);
  }
});

// Button request handling
TrezorConnect.on('UI_EVENT', (event) => {
  if (event.type === 'ui-button') {
    console.log('Confirm on device');
  }
  
  if (event.type === 'ui-request_pin') {
    // PIN girişi gerekli
  }
  
  if (event.type === 'ui-request_passphrase') {
    // Passphrase girişi gerekli
  }
});
```

## Güvenlik Özellikleri

### 1. Firmware İmzalama
- Çoklu imza gerektiren firmware güncellemeleri
- Bootloader güvenliği
- Secure boot chain

### 2. PIN Koruma
- Brute-force koruması
- Rastgele numara girişi
- Cihazda PIN doğrulama

### 3. Passphrase Desteği
- Ek güvenlik katmanı
- Hidden wallet oluşturma
- BIP-39 passphrase standardı

### 4. Recovery Seed
- BIP-39 mnemonic
- Shamir Backup (SLIP-39)
- Seed'in cihazda kalması

## CepWallet Entegrasyon Önerileri

### 1. TrezorConnect Entegrasyonu
```typescript
// CepWallet için Trezor provider
class TrezorWalletProvider {
  async connect() {
    await TrezorConnect.init({
      manifest: {
        appUrl: 'https://cepwallet.app',
        email: 'support@cepwallet.app',
      },
    });
  }
  
  async getAccounts(coinType: string, count: number = 1) {
    const accounts = [];
    
    for (let i = 0; i < count; i++) {
      const path = `m/44'/${this.getCoinIndex(coinType)}'/${i}'/0/0`;
      const result = await TrezorConnect.getAddress({
        path,
        coin: coinType,
      });
      
      if (result.success) {
        accounts.push({
          path,
          address: result.payload.address,
          publicKey: result.payload.publicKey,
        });
      }
    }
    
    return accounts;
  }
  
  async signTransaction(tx: Transaction) {
    // Chain'e göre uygun signing metodu
    if (tx.chain === 'ethereum') {
      return this.signEthereumTransaction(tx);
    } else if (tx.chain === 'bitcoin') {
      return this.signBitcoinTransaction(tx);
    }
  }
}
```

### 2. Multi-Signature Wallet Desteği
```typescript
// Multisig wallet oluşturma
async function createMultisigWallet(publicKeys: string[], m: number) {
  const result = await TrezorConnect.getAddress({
    path: "m/48'/0'/0'/2'/0/0",
    coin: 'btc',
    multisig: {
      pubkeys: publicKeys.map(pk => ({
        node: pk,
        address_n: [0, 0],
      })),
      m,
      signatures: ['', '', ''],
    },
  });
  
  return result.payload.address;
}
```

### 3. Account Discovery
```typescript
// Hesap keşfi (BIP-44)
async function discoverAccounts(coinType: string) {
  const accounts = [];
  let index = 0;
  let emptyAccounts = 0;
  
  while (emptyAccounts < 20) {
    const path = `m/44'/${coinType}'/${index}'/0/0`;
    const result = await TrezorConnect.getAccountInfo({
      path,
      coin: coinType,
    });
    
    if (result.success) {
      if (result.payload.empty) {
        emptyAccounts++;
      } else {
        accounts.push({
          index,
          path,
          balance: result.payload.balance,
          transactions: result.payload.history.total,
        });
        emptyAccounts = 0;
      }
    }
    
    index++;
  }
  
  return accounts;
}
```

## Performans ve Optimizasyon

### 1. Connection Pool
```typescript
// Tek bir TrezorConnect instance kullanma
const trezorInstance = TrezorConnect;

// İşlemler arası bağlantıyı koruma
async function performMultipleOperations() {
  await trezorInstance.init(config);
  
  const address1 = await trezorInstance.getAddress({...});
  const address2 = await trezorInstance.getAddress({...});
  
  // Dispose sadece uygulama kapatılırken
  // await trezorInstance.dispose();
}
```

### 2. Batch Operations
```typescript
// Bundle edilen adres alımı
async function getMultipleAddresses(paths: string[]) {
  const result = await TrezorConnect.getAddress({
    bundle: paths.map(path => ({ path, coin: 'btc' })),
  });
  
  return result.success ? result.payload : [];
}
```

## Hata Yönetimi

```typescript
async function handleTrezorOperation<T>(
  operation: () => Promise<TrezorConnect.Response<T>>
): Promise<T | null> {
  try {
    const result = await operation();
    
    if (result.success) {
      return result.payload;
    }
    
    // Hata tipleri
    switch (result.payload.error) {
      case 'Transport_Missing':
        throw new Error('Trezor Bridge yüklü değil');
      
      case 'Device_NotFound':
        throw new Error('Trezor cihazı bulunamadı');
      
      case 'Device_InitializeFailed':
        throw new Error('Cihaz başlatılamadı');
      
      case 'Action_Cancelled':
        throw new Error('İşlem kullanıcı tarafından iptal edildi');
      
      case 'Pin_Invalid':
        throw new Error('Geçersiz PIN');
      
      case 'Failure_NotInitialized':
        throw new Error('Cihaz başlatılmamış');
      
      default:
        throw new Error(result.payload.error);
    }
  } catch (error) {
    console.error('Trezor operation failed:', error);
    return null;
  }
}

// Kullanım
const address = await handleTrezorOperation(() => 
  TrezorConnect.getAddress({ path: "m/44'/0'/0'/0/0", coin: 'btc' })
);
```

## Test ve Debugging

### Development Mode

```typescript
// Debug logging aktif
TrezorConnect.init({
  manifest: {...},
  debug: true,
  lazyLoad: false,
});

// Event logging
TrezorConnect.on('*', (event) => {
  console.log('[TREZOR EVENT]', event);
});
```

### Emulator Kullanımı

```bash
# Trezor firmware emulator başlatma
cd trezor-firmware/core
poetry install
poetry run make build_unix
poetry run emu.py

# Suite'i emulator ile test
cd trezor-suite
yarn workspace @trezor/suite-desktop dev:emulator
```

## Kaynaklar

### Resmi Dokümantasyon
- [Trezor Connect Docs](https://connect.trezor.io/)
- [Trezor Firmware Docs](https://docs.trezor.io/trezor-firmware/)
- [Trezor Suite Docs](https://suite.trezor.io/docs/)

### GitHub Repositories
- [trezor/trezor-suite](https://github.com/trezor/trezor-suite)
- [trezor/trezor-firmware](https://github.com/trezor/trezor-firmware)
- [trezor/connect](https://github.com/trezor/connect)

### Developer Resources
- [BIP-32: HD Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP-39: Mnemonic](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP-44: Multi-Account Hierarchy](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [SLIP-39: Shamir Backup](https://github.com/satoshilabs/slips/blob/master/slip-0039.md)

## Lisans

Trezor Suite: BUSL-1.1 (Business Source License)
Trezor Firmware: GPL-3.0

---

**Not**: Bu dokümantasyon CepWallet uygulamasında Trezor donanım cüzdan entegrasyonu için hazırlanmıştır. En güncel bilgiler için resmi Trezor dokümantasyonunu kontrol edin.
