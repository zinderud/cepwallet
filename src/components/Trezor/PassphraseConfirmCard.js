import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * PassphraseConfirmCard Component
 *
 * Waiting screen while user enters passphrase on Trezor device
 */
import { useEffect, useState } from 'react';
export const PassphraseConfirmCard = ({ deviceLabel = 'Trezor', demoMode = false, onAutoSkip, }) => {
  const [dots, setDots] = useState('');
  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  // Auto-skip in demo mode
  useEffect(() => {
    if (demoMode && onAutoSkip) {
      const timer = setTimeout(() => {
        console.log('🎭 Demo: Auto-confirming passphrase');
        onAutoSkip();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [demoMode, onAutoSkip]);
  return (_jsxs('div', { style: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #2d2d44',
  }, children: [demoMode && (_jsx('div', { style: {
    background: 'rgba(251, 191, 36, 0.2)',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: '#fcd34d',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
  }, children: '\uD83C\uDFAD Demo Mode - Passphrase simulated (auto-confirming in 2s...)' })), _jsxs('div', { style: {
    textAlign: 'center',
    marginBottom: '30px',
  }, children: [_jsx('div', { style: {
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
  }, children: '\uD83D\uDD10' }), _jsxs('h2', { style: { margin: '0 0 10px 0', color: '#fff' }, children: ['Enter Passphrase', dots] }), _jsxs('p', { style: { color: '#999', margin: 0 }, children: ['On your ', deviceLabel, ' device'] })] }), _jsxs('div', { style: {
    background: '#252541',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '25px',
  }, children: [_jsxs('h3', { style: {
    margin: '0 0 20px 0',
    color: '#fff',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }, children: [_jsx('span', { children: '\uD83D\uDCDD' }), ' Follow These Steps:'] }), _jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '15px' }, children: [_jsxs('div', { style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  }, children: [_jsx('div', { style: {
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
  }, children: '1' }), _jsxs('div', { children: [_jsx('div', { style: { color: '#fff', fontWeight: 'bold', marginBottom: '5px' }, children: 'Enter Your Passphrase' }), _jsx('div', { style: { color: '#999', fontSize: '14px' }, children: 'Type your secret passphrase on the Trezor device screen' })] })] }), _jsxs('div', { style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  }, children: [_jsx('div', { style: {
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
  }, children: '2' }), _jsxs('div', { children: [_jsx('div', { style: { color: '#fff', fontWeight: 'bold', marginBottom: '5px' }, children: 'Confirm Passphrase' }), _jsx('div', { style: { color: '#999', fontSize: '14px' }, children: 'Enter the same passphrase again to confirm' })] })] }), _jsxs('div', { style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  }, children: [_jsx('div', { style: {
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
  }, children: '3' }), _jsxs('div', { children: [_jsx('div', { style: { color: '#fff', fontWeight: 'bold', marginBottom: '5px' }, children: 'Device Will Unlock' }), _jsx('div', { style: { color: '#999', fontSize: '14px' }, children: 'Your Secret Wallet will be activated automatically' })] })] })] })] }), _jsx('div', { style: {
    background: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid #ffa500',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  }, children: _jsxs('div', { style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  }, children: [_jsx('div', { style: { fontSize: '20px', marginTop: '2px' }, children: '\u26A0\uFE0F' }), _jsxs('div', { style: { flex: 1 }, children: [_jsx('div', { style: { color: '#ffa500', fontWeight: 'bold', marginBottom: '5px' }, children: 'Important Security Notice' }), _jsxs('ul', { style: { color: '#ffcc80', margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }, children: [_jsxs('li', { children: ['Your passphrase is ', _jsx('strong', { children: 'never transmitted' }), ' to this computer'] }), _jsx('li', { children: 'It only exists on your Trezor device' }), _jsx('li', { children: 'Write down your passphrase in a secure location' }), _jsx('li', { children: 'Each different passphrase creates a different wallet' })] })] })] }) }), _jsxs('div', { style: {
    textAlign: 'center',
    padding: '20px',
    background: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #374151',
  }, children: [_jsx('div', { style: {
    display: 'inline-flex',
    gap: '6px',
    marginBottom: '10px',
  }, children: [0, 1, 2].map((i) => (_jsx('div', { style: {
    width: '12px',
    height: '12px',
    background: '#667eea',
    borderRadius: '50%',
    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
  } }, i))) }), _jsx('p', { style: { color: '#9ca3af', margin: 0, fontSize: '14px' }, children: 'Waiting for passphrase confirmation...' })] }), _jsx('style', { children: `
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
      ` })] }));
};
