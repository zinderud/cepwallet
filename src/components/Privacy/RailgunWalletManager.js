import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * RailgunWalletManager Component
 *
 * UI for creating and managing RAILGUN wallets
 */
import { useState } from 'react';
import { useRailgunWallet } from '../../hooks/useRailgunWallet';
import './RailgunWalletManager.css';
export const RailgunWalletManager = () => {
  const { wallet, shieldPrivateKey, isInitialized, isLoading, error, initializePrivacy, createWallet, clearWallet, } = useRailgunWallet(11155111); // Sepolia testnet
  const [encryptionKey, setEncryptionKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const handleInitialize = async () => {
    try {
      await initializePrivacy(11155111);
    }
    catch (err) {
      console.error('Initialization failed:', err);
    }
  };
  const handleCreateWallet = async () => {
    if (!encryptionKey) {
      alert('Please enter an encryption key (32 bytes)');
      return;
    }
    try {
      await createWallet(encryptionKey, mnemonic || undefined);
      setShowMnemonic(true);
    }
    catch (err) {
      console.error('Wallet creation failed:', err);
    }
  };
  const generateRandomEncryptionKey = () => {
    const randomKey = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setEncryptionKey(randomKey);
  };
  return (_jsxs('div', { className: 'railgun-wallet-manager', children: [_jsx('h2', { children: '\uD83D\uDEE1\uFE0F RAILGUN Wallet Manager' }), _jsxs('div', { className: 'status', children: [_jsxs('div', { className: `status-item ${isInitialized ? 'active' : ''}`, children: [isInitialized ? '✅' : '⏳', ' Privacy Features'] }), _jsxs('div', { className: `status-item ${wallet ? 'active' : ''}`, children: [wallet ? '✅' : '⏳', ' Wallet Created'] }), _jsxs('div', { className: `status-item ${shieldPrivateKey ? 'active' : ''}`, children: [shieldPrivateKey ? '✅' : '⏳', ' Shield Key Loaded'] })] }), error && (_jsxs('div', { className: 'error-message', children: ['\u274C ', error] })), !isInitialized && (_jsxs('div', { className: 'section', children: [_jsx('h3', { children: 'Step 1: Initialize Privacy Features' }), _jsx('button', { onClick: handleInitialize, disabled: isLoading, className: 'btn-primary', children: isLoading ? 'Initializing...' : 'Initialize RAILGUN' }), _jsx('p', { className: 'help-text', children: 'This will initialize the RAILGUN SDK and download necessary artifacts (~2GB on first run)' })] })), isInitialized && !wallet && (_jsxs('div', { className: 'section', children: [_jsx('h3', { children: 'Step 2: Create RAILGUN Wallet' }), _jsxs('div', { className: 'form-group', children: [_jsx('label', { children: 'Encryption Key (32 bytes / 64 hex chars + 0x)' }), _jsxs('div', { className: 'input-group', children: [_jsx('input', { type: 'password', value: encryptionKey, onChange: (e) => setEncryptionKey(e.target.value), placeholder: '0x0000...', className: 'input-field' }), _jsx('button', { onClick: generateRandomEncryptionKey, className: 'btn-secondary', children: 'Generate' })] }), _jsx('p', { className: 'help-text', children: "\uD83D\uDD12 Keep this safe! You'll need it to access your wallet." })] }), _jsxs('div', { className: 'form-group', children: [_jsx('label', { children: 'Mnemonic (Optional - leave empty to generate new)' }), _jsx('input', { type: 'text', value: mnemonic, onChange: (e) => setMnemonic(e.target.value), placeholder: 'word1 word2 word3...', className: 'input-field' })] }), _jsx('button', { onClick: handleCreateWallet, disabled: isLoading || !encryptionKey, className: 'btn-primary', children: isLoading ? 'Creating Wallet...' : 'Create Wallet' })] })), wallet && (_jsxs('div', { className: 'section', children: [_jsx('h3', { children: '\u2705 Wallet Created Successfully' }), _jsxs('div', { className: 'wallet-info', children: [_jsxs('div', { className: 'info-row', children: [_jsx('span', { className: 'label', children: 'Wallet ID:' }), _jsx('code', { className: 'value', children: wallet.railgunWalletId })] }), _jsxs('div', { className: 'info-row', children: [_jsx('span', { className: 'label', children: 'RAILGUN Address:' }), _jsx('code', { className: 'value', children: wallet.railgunAddress })] }), showMnemonic && wallet.mnemonic && (_jsxs('div', { className: 'info-row warning', children: [_jsx('span', { className: 'label', children: '\u26A0\uFE0F Mnemonic (Save this!):' }), _jsx('code', { className: 'value', children: wallet.mnemonic }), _jsx('button', { onClick: () => {
    navigator.clipboard.writeText(wallet.mnemonic);
    alert('Mnemonic copied to clipboard!');
  }, className: 'btn-small', children: 'Copy' })] })), shieldPrivateKey && (_jsxs('div', { className: 'info-row', children: [_jsx('span', { className: 'label', children: 'Shield Key Status:' }), _jsx('span', { className: 'value success', children: '\u2705 Loaded' })] }))] }), _jsxs('div', { className: 'actions', children: [_jsxs('button', { onClick: () => setShowMnemonic(!showMnemonic), className: 'btn-secondary', children: [showMnemonic ? 'Hide' : 'Show', ' Mnemonic'] }), _jsx('button', { onClick: clearWallet, className: 'btn-danger', children: 'Clear Wallet' })] })] })), isLoading && (_jsxs('div', { className: 'loading-overlay', children: [_jsx('div', { className: 'spinner' }), _jsx('p', { children: 'Processing...' })] }))] }));
};
