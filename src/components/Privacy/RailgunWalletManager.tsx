/**
 * RailgunWalletManager Component
 * 
 * UI for creating and managing RAILGUN wallets
 */

import React, { useState } from 'react';
import { useRailgunWallet } from '../../hooks/useRailgunWallet';
import './RailgunWalletManager.css';

export const RailgunWalletManager: React.FC = () => {
  const {
    wallet,
    shieldPrivateKey,
    isInitialized,
    isLoading,
    error,
    initializePrivacy,
    createWallet,
    clearWallet,
  } = useRailgunWallet(11155111); // Sepolia testnet

  const [encryptionKey, setEncryptionKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleInitialize = async () => {
    try {
      await initializePrivacy(11155111);
    } catch (err) {
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
    } catch (err) {
      console.error('Wallet creation failed:', err);
    }
  };

  const generateRandomEncryptionKey = () => {
    const randomKey = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setEncryptionKey(randomKey);
  };

  return (
    <div className="railgun-wallet-manager">
      <h2>🛡️ RAILGUN Wallet Manager</h2>

      {/* Status */}
      <div className="status">
        <div className={`status-item ${isInitialized ? 'active' : ''}`}>
          {isInitialized ? '✅' : '⏳'} Privacy Features
        </div>
        <div className={`status-item ${wallet ? 'active' : ''}`}>
          {wallet ? '✅' : '⏳'} Wallet Created
        </div>
        <div className={`status-item ${shieldPrivateKey ? 'active' : ''}`}>
          {shieldPrivateKey ? '✅' : '⏳'} Shield Key Loaded
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Initialize Privacy */}
      {!isInitialized && (
        <div className="section">
          <h3>Step 1: Initialize Privacy Features</h3>
          <button
            onClick={handleInitialize}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Initializing...' : 'Initialize RAILGUN'}
          </button>
          <p className="help-text">
            This will initialize the RAILGUN SDK and download necessary artifacts (~2GB on first run)
          </p>
        </div>
      )}

      {/* Create Wallet */}
      {isInitialized && !wallet && (
        <div className="section">
          <h3>Step 2: Create RAILGUN Wallet</h3>
          
          <div className="form-group">
            <label>Encryption Key (32 bytes / 64 hex chars + 0x)</label>
            <div className="input-group">
              <input
                type="password"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="0x0000..."
                className="input-field"
              />
              <button
                onClick={generateRandomEncryptionKey}
                className="btn-secondary"
              >
                Generate
              </button>
            </div>
            <p className="help-text">
              🔒 Keep this safe! You'll need it to access your wallet.
            </p>
          </div>

          <div className="form-group">
            <label>Mnemonic (Optional - leave empty to generate new)</label>
            <input
              type="text"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="word1 word2 word3..."
              className="input-field"
            />
          </div>

          <button
            onClick={handleCreateWallet}
            disabled={isLoading || !encryptionKey}
            className="btn-primary"
          >
            {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
          </button>
        </div>
      )}

      {/* Wallet Info */}
      {wallet && (
        <div className="section">
          <h3>✅ Wallet Created Successfully</h3>
          
          <div className="wallet-info">
            <div className="info-row">
              <span className="label">Wallet ID:</span>
              <code className="value">{wallet.railgunWalletId}</code>
            </div>
            
            <div className="info-row">
              <span className="label">RAILGUN Address:</span>
              <code className="value">{wallet.railgunAddress}</code>
            </div>

            {showMnemonic && wallet.mnemonic && (
              <div className="info-row warning">
                <span className="label">⚠️ Mnemonic (Save this!):</span>
                <code className="value">{wallet.mnemonic}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.mnemonic);
                    alert('Mnemonic copied to clipboard!');
                  }}
                  className="btn-small"
                >
                  Copy
                </button>
              </div>
            )}

            {shieldPrivateKey && (
              <div className="info-row">
                <span className="label">Shield Key Status:</span>
                <span className="value success">✅ Loaded</span>
              </div>
            )}
          </div>

          <div className="actions">
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="btn-secondary"
            >
              {showMnemonic ? 'Hide' : 'Show'} Mnemonic
            </button>
            <button
              onClick={clearWallet}
              className="btn-danger"
            >
              Clear Wallet
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};
