import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useWallet } from '../../hooks/useWallet';
export const WalletConnect = () => {
  const { connectWallet, walletAddress, loading, error } = useWallet();
  return (_jsxs('div', { children: [_jsx('h2', { style: { marginTop: 0, color: '#475569' }, children: '\uD83D\uDCBC Software Wallet' }), !walletAddress ? (_jsxs('div', { children: [_jsx('p', { style: { color: '#64748b', marginBottom: '15px' }, children: 'Create or connect a software wallet' }), _jsx('button', { onClick: connectWallet, disabled: loading, style: {
    padding: '10px 20px',
    background: loading ? '#94a3b8' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    width: '100%'
  }, children: loading ? 'Connecting...' : '🔗 Connect Wallet' })] })) : (_jsxs('div', { style: {
    padding: '15px',
    background: '#dbeafe',
    borderRadius: '4px'
  }, children: [_jsx('p', { style: { margin: 0, color: '#1e40af', fontWeight: 'bold' }, children: '\u2705 Wallet Connected' }), _jsx('p', { style: {
    margin: '10px 0 0 0',
    fontSize: '12px',
    color: '#1e40af',
    wordBreak: 'break-all',
    fontFamily: 'monospace'
  }, children: walletAddress })] })), error && (_jsxs('div', { style: {
    marginTop: '15px',
    padding: '10px',
    background: '#fee2e2',
    borderRadius: '4px',
    color: '#991b1b',
    fontSize: '14px'
  }, children: ['Error: ', error.message] }))] }));
};
