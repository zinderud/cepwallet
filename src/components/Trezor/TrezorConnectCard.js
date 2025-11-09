import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export const TrezorConnectCard = ({ onConnect, isLoading = false, error, }) => {
  return (_jsxs('div', { style: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #2d2d44',
  }, children: [_jsxs('div', { style: { textAlign: 'center', marginBottom: '30px' }, children: [_jsx('div', { style: { fontSize: '48px', marginBottom: '10px' }, children: '\uD83D\uDD10' }), _jsx('h2', { style: { margin: '0 0 10px 0', color: '#fff' }, children: 'Trezor Hardware Wallet' }), _jsx('p', { style: { color: '#999', margin: 0 }, children: 'Connect your Trezor device to continue' })] }), _jsx('div', { style: {
    background: '#252541',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  }, children: _jsxs('div', { style: { display: 'flex', alignItems: 'center', marginBottom: '8px' }, children: [_jsx('span', { style: { color: '#999', marginRight: '10px' }, children: 'Status:' }), _jsx('span', { style: {
    color: isLoading ? '#ffa500' : '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }, children: isLoading ? '⏳ Connecting...' : '⭕ Disconnected' })] }) }), _jsxs('div', { style: {
    background: '#1e1e3f',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
  }, children: [_jsx('div', { style: { color: '#4a9eff', marginBottom: '10px', fontWeight: 'bold' }, children: '\u2139\uFE0F Before you continue:' }), _jsxs('ul', { style: { color: '#bbb', paddingLeft: '20px', margin: 0, lineHeight: '1.6' }, children: [_jsx('li', { children: 'Connect your Trezor device via USB' }), _jsx('li', { children: 'Make sure Trezor Bridge or Trezor Suite is installed' }), _jsx('li', { children: 'Your device should be unlocked and ready' })] })] }), error && (_jsxs('div', { style: {
    background: '#3d1f1f',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#ff6b6b',
  }, children: [_jsx('strong', { children: '\u26A0\uFE0F Error:' }), ' ', error] })), _jsx('button', { onClick: onConnect, disabled: isLoading, style: {
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
  }, onMouseEnter: (e) => {
    if (!isLoading) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    }
  }, onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }, children: isLoading ? '⏳ Connecting...' : '📱 Connect Trezor Device' }), _jsxs('div', { style: {
    marginTop: '20px',
    padding: '15px',
    background: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #374151',
  }, children: [_jsx('div', { style: { color: '#10b981', marginBottom: '8px', fontWeight: 'bold' }, children: '\uD83D\uDEE1\uFE0F Security Guaranteed' }), _jsx('p', { style: { color: '#9ca3af', margin: 0, fontSize: '14px', lineHeight: '1.5' }, children: 'Your private keys never leave the Trezor device. All cryptographic operations happen inside the secure element.' })] })] }));
};
