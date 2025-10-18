/**
 * TrezorPinCard Component
 * 
 * Displays while user enters PIN on Trezor device
 */

import React from 'react';

interface TrezorPinCardProps {
  deviceLabel?: string;
}

export const TrezorPinCard: React.FC<TrezorPinCardProps> = ({ deviceLabel = 'Trezor' }) => {
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      border: '1px solid #2d2d44',
      textAlign: 'center',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>{deviceLabel} Connected</h2>
      </div>

      {/* Device Info */}
      <div style={{
        background: '#252541',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#999' }}>Device:</span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>Trezor Model T</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#999' }}>Status:</span>
          <span style={{ color: '#ffa500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 Locked
          </span>
        </div>
      </div>

      {/* PIN Entry Animation */}
      <div style={{
        background: '#1e1e3f',
        borderRadius: '12px',
        padding: '40px',
        marginBottom: '30px',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            🎯
          </div>
          <div style={{
            width: '120px',
            height: '80px',
            margin: '0 auto',
            border: '3px solid #667eea',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#667eea',
          }}>
            T
          </div>
          <div style={{ marginTop: '15px', color: '#999', fontSize: '14px' }}>
            ← Look here
          </div>
        </div>

        <div style={{ color: '#ffa500', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          ⏳ Enter PIN on your Trezor device...
        </div>
        <p style={{ color: '#999', margin: 0, fontSize: '14px' }}>
          Look at your Trezor screen and enter your PIN using the device buttons
        </p>
      </div>

      {/* Info */}
      <div style={{
        padding: '15px',
        background: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
      }}>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          ℹ️ Your PIN is never shown on this screen for security reasons.
          Always enter it directly on your Trezor device.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
