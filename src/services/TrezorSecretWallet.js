/**
 * Trezor Secret Wallet Service
 *
 * ⚠️ CRITICAL SECURITY:
 * - Private keys NEVER leave the Trezor device
 * - All cryptographic operations happen inside Secure Element
 * - Uses SLIP-0011 standard for deterministic key derivation
 *
 * @module TrezorSecretWalletService
 */
import TrezorConnect from '@trezor/connect-web';
import { getDemoMnemonic, getDemoAddress } from '../utils/demoConfig';
export class TrezorSecretWalletService {
  isInitialized = false;
  currentSession = null;
  passphraseMode = 'device'; // Always use device for security
  demoMode = false; // Demo mode for testing without hardware
  constructor(demoMode = false) {
    this.demoMode = demoMode;
    if (demoMode) {
      console.log('🎭 Trezor Demo Mode: Simulating hardware wallet');
    }
  }
  /**
     * Initialize Trezor Connect
     * Must be called before any other operations
     */
  async init() {
    if (this.isInitialized) {
      console.log('Trezor Connect already initialized');
      return;
    }
    try {
      await TrezorConnect.init({
        lazyLoad: true,
        manifest: {
          email: 'support@cepwallet.com',
          appUrl: 'https://cepwallet.com',
          appName: 'CepWallet',
        },
        // Passphrase protection enabled
        connectSrc: 'https://connect.trezor.io/9/',
      });
      this.isInitialized = true;
      console.log('Trezor Connect initialized successfully');
    }
    catch (error) {
      console.error('Trezor Connect initialization failed:', error);
      throw new Error(`Failed to initialize Trezor Connect: ${error}`);
    }
  }
  /**
     * Connect to Trezor device
     * Establishes connection and gets device state
     */
  async connect() {
    // Demo mode: simulate device connection
    if (this.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      this.currentSession = 'demo-session-' + Date.now();
      this.isInitialized = true; // Mark as initialized in demo mode
      console.log('🎭 Demo: Simulated Trezor connection');
      return {
        connected: true,
        model: 'Trezor Model T (Demo)',
        session: this.currentSession,
      };
    }
    await this.init();
    try {
      // Get device state (with passphrase support)
      const response = await TrezorConnect.getDeviceState({
        useEmptyPassphrase: false, // Enable Secret Wallet support
      });
      if (!response.success) {
        throw new Error(response.payload.error);
      }
      this.currentSession = response.payload.state;
      console.log('Trezor device connected:', {
        session: this.currentSession,
      });
      return {
        connected: true,
        model: 'Trezor Model T', // TODO: Get from device features
        session: this.currentSession,
      };
    }
    catch (error) {
      console.error('Trezor connection failed:', error);
      throw new Error(`Failed to connect to Trezor: ${error.message || error}`);
    }
  }
  /**
     * Enable Secret Wallet with passphrase
     * Passphrase is entered on Trezor device (not on computer)
     *
     * ⚠️ SECURITY: Passphrase creates a completely different wallet
     */
  async enableSecretWallet() {
    if (!this.currentSession) {
      throw new Error('Trezor not connected. Call connect() first.');
    }
    // Demo mode: simulate Secret Wallet activation
    if (this.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate passphrase entry
      // Use demo address derived from environment mnemonic
      const demoAddress = getDemoAddress();
      const demoMnemonic = getDemoMnemonic();
      console.log('🎭 Demo: Simulated Secret Wallet activation');
      console.log('🎭 Demo Address:', demoAddress);
      console.log('🎭 Demo Mnemonic (first 3 words):', demoMnemonic.split(' ').slice(0, 3).join(' ') + '...');
      return {
        isSecretWallet: true,
        address: demoAddress,
        path: "m/44'/60'/0'/0/0",
        deviceState: this.currentSession,
      };
    }
    try {
      // Get new device state with passphrase
      // User will enter passphrase on Trezor device
      const stateResponse = await TrezorConnect.getDeviceState({
        useEmptyPassphrase: false,
      });
      if (!stateResponse.success) {
        throw new Error(stateResponse.payload.error);
      }
      // Get Secret Wallet address
      const addressResponse = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0", // Standard Ethereum path
        showOnTrezor: true, // Display on Trezor screen for confirmation
      });
      if (!addressResponse.success) {
        throw new Error(addressResponse.payload.error);
      }
      console.log('Secret Wallet enabled:', {
        address: addressResponse.payload.address,
        deviceState: stateResponse.payload.state,
      });
      return {
        isSecretWallet: true,
        address: addressResponse.payload.address,
        path: "m/44'/60'/0'/0/0",
        deviceState: stateResponse.payload.state,
      };
    }
    catch (error) {
      console.error('Secret Wallet activation failed:', error);
      throw new Error(`Failed to enable Secret Wallet: ${error.message || error}`);
    }
  }
  /**
     * Derive RAILGUN encryption key from Trezor
     *
     * ⚠️ CRITICAL SECURITY:
     * - Uses cipherKeyValue API (SLIP-0011 standard)
     * - Private key NEVER leaves Trezor device
     * - Deterministic output (same input = same output)
     * - Requires physical approval on device
     *
     * @param purpose - Key purpose: spending, viewing, or nullifying
     * @param walletId - Unique wallet identifier
     * @returns 32-byte hex encryption key (0x prefixed)
     */
  async deriveRailgunEncryptionKey(purpose, walletId) {
    // Demo mode: generate deterministic mock keys
    if (this.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate device interaction
      // Generate deterministic key based on purpose and walletId
      const seed = `${purpose}-${walletId}-demo`;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      const demoKey = '0x' + Math.abs(hash).toString(16).padStart(64, '0');
      console.log(`🎭 Demo: Simulated ${purpose} key derivation`);
      return demoKey;
    }
    if (!this.isInitialized) {
      throw new Error('Trezor not initialized. Call init() first.');
    }
    try {
      const keyLabel = `RAILGUN_${purpose.toUpperCase()}_KEY_${walletId}`;
      const paddedValue = this.padTo16Bytes(walletId);
      console.log('Deriving RAILGUN key:', {
        purpose,
        walletId: walletId.substring(0, 8) + '...',
        keyLabel,
      });
      // Derive key using Trezor's cipherKeyValue (SLIP-0011)
      const response = await TrezorConnect.cipherKeyValue({
        path: "m/44'/60'/0'/0/0", // Ethereum derivation path
        key: keyLabel,
        value: paddedValue,
        encrypt: true,
        askOnEncrypt: true, // Require physical confirmation
        askOnDecrypt: true,
      });
      if (!response.success) {
        throw new Error(response.payload.error);
      }
      // Return as 0x-prefixed hex
      const derivedKey = '0x' + response.payload.value;
      console.log('Key derived successfully:', {
        purpose,
        keyLength: derivedKey.length,
      });
      return derivedKey;
    }
    catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error(`Failed to derive ${purpose} key: ${error.message || error}`);
    }
  }
  /**
     * Derive complete RAILGUN key set
     * Generates all three required keys: spending, viewing, nullifying
     *
     * @param walletId - Unique wallet identifier
     * @returns Complete RAILGUN key set
     */
  async deriveRailgunKeySet(walletId) {
    console.log('Deriving RAILGUN key set for wallet:', walletId.substring(0, 8) + '...');
    try {
      // Derive each key type separately
      const [spendingKey, viewingKey, nullifyingKey] = await Promise.all([
        this.deriveRailgunEncryptionKey('spending', walletId),
        this.deriveRailgunEncryptionKey('viewing', walletId),
        this.deriveRailgunEncryptionKey('nullifying', walletId),
      ]);
      const keySet = {
        spendingKey,
        viewingKey,
        nullifyingKey,
        walletId,
        createdAt: Date.now(),
      };
      console.log('RAILGUN key set derived successfully');
      return keySet;
    }
    catch (error) {
      console.error('Failed to derive RAILGUN key set:', error);
      throw new Error(`Failed to derive RAILGUN key set: ${error.message || error}`);
    }
  }
  /**
     * Sign Ethereum transaction with Trezor
     * Requires physical approval on device
     *
     * @param tx - Transaction to sign
     * @returns Signature (r + s + v concatenated)
     */
  async signTransaction(tx) {
    if (!this.isInitialized) {
      throw new Error('Trezor not initialized. Call init() first.');
    }
    try {
      console.log('Signing transaction on Trezor:', {
        to: tx.to,
        value: tx.value,
        chainId: tx.chainId,
      });
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
        if (response.payload.error === 'Action cancelled by user') {
          throw new Error('Transaction rejected by user on Trezor device');
        }
        throw new Error(response.payload.error);
      }
      // Concatenate r, s, v components
      const signature = response.payload.r + response.payload.s + response.payload.v;
      console.log('Transaction signed successfully');
      return signature;
    }
    catch (error) {
      console.error('Transaction signing failed:', error);
      throw new Error(`Failed to sign transaction: ${error.message || error}`);
    }
  }
  /**
     * Sign message with Trezor
     * Used for authentication or message verification
     *
     * @param message - Message to sign
     * @returns Signature object with address and signature
     */
  async signMessage(message) {
    if (!this.isInitialized) {
      throw new Error('Trezor not initialized. Call init() first.');
    }
    try {
      console.log('Signing message on Trezor');
      const response = await TrezorConnect.ethereumSignMessage({
        path: "m/44'/60'/0'/0/0",
        message,
      });
      if (!response.success) {
        throw new Error(response.payload.error);
      }
      return {
        address: response.payload.address,
        signature: response.payload.signature,
      };
    }
    catch (error) {
      console.error('Message signing failed:', error);
      throw new Error(`Failed to sign message: ${error.message || error}`);
    }
  }
  /**
     * Disconnect from Trezor and clear session
     * Should be called when done or on timeout
     */
  async disconnect() {
    try {
      this.currentSession = null;
      await TrezorConnect.dispose();
      this.isInitialized = false;
      console.log('Trezor disconnected successfully');
    }
    catch (error) {
      console.error('Error during disconnect:', error);
      // Don't throw, just log
    }
  }
  /**
     * Pad value to 16-byte blocks using PKCS7 padding
     * Required by Trezor's cipherKeyValue API
     *
     * @param value - String to pad
     * @returns Hex-encoded padded value
     */
  padTo16Bytes(value) {
    const blockSize = 16;
    const bytes = Buffer.from(value, 'utf8');
    const paddingLength = blockSize - (bytes.length % blockSize);
    const padding = Buffer.alloc(paddingLength, paddingLength);
    const padded = Buffer.concat([bytes, padding]);
    return padded.toString('hex');
  }
  /**
     * Get current session ID
     */
  getSessionId() {
    return this.currentSession;
  }
  /**
     * Check if Trezor is initialized
     */
  isConnected() {
    return this.isInitialized && this.currentSession !== null;
  }
}
// Export singleton instance (default, no demo mode)
export const trezorService = new TrezorSecretWalletService();
