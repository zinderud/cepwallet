# TrezorConnect API Detaylı Kullanım

## İçindekiler

1. [Başlangıç](#başlangıç)
2. [Temel Yapılandırma](#temel-yapılandırma)
3. [API Metodları](#api-metodları)
4. [Event System](#event-system)
5. [Transport Layer](#transport-layer)
6. [İleri Seviye Kullanım](#ileri-seviye-kullanım)

## Başlangıç

TrezorConnect, Trezor donanım cüzdanlarıyla web tarayıcı veya Node.js üzerinden iletişim kurmak için kullanılan JavaScript/TypeScript kütüphanesidir.

### Kurulum

```bash
# NPM
npm install @trezor/connect

# Yarn
yarn add @trezor/connect

# PNPM
pnpm add @trezor/connect
```

### Temel Import

```typescript
// ES Module
import TrezorConnect from '@trezor/connect';

// CommonJS
const TrezorConnect = require('@trezor/connect').default;

// CDN (Browser)
<script src="https://connect.trezor.io/9/trezor-connect.js"></script>
```

## Temel Yapılandırma

### Manifest

Her uygulama için manifest gereklidir:

```typescript
interface Manifest {
  appUrl: string;      // Uygulama URL'i
  email: string;       // Developer email
}

TrezorConnect.init({
  manifest: {
    appUrl: 'https://cepwallet.app',
    email: 'support@cepwallet.app',
  },
});
```

### Gelişmiş Yapılandırma

```typescript
interface InitOptions {
  manifest: Manifest;
  debug?: boolean;              // Debug logging
  lazyLoad?: boolean;          // Lazy iframe loading
  webusb?: boolean;            // WebUSB desteği
  popup?: boolean;             // Popup kullanımı
  connectSrc?: string;         // Custom connect URL
  transportReconnect?: boolean; // Auto-reconnect
  pendingTransportEvent?: boolean;
  transports?: string[];       // Transport tipları
  env?: 'node' | 'web' | 'webextension';
}

// Örnek
TrezorConnect.init({
  manifest: {
    appUrl: 'https://cepwallet.app',
    email: 'support@cepwallet.app',
  },
  debug: process.env.NODE_ENV === 'development',
  lazyLoad: false,
  webusb: true,
  popup: false, // Popup yerine redirect kullan
  transportReconnect: true,
});
```

## API Metodları

### Address ve Public Key İşlemleri

#### getAddress - Adres Alma

```typescript
// Tekli adres
const result = await TrezorConnect.getAddress({
  path: "m/44'/0'/0'/0/0",
  coin: 'btc',
  showOnTrezor: true,
});

if (result.success) {
  console.log('Address:', result.payload.address);
  console.log('Path:', result.payload.serializedPath);
}

// Çoklu adres (bundle)
const bundleResult = await TrezorConnect.getAddress({
  bundle: [
    { path: "m/44'/0'/0'/0/0", coin: 'btc' },
    { path: "m/44'/0'/0'/0/1", coin: 'btc' },
    { path: "m/44'/0'/0'/0/2", coin: 'btc' },
  ],
});

if (bundleResult.success) {
  bundleResult.payload.forEach((item, index) => {
    console.log(`Address ${index}:`, item.address);
  });
}
```

#### getPublicKey - Public Key Alma

```typescript
// BIP-32 public key
const result = await TrezorConnect.getPublicKey({
  path: "m/44'/0'/0'",
  coin: 'btc',
});

if (result.success) {
  const { publicKey, chainCode, xpub, depth, childNum } = result.payload;
  console.log('Public Key:', publicKey);
  console.log('xpub:', xpub);
}

// Çoklu public key
const bundleResult = await TrezorConnect.getPublicKey({
  bundle: [
    { path: "m/44'/0'/0'", coin: 'btc' },
    { path: "m/49'/0'/0'", coin: 'btc' }, // SegWit
    { path: "m/84'/0'/0'", coin: 'btc' }, // Native SegWit
  ],
});
```

### Bitcoin İşlemleri

#### signTransaction - Bitcoin Transaction İmzalama

```typescript
interface BitcoinInput {
  address_n: number[];
  prev_hash: string;
  prev_index: number;
  amount?: string;
  script_type?: 'SPENDADDRESS' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS';
}

interface BitcoinOutput {
  address?: string;
  address_n?: number[];
  amount: string;
  script_type?: 'PAYTOADDRESS' | 'PAYTOP2SHWITNESS' | 'PAYTOWITNESS';
}

// P2PKH transaction
const result = await TrezorConnect.signTransaction({
  inputs: [
    {
      address_n: [44 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 0, 0],
      prev_hash: 'b4dc0ffeee...',
      prev_index: 0,
      amount: '100000000', // 1 BTC in satoshis
      script_type: 'SPENDADDRESS',
    },
  ],
  outputs: [
    {
      address: '1BitcoinAddress...',
      amount: '99950000',
      script_type: 'PAYTOADDRESS',
    },
    {
      address_n: [44 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 1, 0],
      amount: '50000', // Change
      script_type: 'PAYTOADDRESS',
    },
  ],
  coin: 'btc',
});

if (result.success) {
  console.log('Signed TX:', result.payload.serializedTx);
}

// SegWit transaction
const segwitResult = await TrezorConnect.signTransaction({
  inputs: [
    {
      address_n: [84 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 0, 0],
      prev_hash: 'abc123...',
      prev_index: 0,
      amount: '50000000',
      script_type: 'SPENDWITNESS',
    },
  ],
  outputs: [
    {
      address: 'bc1q...', // Bech32 address
      amount: '49950000',
      script_type: 'PAYTOWITNESS',
    },
  ],
  coin: 'btc',
});
```

#### composeTransaction - Transaction Oluşturma ve İmzalama

```typescript
// Otomatik fee hesaplama ile
const result = await TrezorConnect.composeTransaction({
  outputs: [
    {
      address: '1BitcoinAddress...',
      amount: '100000000',
    },
  ],
  coin: 'btc',
  push: true, // İmzalama sonrası broadcast
});

if (result.success) {
  console.log('TX ID:', result.payload.txid);
  console.log('Bytes:', result.payload.bytes);
  console.log('Fee:', result.payload.fee);
}
```

#### pushTransaction - Transaction Broadcast

```typescript
const result = await TrezorConnect.pushTransaction({
  tx: '01000000...', // Serialized transaction hex
  coin: 'btc',
});

if (result.success) {
  console.log('TX ID:', result.payload.txid);
}
```

### Ethereum İşlemleri

#### ethereumGetAddress - Ethereum Adresi Alma

```typescript
const result = await TrezorConnect.ethereumGetAddress({
  path: "m/44'/60'/0'/0/0",
  showOnTrezor: true,
});

if (result.success) {
  console.log('Address:', result.payload.address);
  console.log('Public Key:', result.payload.publicKey);
}

// Çoklu Ethereum adresi
const bundleResult = await TrezorConnect.ethereumGetAddress({
  bundle: [
    { path: "m/44'/60'/0'/0/0" },
    { path: "m/44'/60'/0'/0/1" },
    { path: "m/44'/60'/0'/0/2" },
  ],
});
```

#### ethereumSignTransaction - Ethereum Transaction İmzalama

```typescript
// Legacy transaction
const legacyResult = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: {
    to: '0x7314e0f1c0e28474bdb6be3e2c3e0453255188f8',
    value: '0xf4240', // 1000000 wei
    gasPrice: '0x14',
    gasLimit: '0x14',
    nonce: '0x00',
    chainId: 1,
  },
});

// EIP-1559 transaction
const eip1559Result = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: {
    to: '0x7314e0f1c0e28474bdb6be3e2c3e0453255188f8',
    value: '0xf4240',
    maxFeePerGas: '0x1a13b8600', // 7 gwei
    maxPriorityFeePerGas: '0x77359400', // 2 gwei
    gasLimit: '0x5208',
    nonce: '0x00',
    chainId: 1,
  },
});

if (eip1559Result.success) {
  const { v, r, s } = eip1559Result.payload;
  console.log('Signature v:', v);
  console.log('Signature r:', r);
  console.log('Signature s:', s);
}

// Contract interaction with data
const contractResult = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: {
    to: '0xContractAddress...',
    value: '0x00',
    data: '0xa9059cbb...', // ERC-20 transfer method
    maxFeePerGas: '0x1a13b8600',
    maxPriorityFeePerGas: '0x77359400',
    gasLimit: '0x15f90',
    nonce: '0x00',
    chainId: 1,
  },
});
```

#### ethereumSignMessage - Mesaj İmzalama

```typescript
const result = await TrezorConnect.ethereumSignMessage({
  path: "m/44'/60'/0'/0/0",
  message: 'Hello from CepWallet!',
});

if (result.success) {
  console.log('Signature:', result.payload.signature);
  console.log('Address:', result.payload.address);
}

// Hex mesaj
const hexResult = await TrezorConnect.ethereumSignMessage({
  path: "m/44'/60'/0'/0/0",
  message: '0x48656c6c6f',
  hex: true,
});
```

#### ethereumVerifyMessage - Mesaj Doğrulama

```typescript
const result = await TrezorConnect.ethereumVerifyMessage({
  address: '0x7314e0f1c0e28474bdb6be3e2c3e0453255188f8',
  message: 'Hello from CepWallet!',
  signature: '0x...',
});

if (result.success && result.payload.valid) {
  console.log('Message is valid!');
}
```

#### ethereumSignTypedData - EIP-712 İmzalama

```typescript
const typedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
  },
  primaryType: 'Person',
  domain: {
    name: 'CepWallet',
    version: '1',
    chainId: 1,
    verifyingContract: '0x...',
  },
  message: {
    name: 'Alice',
    wallet: '0x...',
  },
};

const result = await TrezorConnect.ethereumSignTypedData({
  path: "m/44'/60'/0'/0/0",
  data: typedData,
  metamaskV4Compat: true,
});

if (result.success) {
  console.log('Signature:', result.payload.signature);
}
```

### Cardano İşlemleri

#### cardanoGetAddress - Cardano Adresi

```typescript
const result = await TrezorConnect.cardanoGetAddress({
  addressParameters: {
    addressType: 0, // Base address
    path: "m/1852'/1815'/0'/0/0",
    stakingPath: "m/1852'/1815'/0'/2/0",
  },
  protocolMagic: 764824073, // Mainnet
  networkId: 1,
  showOnTrezor: true,
});

if (result.success) {
  console.log('Address:', result.payload.address);
}
```

#### cardanoSignTransaction - Cardano Transaction

```typescript
const result = await TrezorConnect.cardanoSignTransaction({
  inputs: [
    {
      path: "m/1852'/1815'/0'/0/0",
      prev_hash: 'abc123...',
      prev_index: 0,
    },
  ],
  outputs: [
    {
      address: 'addr1...',
      amount: '1000000', // 1 ADA
    },
  ],
  fee: '170000',
  ttl: '500000',
  protocolMagic: 764824073,
  networkId: 1,
});
```

### Solana İşlemleri

#### solanaGetAddress - Solana Adresi

```typescript
const result = await TrezorConnect.solanaGetAddress({
  path: "m/44'/501'/0'/0'",
  showOnTrezor: true,
});

if (result.success) {
  console.log('Address:', result.payload.address);
}
```

#### solanaSignTransaction - Solana Transaction

```typescript
const result = await TrezorConnect.solanaSignTransaction({
  path: "m/44'/501'/0'/0'",
  serializedTx: Buffer.from(transaction.serialize()).toString('hex'),
});

if (result.success) {
  console.log('Signature:', result.payload.signature);
}
```

### Mesaj İmzalama ve Doğrulama

#### signMessage - Bitcoin Mesaj İmzalama

```typescript
const result = await TrezorConnect.signMessage({
  path: "m/44'/0'/0'/0/0",
  message: 'Hello from CepWallet!',
  coin: 'btc',
  scriptType: 'p2pkh',
});

if (result.success) {
  console.log('Signature:', result.payload.signature);
  console.log('Address:', result.payload.address);
}
```

#### verifyMessage - Bitcoin Mesaj Doğrulama

```typescript
const result = await TrezorConnect.verifyMessage({
  address: '1BitcoinAddress...',
  message: 'Hello from CepWallet!',
  signature: 'HzU9...',
  coin: 'btc',
});

if (result.success) {
  console.log('Valid:', result.payload.success);
}
```

### Cihaz Yönetimi

#### getFeatures - Cihaz Bilgileri

```typescript
const result = await TrezorConnect.getFeatures();

if (result.success) {
  const features = result.payload;
  console.log('Device ID:', features.device_id);
  console.log('Model:', features.model);
  console.log('Firmware version:', features.major_version);
  console.log('Label:', features.label);
  console.log('Initialized:', features.initialized);
  console.log('Pin protection:', features.pin_protection);
  console.log('Passphrase protection:', features.passphrase_protection);
}
```

#### applySettings - Cihaz Ayarları

```typescript
// Cihaz etiketi değiştirme
const result = await TrezorConnect.applySettings({
  label: 'My CepWallet Trezor',
});

// Otomatik kilitleme süresi
const autoLockResult = await TrezorConnect.applySettings({
  auto_lock_delay_ms: 600000, // 10 dakika
});

// Homescreen değiştirme
const homescreenResult = await TrezorConnect.applySettings({
  homescreen: 'base64_encoded_image',
});
```

#### wipeDevice - Cihazı Sıfırlama

```typescript
const result = await TrezorConnect.wipeDevice();

if (result.success) {
  console.log('Device wiped successfully');
}
```

#### resetDevice - Yeni Cihaz Kurulumu

```typescript
const result = await TrezorConnect.resetDevice({
  strength: 256, // 24 kelime
  label: 'My Trezor',
  passphrase_protection: true,
  pin_protection: true,
  skip_backup: false,
});
```

#### backupDevice - Seed Yedekleme

```typescript
const result = await TrezorConnect.backupDevice();

if (result.success) {
  console.log('Backup completed');
}
```

## Event System

### Event Tipleri

```typescript
// Device events
TrezorConnect.on('DEVICE_EVENT', (event) => {
  switch (event.type) {
    case 'device-connect':
      console.log('Device connected:', event.payload);
      break;
    
    case 'device-disconnect':
      console.log('Device disconnected:', event.payload);
      break;
    
    case 'device-changed':
      console.log('Device state changed:', event.payload);
      break;
  }
});

// UI events
TrezorConnect.on('UI_EVENT', (event) => {
  switch (event.type) {
    case 'ui-button':
      console.log('Confirm on device');
      break;
    
    case 'ui-request_pin':
      // PIN girişi gerekli
      const pin = await promptUserForPin();
      TrezorConnect.uiResponse({ type: 'ui-receive_pin', payload: pin });
      break;
    
    case 'ui-request_passphrase':
      // Passphrase girişi
      const passphrase = await promptUserForPassphrase();
      TrezorConnect.uiResponse({ 
        type: 'ui-receive_passphrase', 
        payload: { value: passphrase, save: false } 
      });
      break;
    
    case 'ui-request_confirmation':
      console.log('Confirmation required');
      break;
  }
});

// Transport events
TrezorConnect.on('TRANSPORT_EVENT', (event) => {
  console.log('Transport:', event);
});

// Tüm event'leri dinleme
TrezorConnect.on('*', (event) => {
  console.log('[TREZOR]', event);
});
```

### Event Removal

```typescript
const handler = (event) => {
  console.log(event);
};

// Event listener ekleme
TrezorConnect.on('DEVICE_EVENT', handler);

// Event listener kaldırma
TrezorConnect.off('DEVICE_EVENT', handler);

// Tüm listener'ları kaldırma
TrezorConnect.removeAllListeners();
```

## Transport Layer

### Desteklenen Transport'lar

```typescript
// WebUSB (Chrome, Edge, Opera)
TrezorConnect.init({
  webusb: true,
  transports: ['WebUsbTransport'],
});

// Trezor Bridge (Desktop application)
TrezorConnect.init({
  transports: ['BridgeTransport'],
});

// Her ikisi (önce WebUSB denenır)
TrezorConnect.init({
  webusb: true,
  transports: ['WebUsbTransport', 'BridgeTransport'],
});
```

### Custom Transport Configuration

```typescript
TrezorConnect.init({
  manifest: {...},
  transports: ['WebUsbTransport'],
  transportReconnect: true, // Otomatik yeniden bağlanma
  pendingTransportEvent: true,
});
```

## İleri Seviye Kullanım

### Account Discovery

```typescript
interface DiscoverAccountsOptions {
  coin: string;
  derivationMode?: 'normal' | 'segwit' | 'legacy';
}

async function discoverAccounts(options: DiscoverAccountsOptions) {
  const result = await TrezorConnect.getAccountInfo({
    coin: options.coin,
    path: "m/84'/0'/0'", // Native SegWit
    details: 'txs',
  });
  
  if (result.success) {
    return {
      balance: result.payload.balance,
      availableBalance: result.payload.availableBalance,
      transactions: result.payload.history.total,
      addresses: result.payload.addresses,
    };
  }
  
  return null;
}
```

### Multi-signature Wallet

```typescript
// Multisig wallet oluşturma (2-of-3)
const result = await TrezorConnect.getAddress({
  path: "m/48'/0'/0'/2'/0/0",
  coin: 'btc',
  multisig: {
    pubkeys: [
      {
        node: 'xpub...',
        address_n: [0, 0],
      },
      {
        node: 'xpub...',
        address_n: [0, 0],
      },
      {
        node: 'xpub...',
        address_n: [0, 0],
      },
    ],
    m: 2, // Gereken imza sayısı
    signatures: ['', '', ''],
  },
  showOnTrezor: true,
});

// Multisig transaction imzalama
const signResult = await TrezorConnect.signTransaction({
  inputs: [
    {
      address_n: [48 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 0, 0],
      prev_hash: 'abc...',
      prev_index: 0,
      amount: '100000000',
      script_type: 'SPENDMULTISIG',
      multisig: {
        pubkeys: [...],
        m: 2,
        signatures: ['', '', ''], // Diğer imzacıların imzaları
      },
    },
  ],
  outputs: [...],
  coin: 'btc',
});
```

### Batch Operations

```typescript
// Paralel işlemler
const [addresses, publicKeys, accountInfo] = await Promise.all([
  TrezorConnect.getAddress({
    bundle: [
      { path: "m/44'/0'/0'/0/0", coin: 'btc' },
      { path: "m/44'/0'/0'/0/1", coin: 'btc' },
    ],
  }),
  TrezorConnect.getPublicKey({
    bundle: [
      { path: "m/44'/0'/0'", coin: 'btc' },
      { path: "m/49'/0'/0'", coin: 'btc' },
    ],
  }),
  TrezorConnect.getAccountInfo({
    coin: 'btc',
    path: "m/84'/0'/0'",
  }),
]);
```

### Custom Network Definition

```typescript
// Custom EVM network
const result = await TrezorConnect.ethereumSignTransaction({
  path: "m/44'/60'/0'/0/0",
  transaction: {
    to: '0x...',
    value: '0x0',
    gasLimit: '0x5208',
    gasPrice: '0x12a05f200',
    nonce: '0x0',
    chainId: 56, // BSC
  },
  // Custom network bilgisi
  encodedNetwork: {
    chainId: 56,
    slip44: 714,
    shortcut: 'BNB',
    name: 'Binance Smart Chain',
  },
});
```

### Error Handling ve Retry Logic

```typescript
async function robustTrezorOperation<T>(
  operation: () => Promise<TrezorConnect.Response<T>>,
  maxRetries = 3
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();
      
      if (result.success) {
        return result.payload;
      }
      
      // Retry edilebilir hatalar
      if (
        result.payload.error === 'Transport_Missing' ||
        result.payload.error === 'Device_Disconnected'
      ) {
        console.log(`Retry ${i + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // Retry edilemez hatalar
      throw new Error(result.payload.error);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
  
  return null;
}

// Kullanım
const address = await robustTrezorOperation(() =>
  TrezorConnect.getAddress({
    path: "m/44'/0'/0'/0/0",
    coin: 'btc',
  })
);
```

### Session Management

```typescript
class TrezorSession {
  private connected = false;
  
  async connect() {
    await TrezorConnect.init({
      manifest: {
        appUrl: 'https://cepwallet.app',
        email: 'support@cepwallet.app',
      },
    });
    
    this.connected = true;
    
    // Device events
    TrezorConnect.on('DEVICE_EVENT', (event) => {
      if (event.type === 'device-disconnect') {
        this.connected = false;
      }
    });
  }
  
  async ensureConnected() {
    if (!this.connected) {
      await this.connect();
    }
  }
  
  async getAddress(path: string, coin: string) {
    await this.ensureConnected();
    return TrezorConnect.getAddress({ path, coin });
  }
  
  async signTransaction(params: any) {
    await this.ensureConnected();
    return TrezorConnect.signTransaction(params);
  }
  
  async disconnect() {
    await TrezorConnect.dispose();
    this.connected = false;
  }
}

// Kullanım
const session = new TrezorSession();
await session.connect();
const address = await session.getAddress("m/44'/0'/0'/0/0", 'btc');
```

## Type Definitions

```typescript
// Response tipi
interface Response<T> {
  success: boolean;
  payload: T | {
    error: string;
    code?: string;
  };
}

// Address response
interface Address {
  address: string;
  path: number[];
  serializedPath: string;
}

// Public key response
interface PublicKey {
  publicKey: string;
  chainCode: string;
  path: number[];
  serializedPath: string;
  xpub: string;
  xpubSegwit?: string;
  depth: number;
  childNum: number;
  fingerprint: number;
}

// Transaction signature
interface SignedTransaction {
  signatures: string[];
  serializedTx: string;
  txid?: string;
}

// Ethereum signature
interface EthereumSignature {
  v: number;
  r: string;
  s: string;
}

// Device features
interface Features {
  device_id: string;
  model: string;
  major_version: number;
  minor_version: number;
  patch_version: number;
  label: string;
  initialized: boolean;
  pin_protection: boolean;
  passphrase_protection: boolean;
  bootloader_mode: boolean;
  needs_backup: boolean;
}
```

## Best Practices

### 1. Connection Management

```typescript
// ✅ İyi: Tek instance kullan
const connect = TrezorConnect;

// ❌ Kötü: Her seferinde yeni instance
const connect1 = TrezorConnect;
const connect2 = TrezorConnect; // Gereksiz
```

### 2. Error Handling

```typescript
// ✅ İyi: Her zaman error kontrolü
const result = await TrezorConnect.getAddress({...});
if (!result.success) {
  handleError(result.payload.error);
  return;
}
const address = result.payload.address;

// ❌ Kötü: Error kontrolsüz
const address = result.payload.address; // Type error risk
```

### 3. User Experience

```typescript
// ✅ İyi: Kullanıcıya bilgi ver
showMessage('Trezor cihazınızda onaylayın...');
const result = await TrezorConnect.signTransaction({...});
hideMessage();

// ❌ Kötü: Sessiz bekleme
const result = await TrezorConnect.signTransaction({...});
```

### 4. Bundle Operations

```typescript
// ✅ İyi: Bundle kullan
const result = await TrezorConnect.getAddress({
  bundle: [...], // Tek request
});

// ❌ Kötü: Ayrı ayrı request
for (const path of paths) {
  await TrezorConnect.getAddress({ path }); // Çok yavaş
}
```

---

**Not**: Bu dokümantasyon @trezor/connect v9 için hazırlanmıştır. Versiyon farklılıkları için resmi dokümantasyonu kontrol edin.
