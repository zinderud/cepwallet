import { useState, useCallback, useEffect } from 'react';

/**
 * Bridge Hook - Connect to Rust Bridge through IPC
 */
interface BridgeState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useBridge() {
  const [state, setState] = useState<BridgeState>({
    isConnected: false,
    isLoading: false,
    error: null
  });

  /**
   * Connect device
   */
  const connectDevice = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await window.cepwallet.bridge.connectDevice();
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect device');
      }
      setState((prev) => ({ ...prev, isConnected: true, isLoading: false }));
      return result.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Disconnect device
   */
  const disconnectDevice = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await window.cepwallet.bridge.disconnectDevice();
      if (!result.success) {
        throw new Error(result.error || 'Failed to disconnect device');
      }
      setState((prev) => ({ ...prev, isConnected: false, isLoading: false }));
      return result.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Get public key
   */
  const getPublicKey = useCallback(
    async (path: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await window.cepwallet.bridge.getPublicKey(path);
        if (!result.success) {
          throw new Error(result.error || 'Failed to get public key');
        }
        setState((prev) => ({ ...prev, isLoading: false }));
        return result.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
        throw error;
      }
    },
    []
  );

  /**
   * Sign transaction
   */
  const signTransaction = useCallback(
    async (path: string, transaction: Record<string, unknown>) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await window.cepwallet.bridge.signTransaction(path, transaction);
        if (!result.success) {
          throw new Error(result.error || 'Failed to sign transaction');
        }
        setState((prev) => ({ ...prev, isLoading: false }));
        return result.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
        throw error;
      }
    },
    []
  );

  /**
   * Sign message
   */
  const signMessage = useCallback(
    async (path: string, message: string, messageType: 'utf8' | 'hex' = 'utf8') => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await window.cepwallet.bridge.signMessage(path, message, messageType);
        if (!result.success) {
          throw new Error(result.error || 'Failed to sign message');
        }
        setState((prev) => ({ ...prev, isLoading: false }));
        return result.data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    connectDevice,
    disconnectDevice,
    getPublicKey,
    signTransaction,
    signMessage
  };
}

export default useBridge;
