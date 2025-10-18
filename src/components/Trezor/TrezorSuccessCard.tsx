/**
 * TrezorSuccessCard Component
 * 
 * Success screen showing RAILGUN wallet activated with Trezor Secret Wallet
 */

import React from 'react';

interface TrezorSuccessCardProps {
  secretWalletAddress: string;
  railgunAddress?: string;
  deviceLabel?: string;
  onContinue: () => void;
}

export const TrezorSuccessCard: React.FC<TrezorSuccessCardProps> = ({
  secretWalletAddress,
  railgunAddress,
  deviceLabel = 'Trezor',
  onContinue,
}) => {
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '700px',
      margin: '0 auto',
      border: '1px solid #2d2d44',
    }}>
      {/* Success Animation */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 25px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            animation: 'successPulse 1s ease-out',
            boxShadow: '0 8px 40px rgba(16, 185, 129, 0.4)',
          }}
        >
          🎉
        </div>
        <h2 style={{ 
          margin: '0 0 12px 0', 
          color: '#10b981',
          fontSize: '28px',
        }}>
          RAILGUN Wallet Activated!
        </h2>
        <p style={{ color: '#6ee7b7', margin: 0, fontSize: '16px' }}>
          Your private transactions are ready
        </p>
      </div>

      {/* Setup Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '25px',
        border: '2px solid #667eea',
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#fff',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>✅</span> Setup Complete
        </h3>

        {/* Device Info */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
        }}>
          <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>
            Hardware Wallet:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '24px' }}>💳</div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
              {deviceLabel} (Secret Wallet)
            </div>
          </div>
        </div>

        {/* Secret Wallet Address */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
        }}>
          <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>
            Secret Wallet Address:
          </div>
          <div style={{
            background: '#1e1e3f',
            padding: '10px 12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            color: '#4a9eff',
            fontSize: '13px',
            wordBreak: 'break-all',
            border: '1px solid #2d2d44',
          }}>
            {secretWalletAddress}
          </div>
        </div>

        {/* RAILGUN Address (if available) */}
        {railgunAddress && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid #10b981',
          }}>
            <div style={{ color: '#6ee7b7', fontSize: '13px', marginBottom: '8px' }}>
              🛡️ RAILGUN Private Address:
            </div>
            <div style={{
              background: '#1e1e3f',
              padding: '10px 12px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              color: '#10b981',
              fontSize: '13px',
              wordBreak: 'break-all',
              border: '1px solid #2d2d44',
            }}>
              {railgunAddress}
            </div>
          </div>
        )}
      </div>

      {/* Security Features */}
      <div style={{
        background: '#252541',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '25px',
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#fff',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>🔒</span> Active Security Features
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              icon: '🔐',
              title: 'Hardware-Secured Keys',
              desc: 'All keys derived inside Trezor device',
            },
            {
              icon: '🎭',
              title: 'Secret Wallet Protection',
              desc: 'Hidden wallet with passphrase encryption',
            },
            {
              icon: '🛡️',
              title: 'Zero-Knowledge Proofs',
              desc: 'RAILGUN privacy for all transactions',
            },
            {
              icon: '👻',
              title: 'Anonymous Transactions',
              desc: 'Untraceable amounts and recipients',
            },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#1e1e3f',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #2d2d44',
              }}
            >
              <div style={{ fontSize: '24px' }}>{feature.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                  {feature.title}
                </div>
                <div style={{ color: '#999', fontSize: '12px' }}>
                  {feature.desc}
                </div>
              </div>
              <div style={{ color: '#10b981', fontSize: '20px' }}>✓</div>
            </div>
          ))}
        </div>
      </div>

      {/* What's Next */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid #667eea',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '25px',
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#667eea',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>🚀</span> What You Can Do Now
        </h3>
        <ul style={{ 
          color: '#bbb', 
          paddingLeft: '20px', 
          margin: 0, 
          fontSize: '14px',
          lineHeight: '1.8',
        }}>
          <li>Shield funds to RAILGUN for private storage</li>
          <li>Make anonymous transfers to any address</li>
          <li>Use private DeFi with DEXs and protocols</li>
          <li>Unshield funds back to public wallet when needed</li>
        </ul>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        style={{
          width: '100%',
          padding: '18px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Continue to Dashboard →
      </button>

      {/* Bottom Security Notice */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
        textAlign: 'center',
      }}>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px', lineHeight: '1.5' }}>
          🔐 <strong>Remember:</strong> Keep your Trezor device safe and never share your passphrase.
          Each passphrase creates a different wallet.
        </p>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
