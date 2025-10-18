/**
 * Wallet Management Page
 * 
 * RAILGUN wallet creation and management
 */

import React, { useState } from 'react';
import { useRailgunWallet } from '../hooks/useRailgunWallet';

export const WalletPage: React.FC = () => {
  const {
    wallet,
    shieldPrivateKey,
    isInitialized,
    isLoading,
    error,
    initializePrivacy,
    createWallet,
    clearWallet,
  } = useRailgunWallet(11155111); // Sepolia

  const [encryptionKey, setEncryptionKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);

  const handleInitialize = async () => {
    try {
      await initializePrivacy(11155111);
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
  };

  const handleCreateWallet = async () => {
    if (!encryptionKey || encryptionKey.length !== 66) {
      alert('Encryption key must be 66 characters (0x + 64 hex chars)');
      return;
    }

    try {
      await createWallet(encryptionKey, mnemonic || undefined);
      setShowMnemonic(true);
    } catch (err) {
      console.error('Failed to create wallet:', err);
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

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 10px',
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          👛 <span>RAILGUN Wallet</span>
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#64748b'
        }}>
          Create and manage your private RAILGUN wallet
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px',
          background: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '4px'
          }}>
            ❌ Error
          </div>
          <div style={{
            fontSize: '14px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '30px'
      }}>
        <StatusCard
          icon="🚀"
          label="Privacy Engine"
          status={isInitialized ? 'Initialized' : 'Not Initialized'}
          isActive={isInitialized}
        />
        <StatusCard
          icon="👛"
          label="Wallet"
          status={wallet ? 'Created' : 'Not Created'}
          isActive={!!wallet}
        />
        <StatusCard
          icon="🔑"
          label="Shield Key"
          status={shieldPrivateKey ? 'Loaded' : 'Not Loaded'}
          isActive={!!shieldPrivateKey}
        />
      </div>

      {/* Step 1: Initialize Privacy */}
      {!isInitialized && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            Step 1: Initialize Privacy Features
          </h2>
          <p style={{
            margin: '0 0 20px',
            fontSize: '14px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            This will initialize the RAILGUN SDK and prepare the privacy infrastructure. 
            First-time initialization may take a few seconds.
          </p>
          <button
            onClick={handleInitialize}
            disabled={isLoading}
            style={{
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
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {isLoading ? '⏳ Initializing...' : '🚀 Initialize RAILGUN'}
          </button>
        </div>
      )}

      {/* Step 2: Create Wallet */}
      {isInitialized && !wallet && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            Step 2: Create RAILGUN Wallet
          </h2>
          <p style={{
            margin: '0 0 24px',
            fontSize: '14px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            Your RAILGUN wallet will be encrypted with a secure key. Store this key safely - you'll need it to access your wallet.
          </p>

          {/* Encryption Key Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>
              Encryption Key (32 bytes)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type={showEncryptionKey ? 'text' : 'password'}
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                }}
              />
              <button
                onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                style={{
                  padding: '12px 16px',
                  background: '#f1f5f9',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                {showEncryptionKey ? '👁️' : '👁️‍🗨️'}
              </button>
              <button
                onClick={generateRandomKey}
                style={{
                  padding: '12px 20px',
                  background: '#f1f5f9',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                }}
              >
                🎲 Random
              </button>
            </div>
            <div style={{
              marginTop: '6px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              Must be 66 characters (0x + 64 hex characters)
            </div>
          </div>

          {/* Optional Mnemonic */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>
              Mnemonic (Optional - leave empty to generate)
            </label>
            <input
              type="text"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="word1 word2 word3 ... (12 words)"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>

          <button
            onClick={handleCreateWallet}
            disabled={isLoading || !encryptionKey}
            style={{
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
            }}
          >
            {isLoading ? '⏳ Creating...' : '✨ Create Wallet'}
          </button>
        </div>
      )}

      {/* Wallet Info */}
      {wallet && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '2px solid #10b981',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
        }}>
          <h2 style={{
            margin: '0 0 20px',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ✅ <span>Wallet Created Successfully!</span>
          </h2>

          {/* Wallet ID */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Wallet ID
            </div>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#1e293b',
              wordBreak: 'break-all',
              fontWeight: '500'
            }}>
              {wallet.railgunWalletId}
            </div>
          </div>

          {/* RAILGUN Address */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              RAILGUN Address
            </div>
            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#059669',
              wordBreak: 'break-all',
              fontWeight: '500'
            }}>
              {wallet.railgunAddress}
            </div>
          </div>

          {/* Mnemonic */}
          {wallet.mnemonic && showMnemonic && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#92400e',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⚠️ Recovery Phrase (Save Securely!)
              </div>
              <div style={{
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#1e293b',
                fontWeight: '600',
                lineHeight: '1.8'
              }}>
                {wallet.mnemonic}
              </div>
              <div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#92400e',
                lineHeight: '1.5'
              }}>
                ⚠️ <strong>Never share this phrase!</strong> Anyone with access to it can control your wallet.
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              style={{
                padding: '12px 20px',
                background: '#f1f5f9',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              {showMnemonic ? '👁️ Hide' : '👁️ Show'} Recovery Phrase
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure? This will clear your wallet from memory.')) {
                  clearWallet();
                  setEncryptionKey('');
                  setMnemonic('');
                  setShowMnemonic(false);
                }
              }}
              style={{
                padding: '12px 20px',
                background: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#dc2626',
                cursor: 'pointer',
              }}
            >
              🗑️ Clear Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component

interface StatusCardProps {
  icon: string;
  label: string;
  status: string;
  isActive: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, label, status, isActive }) => (
  <div style={{
    padding: '16px',
    background: isActive ? '#f0fdf4' : '#f8fafc',
    border: `2px solid ${isActive ? '#86efac' : '#e2e8f0'}`,
    borderRadius: '12px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
      {icon}
    </div>
    <div style={{
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '14px',
      fontWeight: '700',
      color: isActive ? '#059669' : '#94a3b8'
    }}>
      {status}
    </div>
  </div>
);
