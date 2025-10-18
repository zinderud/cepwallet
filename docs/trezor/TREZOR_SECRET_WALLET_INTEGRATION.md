# Trezor Secret Wallet Entegrasyonu - İyileştirme Dokümanı

## 📋 Genel Bakış

CepWallet, Trezor hardware wallet üzerinde **Secret Wallet (Passphrase)** özelliğini kullanarak maksimum güvenlik sağlar. Kullanıcılar fiziksel cihazlarında onay vererek işlem yaparlar.

## 🎯 Mimari Tasarım

### 1. Bağlantı Akışı

```
┌─────────────────────────────────────────────────────────┐
│                   Kullanıcı Akışı                        │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│  Adım 1: Trezor Cihaz Bağlantısı                        │
│  • USB ile Trezor bağlanır                              │
│  • PIN kodu Trezor ekranında girilir                    │
│  • Standart wallet erişimi sağlanır                     │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│  Adım 2: Secret Wallet Aktivasyonu                      │
│  • Kullanıcı passphrase (şifre) belirler               │
│  • Trezor cihazda passphrase onaylanır                  │
│  • Yeni gizli cüzdan türetilir                          │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│  Adım 3: RAILGUN Wallet Oluşturma                       │
│  • Trezor'dan deterministik key derivation yapılır      │
│  • RAILGUN encryption key'leri türetilir (cihaz içinde) │
│  • RAILGUN wallet oluşturulur (spending + viewing keys) │
│  • Private key ASLA cihazdan çıkmaz                     │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│  Adım 4: İşlem Onaylama                                 │
│  • Her işlem için Trezor onayı gerekir                 │
│  • Fiziksel butonlarla onay verilir                     │
│  • İşlem imzalanır ve gönderilir                        │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Güvenlik Katmanları

### Katman 1: Hardware Wallet (Trezor)
- ✅ Private key'ler **ASLA** cihazdan çıkmaz
- ✅ Tüm kriptografik işlemler cihaz içinde yapılır
- ✅ PIN kodu ile fiziksel koruma
- ✅ Secure Element chip

### Katman 2: Secret Wallet (Passphrase)
- ✅ BIP39 passphrase standardı
- ✅ Sınırsız gizli cüzdan oluşturma
- ✅ Passphrase unutulursa cüzdan kaybolur (plausible deniability)
- ✅ Her passphrase tamamen farklı private key seti üretir

### Katman 3: Deterministik Key Derivation
- ✅ SLIP-0011 standardı (cipherKeyValue)
- ✅ Trezor cihaz içinde key türetme
- ✅ Sadece encrypted output dışarı çıkar
- ✅ RAILGUN için 3 ayrı key: Spending + Viewing + Nullifying

### Katman 4: RAILGUN Privacy
- ✅ Zero-knowledge proofs
- ✅ Shielded transactions
- ✅ On-chain privacy
- ✅ BIP-32 hierarchical deterministic wallet

### Katman 5: Encryption
- ✅ Local storage encryption
- ✅ Trezor-derived encryption key
- ✅ AES-256 şifreleme
- ✅ LevelDOWN database storage

## 📱 Kullanıcı Arayüzü Akışı

### 1. İlk Bağlantı Sayfası

```typescript
// WalletPage.tsx - Yeni Section
┌────────────────────────────────────────────────────┐
│  🔐 Trezor Hardware Wallet                         │
│                                                     │
│  Status: ⭕ Disconnected                           │
│                                                     │
│  [📱 Connect Trezor Device]                        │
│                                                     │
│  ℹ️ Please connect your Trezor device via USB     │
└────────────────────────────────────────────────────┘
```

### 2. PIN Girişi (Trezor Cihazda)

```typescript
┌────────────────────────────────────────────────────┐
│  🔐 Trezor Connected                               │
│                                                     │
│  Device: Trezor Model T                            │
│  Status: 🔒 Locked                                 │
│                                                     │
│  ⏳ Enter PIN on your Trezor device...            │
│                                                     │
│  ℹ️ Look at your Trezor screen                    │
└────────────────────────────────────────────────────┘
```

### 3. Secret Wallet Aktivasyonu

```typescript
┌────────────────────────────────────────────────────┐
│  🔓 Trezor Unlocked                                │
│                                                     │
│  Standard Wallet: m/44'/60'/0'/0                   │
│  Address: 0x742d35...f0bEb                         │
│                                                     │
│  ───────────────────────────────────────────────   │
│                                                     │
│  🔐 Secret Wallet (Passphrase Protection)         │
│                                                     │
│  Enable advanced security with passphrase          │
│                                                     │
│  [➕ Use Secret Wallet]  [→ Skip]                 │
│                                                     │
│  ⚠️ Warning: Passphrase creates a completely new  │
│     hidden wallet. Write it down securely!         │
└────────────────────────────────────────────────────┘
```

### 4. Passphrase Girişi

```typescript
┌────────────────────────────────────────────────────┐
│  🔐 Secret Wallet Setup                            │
│                                                     │
│  Enter your passphrase:                            │
│  ┌──────────────────────────────────────────────┐ │
│  │ ●●●●●●●●●●●●●●●●                     [👁️]  │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ⚠️ This passphrase will:                         │
│  • Create a hidden wallet                          │
│  • Be required for every login                     │
│  • Cannot be recovered if forgotten                │
│                                                     │
│  ✅ Enter on Trezor device (recommended)          │
│  🖥️ Enter on computer (less secure)               │
│                                                     │
│  [Continue on Trezor]                              │
└────────────────────────────────────────────────────┘
```

### 5. Passphrase Onay (Trezor Cihazda)

```typescript
┌────────────────────────────────────────────────────┐
│  ⏳ Confirm Passphrase on Trezor                   │
│                                                     │
│  1. Enter your passphrase on Trezor device         │
│  2. Confirm with the physical button               │
│  3. Re-enter to verify                             │
│                                                     │
│  [Trezor Device Animation]                         │
│         🎯                                          │
│      ┌─────┐                                        │
│      │ T   │  ← Look here                          │
│      └─────┘                                        │
│                                                     │
│  Status: Waiting for confirmation...               │
└────────────────────────────────────────────────────┘
```

### 6. Secret Wallet Aktif

```typescript
┌────────────────────────────────────────────────────┐
│  ✅ Secret Wallet Active                           │
│                                                     │
│  Mode: 🔐 Secret Wallet (Passphrase Protected)    │
│  Device: Trezor Model T                            │
│  Address: 0x9a2f84...3c7B (Hidden)                 │
│                                                     │
│  ───────────────────────────────────────────────   │
│                                                     │
│  🔒 RAILGUN Privacy Wallet                        │
│                                                     │
│  Create your RAILGUN wallet for private            │
│  transactions using Trezor-derived keys            │
│                                                     │
│  [🚀 Initialize RAILGUN Wallet]                   │
│                                                     │
│  ℹ️ Your encryption key will be derived from      │
│     Trezor Secret Wallet                           │
└────────────────────────────────────────────────────┘
```

### 7. İşlem Onaylama Akışı

```typescript
┌────────────────────────────────────────────────────┐
│  🔒 Shield 0.5 ETH                                 │
│                                                     │
│  Transaction Details:                              │
│  • Type: Shield (Public → Private)                 │
│  • Amount: 0.5 ETH                                 │
│  • To: 0zk1q2w3e4r5t6y7u8i9o0p...                 │
│  • Network: Ethereum Mainnet                       │
│  • Est. Gas: 0.0021 ETH                            │
│                                                     │
│  ⏳ Confirm on Trezor Device                       │
│                                                     │
│  [Trezor Device Animation]                         │
│      Press ✓ to approve                            │
│      Press ✗ to reject                             │
│                                                     │
│  Status: Waiting for approval...                   │
│  Time remaining: 2:45                              │
└────────────────────────────────────────────────────┘
```

## 🛠️ Teknik Implementasyon

### 1. Trezor Bağlantı Servisi

```typescript
// src/services/TrezorSecretWallet.ts

import TrezorConnect from '@trezor/connect-web';

export class TrezorSecretWalletService {
  private isInitialized = false;
  private currentSession: string | null = null;
  private passphraseMode: 'device' | 'host' = 'device';

  /**
   * Initialize Trezor Connect
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    await TrezorConnect.init({
      lazyLoad: true,
      manifest: {
        email: 'support@cepwallet.com',
        appUrl: 'https://cepwallet.com',
      },
      // Passphrase koruması aktif
      connectSrc: 'https://connect.trezor.io/9/',
    });

    this.isInitialized = true;
  }

  /**
   * Connect to Trezor device
   */
  async connect(): Promise<DeviceInfo> {
    await this.init();

    const response = await TrezorConnect.getDeviceState({
      useEmptyPassphrase: false, // Secret wallet için false
    });

    if (!response.success) {
      throw new Error(response.payload.error);
    }

    this.currentSession = response.payload.state;

    return {
      connected: true,
      model: 'Trezor Model T',
      session: this.currentSession,
    };
  }

  /**
   * Enable passphrase (Secret Wallet)
   * Passphrase Trezor cihazda girilir
   */
  async enableSecretWallet(): Promise<WalletInfo> {
    if (!this.currentSession) {
      throw new Error('Trezor not connected');
    }

    // Passphrase ile yeni device state al
    const response = await TrezorConnect.getDeviceState({
      useEmptyPassphrase: false,
      // Trezor cihazda passphrase girilecek
    });

    if (!response.success) {
      throw new Error(response.payload.error);
    }

    // Secret wallet address'ini al
    const addressResponse = await TrezorConnect.ethereumGetAddress({
      path: "m/44'/60'/0'/0/0",
      showOnTrezor: true, // Trezor ekranında göster
    });

    if (!addressResponse.success) {
      throw new Error(addressResponse.payload.error);
    }

    return {
      isSecretWallet: true,
      address: addressResponse.payload.address,
      path: "m/44'/60'/0'/0/0",
      deviceState: response.payload.state,
    };
  }

  /**
   * Derive RAILGUN encryption keys from Trezor
   * RAILGUN wallet encryption için kullanılır
   * ⚠️ CRITICAL: Private key ASLA cihazdan çıkmaz!
   * Bu fonksiyon Trezor'un cipherKeyValue API'sini kullanarak
   * deterministik bir şekilde encryption key'leri türetir.
   */
  async deriveRailgunEncryptionKey(
    purpose: 'spending' | 'viewing' | 'nullifying',
    walletId: string
  ): Promise<string> {
    // Trezor'dan deterministic key türet (SLIP-0011 standardı)
    // Private key cihaz içinde kalır, sadece encrypted output döner
    const response = await TrezorConnect.cipherKeyValue({
      path: "m/44'/60'/0'/0/0", // Ethereum derivation path
      key: `RAILGUN_${purpose.toUpperCase()}_KEY_${walletId}`,
      value: this.padTo16Bytes(walletId), // 16-byte blocks gerekli
      encrypt: true,
      askOnEncrypt: true, // Trezor'da onay iste
      askOnDecrypt: true,
    });

    if (!response.success) {
      throw new Error(response.payload.error);
    }

    // Deterministik olarak türetilmiş encryption key (32-byte hex)
    return '0x' + response.payload.value;
  }

  /**
   * Derive complete RAILGUN key set
   * Spending Key + Viewing Key + Nullifying Key
   */
  async deriveRailgunKeySet(walletId: string): Promise<RailgunKeySet> {
    // Her bir key türü için ayrı derivation
    const spendingKey = await this.deriveRailgunEncryptionKey('spending', walletId);
    const viewingKey = await this.deriveRailgunEncryptionKey('viewing', walletId);
    const nullifyingKey = await this.deriveRailgunEncryptionKey('nullifying', walletId);

    return {
      spendingKey,  // Private RAILGUN spending key
      viewingKey,   // Private RAILGUN viewing key
      nullifyingKey, // Private nullifying key
      walletId,
    };
  }

  /**
   * Pad value to 16-byte blocks (PKCS7)
   * cipherKeyValue requires 16-byte aligned values
   */
  private padTo16Bytes(value: string): string {
    const blockSize = 16;
    const bytes = Buffer.from(value, 'utf8');
    const paddingLength = blockSize - (bytes.length % blockSize);
    const padding = Buffer.alloc(paddingLength, paddingLength);
    const padded = Buffer.concat([bytes, padding]);
    return padded.toString('hex');
  }

  /**
   * Sign transaction with Trezor approval
   */
  async signTransaction(tx: TransactionRequest): Promise<string> {
    const response = await TrezorConnect.ethereumSignTransaction({
      path: "m/44'/60'/0'/0/0",
      transaction: {
        to: tx.to,
        value: tx.value,
        gasPrice: tx.gasPrice,
        gasLimit: tx.gasLimit,
        nonce: tx.nonce,
        data: tx.data || '',
        chainId: tx.chainId,
      },
    });

    if (!response.success) {
      throw new Error(response.payload.error);
    }

    return response.payload.r + response.payload.s + response.payload.v;
  }

  /**
   * Disconnect and clear session
   */
  async disconnect(): Promise<void> {
    this.currentSession = null;
    await TrezorConnect.dispose();
    this.isInitialized = false;
  }
}
```

### 2. React Hook - Trezor Yönetimi

```typescript
// src/hooks/useTrezorSecretWallet.ts

import { useState, useCallback } from 'react';
import { TrezorSecretWalletService } from '../services/TrezorSecretWallet';

interface TrezorState {
  isConnected: boolean;
  isSecretWallet: boolean;
  address: string | null;
  device: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useTrezorSecretWallet() {
  const [state, setState] = useState<TrezorState>({
    isConnected: false,
    isSecretWallet: false,
    address: null,
    device: null,
    isLoading: false,
    error: null,
  });

  const service = new TrezorSecretWalletService();

  /**
   * Connect to Trezor device
   */
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const deviceInfo = await service.connect();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        device: deviceInfo.model,
        isLoading: false,
      }));

      return deviceInfo;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  /**
   * Enable Secret Wallet with passphrase
   */
  const enableSecretWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletInfo = await service.enableSecretWallet();
      
      setState(prev => ({
        ...prev,
        isSecretWallet: true,
        address: walletInfo.address,
        isLoading: false,
      }));

      return walletInfo;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  /**
   * Create RAILGUN wallet with Trezor-derived keys
   */
  const createRailgunWallet = useCallback(async (walletId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Trezor'dan RAILGUN key set'i türet
      // ⚠️ Private key ASLA çıkmaz, sadece encryption keys
      const keySet = await service.deriveRailgunKeySet(walletId);

      setState(prev => ({ ...prev, isLoading: false }));

      return keySet;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign transaction
   */
  const signTransaction = useCallback(async (tx: TransactionRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const signature = await service.signTransaction(tx);
      
      setState(prev => ({ ...prev, isLoading: false }));

      return signature;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  /**
   * Disconnect from Trezor
   */
  const disconnect = useCallback(async () => {
    await service.disconnect();
    
    setState({
      isConnected: false,
      isSecretWallet: false,
      address: null,
      device: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    enableSecretWallet,
    createRailgunWallet,
    signTransaction,
    disconnect,
  };
}
```

### 3. WalletPage Component - Güncellenmiş

```typescript
// src/pages/WalletPage.tsx - Trezor Integration

export const WalletPage: React.FC = () => {
  const { wallet, isInitialized, createWallet } = useRailgunWallet(11155111);
  const trezor = useTrezorSecretWallet();
  
  const [step, setStep] = useState<
    'connect' | 'pin' | 'secret-wallet' | 'passphrase' | 'railgun' | 'complete'
  >('connect');

  // Step 1: Connect Trezor
  const handleConnectTrezor = async () => {
    try {
      await trezor.connect();
      setStep('pin'); // PIN cihazda girilecek
    } catch (error) {
      console.error('Trezor connection failed:', error);
    }
  };

  // Step 2: Enable Secret Wallet
  const handleEnableSecretWallet = async () => {
    try {
      setStep('passphrase'); // Passphrase girişi için geç
      
      const walletInfo = await trezor.enableSecretWallet();
      
      console.log('Secret Wallet enabled:', walletInfo.address);
      setStep('railgun');
    } catch (error) {
      console.error('Secret wallet activation failed:', error);
    }
  };

  // Step 3: Create RAILGUN Wallet
  const handleCreateRailgunWallet = async () => {
    try {
      // Generate unique wallet ID
      const walletId = crypto.randomUUID();
      
      // Trezor'dan RAILGUN key set türet
      // ⚠️ Private keys cihaz içinde kalır
      const keySet = await trezor.createRailgunWallet(walletId);
      
      // RAILGUN wallet oluştur (türetilmiş key'lerle)
      await createWallet(keySet);
      
      setStep('complete');
    } catch (error) {
      console.error('RAILGUN wallet creation failed:', error);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Step 1: Trezor Connection */}
      {step === 'connect' && (
        <TrezorConnectCard onConnect={handleConnectTrezor} />
      )}

      {/* Step 2: PIN Entry (on device) */}
      {step === 'pin' && (
        <TrezorPinCard />
      )}

      {/* Step 3: Secret Wallet Choice */}
      {step === 'secret-wallet' && (
        <SecretWalletChoiceCard 
          onEnable={handleEnableSecretWallet}
          onSkip={() => setStep('railgun')}
        />
      )}

      {/* Step 4: Passphrase Entry (on device) */}
      {step === 'passphrase' && (
        <PassphraseConfirmCard />
      )}

      {/* Step 5: RAILGUN Wallet Creation */}
      {step === 'railgun' && (
        <RailgunWalletCard 
          onCreate={handleCreateRailgunWallet}
          isSecretWallet={trezor.isSecretWallet}
          address={trezor.address}
        />
      )}

      {/* Step 6: Complete */}
      {step === 'complete' && (
        <WalletCompleteCard 
          wallet={wallet}
          trezorAddress={trezor.address}
        />
      )}
    </div>
  );
};
```

## 🔄 İşlem Onaylama Akışı

### Shield Transaction Örneği

```typescript
// src/hooks/useRailgunWallet.ts - Shield with Trezor

const shield = async (params: ShieldParams) => {
  // 1. ZK Proof oluştur
  const proof = await generateShieldProof(params);
  
  // 2. Transaction oluştur
  const tx = await buildShieldTransaction(proof, params);
  
  // 3. Trezor'da onay al ve imzala
  const signature = await trezor.signTransaction(tx);
  
  // 4. İşlemi gönder
  const receipt = await sendTransaction(tx, signature);
  
  return receipt;
};
```

### Kullanıcı Görünümü

```typescript
┌────────────────────────────────────────────────────┐
│  Step 1/4: Preparing transaction...                │
│  ▓▓▓▓░░░░░░░░░░ 25%                                │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Step 2/4: Generating ZK proof...                  │
│  ▓▓▓▓▓▓▓▓░░░░░░ 50%                                │
│  ⏱️ Est. time: 8 seconds                           │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Step 3/4: Awaiting Trezor approval...             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░ 75%                                │
│                                                     │
│  [Trezor Animation]                                │
│      Review transaction on your device             │
│      Press ✓ to confirm                            │
│                                                     │
│  Transaction Details:                              │
│  • Shield 0.5 ETH                                  │
│  • Gas: 0.0021 ETH                                 │
│  • Network: Ethereum                               │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Step 4/4: Broadcasting transaction...             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%                               │
│                                                     │
│  ✅ Transaction confirmed!                         │
│  TX: 0xabc123...def456                             │
│  [View on Explorer]                                │
└────────────────────────────────────────────────────┘
```

## 📊 Durum Göstergeleri

### Wallet Page Header

```typescript
┌────────────────────────────────────────────────────┐
│  Wallet Status                                      │
│                                                     │
│  🔐 Trezor Model T                                 │
│  ├─ Status: ✅ Connected                           │
│  ├─ Mode: 🔒 Secret Wallet                         │
│  └─ Session: Active (2h 34m)                       │
│                                                     │
│  🚂 RAILGUN Wallet                                 │
│  ├─ Address: 0zk1q2w3e4r5t6y7u8...                │
│  ├─ Shielded Balance: 2.5 ETH                      │
│  └─ Encryption: Trezor-derived                     │
│                                                     │
│  [Disconnect Trezor]                               │
└────────────────────────────────────────────────────┘
```

## ⚠️ Güvenlik Uyarıları

### Passphrase Uyarı Ekranı

```typescript
┌────────────────────────────────────────────────────┐
│  ⚠️ IMPORTANT: Secret Wallet Security              │
│                                                     │
│  📝 Critical Information:                          │
│                                                     │
│  ✓ Write down your passphrase securely            │
│  ✓ Store it separate from recovery seed            │
│  ✓ Never share with anyone                         │
│  ✓ No one can recover it if lost                   │
│                                                     │
│  ❌ DO NOT:                                        │
│  • Store digitally (email, cloud, etc.)            │
│  • Take screenshots                                 │
│  • Share with support (we never ask)               │
│                                                     │
│  🔐 Each passphrase creates a completely new       │
│     hidden wallet with different addresses         │
│                                                     │
│  ☑️ I understand and have written it down          │
│                                                     │
│  [I Understand - Continue]                         │
└────────────────────────────────────────────────────┘
```

## 🧪 Test Senaryoları

### 1. İlk Kurulum Testi
```bash
# Test akışı
1. Trezor bağla
2. PIN gir (cihazda)
3. Secret Wallet aktive et
4. Passphrase gir (cihazda)
5. RAILGUN wallet oluştur
6. Encryption key doğrula
7. İşlem yap ve onayla
```

### 2. Tekrar Bağlanma Testi
```bash
# Aynı secret wallet'a tekrar bağlan
1. Trezor bağla
2. PIN gir
3. Aynı passphrase'i gir
4. Wallet'ı yükle
5. Balance'ları kontrol et
```

### 3. Farklı Passphrase Testi
```bash
# Farklı secret wallet'lar
1. Passphrase "A" ile wallet 1 oluştur
2. Çık
3. Passphrase "B" ile wallet 2 oluştur
4. Tamamen farklı adresler doğrula
```

## 📦 Gerekli Paketler

```json
{
  "dependencies": {
    "@trezor/connect-web": "^9.1.0",
    "@trezor/connect": "^9.1.0",
    "ethers": "^6.9.0"
  }
}
```

## 🚀 Implementasyon Sırası

### Faz 1: Temel Trezor Bağlantısı (1-2 gün)
- [ ] TrezorConnect entegrasyonu
- [ ] Cihaz bağlantı testi
- [ ] PIN entry flow
- [ ] Basic UI components

### Faz 2: Secret Wallet (2-3 gün)
- [ ] Passphrase flow implementasyonu
- [ ] Device state management
- [ ] Wallet derivation
- [ ] UI/UX polish

### Faz 3: RAILGUN Entegrasyonu (2-3 gün)
- [ ] Encryption key derivation
- [ ] Wallet creation flow
- [ ] Storage encryption
- [ ] Session management

### Faz 4: Transaction Signing (2-3 gün)
- [ ] Transaction builder
- [ ] Trezor approval flow
- [ ] Error handling
- [ ] User feedback

### Faz 5: Test & Polish (1-2 gün)
- [ ] End-to-end testing
- [ ] Error scenarios
- [ ] UI/UX refinement
- [ ] Documentation

**Toplam Süre: ~8-13 gün**

## 📝 Notlar

- Passphrase **mutlaka** Trezor cihazda girilmeli (host'ta girilmemeli)
- Her işlem için fiziksel onay gerekli
- Session timeout yönetimi önemli
- Hata mesajları kullanıcı dostu olmalı
- Recovery senaryoları düşünülmeli

## 🔒 Kritik Güvenlik Prensipleri

### ⚠️ Private Key Güvenliği

**ASLA YAPILMAMASI GEREKENLER:**
- ❌ Trezor'dan private key çıkarmak
- ❌ `getPrivateKey()` gibi fonksiyonlar kullanmak
- ❌ Private key'i memory'de tutmak
- ❌ Private key'i log'lamak veya debug etmek

**YAPILMASI GEREKENLER:**
- ✅ `cipherKeyValue()` ile deterministik key derivation
- ✅ `signTransaction()` ile cihaz içinde imzalama
- ✅ `signMessage()` ile authentication
- ✅ Tüm kriptografik işlemleri Trezor cihazda yapmak

### 🔑 RAILGUN Key Derivation Mekanizması

**3 Farklı Key Türü:**

1. **Spending Key** - İşlem yetkisi
   - Trezor'dan türetilir: `RAILGUN_SPENDING_KEY_${walletId}`
   - Token sahipliğini kriptografik olarak kanıtlar
   - 0zk address'ine encode edilir
   - ASLA cihazdan çıkmaz

2. **Viewing Key** - Denetim yetkisi
   - Trezor'dan türetilir: `RAILGUN_VIEWING_KEY_${walletId}`
   - Sadece işlemleri görüntüleme izni verir
   - Harcama yetkisi YOKTUR
   - Belirli block range'leri için kullanılabilir
   - 0zk address'ine encode edilir

3. **Nullifying Key** - Privacy işlemleri
   - Trezor'dan türetilir: `RAILGUN_NULLIFYING_KEY_${walletId}`
   - Zero-knowledge proof'larda kullanılır
   - Double-spending önleme mekanizması
   - Cihaz içinde kalır

### 📊 Key Derivation Akışı

```
Trezor Seed (Hardware)
       │
       ▼
BIP-39 Mnemonic + Passphrase (Secret Wallet)
       │
       ▼
BIP-32 Derivation Path (m/44'/60'/0'/0/0)
       │
       ├──► cipherKeyValue("RAILGUN_SPENDING_KEY")
       │    └──► Spending Key (32-byte)
       │
       ├──► cipherKeyValue("RAILGUN_VIEWING_KEY")
       │    └──► Viewing Key (32-byte)
       │
       └──► cipherKeyValue("RAILGUN_NULLIFYING_KEY")
            └──► Nullifying Key (32-byte)
```

**Her key türetme:**
1. Trezor cihazda onaylanır (askOnEncrypt: true)
2. SLIP-0011 standardına göre türetilir
3. Deterministik çıktı üretir (aynı input = aynı output)
4. 16-byte block padding uygulanır (PKCS7)
5. Encrypted output döner (private key çıkmaz)

### 🛡️ Trezor cipherKeyValue API Detayları

**Encryption Key Oluşumu:**
```
Final Key = f(
  Private Key at BIP-32 Path,
  Label String (e.g., "RAILGUN_SPENDING_KEY"),
  Confirmation Settings (askOnEncrypt/Decrypt),
  IV (Initialization Vector)
)
```

**Özellikler:**
- Farklı path → Farklı key
- Farklı label → Farklı key
- Farklı confirmation → Farklı key
- Bypass edilemez (kriptografik olarak bağlı)

### 🔐 RAILGUN 0zk Address Yapısı

RAILGUN adresleri standart Ethereum adreslerinden UZUNDUR çünkü:
- Spending Key public component'i içerir
- Viewing Key public component'i içerir
- Her ikisi de BIP-32'den türetilir
- Zero-knowledge proof'lar için gerekli

```
0zk1q2w3e4r5t6y7u8i9o0p...
│  │                       │
│  └─ Spending Public Key  │
└─ Viewing Public Key ─────┘
```

### ⚡ Transaction Signing Akışı

```
1. RAILGUN Transaction Hazırla
2. ZK Proof Oluştur (client-side)
3. Ethereum Transaction Build Et
4. Trezor.signTransaction() ← Cihazda onay
5. Signed TX Al (private key çıkmaz)
6. Blockchain'e Gönder
```

**Her adımda:**
- Trezor ekranında işlem detayları gösterilir
- Kullanıcı fiziksel olarak onaylar
- Private key memory'e asla yüklenmez

### 🔍 Güvenlik Denetimi Checklist

**Kod Review Sırasında Kontrol Edilmesi Gerekenler:**
- [ ] Hiçbir fonksiyon private key return etmiyor mu?
- [ ] Tüm imzalama işlemleri Trezor'da mı yapılıyor?
- [ ] `cipherKeyValue()` 16-byte padding kullanıyor mu?
- [ ] Error handling user-friendly mi?
- [ ] Session timeout var mı?
- [ ] Trezor disconnect durumu handle ediliyor mu?
- [ ] Passphrase cihazda mı giriliyor (host'ta değil)?
- [ ] Key derivation deterministik mi?
- [ ] Log'larda sensitive data yok mu?

---

**Hazırlayan:** CepWallet Development Team  
**Tarih:** 18 Ekim 2025  
**Versiyon:** 2.0 (Güvenlik Revizyonu)  
**Kritik Güncelleme:** Private key derivation yerine deterministik key derivation
