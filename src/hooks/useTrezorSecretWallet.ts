/**
 * useTrezorSecretWallet Hook
 * 
 * React hook for managing Trezor Secret Wallet connections and operations
 * 
 * Features:
 * - Connect/disconnect to Trezor device
 * - Enable Secret Wallet with passphrase
 * - Derive RAILGUN encryption keys
 * - Sign transactions
 * - State management with loading/error handling
 * 
 * @module useTrezorSecretWallet
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { trezorService } from '../services/TrezorSecretWallet';
import type {
  DeviceInfo,
  WalletInfo,
  RailgunKeySet,
  TransactionRequest,
} from '../types/trezor';

interface TrezorState {
  isConnected: boolean;
  isSecretWallet: boolean;
  address: string | null;
  device: string | null;
  session: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useTrezorSecretWallet() {
  const [state, setState] = useState<TrezorState>({
    isConnected: false,
    isSecretWallet: false,
    address: null,
    device: null,
    session: null,
    isLoading: false,
    error: null,
  });

  // Session timeout management
  const sessionTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef<number>(Date.now());

  // Session timeout: 30 minutes
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  /**
   * Reset last activity time
   */
  const updateActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  /**
   * Start session timeout timer
   */
  const startSessionTimeout = useCallback(() => {
    if (sessionTimeout.current) {
      clearTimeout(sessionTimeout.current);
    }

    sessionTimeout.current = setTimeout(() => {
      console.log('Session timeout - disconnecting Trezor');
      disconnect();
    }, SESSION_TIMEOUT_MS);
  }, [SESSION_TIMEOUT_MS]);

  /**
   * Connect to Trezor device
   */
  const connect = useCallback(async (): Promise<DeviceInfo> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    updateActivity();

    try {
      const deviceInfo = await trezorService.connect();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        device: deviceInfo.model,
        session: deviceInfo.session,
        isLoading: false,
      }));

      startSessionTimeout();

      return deviceInfo;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to Trezor';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [updateActivity, startSessionTimeout]);

  /**
   * Enable Secret Wallet with passphrase
   * Passphrase is entered on Trezor device
   */
  const enableSecretWallet = useCallback(async (): Promise<WalletInfo> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    updateActivity();

    try {
      const walletInfo = await trezorService.enableSecretWallet();
      
      setState(prev => ({
        ...prev,
        isSecretWallet: true,
        address: walletInfo.address,
        isLoading: false,
      }));

      startSessionTimeout();

      return walletInfo;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to enable Secret Wallet';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [updateActivity, startSessionTimeout]);

  /**
   * Derive RAILGUN wallet keys from Trezor
   * ⚠️ Private keys never leave the device
   */
  const deriveRailgunKeys = useCallback(async (walletId: string): Promise<RailgunKeySet> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    updateActivity();

    try {
      // Derive all three RAILGUN keys
      const keySet = await trezorService.deriveRailgunKeySet(walletId);
      
      setState(prev => ({ ...prev, isLoading: false }));

      startSessionTimeout();

      return keySet;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to derive RAILGUN keys';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [updateActivity, startSessionTimeout]);

  /**
   * Sign transaction with Trezor
   * Requires physical approval on device
   */
  const signTransaction = useCallback(async (tx: TransactionRequest): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    updateActivity();

    try {
      const signature = await trezorService.signTransaction(tx);
      
      setState(prev => ({ ...prev, isLoading: false }));

      startSessionTimeout();

      return signature;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign transaction';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [updateActivity, startSessionTimeout]);

  /**
   * Sign message with Trezor
   * Used for authentication
   */
  const signMessage = useCallback(async (message: string): Promise<{ address: string; signature: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    updateActivity();

    try {
      const result = await trezorService.signMessage(message);
      
      setState(prev => ({ ...prev, isLoading: false }));

      startSessionTimeout();

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign message';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [updateActivity, startSessionTimeout]);

  /**
   * Disconnect from Trezor
   * Clears session and all state
   */
  const disconnect = useCallback(async () => {
    // Clear timeout
    if (sessionTimeout.current) {
      clearTimeout(sessionTimeout.current);
      sessionTimeout.current = null;
    }

    await trezorService.disconnect();
    
    setState({
      isConnected: false,
      isSecretWallet: false,
      address: null,
      device: null,
      session: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (sessionTimeout.current) {
        clearTimeout(sessionTimeout.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    enableSecretWallet,
    deriveRailgunKeys,
    signTransaction,
    signMessage,
    disconnect,
    clearError,
    
    // Helper
    updateActivity,
  };
}
