/**
 * RailgunWalletCard Component
 * 
 * Shows Secret Wallet address and allows RAILGUN wallet initialization
 * with Trezor-derived keys
 */

import React, { useState } from 'react';

interface RailgunWalletCardProps {
  secretWalletAddress: string;
  deviceLabel?: string;
  onInitializeRailgun: () => Promise<void>;
  onBack?: () => void;
}

export const RailgunWalletCard: React.FC<RailgunWalletCardProps> = ({
  secretWalletAddress,
  deviceLabel = 'Trezor',
  onInitializeRailgun,
  onBack,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      await onInitializeRailgun();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize RAILGUN wallet');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '700px',
      margin: '0 auto',
      border: '1px solid #2d2d44',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
        }}>
          ✅
        </div>
        <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>Secret Wallet Activated</h2>
        <p style={{ color: '#10b981', margin: 0, fontWeight: 'bold' }}>
          {deviceLabel} unlocked with passphrase
        </p>
      </div>

      {/* Secret Wallet Address */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        border: '2px solid #667eea',
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <div style={{ fontSize: '28px', marginRight: '12px' }}>🔐</div>
          <div>
            <div style={{ color: '#999', fontSize: '13px' }}>Secret Wallet Address:</div>
            <div style={{ 
              background: '#1e1e3f',
              padding: '12px 15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: '#4a9eff',
              fontSize: '14px',
              marginTop: '8px',
              wordBreak: 'break-all',
              border: '1px solid #2d2d44',
            }}>
              {secretWalletAddress}
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '15px',
        }}>
          <p style={{ color: '#6ee7b7', margin: 0, fontSize: '13px' }}>
            ✅ This is your hidden wallet address, different from standard wallet
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: '#2d2d44', margin: '30px 0' }} />

      {/* RAILGUN Privacy Section */}
      <div style={{
        background: '#252541',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '25px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '36px', marginRight: '15px' }}>🛡️</div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>RAILGUN Privacy Layer</h3>
            <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
              Zero-knowledge proof private transactions
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px',
        }}>
          {[
            { icon: '🔒', title: 'Private Transactions', desc: 'Hide amounts & addresses' },
            { icon: '🎭', title: 'Anonymous', desc: 'Untraceable on-chain' },
            { icon: '⚡', title: 'DeFi Compatible', desc: 'Use with DEXs & protocols' },
            { icon: '🔑', title: 'Trezor-Secured', desc: 'Keys derived in device' },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: '#1e1e3f',
                borderRadius: '8px',
                padding: '15px',
                border: '1px solid #2d2d44',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{feature.icon}</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                {feature.title}
              </div>
              <div style={{ color: '#999', fontSize: '12px' }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid #667eea',
          borderRadius: '8px',
          padding: '15px',
        }}>
          <div style={{ color: '#667eea', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
            🧠 How It Works:
          </div>
          <ol style={{ color: '#bbb', paddingLeft: '20px', margin: 0, fontSize: '13px', lineHeight: '1.7' }}>
            <li>Trezor derives 3 encryption keys using <code style={{ background: '#1e1e3f', padding: '2px 6px', borderRadius: '4px' }}>cipherKeyValue()</code></li>
            <li>Keys create your RAILGUN private identity (spending, viewing, nullifying)</li>
            <li>All transactions are shielded with zero-knowledge proofs</li>
            <li>Only you can decrypt your transaction history</li>
          </ol>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>❌</div>
            <div style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        {onBack && (
          <button
            onClick={onBack}
            disabled={isInitializing}
            style={{
              padding: '16px 30px',
              background: 'transparent',
              color: '#999',
              border: '2px solid #444',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isInitializing ? 'not-allowed' : 'pointer',
              opacity: isInitializing ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isInitializing) {
                e.currentTarget.style.borderColor = '#666';
                e.currentTarget.style.color = '#ccc';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.color = '#999';
            }}
          >
            ← Back
          </button>
        )}

        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          style={{
            flex: 1,
            padding: '18px',
            background: isInitializing 
              ? '#555'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isInitializing ? 'not-allowed' : 'pointer',
            opacity: isInitializing ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isInitializing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isInitializing ? '⏳ Initializing RAILGUN Wallet...' : '🚀 Initialize RAILGUN Wallet'}
        </button>
      </div>

      {/* Bottom Notice */}
      <div style={{
        padding: '15px',
        background: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
        textAlign: 'center',
      }}>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
          🔐 <strong>Privacy Guarantee:</strong> Your RAILGUN keys are derived inside Trezor 
          and never leave the device. All encryption happens locally.
        </p>
      </div>
    </div>
  );
};
