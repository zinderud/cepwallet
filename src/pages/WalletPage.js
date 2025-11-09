import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Wallet Management Page
 *
 * RAILGUN wallet creation and management with Trezor hardware wallet support
 */
import React, { useState } from 'react';
import { useRailgunWallet } from '../hooks/useRailgunWallet';
import { useTrezorSecretWallet } from '../hooks/useTrezorSecretWallet';
import { navigateTo } from '../hooks/useNavigation';
import { getDemoMnemonic, getDemoAddress, validateDemoConfig } from '../utils/demoConfig';
import { TrezorConnectCard, TrezorPinCard, SecretWalletChoiceCard, PassphraseConfirmCard, RailgunWalletCard, TrezorSuccessCard, } from '../components/Trezor';
/**
 * Derive Ethereum address from encryption key
 * Simple deterministic derivation for display purposes
 */
const deriveEthAddressFromKey = (encryptionKey) => {
    // Remove 0x prefix if present
    const key = encryptionKey.startsWith('0x') ? encryptionKey.slice(2) : encryptionKey;
    // Take last 40 characters (20 bytes) as address
    // In production, this should use proper cryptographic derivation
    const addressPart = key.slice(-40);
    return '0x' + addressPart;
};
export const WalletPage = () => {
    // RAILGUN wallet hook
    const { wallet, shieldPrivateKey, isInitialized, isLoading, error, initializePrivacy, createWallet, clearWallet, } = useRailgunWallet(11155111); // Sepolia
    // UI state
    const [trezorDemoMode, setTrezorDemoMode] = useState(true); // Enable demo mode by default
    // Trezor hook (with demo mode support)
    const trezor = useTrezorSecretWallet(trezorDemoMode);
    const [walletType, setWalletType] = useState(null);
    const [encryptionKey, setEncryptionKey] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [showEncryptionKey, setShowEncryptionKey] = useState(false);
    const [ethAddress, setEthAddress] = useState('');
    // Derive ETH address when wallet is created
    React.useEffect(() => {
        if (wallet && encryptionKey) {
            const derivedAddress = deriveEthAddressFromKey(encryptionKey);
            setEthAddress(derivedAddress);
            // Store in localStorage for persistence
            localStorage.setItem('railgun_eth_address', derivedAddress);
        }
    }, [wallet, encryptionKey]);
    // Restore ETH address and encryption key from localStorage
    React.useEffect(() => {
        const storedEthAddress = localStorage.getItem('railgun_eth_address');
        const storedEncryptionKey = localStorage.getItem('railgun_encryption_key');
        if (storedEthAddress) {
            setEthAddress(storedEthAddress);
        }
        if (storedEncryptionKey) {
            setEncryptionKey(storedEncryptionKey);
        }
    }, []);
    // If wallet is restored from localStorage, set walletType to 'manual'
    React.useEffect(() => {
        if (wallet && !walletType) {
            setWalletType('manual');
        }
    }, [wallet, walletType]);
    const [trezorStep, setTrezorStep] = useState('connect');
    // Trezor handlers
    const handleTrezorConnect = async () => {
        try {
            await trezor.connect();
            setTrezorStep('pin');
            // Wait for device unlock, then move to secret wallet choice
            setTimeout(() => {
                if (trezor.isConnected) {
                    setTrezorStep('secret-wallet-choice');
                }
            }, 2000);
        }
        catch (err) {
            console.error('Trezor connection failed:', err);
        }
    };
    const handleEnableSecretWallet = async () => {
        try {
            setTrezorStep('passphrase');
            await trezor.enableSecretWallet();
            // Wait for passphrase confirmation
            setTimeout(() => {
                if (trezor.isSecretWallet) {
                    setTrezorStep('railgun');
                }
            }, 1500);
        }
        catch (err) {
            console.error('Failed to enable Secret Wallet:', err);
            setTrezorStep('secret-wallet-choice');
        }
    };
    const handleSkipSecretWallet = () => {
        // Skip to RAILGUN with standard wallet
        setTrezorStep('railgun');
    };
    const handleInitializeRailgun = async () => {
        try {
            // First initialize privacy if needed
            if (!isInitialized) {
                await initializePrivacy(11155111);
            }
            // Derive RAILGUN keys from Trezor (use Trezor address as wallet ID)
            const walletId = trezor.address || 'trezor-wallet';
            const railgunKeys = await trezor.deriveRailgunKeys(walletId);
            console.log('RAILGUN keys derived:', railgunKeys);
            // Save encryption key to state for ETH address derivation
            setEncryptionKey(railgunKeys.spendingKey);
            // Demo mode: Use fixed mnemonic from environment for consistent wallet addresses
            // This ensures the same addresses are used across sessions
            const demoMnemonic = trezorDemoMode ? getDemoMnemonic() : undefined;
            // Validate demo configuration
            if (trezorDemoMode) {
                const validation = validateDemoConfig();
                if (!validation.valid) {
                    console.error('❌ Demo configuration error:', validation.message);
                    throw new Error(`Demo configuration error: ${validation.message}`);
                }
                console.log('✅ Demo configuration validated');
                console.log('🎭 Demo Address:', getDemoAddress());
            }
            // Create RAILGUN wallet with Trezor-derived encryption key
            // Note: We use the spending key as the encryption key for now
            await createWallet(railgunKeys.spendingKey, demoMnemonic);
            console.log('✅ Trezor RAILGUN wallet created');
            setTrezorStep('complete');
        }
        catch (err) {
            console.error('Failed to initialize RAILGUN:', err);
        }
    };
    const handleTrezorComplete = () => {
        // Navigate to dashboard
        console.log('Trezor setup complete - navigating to dashboard');
        navigateTo('dashboard');
    };
    // Manual wallet handlers
    const handleInitialize = async () => {
        try {
            await initializePrivacy(11155111);
        }
        catch (err) {
            console.error('Failed to initialize:', err);
        }
    };
    const handleCreateWallet = async () => {
        if (!encryptionKey || encryptionKey.length !== 66) {
            alert('Encryption key must be 66 characters (0x + 64 hex chars)');
            return;
        }
        try {
            console.log('Creating wallet with encryption key:', encryptionKey);
            console.log('Mnemonic:', mnemonic || 'Will generate new');
            await createWallet(encryptionKey, mnemonic || undefined);
            setShowMnemonic(true);
            console.log('Wallet created successfully!');
        }
        catch (err) {
            console.error('Failed to create wallet:', err);
            console.error('Error details:', {
                message: err?.message,
                stack: err?.stack,
                cause: err?.cause,
            });
            // Show detailed error to user
            alert(`Failed to create wallet: ${err?.message || 'Unknown error'}\n\nCheck console for details.`);
        }
    };
    const generateRandomKey = () => {
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const hexKey = '0x' + Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        setEncryptionKey(hexKey);
    };
    return (_jsxs("div", { style: {
            padding: '30px',
            maxWidth: '900px',
            margin: '0 auto',
            minHeight: '100vh',
            background: '#0f1419',
        }, children: [_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsxs("h1", { style: {
                            margin: '0 0 10px',
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }, children: ["\uD83D\uDC5B ", _jsx("span", { children: "RAILGUN Wallet" })] }), _jsx("p", { style: {
                            margin: 0,
                            fontSize: '16px',
                            color: '#999'
                        }, children: "Create and manage your private RAILGUN wallet" })] }), (error || trezor.error) && (_jsxs("div", { style: {
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #ef4444',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }, children: [_jsx("div", { style: {
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#fca5a5',
                            marginBottom: '4px'
                        }, children: "\u274C Error" }), _jsx("div", { style: {
                            fontSize: '14px',
                            color: '#ef4444'
                        }, children: error || trezor.error })] })), !walletType && !wallet && (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '2px solid #fbbf24',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("span", { style: { fontSize: '24px' }, children: "\uD83C\uDFAD" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: '600', color: '#fbbf24', marginBottom: '4px' }, children: "Trezor Demo Mode" }), _jsx("div", { style: { fontSize: '13px', color: '#fcd34d' }, children: trezorDemoMode
                                                    ? 'Simulating hardware wallet - no device required'
                                                    : 'Real Trezor device will be used' })] })] }), _jsxs("label", { style: {
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '60px',
                                    height: '34px',
                                }, children: [_jsx("input", { type: "checkbox", checked: trezorDemoMode, onChange: (e) => setTrezorDemoMode(e.target.checked), style: { opacity: 0, width: 0, height: 0 } }), _jsx("span", { style: {
                                            position: 'absolute',
                                            cursor: 'pointer',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: trezorDemoMode ? '#10b981' : '#64748b',
                                            borderRadius: '34px',
                                            transition: '0.4s',
                                        }, children: _jsx("span", { style: {
                                                position: 'absolute',
                                                content: '""',
                                                height: '26px',
                                                width: '26px',
                                                left: trezorDemoMode ? '30px' : '4px',
                                                bottom: '4px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                transition: '0.4s',
                                            } }) })] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            marginBottom: '30px',
                        }, children: [_jsxs("div", { onClick: () => setWalletType('trezor'), style: {
                                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
                                    borderRadius: '16px',
                                    padding: '40px 30px',
                                    border: '2px solid #667eea',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }, children: [_jsx("div", { style: { fontSize: '64px', marginBottom: '20px' }, children: "\uD83D\uDCB3" }), _jsxs("h3", { style: { margin: '0 0 10px', color: '#fff', fontSize: '20px' }, children: ["Trezor Hardware Wallet", trezorDemoMode && (_jsx("span", { style: {
                                                    marginLeft: '8px',
                                                    padding: '4px 8px',
                                                    background: '#fbbf24',
                                                    color: '#1a1a2e',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    verticalAlign: 'middle',
                                                }, children: "\uD83C\uDFAD DEMO" }))] }), _jsx("p", { style: { margin: '0 0 20px', color: '#bbb', fontSize: '14px', lineHeight: '1.6' }, children: "Maximum security with Trezor device + Secret Wallet passphrase protection" }), _jsx("div", { style: {
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            border: '1px solid #10b981',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            fontSize: '13px',
                                            color: '#6ee7b7',
                                        }, children: "\u2705 Recommended for best security" })] }), _jsxs("div", { onClick: () => setWalletType('manual'), style: {
                                    background: '#1a1a2e',
                                    borderRadius: '16px',
                                    padding: '40px 30px',
                                    border: '2px solid #2d2d44',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.2)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }, children: [_jsx("div", { style: { fontSize: '64px', marginBottom: '20px' }, children: "\u2328\uFE0F" }), _jsx("h3", { style: { margin: '0 0 10px', color: '#fff', fontSize: '20px' }, children: "Manual Wallet" }), _jsx("p", { style: { margin: '0 0 20px', color: '#999', fontSize: '14px', lineHeight: '1.6' }, children: "Create wallet with custom encryption key and optional mnemonic phrase" }), _jsx("div", { style: {
                                            background: 'rgba(255, 165, 0, 0.1)',
                                            border: '1px solid #ffa500',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            fontSize: '13px',
                                            color: '#ffcc80',
                                        }, children: "\u26A0\uFE0F Less secure than hardware wallet" })] })] })] })), walletType === 'trezor' && (_jsxs(_Fragment, { children: [trezorStep === 'connect' && (_jsx(TrezorConnectCard, { onConnect: handleTrezorConnect, isLoading: trezor.isLoading, error: trezor.error })), trezorStep === 'pin' && (_jsx(TrezorPinCard, { deviceLabel: trezor.device || undefined, demoMode: trezorDemoMode, onAutoSkip: () => setTrezorStep('secret-wallet-choice') })), trezorStep === 'secret-wallet-choice' && (_jsx(SecretWalletChoiceCard, { standardAddress: trezor.address || undefined, onEnable: handleEnableSecretWallet, onSkip: handleSkipSecretWallet, isLoading: trezor.isLoading, demoMode: trezorDemoMode })), trezorStep === 'passphrase' && (_jsx(PassphraseConfirmCard, { deviceLabel: trezor.device || undefined, demoMode: trezorDemoMode, onAutoSkip: () => setTrezorStep('railgun') })), trezorStep === 'railgun' && (_jsx(RailgunWalletCard, { secretWalletAddress: trezor.address || '', deviceLabel: trezor.device || undefined, onInitializeRailgun: handleInitializeRailgun, onBack: () => setTrezorStep('secret-wallet-choice'), demoMode: trezorDemoMode })), trezorStep === 'complete' && (_jsx(TrezorSuccessCard, { secretWalletAddress: trezor.address || '', deviceLabel: trezor.device || undefined, onContinue: handleTrezorComplete })), trezorStep === 'connect' && (_jsx("div", { style: { textAlign: 'center', marginTop: '20px' }, children: _jsx("button", { onClick: () => setWalletType(null), style: {
                                padding: '12px 24px',
                                background: 'transparent',
                                color: '#999',
                                border: '2px solid #444',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }, children: "\u2190 Back to Selection" }) }))] })), walletType === 'manual' && (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '16px',
                            marginBottom: '30px'
                        }, children: [_jsx(StatusCard, { icon: "\uD83D\uDE80", label: "Privacy Engine", status: isInitialized ? 'Initialized' : 'Not Initialized', isActive: isInitialized }), _jsx(StatusCard, { icon: "\uD83D\uDC5B", label: "Wallet", status: wallet ? 'Created' : 'Not Created', isActive: !!wallet }), _jsx(StatusCard, { icon: "\uD83D\uDD11", label: "Shield Key", status: shieldPrivateKey ? 'Loaded' : 'Not Loaded', isActive: !!shieldPrivateKey })] }), !isInitialized && (_jsxs("div", { style: {
                            background: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            marginBottom: '20px'
                        }, children: [_jsx("h2", { style: {
                                    margin: '0 0 12px',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }, children: "Step 1: Initialize Privacy Features" }), _jsx("p", { style: {
                                    margin: '0 0 20px',
                                    fontSize: '14px',
                                    color: '#64748b',
                                    lineHeight: '1.6'
                                }, children: "This will initialize the RAILGUN SDK and prepare the privacy infrastructure. First-time initialization may take a few seconds." }), _jsx("button", { onClick: handleInitialize, disabled: isLoading, style: {
                                    padding: '14px 24px',
                                    background: isLoading
                                        ? '#94a3b8'
                                        : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                }, onMouseEnter: (e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                                    }
                                }, onMouseLeave: (e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                    }
                                }, children: isLoading ? '⏳ Initializing...' : '🚀 Initialize RAILGUN' })] })), isInitialized && !wallet && (_jsxs("div", { style: {
                            background: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            marginBottom: '20px'
                        }, children: [_jsx("h2", { style: {
                                    margin: '0 0 12px',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }, children: "Step 2: Create RAILGUN Wallet" }), _jsx("p", { style: {
                                    margin: '0 0 24px',
                                    fontSize: '14px',
                                    color: '#64748b',
                                    lineHeight: '1.6'
                                }, children: "Your RAILGUN wallet will be encrypted with a secure key. Store this key safely - you'll need it to access your wallet." }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#475569'
                                        }, children: "Encryption Key (32 bytes)" }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("input", { type: showEncryptionKey ? 'text' : 'password', value: encryptionKey, onChange: (e) => setEncryptionKey(e.target.value), placeholder: "0x0000000000000000000000000000000000000000000000000000000000000000", style: {
                                                    flex: 1,
                                                    padding: '12px',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontFamily: 'monospace',
                                                    outline: 'none',
                                                }, onFocus: (e) => {
                                                    e.target.style.borderColor = '#3b82f6';
                                                }, onBlur: (e) => {
                                                    e.target.style.borderColor = '#e2e8f0';
                                                } }), _jsx("button", { onClick: () => setShowEncryptionKey(!showEncryptionKey), style: {
                                                    padding: '12px 16px',
                                                    background: '#f1f5f9',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                }, children: showEncryptionKey ? '👁️' : '👁️‍🗨️' }), _jsx("button", { onClick: generateRandomKey, style: {
                                                    padding: '12px 20px',
                                                    background: '#f1f5f9',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#475569',
                                                }, children: "\uD83C\uDFB2 Random" })] }), _jsx("div", { style: {
                                            marginTop: '6px',
                                            fontSize: '12px',
                                            color: '#64748b'
                                        }, children: "Must be 66 characters (0x + 64 hex characters)" })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#475569'
                                        }, children: "Mnemonic (Optional - leave empty to generate)" }), _jsx("input", { type: "text", value: mnemonic, onChange: (e) => setMnemonic(e.target.value), placeholder: "word1 word2 word3 ... (12 words)", style: {
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }, onFocus: (e) => {
                                            e.target.style.borderColor = '#3b82f6';
                                        }, onBlur: (e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        } })] }), _jsx("button", { onClick: handleCreateWallet, disabled: isLoading || !encryptionKey, style: {
                                    padding: '14px 24px',
                                    background: (!encryptionKey || isLoading)
                                        ? '#94a3b8'
                                        : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: (!encryptionKey || isLoading) ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                }, children: isLoading ? '⏳ Creating...' : '✨ Create Wallet' })] })), wallet && (_jsxs("div", { style: {
                            background: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            border: '2px solid #10b981',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                        }, children: [_jsxs("h2", { style: {
                                    margin: '0 0 20px',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }, children: ["\u2705 ", _jsx("span", { children: "Wallet Created Successfully!" })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("div", { style: {
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }, children: "Wallet ID" }), _jsx("div", { style: {
                                            padding: '12px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontFamily: 'monospace',
                                            color: '#1e293b',
                                            wordBreak: 'break-all',
                                            fontWeight: '500'
                                        }, children: wallet.railgunWalletId })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("div", { style: {
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }, children: "RAILGUN Address" }), _jsx("div", { style: {
                                            padding: '12px',
                                            background: '#f0fdf4',
                                            border: '1px solid #86efac',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontFamily: 'monospace',
                                            color: '#059669',
                                            wordBreak: 'break-all',
                                            fontWeight: '500'
                                        }, children: wallet.railgunAddress })] }), ethAddress && (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("div", { style: {
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }, children: [_jsx("span", { children: "ETH Address" }), _jsx("span", { style: {
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    background: '#dbeafe',
                                                    color: '#1e40af',
                                                    borderRadius: '4px',
                                                    fontWeight: '600'
                                                }, children: "For Receiving Test Tokens" })] }), _jsxs("div", { style: {
                                            padding: '12px',
                                            background: '#ecfdf5',
                                            border: '1px solid #6ee7b7',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontFamily: 'monospace',
                                            color: '#047857',
                                            wordBreak: 'break-all',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px'
                                        }, children: [_jsx("span", { children: ethAddress }), _jsx("button", { onClick: () => {
                                                    navigator.clipboard.writeText(ethAddress);
                                                    alert('ETH Address copied to clipboard!');
                                                }, style: {
                                                    padding: '6px 10px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    flexShrink: 0
                                                }, children: "\uD83D\uDCCB Copy" })] })] })), wallet.mnemonic && showMnemonic && (_jsxs("div", { style: {
                                    marginBottom: '20px',
                                    padding: '16px',
                                    background: '#fef3c7',
                                    border: '2px solid #fbbf24',
                                    borderRadius: '12px'
                                }, children: [_jsx("div", { style: {
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: '#92400e',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }, children: "\u26A0\uFE0F Recovery Phrase (Save Securely!)" }), _jsx("div", { style: {
                                            padding: '12px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'monospace',
                                            color: '#1e293b',
                                            fontWeight: '600',
                                            lineHeight: '1.8'
                                        }, children: wallet.mnemonic }), _jsxs("div", { style: {
                                            marginTop: '12px',
                                            fontSize: '12px',
                                            color: '#92400e',
                                            lineHeight: '1.5'
                                        }, children: ["\u26A0\uFE0F ", _jsx("strong", { children: "Never share this phrase!" }), " Anyone with access to it can control your wallet."] })] })), _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr',
                                    gap: '12px',
                                    marginTop: '20px'
                                }, children: [_jsx("button", { onClick: () => navigateTo('dashboard'), style: {
                                            padding: '12px 20px',
                                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: 'white',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                        }, children: "\uD83D\uDCCA Go to Dashboard" }), _jsxs("button", { onClick: () => setShowMnemonic(!showMnemonic), style: {
                                            padding: '12px 20px',
                                            background: '#f1f5f9',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            cursor: 'pointer',
                                        }, children: [showMnemonic ? '👁️ Hide' : '👁️ Show', " Recovery Phrase"] }), _jsx("button", { onClick: () => {
                                            if (confirm('Are you sure? This will clear your wallet from memory.')) {
                                                clearWallet();
                                                setEncryptionKey('');
                                                setMnemonic('');
                                                setShowMnemonic(false);
                                                setEthAddress('');
                                                localStorage.removeItem('railgun_eth_address');
                                            }
                                        }, style: {
                                            padding: '12px 20px',
                                            background: '#fef2f2',
                                            border: '2px solid #fecaca',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                        }, children: "\uD83D\uDDD1\uFE0F Clear Wallet" })] })] })), _jsx("div", { style: { textAlign: 'center', marginTop: '20px' }, children: _jsx("button", { onClick: () => {
                                setWalletType(null);
                                clearWallet();
                            }, style: {
                                padding: '12px 24px',
                                background: 'transparent',
                                color: '#999',
                                border: '2px solid #444',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }, children: "\u2190 Back to Selection" }) })] }))] }));
};
const StatusCard = ({ icon, label, status, isActive }) => (_jsxs("div", { style: {
        padding: '16px',
        background: isActive ? 'rgba(16, 185, 129, 0.1)' : '#1a1a2e',
        border: `2px solid ${isActive ? '#10b981' : '#2d2d44'}`,
        borderRadius: '12px',
        textAlign: 'center'
    }, children: [_jsx("div", { style: { fontSize: '28px', marginBottom: '8px' }, children: icon }), _jsx("div", { style: {
                fontSize: '12px',
                fontWeight: '600',
                color: '#999',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }, children: label }), _jsx("div", { style: {
                fontSize: '14px',
                fontWeight: '700',
                color: isActive ? '#10b981' : '#666'
            }, children: status })] }));
