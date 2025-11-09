import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
export const PrivacyTransactionForm = ({ selectedPrivacyLevel = 'Railgun', }) => {
  const [txType, setTxType] = useState('shield');
  const [recipient, setRecipient] = useState('');
  const [token, setToken] = useState('0x0000000000000000000000000000000000000000');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [proofEstimate, setProofEstimate] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let tx;
      if (txType === 'shield') {
        tx = await invoke('shield_transaction', {
          token,
          amount,
        });
      }
      else if (txType === 'transfer') {
        tx = await invoke('private_transfer', {
          recipient,
          token,
          amount,
        });
      }
      else {
        // unshield
        tx = await invoke('unshield_transaction', {
          token,
          amount,
          recipient,
        });
      }
      setResult(tx);
    }
    catch (err) {
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };
  const estimateProofTime = async () => {
    try {
      const proofType = txType === 'shield' ? 'Shield' : txType === 'transfer' ? 'Transfer' : 'Unshield';
      const time = await invoke('estimate_proof_time', { proofType });
      setProofEstimate(time);
    }
    catch (err) {
      console.error('Failed to estimate proof time:', err);
    }
  };
  React.useEffect(() => {
    estimateProofTime();
  }, [txType]);
  return (_jsxs('div', { style: {
    padding: '24px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
  }, children: [_jsx('h3', { style: { marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }, children: '\uD83D\uDD10 Privacy Transaction' }), _jsxs('p', { style: { color: '#6b7280', marginBottom: '20px' }, children: ['Send private transactions using ', selectedPrivacyLevel] }), _jsxs('div', { style: { marginBottom: '20px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Transaction Type' }), _jsx('div', { style: { display: 'flex', gap: '8px' }, children: ['shield', 'transfer', 'unshield'].map((type) => (_jsxs('button', { onClick: () => setTxType(type), style: {
    flex: 1,
    padding: '12px',
    backgroundColor: txType === type ? '#3b82f6' : '#f3f4f6',
    color: txType === type ? 'white' : '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'capitalize',
  }, children: [type === 'shield' && '🛡️ ', type === 'transfer' && '🔀 ', type === 'unshield' && '🔓 ', type] }, type))) })] }), _jsxs('form', { onSubmit: handleSubmit, children: [_jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Token Address' }), _jsxs('select', { value: token, onChange: (e) => setToken(e.target.value), style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
  }, children: [_jsx('option', { value: '0x0000000000000000000000000000000000000000', children: 'ETH (Native)' }), _jsx('option', { value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', children: 'USDC' }), _jsx('option', { value: '0xdAC17F958D2ee523a2206206994597C13D831ec7', children: 'USDT' }), _jsx('option', { value: '0x6B175474E89094C44Da98b954EedeAC495271d0F', children: 'DAI' })] })] }), _jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Amount' }), _jsx('input', { type: 'text', value: amount, onChange: (e) => setAmount(e.target.value), placeholder: '0.0', style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'monospace',
  } })] }), (txType === 'transfer' || txType === 'unshield') && (_jsxs('div', { style: { marginBottom: '16px' }, children: [_jsx('label', { style: { display: 'block', fontWeight: '600', marginBottom: '8px' }, children: 'Recipient Address' }), _jsx('input', { type: 'text', value: recipient, onChange: (e) => setRecipient(e.target.value), placeholder: '0x...', style: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
  } })] })), proofEstimate !== null && (_jsxs('div', { style: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#92400e',
  }, children: ['\u23F1\uFE0F Estimated proof generation time: ', _jsxs('strong', { children: [proofEstimate, 's'] })] })), _jsx('button', { type: 'submit', disabled: loading, style: {
    width: '100%',
    padding: '14px',
    backgroundColor: loading ? '#9ca3af' : '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
  }, children: loading ? 'Processing...' : `${txType.charAt(0).toUpperCase()}${txType.slice(1)} Transaction` })] }), result && (_jsxs('div', { style: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: '8px',
  }, children: [_jsx('div', { style: { fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#065f46' }, children: '\u2705 Transaction Successful' }), _jsxs('div', { style: { fontSize: '14px', color: '#047857', marginBottom: '4px' }, children: [_jsx('strong', { children: 'TX Hash:' }), ' ', result.tx_hash] }), _jsxs('div', { style: { fontSize: '14px', color: '#047857', marginBottom: '4px' }, children: [_jsx('strong', { children: 'Status:' }), ' ', result.status] }), result.proof_time_ms && (_jsxs('div', { style: { fontSize: '14px', color: '#047857' }, children: [_jsx('strong', { children: 'Proof Time:' }), ' ', (result.proof_time_ms / 1000).toFixed(2), 's'] }))] })), error && (_jsxs('div', { style: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#fee2e2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    color: '#dc2626',
  }, children: ['\u274C ', error] }))] }));
};
