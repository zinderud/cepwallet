import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * SecretWalletChoiceCard Component
 *
 * Allows user to choose whether to enable Secret Wallet (passphrase)
 */
import { useEffect } from 'react';
export const SecretWalletChoiceCard = ({ standardAddress, onEnable, onSkip, isLoading = false, demoMode = false, }) => {
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
  return (_jsxs('div', { style: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '700px',
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
  }, children: '\uD83C\uDFAD Demo Mode - Auto-enabling Secret Wallet in 2s...' })), _jsxs('div', { style: { textAlign: 'center', marginBottom: '30px' }, children: [_jsx('div', { style: { fontSize: '48px', marginBottom: '10px' }, children: '\uD83D\uDD13' }), _jsx('h2', { style: { margin: '0 0 10px 0', color: '#fff' }, children: 'Trezor Unlocked' })] }), standardAddress && (_jsxs('div', { style: {
    background: '#252541',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
  }, children: [_jsx('div', { style: { color: '#999', marginBottom: '10px' }, children: 'Standard Wallet:' }), _jsx('div', { style: {
    background: '#1e1e3f',
    padding: '12px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    color: '#4a9eff',
    fontSize: '14px',
    wordBreak: 'break-all',
  }, children: standardAddress })] })), _jsx('div', { style: { height: '1px', background: '#2d2d44', margin: '30px 0' } }), _jsxs('div', { style: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    border: '2px solid #667eea',
  }, children: [_jsxs('div', { style: { display: 'flex', alignItems: 'center', marginBottom: '15px' }, children: [_jsx('div', { style: { fontSize: '32px', marginRight: '15px' }, children: '\uD83D\uDD10' }), _jsxs('div', { children: [_jsx('h3', { style: { margin: '0 0 5px 0', color: '#fff' }, children: 'Secret Wallet (Passphrase Protection)' }), _jsx('p', { style: { margin: 0, color: '#bbb', fontSize: '14px' }, children: 'Enable advanced security with passphrase' })] })] }), _jsxs('div', { style: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  }, children: [_jsx('div', { style: { color: '#10b981', marginBottom: '12px', fontWeight: 'bold' }, children: '\u2705 Benefits:' }), _jsxs('ul', { style: { color: '#bbb', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }, children: [_jsx('li', { children: 'Create hidden wallets with different passphrases' }), _jsx('li', { children: 'Plausible deniability - each passphrase = different wallet' }), _jsx('li', { children: 'Enhanced security against physical attacks' }), _jsx('li', { children: 'Unlimited number of hidden wallets' })] })] }), _jsxs('div', { style: {
    background: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid #ffa500',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  }, children: [_jsx('div', { style: { color: '#ffa500', marginBottom: '8px', fontWeight: 'bold' }, children: '\u26A0\uFE0F Important Warning:' }), _jsxs('p', { style: { color: '#ffcc80', margin: 0, fontSize: '13px', lineHeight: '1.6' }, children: ['Passphrase creates a ', _jsx('strong', { children: 'completely new hidden wallet' }), '. Write it down securely! If you forget it, the wallet cannot be recovered.'] })] }), _jsxs('div', { style: { display: 'flex', gap: '15px' }, children: [_jsx('button', { onClick: onEnable, disabled: isLoading, style: {
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
  }, onMouseEnter: (e) => {
    if (!isLoading) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    }
  }, onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }, children: isLoading ? '⏳ Activating...' : '➕ Use Secret Wallet' }), _jsx('button', { onClick: onSkip, disabled: isLoading, style: {
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
  }, onMouseEnter: (e) => {
    if (!isLoading) {
      e.currentTarget.style.borderColor = '#666';
      e.currentTarget.style.color = '#ccc';
    }
  }, onMouseLeave: (e) => {
    e.currentTarget.style.borderColor = '#444';
    e.currentTarget.style.color = '#999';
  }, children: '\u2192 Skip' })] })] }), _jsx('div', { style: {
    padding: '15px',
    background: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #374151',
    textAlign: 'center',
  }, children: _jsxs('p', { style: { color: '#9ca3af', margin: 0, fontSize: '13px', lineHeight: '1.5' }, children: ['\uD83D\uDCA1 ', _jsx('strong', { children: 'Tip:' }), " You can always enable Secret Wallet later from settings. For maximum security, it's recommended to use it."] }) })] }));
};
