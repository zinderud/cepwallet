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
import { TrezorSecretWalletService } from '../services/TrezorSecretWallet';
export function useTrezorSecretWallet(demoMode = false) {
    // Initialize service with demo mode (only once)
    const serviceRef = useRef(null);
    if (!serviceRef.current) {
        serviceRef.current = new TrezorSecretWalletService(demoMode);
    }
    const [state, setState] = useState({
        isConnected: false,
        isSecretWallet: false,
        address: null,
        device: null,
        session: null,
        isLoading: false,
        error: null,
    });
    useEffect(() => {
        if (demoMode) {
            console.log('🎭 Trezor Hook: Running in DEMO mode');
        }
    }, [demoMode]);
    // Session timeout management
    const sessionTimeout = useRef(null);
    const lastActivity = useRef(Date.now());
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
    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        updateActivity();
        try {
            const deviceInfo = await serviceRef.current.connect();
            setState(prev => ({
                ...prev,
                isConnected: true,
                device: deviceInfo.model,
                session: deviceInfo.session,
                isLoading: false,
            }));
            startSessionTimeout();
            return deviceInfo;
        }
        catch (error) {
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
    const enableSecretWallet = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        updateActivity();
        try {
            const walletInfo = await serviceRef.current.enableSecretWallet();
            setState(prev => ({
                ...prev,
                isSecretWallet: true,
                address: walletInfo.address,
                isLoading: false,
            }));
            startSessionTimeout();
            return walletInfo;
        }
        catch (error) {
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
    const deriveRailgunKeys = useCallback(async (walletId) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        updateActivity();
        try {
            // Derive all three RAILGUN keys
            const keySet = await serviceRef.current.deriveRailgunKeySet(walletId);
            setState(prev => ({ ...prev, isLoading: false }));
            startSessionTimeout();
            return keySet;
        }
        catch (error) {
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
    const signTransaction = useCallback(async (tx) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        updateActivity();
        try {
            const signature = await serviceRef.current.signTransaction(tx);
            setState(prev => ({ ...prev, isLoading: false }));
            startSessionTimeout();
            return signature;
        }
        catch (error) {
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
    const signMessage = useCallback(async (message) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        updateActivity();
        try {
            const result = await serviceRef.current.signMessage(message);
            setState(prev => ({ ...prev, isLoading: false }));
            startSessionTimeout();
            return result;
        }
        catch (error) {
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
        await serviceRef.current.disconnect();
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
