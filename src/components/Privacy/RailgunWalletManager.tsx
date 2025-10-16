/**
 * RailgunWalletManager Component
 * 
 * UI for creating and managing RAILGUN wallets
 */

import React, { useState } from 'react';
import { useRailgunWallet } from '../../hooks/useRailgunWallet';

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

      <style jsx>{`
        .railgun-wallet-manager {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .status {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .status-item {
          padding: 8px 16px;
          border-radius: 4px;
          background: #fff;
          border: 2px solid #ddd;
          font-weight: 500;
        }

        .status-item.active {
          border-color: #4caf50;
          background: #e8f5e9;
        }

        .error-message {
          padding: 12px;
          background: #ffebee;
          border: 1px solid #f44336;
          border-radius: 4px;
          color: #c62828;
          margin-bottom: 20px;
        }

        .section {
          margin-bottom: 30px;
          padding: 20px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .input-group {
          display: flex;
          gap: 10px;
        }

        .input-field {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .help-text {
          margin-top: 5px;
          font-size: 12px;
          color: #666;
        }

        .wallet-info {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding: 10px;
          background: #fff;
          border-radius: 4px;
        }

        .info-row.warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
        }

        .info-row .label {
          font-weight: 600;
          min-width: 150px;
        }

        .info-row .value {
          flex: 1;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
        }

        .value.success {
          color: #4caf50;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-danger,
        .btn-small {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #2196f3;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1976d2;
        }

        .btn-secondary {
          background: #757575;
          color: white;
        }

        .btn-secondary:hover {
          background: #616161;
        }

        .btn-danger {
          background: #f44336;
          color: white;
        }

        .btn-danger:hover {
          background: #d32f2f;
        }

        .btn-small {
          padding: 5px 10px;
          font-size: 12px;
          background: #4caf50;
          color: white;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1000;
        }

        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
