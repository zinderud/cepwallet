import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
const COMMON_TOKENS = [
  { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', icon: '⟠' },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', icon: '💵' },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', icon: '💰' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', icon: '💎' },
];
export const ShieldedBalance = () => {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedToken, setSelectedToken] = useState('ETH');
  useEffect(() => {
    // Load balances for all tokens
    COMMON_TOKENS.forEach((token) => {
      loadBalance(token.symbol, token.address);
    });
  }, []);
  const loadBalance = async (symbol, tokenAddress) => {
    setLoading((prev) => ({ ...prev, [symbol]: true }));
    try {
      const balance = await invoke('get_shielded_balance', {
        token: tokenAddress,
      });
      setBalances((prev) => ({ ...prev, [symbol]: balance }));
    }
    catch (err) {
      console.error(`Failed to load ${symbol} balance:`, err);
      setBalances((prev) => ({ ...prev, [symbol]: '0.00' }));
    }
    finally {
      setLoading((prev) => ({ ...prev, [symbol]: false }));
    }
  };
  const refreshBalance = (symbol, address) => {
    loadBalance(symbol, address);
  };
  return (_jsxs('div', { style: {
    padding: '24px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
  }, children: [_jsxs('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx('h3', { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: '\uD83D\uDEE1\uFE0F Shielded Balances' }), _jsx('span', { style: { fontSize: '14px', color: '#6b7280' }, children: 'Private balances protected by RAILGUN' })] }), _jsx('div', { style: { display: 'grid', gap: '12px' }, children: COMMON_TOKENS.map((token) => (_jsx('div', { style: {
    padding: '16px',
    border: selectedToken === token.symbol ? '2px solid #10b981' : '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: selectedToken === token.symbol ? '#f0fdf4' : '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }, onClick: () => setSelectedToken(token.symbol), children: _jsxs('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx('span', { style: { fontSize: '28px' }, children: token.icon }), _jsxs('div', { children: [_jsx('div', { style: { fontWeight: '600', fontSize: '16px' }, children: token.symbol }), _jsxs('div', { style: { fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }, children: [token.address.slice(0, 6), '...', token.address.slice(-4)] })] })] }), _jsx('div', { style: { textAlign: 'right' }, children: loading[token.symbol] ? (_jsx('div', { style: { color: '#6b7280' }, children: 'Loading...' })) : (_jsxs(_Fragment, { children: [_jsx('div', { style: { fontSize: '20px', fontWeight: '700', color: '#10b981' }, children: balances[token.symbol] || '0.00' }), _jsx('button', { onClick: (e) => {
    e.stopPropagation();
    refreshBalance(token.symbol, token.address);
  }, style: {
    marginTop: '4px',
    padding: '4px 12px',
    fontSize: '12px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  }, children: '\uD83D\uDD04 Refresh' })] })) })] }) }, token.symbol))) }), _jsx('div', { style: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e40af',
  }, children: '\u2139\uFE0F Shielded balances are only visible to you and cannot be traced on-chain' })] }));
};
