/**
 * Demo Configuration Utilities
 *
 * Provides consistent demo wallet configuration from environment variables
 */
import { ethers } from 'ethers';
/**
 * Get demo mnemonic from environment
 */
export function getDemoMnemonic() {
    const mnemonic = import.meta.env.VITE_DEMO_MNEMONIC;
    if (!mnemonic) {
        console.warn('⚠️ VITE_DEMO_MNEMONIC not found in .env, using default test mnemonic');
        return 'test test test test test test test test test test test junk';
    }
    return mnemonic;
}
/**
 * Get demo Ethereum address derived from the demo mnemonic
 * Uses standard Ethereum derivation path: m/44'/60'/0'/0/0
 */
export function getDemoAddress() {
    const mnemonic = getDemoMnemonic();
    try {
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        return wallet.address;
    }
    catch (error) {
        console.error('❌ Failed to derive demo address from mnemonic:', error);
        // Fallback to a known test address
        return '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    }
}
/**
 * Validate if demo configuration is properly set
 */
export function validateDemoConfig() {
    const mnemonic = import.meta.env.VITE_DEMO_MNEMONIC;
    if (!mnemonic) {
        return {
            valid: false,
            message: 'VITE_DEMO_MNEMONIC not found in .env file'
        };
    }
    // Validate mnemonic format
    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) {
        return {
            valid: false,
            message: `Invalid mnemonic: expected 12 or 24 words, got ${wordCount}`
        };
    }
    // Try to derive address to validate mnemonic
    try {
        ethers.Wallet.fromPhrase(mnemonic);
        return {
            valid: true,
            message: 'Demo configuration is valid'
        };
    }
    catch (error) {
        return {
            valid: false,
            message: 'Invalid mnemonic phrase'
        };
    }
}
