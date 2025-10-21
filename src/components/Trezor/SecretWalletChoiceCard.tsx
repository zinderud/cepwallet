/**
 * SecretWalletChoiceCard Component
 * 
 * Allows user to choose whether to enable Secret Wallet (passphrase)
 */

import React, { useEffect } from 'react';

interface SecretWalletChoiceCardProps {
  standardAddress?: string;
  onEnable: () => Promise<void>;
  onSkip: () => void;
  isLoading?: boolean;
  demoMode?: boolean;
}

export const SecretWalletChoiceCard: React.FC<SecretWalletChoiceCardProps> = ({
  standardAddress,
  onEnable,
  onSkip,
  isLoading = false,
  demoMode = false,
}) => {
  // Auto-enable Secret Wallet in demo mode
  useEffect(() => {
    if (demoMode) {
      const timer = setTimeout(() => {
        console.log('🎭 Demo: Auto-enabling Secret Wallet');
        onEnable();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [demoMode, onEnable]);

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '700px',
      margin: '0 auto',
      border: '1px solid #2d2d44',
    }}>
      {/* Demo Mode Badge */}
      {demoMode && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.2)',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#fcd34d',
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'center',
        }}>
          🎭 Demo Mode - Auto-enabling Secret Wallet in 2s...
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔓</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>Trezor Unlocked</h2>
      </div>

      {/* Standard Wallet Info */}
      {standardAddress && (
        <div style={{
          background: '#252541',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
        }}>
          <div style={{ color: '#999', marginBottom: '10px' }}>Standard Wallet:</div>
          <div style={{ 
            background: '#1e1e3f',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            color: '#4a9eff',
            fontSize: '14px',
            wordBreak: 'break-all',
          }}>
            {standardAddress}
          </div>
        </div>
      )}

      <div style={{ height: '1px', background: '#2d2d44', margin: '30px 0' }} />

      {/* Secret Wallet Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        border: '2px solid #667eea',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '32px', marginRight: '15px' }}>🔐</div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>Secret Wallet (Passphrase Protection)</h3>
            <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
              Enable advanced security with passphrase
            </p>
          </div>
        </div>

        {/* Features */}
        <div style={{ 
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ color: '#10b981', marginBottom: '12px', fontWeight: 'bold' }}>
            ✅ Benefits:
          </div>
          <ul style={{ color: '#bbb', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
            <li>Create hidden wallets with different passphrases</li>
            <li>Plausible deniability - each passphrase = different wallet</li>
            <li>Enhanced security against physical attacks</li>
            <li>Unlimited number of hidden wallets</li>
          </ul>
        </div>

        {/* Warning */}
        <div style={{
          background: 'rgba(255, 165, 0, 0.1)',
          border: '1px solid #ffa500',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
        }}>
          <div style={{ color: '#ffa500', marginBottom: '8px', fontWeight: 'bold' }}>
            ⚠️ Important Warning:
          </div>
          <p style={{ color: '#ffcc80', margin: 0, fontSize: '13px', lineHeight: '1.6' }}>
            Passphrase creates a <strong>completely new hidden wallet</strong>. 
            Write it down securely! If you forget it, the wallet cannot be recovered.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={onEnable}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '16px',
              background: isLoading ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? '⏳ Activating...' : '➕ Use Secret Wallet'}
          </button>

          <button
            onClick={onSkip}
            disabled={isLoading}
            style={{
              padding: '16px 30px',
              background: 'transparent',
              color: '#999',
              border: '2px solid #444',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = '#666';
                e.currentTarget.style.color = '#ccc';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.color = '#999';
            }}
          >
            → Skip
          </button>
        </div>
      </div>

      {/* Bottom Info */}
      <div style={{
        padding: '15px',
        background: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
        textAlign: 'center',
      }}>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
          💡 <strong>Tip:</strong> You can always enable Secret Wallet later from settings.
          For maximum security, it's recommended to use it.
        </p>
      </div>
    </div>
  );
};
