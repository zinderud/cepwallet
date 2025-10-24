/**
 * useRailgunWallet Hook
 * 
 * React hook for RAILGUN wallet management
 */

import { useState, useCallback, useEffect } from 'react';
import { tauriApi } from '../api/tauri';
import { createSepoliaTransactionService } from '../services/TransactionService';
import { ethers } from 'ethers';
import type {
  RailgunWallet,
  CreateRailgunWalletParams,
  ShieldTransactionParams,
  UnshieldTransactionParams,
  PrivateTransferParams,
  ShieldedTransaction,
} from '../types';

interface UseRailgunWalletReturn {
  // State
  wallet: RailgunWallet | null;
  shieldPrivateKey: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializePrivacy: (chainId: number) => Promise<void>;
  createWallet: (encryptionKey: string, mnemonic?: string) => Promise<void>;
  loadShieldKey: (walletId: string) => Promise<void>;
  shield: (params: Omit<ShieldTransactionParams, 'railgunAddress' | 'shieldPrivateKey'>) => Promise<ShieldedTransaction>;
  unshield: (params: Omit<UnshieldTransactionParams, 'railgunWalletId' | 'encryptionKey'>) => Promise<ShieldedTransaction>;
  transfer: (params: Omit<PrivateTransferParams, 'railgunWalletId' | 'encryptionKey'>) => Promise<ShieldedTransaction>;
  getBalance: (token: string) => Promise<string>;
  clearWallet: () => void;
}

/**
 * Custom hook for RAILGUN wallet operations
 */
export function useRailgunWallet(
  chainId: number = 11155111, // Default to Sepolia
  encryptionKey?: string
): UseRailgunWalletReturn {
  const [wallet, setWallet] = useState<RailgunWallet | null>(null);
  const [shieldPrivateKey, setShieldPrivateKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Restore wallet from localStorage on mount
   */
  useEffect(() => {
    const storedWallet = localStorage.getItem('railgun_wallet');
    const storedShieldKey = localStorage.getItem('railgun_shield_key');
    const storedInitialized = localStorage.getItem('railgun_initialized');
    
    if (storedWallet) {
      try {
        const parsedWallet = JSON.parse(storedWallet);
        setWallet(parsedWallet);
        console.log('✅ Wallet restored from localStorage:', parsedWallet.railgunAddress);
        
        if (storedShieldKey) {
          setShieldPrivateKey(storedShieldKey);
          console.log('✅ Shield key restored from localStorage');
        }
        
        if (storedInitialized === 'true') {
          setIsInitialized(true);
          console.log('✅ Privacy initialization state restored');
        }
      } catch (err) {
        console.error('❌ Failed to restore wallet from localStorage:', err);
        localStorage.removeItem('railgun_wallet');
        localStorage.removeItem('railgun_shield_key');
        localStorage.removeItem('railgun_initialized');
      }
    }
  }, []); // Run only on mount

  /**
   * Initialize privacy features
   */
  const initializePrivacy = useCallback(async (chainId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await tauriApi.privacy.initialize(chainId);
      setIsInitialized(true);
      localStorage.setItem('railgun_initialized', 'true');
      console.log(`✅ Privacy initialized for chain ${chainId}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize privacy';
      setError(errorMsg);
      console.error('❌ Privacy initialization failed:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new RAILGUN wallet
   */
  const createWallet = useCallback(async (encryptionKey: string, mnemonic?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Creating RAILGUN wallet...');
      console.log('  Encryption key:', encryptionKey.substring(0, 10) + '...');
      console.log('  Mnemonic:', mnemonic ? 'provided' : 'will generate');
      
      // Ensure privacy is initialized first
      if (!isInitialized) {
        console.log('🔄 Privacy not initialized, initializing now...');
        await initializePrivacy(chainId);
      }

      console.log('🔄 Calling Tauri API...');
      const response = await tauriApi.railgunWallet.createWallet({
        encryptionKey,
        mnemonic,
      });

      console.log('✅ Tauri API response:', response);

      const newWallet: RailgunWallet = {
        railgunWalletId: response.railgunWalletId,
        railgunAddress: response.railgunAddress,
        mnemonic: response.mnemonic,
      };

      setWallet(newWallet);
      
      // Auto-load shield key
      console.log('🔄 Loading shield key...');
      await loadShieldKey(newWallet.railgunWalletId);
      
      console.log('✅ RAILGUN wallet created:', newWallet.railgunAddress);
      
      // Store wallet info in localStorage (encrypted in production!)
      localStorage.setItem('railgun_wallet', JSON.stringify(newWallet));
      localStorage.setItem('railgun_encryption_key', encryptionKey);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMsg);
      console.error('❌ Wallet creation failed:', errorMsg);
      console.error('❌ Full error:', err);
      console.error('❌ Error stack:', err?.stack);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [chainId, isInitialized, initializePrivacy]);

  /**
   * Load shield private key for wallet
   */
  const loadShieldKey = useCallback(async (walletId: string) => {
    try {
      const response = await tauriApi.railgunWallet.getShieldKey({
        railgunWalletId: walletId,
      });
      
      setShieldPrivateKey(response.shieldPrivateKey);
      
      // Store shield key in localStorage (encrypted in production!)
      localStorage.setItem('railgun_shield_key', response.shieldPrivateKey);
      
      console.log('✅ Shield key loaded and stored');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load shield key';
      setError(errorMsg);
      console.error('❌ Shield key loading failed:', errorMsg);
      throw err;
    }
  }, []);

  /**
   * Shield tokens (Public → Private)
   */
  const shield = useCallback(async (
    params: Omit<ShieldTransactionParams, 'railgunAddress' | 'shieldPrivateKey'>
  ): Promise<ShieldedTransaction> => {
    if (!wallet || !shieldPrivateKey) {
      throw new Error('Wallet not initialized. Call createWallet() first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔒 Step 1: Generating shield proof...');
      const result = await tauriApi.privacy.shield({
        ...params,
        railgunAddress: wallet.railgunAddress,
        shieldPrivateKey,
      });

      console.log('✅ Shield proof generated');
      console.log('� [TypeScript] Result received from Tauri:', JSON.stringify(result, null, 2));
      console.log('🔍 [TypeScript] Transaction field type:', typeof result.transaction);
      console.log('🔍 [TypeScript] Transaction data:', result.transaction);

      // Check if transaction data is available
      if (result.transaction) {
        console.log('🚀 Step 2: Broadcasting transaction to blockchain...');
        console.log('📍 Wallet Address to Fund:', wallet.mnemonic ? 
          ethers.Wallet.fromPhrase(wallet.mnemonic).address : 
          'No mnemonic available');
        
        const txService = createSepoliaTransactionService();
        const txResult = await txService.broadcastShieldTransaction(
          result.transaction,
          wallet.mnemonic
        );

        if (!txResult.success) {
          throw new Error(`Transaction broadcast failed: ${txResult.error}`);
        }

        console.log('✅ Transaction broadcast successful!');
        console.log('📝 Transaction hash:', txResult.txHash);
        console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/tx/${txResult.txHash}`);
        
        // TODO: Trigger merkletree scan after confirmation
        console.log('⏳ Next: Scan merkletree to update balance (not implemented yet)');
      }

      console.log('✅ Shield operation completed');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Shield failed';
      setError(errorMsg);
      console.error('❌ Shield failed:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, shieldPrivateKey]);

  /**
   * Unshield tokens (Private → Public)
   */
  const unshield = useCallback(async (
    params: Omit<UnshieldTransactionParams, 'railgunWalletId' | 'encryptionKey' | 'mnemonic'>
  ): Promise<ShieldedTransaction> => {
    if (!wallet || !encryptionKey) {
      throw new Error('Wallet not initialized or encryption key missing');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await tauriApi.privacy.unshield({
        ...params,
        railgunWalletId: wallet.railgunWalletId,
        encryptionKey,
        mnemonic: wallet.mnemonic,
      });

      console.log('✅ Tokens unshielded successfully');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unshield failed';
      setError(errorMsg);
      console.error('❌ Unshield failed:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, encryptionKey]);

  /**
   * Private transfer (Private → Private)
   */
  const transfer = useCallback(async (
    params: Omit<PrivateTransferParams, 'railgunWalletId' | 'encryptionKey' | 'mnemonic'>
  ): Promise<ShieldedTransaction> => {
    if (!wallet || !encryptionKey) {
      throw new Error('Wallet not initialized or encryption key missing');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await tauriApi.privacy.transfer({
        ...params,
        railgunWalletId: wallet.railgunWalletId,
        encryptionKey,
        mnemonic: wallet.mnemonic,
      });

      console.log('✅ Private transfer completed');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMsg);
      console.error('❌ Transfer failed:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, encryptionKey]);

  /**
   * Get shielded balance
   */
  const getBalance = useCallback(async (token: string): Promise<string> => {
    try {
      return await tauriApi.privacy.getShieldedBalance(token);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get balance';
      setError(errorMsg);
      console.error('❌ Balance retrieval failed:', errorMsg);
      throw err;
    }
  }, []);

  /**
   * Clear wallet data
   */
  const clearWallet = useCallback(() => {
    setWallet(null);
    setShieldPrivateKey(null);
    setIsInitialized(false);
    localStorage.removeItem('railgun_wallet');
    localStorage.removeItem('railgun_shield_key');
    localStorage.removeItem('railgun_initialized');
    localStorage.removeItem('railgun_encryption_key');
    localStorage.removeItem('railgun_eth_address');
    console.log('🗑️ Wallet cleared from state and localStorage');
  }, []);

  /**
   * Load wallet from localStorage on mount
   */
  useEffect(() => {
    const loadWalletFromStorage = async () => {
      const storedWallet = localStorage.getItem('railgun_wallet');
      if (storedWallet) {
        try {
          const parsedWallet = JSON.parse(storedWallet) as RailgunWallet;
          setWallet(parsedWallet);
          
          // Initialize privacy if needed
          const ready = await tauriApi.privacy.isReady();
          if (!ready) {
            await initializePrivacy(chainId);
          } else {
            setIsInitialized(true);
          }
          
          // Load shield key
          if (parsedWallet.railgunWalletId) {
            await loadShieldKey(parsedWallet.railgunWalletId);
          }
          
          console.log('✅ Wallet loaded from storage');
        } catch (err) {
          console.error('❌ Failed to load wallet from storage:', err);
          localStorage.removeItem('railgun_wallet');
        }
      }
    };

    loadWalletFromStorage();
  }, [chainId, initializePrivacy, loadShieldKey]);

  return {
    // State
    wallet,
    shieldPrivateKey,
    isInitialized,
    isLoading,
    error,
    
    // Actions
    initializePrivacy,
    createWallet,
    loadShieldKey,
    shield,
    unshield,
    transfer,
    getBalance,
    clearWallet,
  };
}
