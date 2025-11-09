import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
const AVAILABLE_POOLS = [
  {
    id: 'pool-eth-001',
    name: 'ETH Privacy Pool',
    token: 'ETH',
    tvl: '1,234 ETH',
    members: 156,
    icon: '⟠',
  },
  {
    id: 'pool-usdc-001',
    name: 'USDC Privacy Pool',
    token: 'USDC',
    tvl: '567,890 USDC',
    members: 89,
    icon: '💵',
  },
  {
    id: 'pool-dai-001',
    name: 'DAI Privacy Pool',
    token: 'DAI',
    tvl: '234,567 DAI',
    members: 67,
    icon: '💎',
  },
];
export const PrivacyPoolManager = () => {
  const [selectedPool, setSelectedPool] = useState(null);
  const [operation, setOperation] = useState('join');
  const [depositAmount, setDepositAmount] = useState('');
  const [swapFromToken, setSwapFromToken] = useState('ETH');
  const [swapToToken, setSwapToToken] = useState('USDC');
  const [swapAmount, setSwapAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const handleJoinPool = async () => {
    if (!selectedPool)
      return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const pool = AVAILABLE_POOLS.find((p) => p.id === selectedPool);
      const tokenAddress = pool?.token === 'ETH'
        ? '0x0000000000000000000000000000000000000000'
        : pool?.token === 'USDC'
          ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
          : '0x6B175474E89094C44Da98b954EedeAC495271d0F';
      const op = await invoke('join_privacy_pool', {
        poolId: selectedPool,
        token: tokenAddress,
        depositAmount,
      });
      setResult(op);
    }
    catch (err) {
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };
  const handleExitPool = async () => {
    if (!selectedPool)
      return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const op = await invoke('exit_privacy_pool', {
        poolId: selectedPool,
        withdrawAddress,
      });
      setResult(op);
    }
    catch (err) {
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };
  const handleSwap = async () => {
    if (!selectedPool)
      return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fromTokenAddress = swapFromToken === 'ETH'
        ? '0x0000000000000000000000000000000000000000'
        : swapFromToken === 'USDC'
          ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
          : '0x6B175474E89094C44Da98b954EedeAC495271d0F';
      const toTokenAddress = swapToToken === 'ETH'
        ? '0x0000000000000000000000000000000000000000'
        : swapToToken === 'USDC'
          ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
          : '0x6B175474E89094C44Da98b954EedeAC495271d0F';
      const op = await invoke('privacy_pool_swap', {
        poolId: selectedPool,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        amount: swapAmount,
      });
      setResult(op);
    }
    catch (err) {
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };
  return (_jsxs('div', { style: {
    padding: '24px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
  }, children: [_jsx('h3', { style: { marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }, children: '\uD83C\uDFCA Privacy Pools' }), _jsx('p', { style: { color: '#6b7280', marginBottom: '20px' }, children: 'Join privacy pools for compliant private transactions' }), _jsxs('div', { style: { marginBottom: '20px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Operation' }), _jsx('div', { style: { display: 'flex', gap: '8px' }, children: ['join', 'exit', 'swap'].map((op) => (_jsxs('button', { onClick: () => setOperation(op), style: {
    flex: 1,
    padding: '12px',
    backgroundColor: operation === op ? '#8b5cf6' : '#f3f4f6',
    color: operation === op ? 'white' : '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'capitalize',
  }, children: [op === 'join' && '➕ ', op === 'exit' && '➖ ', op === 'swap' && '🔄 ', op] }, op))) })] }), _jsxs('div', { style: { marginBottom: '20px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Select Pool' }), _jsx('div', { style: { display: 'grid', gap: '8px' }, children: AVAILABLE_POOLS.map((pool) => (_jsx('div', { onClick: () => setSelectedPool(pool.id), style: {
    padding: '12px',
    border: selectedPool === pool.id ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: selectedPool === pool.id ? '#f5f3ff' : 'white',
  }, children: _jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx('span', { style: { fontSize: '24px' }, children: pool.icon }), _jsxs('div', { style: { flex: 1 }, children: [_jsx('div', { style: { fontWeight: '600', fontSize: '14px' }, children: pool.name }), _jsxs('div', { style: { fontSize: '12px', color: '#6b7280' }, children: ['TVL: ', pool.tvl, ' \u2022 ', pool.members, ' members'] })] })] }) }, pool.id))) })] }), operation === 'join' && (_jsxs('div', { children: [_jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Deposit Amount' }), _jsx('input', { type: 'text', value: depositAmount, onChange: (e) => setDepositAmount(e.target.value), placeholder: '0.0', style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'monospace',
  } })] }), _jsx('button', { onClick: handleJoinPool, disabled: loading || !selectedPool, style: {
    width: '100%',
    padding: '14px',
    backgroundColor: loading || !selectedPool ? '#9ca3af' : '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading || !selectedPool ? 'not-allowed' : 'pointer',
  }, children: loading ? 'Processing...' : 'Join Pool' })] })), operation === 'exit' && (_jsxs('div', { children: [_jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Withdraw Address' }), _jsx('input', { type: 'text', value: withdrawAddress, onChange: (e) => setWithdrawAddress(e.target.value), placeholder: '0x...', style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
  } })] }), _jsx('button', { onClick: handleExitPool, disabled: loading || !selectedPool, style: {
    width: '100%',
    padding: '14px',
    backgroundColor: loading || !selectedPool ? '#9ca3af' : '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading || !selectedPool ? 'not-allowed' : 'pointer',
  }, children: loading ? 'Processing...' : 'Exit Pool' })] })), operation === 'swap' && (_jsxs('div', { children: [_jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'From Token' }), _jsxs('select', { value: swapFromToken, onChange: (e) => setSwapFromToken(e.target.value), style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  }, children: [_jsx('option', { value: 'ETH', children: 'ETH' }), _jsx('option', { value: 'USDC', children: 'USDC' }), _jsx('option', { value: 'DAI', children: 'DAI' })] })] }), _jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'To Token' }), _jsxs('select', { value: swapToToken, onChange: (e) => setSwapToToken(e.target.value), style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  }, children: [_jsx('option', { value: 'ETH', children: 'ETH' }), _jsx('option', { value: 'USDC', children: 'USDC' }), _jsx('option', { value: 'DAI', children: 'DAI' })] })] }), _jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Amount' }), _jsx('input', { type: 'text', value: swapAmount, onChange: (e) => setSwapAmount(e.target.value), placeholder: '0.0', style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'monospace',
  } })] }), _jsx('button', { onClick: handleSwap, disabled: loading || !selectedPool, style: {
    width: '100%',
    padding: '14px',
    backgroundColor: loading || !selectedPool ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading || !selectedPool ? 'not-allowed' : 'pointer',
  }, children: loading ? 'Processing...' : 'Swap in Pool' })] })), result && (_jsxs('div', { style: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#ddd6fe',
    border: '2px solid #8b5cf6',
    borderRadius: '8px',
  }, children: [_jsx('div', { style: { fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#5b21b6' }, children: '\u2705 Operation Successful' }), _jsxs('div', { style: { fontSize: '14px', color: '#6b21a8', marginBottom: '4px' }, children: [_jsx('strong', { children: 'Pool:' }), ' ', result.pool_id] }), _jsxs('div', { style: { fontSize: '14px', color: '#6b21a8', marginBottom: '4px' }, children: [_jsx('strong', { children: 'Operation:' }), ' ', result.operation_type] }), _jsxs('div', { style: { fontSize: '14px', color: '#6b21a8' }, children: [_jsx('strong', { children: 'Status:' }), ' ', result.status] })] })), error && (_jsxs('div', { style: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#fee2e2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    color: '#dc2626',
  }, children: ['\u274C ', error] }))] }));
};
