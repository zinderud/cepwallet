import React from 'react';
import { useWallet } from '../../hooks/useWallet';

export const WalletConnect: React.FC = () => {
  const { connectWallet, walletAddress, loading, error } = useWallet();

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#475569' }}>💼 Software Wallet</h2>
      
      {!walletAddress ? (
        <div>
          <p style={{ color: '#64748b', marginBottom: '15px' }}>
            Create or connect a software wallet
          </p>
          <button 
            onClick={connectWallet}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            {loading ? 'Connecting...' : '🔗 Connect Wallet'}
          </button>
        </div>
      ) : (
        <div style={{ 
          padding: '15px', 
          background: '#dbeafe',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: 'bold' }}>
            ✅ Wallet Connected
          </p>
          <p style={{ 
            margin: '10px 0 0 0', 
            fontSize: '12px', 
            color: '#1e40af',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            {walletAddress}
          </p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: '15px',
          padding: '10px',
          background: '#fee2e2',
          borderRadius: '4px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
};