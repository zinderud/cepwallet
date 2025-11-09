import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
export const TrezorConnect = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [error, setError] = useState(null);
  const connectToTrezor = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await invoke('connect_device');
      setDeviceInfo(info);
      setConnected(true);
    }
    catch (err) {
      setError(err.message || String(err));
      setConnected(false);
    }
    finally {
      setLoading(false);
    }
  };
  const disconnect = async () => {
    try {
      await invoke('disconnect_device');
      setConnected(false);
      setDeviceInfo(null);
    }
    catch (err) {
      setError(err.message || String(err));
    }
  };
  return (_jsxs('div', { children: [_jsx('h2', { style: { marginTop: 0, color: '#475569' }, children: '\uD83D\uDD10 Hardware Wallet' }), !connected ? (_jsxs('div', { children: [_jsx('p', { style: { color: '#64748b', marginBottom: '15px' }, children: 'Connect your Trezor device to get started' }), _jsx('button', { onClick: connectToTrezor, disabled: loading, style: {
    padding: '10px 20px',
    background: loading ? '#94a3b8' : '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    width: '100%'
  }, children: loading ? 'Connecting...' : '🔌 Connect Trezor' })] })) : (_jsxs('div', { children: [_jsxs('div', { style: {
    padding: '15px',
    background: '#d1fae5',
    borderRadius: '4px',
    marginBottom: '15px'
  }, children: [_jsx('p', { style: { margin: 0, color: '#065f46', fontWeight: 'bold' }, children: '\u2705 Connected Successfully!' }), deviceInfo && (_jsxs('div', { style: { marginTop: '10px', fontSize: '14px', color: '#047857' }, children: [_jsxs('p', { style: { margin: '5px 0' }, children: ['Model: ', deviceInfo.model] }), _jsxs('p', { style: { margin: '5px 0' }, children: ['Label: ', deviceInfo.label] })] }))] }), _jsx('button', { onClick: disconnect, style: {
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  }, children: 'Disconnect' })] })), error && (_jsxs('div', { style: {
    marginTop: '15px',
    padding: '10px',
    background: '#fee2e2',
    borderRadius: '4px',
    color: '#991b1b',
    fontSize: '14px'
  }, children: [_jsx('strong', { children: '\u26A0\uFE0F Note:' }), ' ', error, _jsx('p', { style: { margin: '5px 0 0 0', fontSize: '12px' }, children: 'Make sure Trezor is plugged in and Trezor Suite is closed.' })] }))] }));
};
