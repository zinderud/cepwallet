# Kohaku + Trezor Entegrasyon Rehberi (Tauri 2.x)

**Son Güncelleme:** 17 Ekim 2025  
**Tauri Sürümü:** 2.8.5  
**Mimari:** Rust Backend + React Frontend

## 🎯 Genel Bakış

Bu rehber, **Kohaku** gizlilik protokollerini (RAILGUN ve Privacy Pools) **Trezor** hardware wallet ile **Tauri 2.x** mimarisinde entegre ederek privacy-first bir wallet uygulaması geliştirme sürecini detaylandırır.

> **Not:** Bu implementasyon Tauri 2.x kullanır. Electron'dan farklı olarak:
> - Privacy logic **Rust backend**'de çalışır (daha güvenli, daha hızlı)
> - Zero-knowledge proof generation **native Rust** kütüphaneleri kullanır
> - Trezor communication **Tauri IPC** üzerinden yapılır

---

## 📋 Ön Gereksinimler

### Hardware
- ✅ Trezor One veya Trezor Model T
- ✅ USB kablo

### Software
- ✅ **Rust** 1.70+ (ZK proof libraries için)
- ✅ **Node.js** 18+ (React frontend)
- ✅ **pnpm** 8+ (package manager)
- ✅ **Tauri** 2.8+ (desktop framework)
- ✅ **Trezor Bridge** (USB communication)

### Bilgi Gereksinimleri
- ✅ **Rust** (privacy logic backend)
- ✅ **TypeScript** (React frontend)
- ✅ **Ethereum / Web3** (blockchain)
- ✅ **Zero-knowledge proofs** (temel - Rust zkSNARK libraries)
- ✅ **Tauri IPC** (frontend-backend communication)

---

## 🏗️ Mimari Tasarım (Tauri 2.x)

### Katmanlı Yapı

```
┌────────────────────────────────────────────────────────┐
│              React Frontend (TypeScript)                │
│  • Privacy Control UI                                   │
│  • Shielded Balance Display                             │
│  • Transaction Builder with Privacy Levels              │
│  • Privacy Pool Dashboard                               │
└─────────────────────────┬──────────────────────────────┘
                          │ Tauri IPC
                          ↓
┌────────────────────────────────────────────────────────┐
│              Tauri Commands (Rust)                      │
│  • shield_transaction(amount, token)                    │
│  • unshield_transaction(amount, to)                     │
│  • private_transfer(to, amount, proof)                  │
│  • join_privacy_pool(pool_id, deposit)                  │
│  • generate_zk_proof(transaction)                       │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────┐
│           Privacy Module (Rust src-tauri/)              │
│  ┌───────────────────┬──────────────────────────────┐  │
│  │   RAILGUN (Rust)  │   Privacy Pools (Rust FFI)   │  │
│  │  • Shield         │  • Pool Join/Exit            │  │
│  │  • Shielded TX    │  • Private Swaps             │  │
│  │  • Unshield       │  • Compliance Proofs         │  │
│  │  • ZK Proofs      │  • Pool Membership           │  │
│  └───────────────────┴──────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────┐
│         Trezor Hardware Integration (Rust)              │
│  • TrezorManager (existing)                             │
│  • Sign shielded transactions                           │
│  • Sign privacy pool operations                         │
│  • Secure key management                                │
└─────────────────────────┬──────────────────────────────┘
                          │ USB/HID
                          ↓
┌────────────────────────────────────────────────────────┐
│              Trezor Hardware Device                     │
│  • Private key storage (never leaves device)            │
│  • Transaction signing with user confirmation           │
│  • PIN/Passphrase protection                            │
└────────────────────────────────────────────────────────┘
```

### **Tauri-Specific Avantajlar:**
- ✅ **Rust Backend:** ZK proof generation C++ libraries ile native entegrasyon
- ✅ **Security:** Private keys Trezor'da, sensitive data Rust memory management
- ✅ **Performance:** Native code, multi-threading, async runtime
- ✅ **Cross-platform:** macOS, Windows, Linux tek codebase
│      Signing Layer (Trezor)                 │
│  • Trezor Connect API                       │
│  • Transaction signing                      │
│  • Account management                       │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│       Hardware (Trezor Device)              │
│  • Private key storage                      │
│  • Secure element                           │
└────────────────────────────────────────────┘
```

---

## 🔧 Kurulum ve Setup

### 1. Proje Başlatma

```bash
# Ana dizin oluştur
mkdir cepwallet && cd cepwallet

# Monorepo setup (Kohaku gibi)
pnpm init

# Workspace yapılandırması
cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
  - 'apps/*'
EOF
```

### 2. Kohaku Libraries Kurulumu

```bash
# Kohaku privacy libraries
pnpm add @kohaku-eth/railgun @kohaku-eth/privacy-pools

# ZK proof dependencies
pnpm add snarkjs circomlibjs

# Ethereum libs
pnpm add ethers@^6
```

### 3. Trezor Connect Setup

```bash
# Trezor Connect
pnpm add @trezor/connect-web

# USB communication (Node.js bridge için)
pnpm add usb libusb
```

### 4. Frontend Framework

```bash
# Electron + React
pnpm add electron react react-dom
pnpm add -D @types/react @types/react-dom typescript

# UI libraries
pnpm add tailwindcss @headlessui/react
```

---

## 💻 Core Implementation

### 1. Trezor Manager Service

```typescript
// src/services/TrezorManager.ts

import TrezorConnect from '@trezor/connect-web';
import { ethers } from 'ethers';

export class TrezorManager {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    await TrezorConnect.init({
      lazyLoad: true,
      manifest: {
        email: 'dev@cepwallet.com',
        appUrl: 'https://cepwallet.com'
      }
    });

    this.isInitialized = true;
  }

  async getAddress(path: string = "m/44'/60'/0'/0/0"): Promise<string> {
    const result = await TrezorConnect.ethereumGetAddress({
      path,
      showOnTrezor: false
    });

    if (!result.success) {
      throw new Error(result.payload.error);
    }

    return result.payload.address;
  }

  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    // Nonce ve gas bilgilerini hazırla
    const unsignedTx = {
      to: tx.to!,
      value: ethers.toBeHex(tx.value || 0),
      gasPrice: ethers.toBeHex(tx.gasPrice || 0),
      gasLimit: ethers.toBeHex(tx.gasLimit || 21000),
      nonce: ethers.toBeHex(tx.nonce || 0),
      data: tx.data || '0x',
      chainId: tx.chainId || 1
    };

    const result = await TrezorConnect.ethereumSignTransaction({
      path: "m/44'/60'/0'/0/0",
      transaction: unsignedTx
    });

    if (!result.success) {
      throw new Error(result.payload.error);
    }

    // Serialize signed transaction
    const signature = {
      r: result.payload.r,
      s: result.payload.s,
      v: result.payload.v
    };

    return ethers.Transaction.from({
      ...tx,
      signature
    }).serialized;
  }

  async signMessage(message: string): Promise<string> {
    const result = await TrezorConnect.ethereumSignMessage({
      path: "m/44'/60'/0'/0/0",
      message,
      hex: false
    });

    if (!result.success) {
      throw new Error(result.payload.error);
    }

    return result.payload.signature;
  }
}
```

### 2. RAILGUN Integration

```typescript
// src/services/RailgunService.ts

import { RailgunWallet, ShieldedTransfer } from '@kohaku-eth/railgun';
import { TrezorManager } from './TrezorManager';
import { ethers } from 'ethers';

export class RailgunService {
  private wallet: RailgunWallet | null = null;
  private trezor: TrezorManager;
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.trezor = new TrezorManager();
  }

  async initialize() {
    await this.trezor.initialize();
    
    // Trezor'dan address al
    const address = await this.trezor.getAddress();

    // RAILGUN wallet oluştur
    this.wallet = await RailgunWallet.create({
      address,
      provider: this.provider,
      signer: async (tx) => {
        // Custom signer: Trezor'a yönlendir
        return await this.trezor.signTransaction(tx);
      }
    });

    console.log('✅ RAILGUN wallet initialized with Trezor');
  }

  /**
   * Shield: Public ETH/tokens'ı RAILGUN private pool'a gönder
   */
  async shield(params: {
    token: string; // Token address (0x0 for ETH)
    amount: string; // Wei cinsinden
  }): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    // Shield transaction oluştur
    const shieldTx = await this.wallet.shield({
      tokenAddress: params.token,
      amount: ethers.parseEther(params.amount)
    });

    // Trezor ile imzala
    const signedTx = await this.trezor.signTransaction(shieldTx);

    // Broadcast
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    return txResponse.hash;
  }

  /**
   * Shielded Transfer: RAILGUN pool içinde private transfer
   */
  async shieldedTransfer(params: {
    to: string; // Alıcı RAILGUN address
    token: string;
    amount: string;
  }): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    // Private transfer oluştur
    const transferTx = await this.wallet.generateShieldedTransfer({
      recipient: params.to,
      tokenAddress: params.token,
      amount: ethers.parseEther(params.amount)
    });

    // ZK proof oluştur (bu zaman alabilir)
    console.log('Generating zero-knowledge proof...');
    const proofTx = await transferTx.prove();

    // Trezor ile imzala
    const signedTx = await this.trezor.signTransaction(proofTx.unsignedTx);

    // Broadcast
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    console.log('✅ Shielded transfer completed (private)');
    return txResponse.hash;
  }

  /**
   * Unshield: RAILGUN pool'dan public address'e çıkar
   */
  async unshield(params: {
    token: string;
    amount: string;
    to: string; // Public Ethereum address
  }): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const unshieldTx = await this.wallet.unshield({
      tokenAddress: params.token,
      amount: ethers.parseEther(params.amount),
      recipient: params.to
    });

    const signedTx = await this.trezor.signTransaction(unshieldTx);
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    return txResponse.hash;
  }

  /**
   * Private balance (RAILGUN pool içinde)
   */
  async getPrivateBalance(token: string): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const balance = await this.wallet.getShieldedBalance(token);
    return ethers.formatEther(balance);
  }
}
```

### 3. Privacy Pools Integration

```typescript
// src/services/PrivacyPoolsService.ts

import { PrivacyPool, PoolMembership } from '@kohaku-eth/privacy-pools';
import { TrezorManager } from './TrezorManager';
import { ethers } from 'ethers';

export class PrivacyPoolsService {
  private pool: PrivacyPool | null = null;
  private trezor: TrezorManager;
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.trezor = new TrezorManager();
  }

  async initialize() {
    await this.trezor.initialize();
  }

  /**
   * Privacy pool'a katıl
   */
  async joinPool(params: {
    poolId: string;
    depositAmount: string;
    credentials?: any; // KYC/compliance için (opsiyonel)
  }): Promise<PoolMembership> {
    const address = await this.trezor.getAddress();

    // Pool'a katılma transaction'ı oluştur
    const joinTx = await PrivacyPool.join({
      poolId: params.poolId,
      depositor: address,
      amount: ethers.parseEther(params.depositAmount),
      credentials: params.credentials
    });

    // Trezor ile imzala
    const signedTx = await this.trezor.signTransaction(joinTx);
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    // Pool membership bilgisi
    this.pool = await PrivacyPool.connect(params.poolId, address);

    console.log('✅ Joined privacy pool:', params.poolId);
    return this.pool.getMembership();
  }

  /**
   * Pool içinde private swap
   */
  async swapInPool(params: {
    fromToken: string;
    toToken: string;
    amount: string;
  }): Promise<string> {
    if (!this.pool) throw new Error('Not a pool member');

    // Pool içinde swap transaction
    const swapTx = await this.pool.swap({
      inputToken: params.fromToken,
      outputToken: params.toToken,
      inputAmount: ethers.parseEther(params.amount)
    });

    // ZK proof oluştur
    console.log('Generating privacy proof for swap...');
    const proofTx = await swapTx.generateProof();

    // Trezor ile imzala
    const signedTx = await this.trezor.signTransaction(proofTx);
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    console.log('✅ Private swap completed in pool');
    return txResponse.hash;
  }

  /**
   * Pool'dan çıkış yap
   */
  async exitPool(withdrawAddress?: string): Promise<string> {
    if (!this.pool) throw new Error('Not a pool member');

    const address = withdrawAddress || await this.trezor.getAddress();

    const exitTx = await this.pool.exit({
      recipient: address
    });

    const signedTx = await this.trezor.signTransaction(exitTx);
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    return txResponse.hash;
  }

  /**
   * Compliance proof oluştur (regülatörler için)
   */
  async generateComplianceProof(params: {
    transactionHash: string;
    authorityAddress: string;
  }): Promise<any> {
    if (!this.pool) throw new Error('Not a pool member');

    // Zero-knowledge proof: İşlemi kanıtla ama detayları açıklama
    const proof = await this.pool.generateComplianceProof({
      txHash: params.transactionHash,
      authority: params.authorityAddress,
      signer: async (msg) => await this.trezor.signMessage(msg)
    });

    return proof;
  }

  /**
   * Pool içinde bakiye (private)
   */
  async getPoolBalance(token: string): Promise<string> {
    if (!this.pool) throw new Error('Not a pool member');

    const balance = await this.pool.getBalance(token);
    return ethers.formatEther(balance);
  }
}
```

### 4. Unified Wallet Service

```typescript
// src/services/WalletService.ts

import { ethers } from 'ethers';
import { TrezorManager } from './TrezorManager';
import { RailgunService } from './RailgunService';
import { PrivacyPoolsService } from './PrivacyPoolsService';

export enum PrivacyLevel {
  PUBLIC = 'public',
  RAILGUN = 'railgun',
  PRIVACY_POOL = 'privacy_pool',
  MAXIMUM = 'maximum' // RAILGUN + Privacy Pool
}

export class WalletService {
  private trezor: TrezorManager;
  private railgun: RailgunService;
  private privacyPools: PrivacyPoolsService;
  private provider: ethers.Provider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.trezor = new TrezorManager();
    this.railgun = new RailgunService(this.provider);
    this.privacyPools = new PrivacyPoolsService(this.provider);
  }

  async initialize() {
    await this.trezor.initialize();
    await this.railgun.initialize();
    await this.privacyPools.initialize();

    console.log('✅ Wallet initialized with privacy features');
  }

  /**
   * Send transaction with privacy level
   */
  async send(params: {
    to: string;
    amount: string;
    token?: string;
    privacyLevel: PrivacyLevel;
  }): Promise<string> {
    const token = params.token || ethers.ZeroAddress; // ETH

    switch (params.privacyLevel) {
      case PrivacyLevel.PUBLIC:
        // Normal Ethereum transaction
        return await this.sendPublic(params);

      case PrivacyLevel.RAILGUN:
        // RAILGUN shielded transfer
        await this.railgun.shield({ token, amount: params.amount });
        return await this.railgun.shieldedTransfer({
          to: params.to,
          token,
          amount: params.amount
        });

      case PrivacyLevel.PRIVACY_POOL:
        // Privacy pool transfer
        return await this.privacyPools.swapInPool({
          fromToken: token,
          toToken: token, // Same token transfer
          amount: params.amount
        });

      case PrivacyLevel.MAXIMUM:
        // Combine RAILGUN + Privacy Pool
        await this.railgun.shield({ token, amount: params.amount });
        await this.privacyPools.joinPool({
          poolId: 'default',
          depositAmount: params.amount
        });
        return await this.privacyPools.swapInPool({
          fromToken: token,
          toToken: token,
          amount: params.amount
        });

      default:
        throw new Error('Invalid privacy level');
    }
  }

  private async sendPublic(params: {
    to: string;
    amount: string;
    token?: string;
  }): Promise<string> {
    const from = await this.trezor.getAddress();
    
    const tx: ethers.TransactionRequest = {
      from,
      to: params.to,
      value: ethers.parseEther(params.amount),
      chainId: 1
    };

    // Add nonce and gas
    tx.nonce = await this.provider.getTransactionCount(from);
    const feeData = await this.provider.getFeeData();
    tx.gasPrice = feeData.gasPrice;
    tx.gasLimit = 21000n;

    const signedTx = await this.trezor.signTransaction(tx);
    const txResponse = await this.provider.broadcastTransaction(signedTx);
    await txResponse.wait();

    return txResponse.hash;
  }

  /**
   * Get balance with privacy awareness
   */
  async getBalance(options: {
    token?: string;
    includePrivate?: boolean;
  } = {}): Promise<{
    public: string;
    railgun?: string;
    privacyPool?: string;
    total: string;
  }> {
    const token = options.token || ethers.ZeroAddress;
    const address = await this.trezor.getAddress();

    // Public balance
    const publicBalance = await this.provider.getBalance(address);
    const result: any = {
      public: ethers.formatEther(publicBalance),
    };

    if (options.includePrivate) {
      // RAILGUN private balance
      try {
        result.railgun = await this.railgun.getPrivateBalance(token);
      } catch (e) {
        result.railgun = '0';
      }

      // Privacy pool balance
      try {
        result.privacyPool = await this.privacyPools.getPoolBalance(token);
      } catch (e) {
        result.privacyPool = '0';
      }

      // Total
      result.total = (
        parseFloat(result.public) +
        parseFloat(result.railgun || '0') +
        parseFloat(result.privacyPool || '0')
      ).toString();
    } else {
      result.total = result.public;
    }

    return result;
  }
}
```

---

## 🎨 React UI Components

### Privacy Control Component

```tsx
// src/components/PrivacyControl.tsx

import React, { useState } from 'react';
import { PrivacyLevel } from '../services/WalletService';

interface PrivacyControlProps {
  onPrivacyChange: (level: PrivacyLevel) => void;
}

export const PrivacyControl: React.FC<PrivacyControlProps> = ({
  onPrivacyChange
}) => {
  const [selectedLevel, setSelectedLevel] = useState(PrivacyLevel.PUBLIC);

  const privacyLevels = [
    {
      level: PrivacyLevel.PUBLIC,
      name: 'Public',
      icon: '🌐',
      description: 'Normal Ethereum transaction (fully visible)',
      fee: 'Low'
    },
    {
      level: PrivacyLevel.RAILGUN,
      name: 'Shielded',
      icon: '🛡️',
      description: 'RAILGUN protected (amount & recipient hidden)',
      fee: 'Medium'
    },
    {
      level: PrivacyLevel.PRIVACY_POOL,
      name: 'Privacy Pool',
      icon: '🌊',
      description: 'Pool-based privacy (compliance-friendly)',
      fee: 'Medium'
    },
    {
      level: PrivacyLevel.MAXIMUM,
      name: 'Maximum',
      icon: '🔒',
      description: 'RAILGUN + Privacy Pool (maximum privacy)',
      fee: 'High'
    }
  ];

  const handleSelect = (level: PrivacyLevel) => {
    setSelectedLevel(level);
    onPrivacyChange(level);
  };

  return (
    <div className="privacy-control">
      <h3 className="text-lg font-semibold mb-4">Privacy Level</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {privacyLevels.map((item) => (
          <button
            key={item.level}
            onClick={() => handleSelect(item.level)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${selectedLevel === item.level
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-gray-500">Fee: {item.fee}</span>
            </div>
            <div className="font-semibold text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {item.description}
            </div>
          </button>
        ))}
      </div>

      {selectedLevel !== PrivacyLevel.PUBLIC && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ Privacy transactions take longer to process due to zero-knowledge proof generation.
          </p>
        </div>
      )}
    </div>
  );
};
```

### Send Transaction Component

```tsx
// src/components/SendTransaction.tsx

import React, { useState } from 'react';
import { WalletService, PrivacyLevel } from '../services/WalletService';
import { PrivacyControl } from './PrivacyControl';

export const SendTransaction: React.FC = () => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState(PrivacyLevel.PUBLIC);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const walletService = new WalletService('https://mainnet.infura.io/v3/YOUR-KEY');

  const handleSend = async () => {
    setLoading(true);
    setTxHash('');

    try {
      await walletService.initialize();

      const hash = await walletService.send({
        to,
        amount,
        privacyLevel
      });

      setTxHash(hash);
      alert('Transaction sent successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-transaction p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Send Transaction</h2>

      <div className="space-y-4">
        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount (ETH)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.01"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Privacy Control */}
        <PrivacyControl onPrivacyChange={setPrivacyLevel} />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !to || !amount}
          className={`
            w-full py-3 rounded-lg font-semibold
            ${loading || !to || !amount
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
            }
          `}
        >
          {loading ? 'Processing...' : 'Send Transaction'}
        </button>

        {/* Transaction Hash */}
        {txHash && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-medium text-green-800">
              Transaction Successful!
            </p>
            <p className="text-xs text-green-600 mt-1 break-all">
              Hash: {txHash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🧪 Testing

### Unit Tests

```typescript
// tests/RailgunService.test.ts

import { RailgunService } from '../src/services/RailgunService';
import { ethers } from 'ethers';

describe('RailgunService', () => {
  let service: RailgunService;
  let provider: ethers.Provider;

  beforeEach(() => {
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    service = new RailgunService(provider);
  });

  it('should initialize with Trezor', async () => {
    await service.initialize();
    // Test assertions
  });

  it('should shield ETH to RAILGUN', async () => {
    await service.initialize();
    
    const txHash = await service.shield({
      token: ethers.ZeroAddress,
      amount: '1.0'
    });

    expect(txHash).toBeTruthy();
  });

  it('should perform shielded transfer', async () => {
    await service.initialize();

    const txHash = await service.shieldedTransfer({
      to: '0xRECIPIENT...',
      token: ethers.ZeroAddress,
      amount: '0.5'
    });

    expect(txHash).toBeTruthy();
  });
});
```

---

## 📊 Performance Considerations

### ZK Proof Generation Time

```typescript
// Proof generation süreleri (tahmin)

Shield:              ~5-10 saniye
Shielded Transfer:   ~15-30 saniye
Privacy Pool Swap:   ~20-40 saniye
Maximum Privacy:     ~30-60 saniye

// UI'da loading state göster
// Progress indicator ekle
// Kullanıcıyı bilgilendir
```

---

## 🔐 Güvenlik Best Practices

### 1. Private Key Protection
```typescript
// ❌ ASLA yapma
localStorage.setItem('privateKey', key);

// ✅ Doğru yaklaşım
// Private key sadece Trezor'da kalır
// Uygulama hiçbir zaman görmez
```

### 2. Transaction Verification
```typescript
// Trezor ekranında her zaman göster:
// - Recipient address (FULL)
// - Amount
// - Privacy level
// - Fees
```

### 3. Proof Validation
```typescript
// ZK proof'ları her zaman doğrula
const isValid = await verifyProof(proof);
if (!isValid) {
  throw new Error('Invalid proof');
}
```

---

## 🚀 Deployment

### Environment Variables

```bash
# .env
INFURA_PROJECT_ID=your_project_id
ALCHEMY_API_KEY=your_api_key
RAILGUN_CONTRACT_ADDRESS=0x...
PRIVACY_POOL_ADDRESS=0x...
```

### Build

```bash
# Desktop app build
pnpm build

# Electron packaging
pnpm electron:build
```

---

## 📝 Checklist

### Development
- [ ] Kohaku libraries kuruldu
- [ ] Trezor Connect entegre edildi
- [ ] RAILGUN service implement edildi
- [ ] Privacy Pools service implement edildi
- [ ] UI components hazır
- [ ] Tests yazıldı

### Testing
- [ ] Trezor bağlantısı test edildi
- [ ] Shield/Unshield test edildi
- [ ] Shielded transfer test edildi
- [ ] Privacy pool operations test edildi
- [ ] UI flows test edildi

### Production
- [ ] Security audit yapıldı
- [ ] Performance optimize edildi
- [ ] Error handling eklendi
- [ ] Logging implement edildi
- [ ] Documentation tamamlandı

---

Bu rehber, Kohaku + Trezor entegrasyonu için production-ready bir temel oluşturur! 🚀🔒
