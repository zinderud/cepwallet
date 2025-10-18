/**
 * PassphraseConfirmCard Component
 * 
 * Waiting screen while user enters passphrase on Trezor device
 */

import React, { useEffect, useState } from 'react';

interface PassphraseConfirmCardProps {
  deviceLabel?: string;
}

export const PassphraseConfirmCard: React.FC<PassphraseConfirmCardProps> = ({
  deviceLabel = 'Trezor',
}) => {
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      border: '1px solid #2d2d44',
    }}>
      {/* Animated Device */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
      }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            animation: 'secretPulse 2s ease-in-out infinite',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          🔐
        </div>
        <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>
          Enter Passphrase{dots}
        </h2>
        <p style={{ color: '#999', margin: 0 }}>
          On your {deviceLabel} device
        </p>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#252541',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '25px',
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#fff',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>📝</span> Follow These Steps:
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Step 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
          }}>
            <div style={{
              minWidth: '32px',
              height: '32px',
              background: '#667eea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              1
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                Enter Your Passphrase
              </div>
              <div style={{ color: '#999', fontSize: '14px' }}>
                Type your secret passphrase on the Trezor device screen
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
          }}>
            <div style={{
              minWidth: '32px',
              height: '32px',
              background: '#667eea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              2
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                Confirm Passphrase
              </div>
              <div style={{ color: '#999', fontSize: '14px' }}>
                Enter the same passphrase again to confirm
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
          }}>
            <div style={{
              minWidth: '32px',
              height: '32px',
              background: '#667eea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              3
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                Device Will Unlock
              </div>
              <div style={{ color: '#999', fontSize: '14px' }}>
                Your Secret Wallet will be activated automatically
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div style={{
        background: 'rgba(255, 165, 0, 0.1)',
        border: '1px solid #ffa500',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <div style={{ fontSize: '20px', marginTop: '2px' }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#ffa500', fontWeight: 'bold', marginBottom: '5px' }}>
              Important Security Notice
            </div>
            <ul style={{ color: '#ffcc80', margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
              <li>Your passphrase is <strong>never transmitted</strong> to this computer</li>
              <li>It only exists on your Trezor device</li>
              <li>Write down your passphrase in a secure location</li>
              <li>Each different passphrase creates a different wallet</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
      }}>
        <div style={{ 
          display: 'inline-flex',
          gap: '6px',
          marginBottom: '10px',
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                background: '#667eea',
                borderRadius: '50%',
                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          Waiting for passphrase confirmation...
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes secretPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 48px rgba(102, 126, 234, 0.5);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
