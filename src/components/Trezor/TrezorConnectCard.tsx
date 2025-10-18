/**
 * TrezorConnectCard Component
 * 
 * Initial connection card for Trezor hardware wallet
 */

import React from 'react';

interface TrezorConnectCardProps {
  onConnect: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const TrezorConnectCard: React.FC<TrezorConnectCardProps> = ({
  onConnect,
  isLoading = false,
  error,
}) => {
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      border: '1px solid #2d2d44',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>Trezor Hardware Wallet</h2>
        <p style={{ color: '#999', margin: 0 }}>Connect your Trezor device to continue</p>
      </div>

      {/* Status */}
      <div style={{
        background: '#252541',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#999', marginRight: '10px' }}>Status:</span>
          <span style={{ 
            color: isLoading ? '#ffa500' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {isLoading ? '⏳ Connecting...' : '⭕ Disconnected'}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#1e1e3f',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
      }}>
        <div style={{ color: '#4a9eff', marginBottom: '10px', fontWeight: 'bold' }}>
          ℹ️ Before you continue:
        </div>
        <ul style={{ color: '#bbb', paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
          <li>Connect your Trezor device via USB</li>
          <li>Make sure Trezor Bridge or Trezor Suite is installed</li>
          <li>Your device should be unlocked and ready</li>
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#3d1f1f',
          border: '1px solid #ff4444',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#ff6b6b',
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Connect Button */}
      <button
        onClick={onConnect}
        disabled={isLoading}
        style={{
          width: '100%',
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
        {isLoading ? '⏳ Connecting...' : '📱 Connect Trezor Device'}
      </button>

      {/* Security Note */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
      }}>
        <div style={{ color: '#10b981', marginBottom: '8px', fontWeight: 'bold' }}>
          🛡️ Security Guaranteed
        </div>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          Your private keys never leave the Trezor device. All cryptographic operations
          happen inside the secure element.
        </p>
      </div>
    </div>
  );
};
