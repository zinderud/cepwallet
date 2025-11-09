import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
export const PrivacyControl = ({ onPrivacyLevelChange }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('Public');
  const [error, setError] = useState(null);
  // Check if privacy is already initialized
  useEffect(() => {
    checkPrivacyStatus();
  }, []);
  const checkPrivacyStatus = async () => {
    try {
      const ready = await invoke('is_privacy_ready');
      setIsInitialized(ready);
    }
    catch (err) {
      console.error('Privacy status check failed:', err);
    }
  };
  const initializePrivacy = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      await invoke('initialize_privacy');
      setIsInitialized(true);
    }
    catch (err) {
      setError(err);
    }
    finally {
      setIsInitializing(false);
    }
  };
  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    if (onPrivacyLevelChange) {
      onPrivacyLevelChange(level);
    }
  };
  const privacyLevels = [
    {
      name: 'Public',
      description: 'Standard blockchain transaction',
      fee: '1.0x',
      icon: '🔓',
    },
    {
      name: 'Railgun',
      description: 'Shielded transaction with RAILGUN',
      fee: '1.5x',
      icon: '🛡️',
    },
    {
      name: 'PrivacyPool',
      description: 'Privacy Pools with compliance',
      fee: '2.0x',
      icon: '🏊',
    },
    {
      name: 'Maximum',
      description: 'All privacy features enabled',
      fee: '4.5x',
      icon: '🔒',
    },
  ];
  if (!isInitialized) {
    return (_jsxs('div', { style: {
      padding: '24px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: '#f9fafb',
    }, children: [_jsx('h3', { style: { marginTop: 0, fontSize: '20px', fontWeight: '600' }, children: '\uD83D\uDD10 Privacy Features' }), _jsx('p', { style: { color: '#6b7280' }, children: 'Initialize privacy features to enable RAILGUN, Privacy Pools, and ZK-SNARK proofs.' }), _jsx('button', { onClick: initializePrivacy, disabled: isInitializing, style: {
      padding: '12px 24px',
      backgroundColor: isInitializing ? '#9ca3af' : '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: isInitializing ? 'not-allowed' : 'pointer',
      marginTop: '16px',
    }, children: isInitializing ? 'Initializing...' : 'Initialize Privacy' }), error && (_jsx('div', { style: {
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      borderRadius: '8px',
      color: '#dc2626',
    }, children: error }))] }));
  }
  return (_jsxs('div', { style: {
    padding: '24px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
  }, children: [_jsx('h3', { style: { marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }, children: '\uD83D\uDD10 Privacy Level' }), _jsx('p', { style: { color: '#6b7280', marginBottom: '20px' }, children: 'Choose your desired privacy level for transactions' }), _jsx('div', { style: { display: 'grid', gap: '12px' }, children: privacyLevels.map((level) => (_jsx('div', { onClick: () => handleLevelChange(level.name), style: {
    padding: '16px',
    border: selectedLevel === level.name ? '2px solid #3b82f6' : '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: selectedLevel === level.name ? '#eff6ff' : 'white',
    transition: 'all 0.2s',
  }, children: _jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx('span', { style: { fontSize: '24px' }, children: level.icon }), _jsxs('div', { style: { flex: 1 }, children: [_jsx('div', { style: { fontWeight: '600', fontSize: '16px', marginBottom: '4px' }, children: level.name }), _jsx('div', { style: { fontSize: '14px', color: '#6b7280' }, children: level.description })] }), _jsxs('div', { style: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    padding: '4px 12px',
    borderRadius: '12px',
  }, children: [level.fee, ' fee'] })] }) }, level.name))) }), _jsxs('div', { style: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#92400e',
  }, children: ['\u26A1 Selected: ', _jsx('strong', { children: selectedLevel }), ' - Privacy features are active'] })] }));
};
