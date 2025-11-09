import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * RailgunWalletCard Component
 *
 * Shows Secret Wallet address and allows RAILGUN wallet initialization
 * with Trezor-derived keys
 */
import { useState, useEffect } from 'react';
export const RailgunWalletCard = ({ secretWalletAddress, deviceLabel = 'Trezor', onInitializeRailgun, onBack, demoMode = false, }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  // Auto-initialize in demo mode
  useEffect(() => {
    if (demoMode && !isInitializing) {
      const timer = setTimeout(() => {
        console.log('🎭 Demo: Auto-initializing RAILGUN wallet');
        handleInitialize();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [demoMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      await onInitializeRailgun();
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize RAILGUN wallet');
    }
    finally {
      setIsInitializing(false);
    }
  };
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
  }, children: '\uD83C\uDFAD Demo Mode - Auto-initializing RAILGUN in 2s...' })), _jsxs('div', { style: { textAlign: 'center', marginBottom: '30px' }, children: [_jsx('div', { style: {
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
  }, children: '\u2705' }), _jsx('h2', { style: { margin: '0 0 10px 0', color: '#fff' }, children: 'Secret Wallet Activated' }), _jsxs('p', { style: { color: '#10b981', margin: 0, fontWeight: 'bold' }, children: [deviceLabel, ' unlocked with passphrase'] })] }), _jsxs('div', { style: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    border: '2px solid #667eea',
  }, children: [_jsxs('div', { style: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  }, children: [_jsx('div', { style: { fontSize: '28px', marginRight: '12px' }, children: '\uD83D\uDD10' }), _jsxs('div', { children: [_jsx('div', { style: { color: '#999', fontSize: '13px' }, children: 'Secret Wallet Address:' }), _jsx('div', { style: {
    background: '#1e1e3f',
    padding: '12px 15px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    color: '#4a9eff',
    fontSize: '14px',
    marginTop: '8px',
    wordBreak: 'break-all',
    border: '1px solid #2d2d44',
  }, children: secretWalletAddress })] })] }), _jsx('div', { style: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '15px',
  }, children: _jsx('p', { style: { color: '#6ee7b7', margin: 0, fontSize: '13px' }, children: '\u2705 This is your hidden wallet address, different from standard wallet' }) })] }), _jsx('div', { style: { height: '1px', background: '#2d2d44', margin: '30px 0' } }), _jsxs('div', { style: {
    background: '#252541',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '25px',
  }, children: [_jsxs('div', { style: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  }, children: [_jsx('div', { style: { fontSize: '36px', marginRight: '15px' }, children: '\uD83D\uDEE1\uFE0F' }), _jsxs('div', { children: [_jsx('h3', { style: { margin: '0 0 5px 0', color: '#fff' }, children: 'RAILGUN Privacy Layer' }), _jsx('p', { style: { margin: 0, color: '#999', fontSize: '14px' }, children: 'Zero-knowledge proof private transactions' })] })] }), _jsx('div', { style: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px',
  }, children: [
    { icon: '🔒', title: 'Private Transactions', desc: 'Hide amounts & addresses' },
    { icon: '🎭', title: 'Anonymous', desc: 'Untraceable on-chain' },
    { icon: '⚡', title: 'DeFi Compatible', desc: 'Use with DEXs & protocols' },
    { icon: '🔑', title: 'Trezor-Secured', desc: 'Keys derived in device' },
  ].map((feature, index) => (_jsxs('div', { style: {
    background: '#1e1e3f',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #2d2d44',
  }, children: [_jsx('div', { style: { fontSize: '24px', marginBottom: '8px' }, children: feature.icon }), _jsx('div', { style: { color: '#fff', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }, children: feature.title }), _jsx('div', { style: { color: '#999', fontSize: '12px' }, children: feature.desc })] }, index))) }), _jsxs('div', { style: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid #667eea',
    borderRadius: '8px',
    padding: '15px',
  }, children: [_jsx('div', { style: { color: '#667eea', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }, children: '\uD83E\uDDE0 How It Works:' }), _jsxs('ol', { style: { color: '#bbb', paddingLeft: '20px', margin: 0, fontSize: '13px', lineHeight: '1.7' }, children: [_jsxs('li', { children: ['Trezor derives 3 encryption keys using ', _jsx('code', { style: { background: '#1e1e3f', padding: '2px 6px', borderRadius: '4px' }, children: 'cipherKeyValue()' })] }), _jsx('li', { children: 'Keys create your RAILGUN private identity (spending, viewing, nullifying)' }), _jsx('li', { children: 'All transactions are shielded with zero-knowledge proofs' }), _jsx('li', { children: 'Only you can decrypt your transaction history' })] })] })] }), error && (_jsx('div', { style: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  }, children: _jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx('div', { style: { fontSize: '20px' }, children: '\u274C' }), _jsx('div', { style: { color: '#fca5a5', fontSize: '14px' }, children: error })] }) })), _jsxs('div', { style: { display: 'flex', gap: '15px', marginBottom: '20px' }, children: [onBack && (_jsx('button', { onClick: onBack, disabled: isInitializing, style: {
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
  }, onMouseEnter: (e) => {
    if (!isInitializing) {
      e.currentTarget.style.borderColor = '#666';
      e.currentTarget.style.color = '#ccc';
    }
  }, onMouseLeave: (e) => {
    e.currentTarget.style.borderColor = '#444';
    e.currentTarget.style.color = '#999';
  }, children: '\u2190 Back' })), _jsx('button', { onClick: handleInitialize, disabled: isInitializing, style: {
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
  }, onMouseEnter: (e) => {
    if (!isInitializing) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
    }
  }, onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }, children: isInitializing ? '⏳ Initializing RAILGUN Wallet...' : '🚀 Initialize RAILGUN Wallet' })] }), _jsx('div', { style: {
    padding: '15px',
    background: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #374151',
    textAlign: 'center',
  }, children: _jsxs('p', { style: { color: '#9ca3af', margin: 0, fontSize: '13px', lineHeight: '1.5' }, children: ['\uD83D\uDD10 ', _jsx('strong', { children: 'Privacy Guarantee:' }), ' Your RAILGUN keys are derived inside Trezor and never leave the device. All encryption happens locally.'] }) })] }));
};
