import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Settings Page
 *
 * Network selection, privacy preferences, and security settings
 */
import { useState } from 'react';
const NETWORKS = [
  { id: 1, name: 'Ethereum Mainnet', chainId: 1, icon: '⟠', color: '#627eea' },
  { id: 11155111, name: 'Sepolia Testnet', chainId: 11155111, icon: '🧪', color: '#f97316' },
  { id: 137, name: 'Polygon', chainId: 137, icon: '⬣', color: '#8247e5' },
  { id: 42161, name: 'Arbitrum', chainId: 42161, icon: '🔵', color: '#28a0f0' },
  { id: 10, name: 'Optimism', chainId: 10, icon: '🔴', color: '#ff0420' },
];
export const SettingsPage = () => {
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[1]); // Default to Sepolia
  const [autoPrivacy, setAutoPrivacy] = useState(false);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [saveTransactionHistory, setSaveTransactionHistory] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  return (_jsxs('div', { style: { padding: '30px', maxWidth: '1000px', margin: '0 auto' }, children: [_jsxs('div', { style: { marginBottom: '30px' }, children: [_jsxs('h1', { style: {
    margin: '0 0 10px',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }, children: ['\u2699\uFE0F ', _jsx('span', { children: 'Settings' })] }), _jsx('p', { style: {
    margin: 0,
    fontSize: '16px',
    color: '#64748b'
  }, children: 'Configure network, privacy, and security preferences' })] }), _jsxs('div', { style: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px'
  }, children: [_jsx('h2', { style: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  }, children: '\uD83C\uDF10 Network' }), _jsx('p', { style: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#64748b'
  }, children: 'Select the blockchain network to use' }), _jsx('div', { style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  }, children: NETWORKS.map((network) => (_jsxs('button', { onClick: () => setSelectedNetwork(network), style: {
    padding: '16px',
    background: selectedNetwork.id === network.id
      ? `linear-gradient(135deg, ${network.color}20, ${network.color}30)`
      : 'white',
    border: `2px solid ${selectedNetwork.id === network.id ? network.color : '#e2e8f0'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  }, onMouseEnter: (e) => {
    if (selectedNetwork.id !== network.id) {
      e.currentTarget.style.borderColor = network.color;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  }, onMouseLeave: (e) => {
    if (selectedNetwork.id !== network.id) {
      e.currentTarget.style.borderColor = '#e2e8f0';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  }, children: [_jsxs('div', { style: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  }, children: [_jsx('span', { style: { fontSize: '24px' }, children: network.icon }), _jsx('span', { style: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b'
  }, children: network.name })] }), _jsxs('div', { style: {
    fontSize: '13px',
    color: '#64748b',
    fontFamily: 'monospace'
  }, children: ['Chain ID: ', network.chainId] })] }, network.id))) }), _jsx('div', { style: {
    marginTop: '16px',
    padding: '12px',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0369a1'
  }, children: '\u2139\uFE0F Switching networks requires reinitializing the privacy system' })] }), _jsxs('div', { style: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px'
  }, children: [_jsx('h2', { style: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  }, children: '\uD83D\uDD12 Privacy Preferences' }), _jsx('p', { style: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#64748b'
  }, children: 'Control how your wallet handles privacy' }), _jsx(SettingToggle, { label: 'Auto-shield incoming funds', description: 'Automatically shield public funds when received', value: autoPrivacy, onChange: setAutoPrivacy, icon: '\uD83D\uDEE1\uFE0F' }), _jsx(SettingToggle, { label: 'Require transaction confirmation', description: 'Ask for confirmation before executing privacy operations', value: requireConfirmation, onChange: setRequireConfirmation, icon: '\u270B' }), _jsx(SettingToggle, { label: 'Save transaction history', description: 'Keep local record of shielded transactions (encrypted)', value: saveTransactionHistory, onChange: setSaveTransactionHistory, icon: '\uD83D\uDCCB' })] }), _jsxs('div', { style: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px'
  }, children: [_jsx('h2', { style: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  }, children: '\uD83D\uDD10 Security' }), _jsx('p', { style: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#64748b'
  }, children: 'Manage wallet security and backup options' }), _jsx(SettingToggle, { label: 'Encryption enabled', description: 'Encrypt wallet data with encryption key', value: encryptionEnabled, onChange: setEncryptionEnabled, icon: '\uD83D\uDD11', locked: true }), _jsx(SettingToggle, { label: 'Auto-backup wallet', description: 'Automatically backup encrypted wallet data', value: autoBackup, onChange: setAutoBackup, icon: '\uD83D\uDCBE' }), _jsxs('div', { style: {
    marginTop: '30px',
    paddingTop: '24px',
    borderTop: '2px solid #fee2e2'
  }, children: [_jsx('h3', { style: {
    margin: '0 0 16px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }, children: '\u26A0\uFE0F Danger Zone' }), _jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx(DangerButton, { label: 'Export Private Keys', description: 'Export wallet mnemonic and encryption key', onClick: () => {
    if (confirm('⚠️ Warning: This will reveal your private keys. Continue?')) {
      alert('🔑 Export functionality will open a secure dialog');
    }
  } }), _jsx(DangerButton, { label: 'Clear Local Data', description: 'Remove all locally stored wallet information', onClick: () => {
    if (confirm('⚠️ Warning: This will delete all local data. Make sure you have backups. Continue?')) {
      localStorage.clear();
      alert('✅ Local data cleared. Please refresh the page.');
    }
  } }), _jsx(DangerButton, { label: 'Delete Wallet', description: 'Permanently delete wallet (requires backup confirmation)', onClick: () => {
    const confirmation = prompt('⚠️ DANGER: This will permanently delete your wallet.\n\n' +
                                                'Type "DELETE" to confirm:');
    if (confirmation === 'DELETE') {
      alert('🗑️ Wallet deletion functionality will be implemented');
    }
  }, critical: true })] })] })] }), _jsxs('div', { style: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  }, children: [_jsx('h2', { style: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  }, children: '\uD83D\uDD27 Advanced' }), _jsx('p', { style: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#64748b'
  }, children: 'Advanced configuration options' }), _jsxs('div', { style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  }, children: [_jsx(InfoCard, { label: 'RAILGUN Version', value: 'v3.0', icon: '\uD83D\uDE82' }), _jsx(InfoCard, { label: 'Proof Generator', value: 'FFI Bridge', icon: '\u26A1' }), _jsx(InfoCard, { label: 'Database', value: 'LevelDB', icon: '\uD83D\uDCBE' }), _jsx(InfoCard, { label: 'App Version', value: '1.0.0', icon: '\uD83D\uDCE6' })] }), _jsxs('div', { style: {
    marginTop: '20px',
    padding: '16px',
    background: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '1.6'
  }, children: [_jsx('strong', { children: '\u26A0\uFE0F Warning:' }), " Modifying advanced settings may affect wallet functionality. Only change these if you know what you're doing."] })] })] }));
};
const SettingToggle = ({ label, description, value, onChange, icon, locked = false }) => (_jsx('div', { style: {
  padding: '20px',
  background: '#f8fafc',
  borderRadius: '12px',
  marginBottom: '12px',
  opacity: locked ? 0.6 : 1
}, children: _jsxs('div', { style: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px'
}, children: [_jsxs('div', { style: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1
}, children: [_jsx('span', { style: { fontSize: '20px' }, children: icon }), _jsxs('div', { children: [_jsxs('div', { style: {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '4px'
}, children: [label, locked && _jsx('span', { style: { marginLeft: '8px', fontSize: '12px' }, children: '\uD83D\uDD12' })] }), _jsx('div', { style: {
  fontSize: '13px',
  color: '#64748b'
}, children: description })] })] }), _jsx('button', { onClick: () => !locked && onChange(!value), disabled: locked, style: {
  width: '52px',
  height: '28px',
  background: value ? '#3b82f6' : '#cbd5e1',
  borderRadius: '14px',
  border: 'none',
  cursor: locked ? 'not-allowed' : 'pointer',
  position: 'relative',
  transition: 'all 0.2s',
  flexShrink: 0
}, children: _jsx('div', { style: {
  width: '20px',
  height: '20px',
  background: 'white',
  borderRadius: '10px',
  position: 'absolute',
  top: '4px',
  left: value ? '28px' : '4px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
} }) })] }) }));
const DangerButton = ({ label, description, onClick, critical = false }) => (_jsxs('button', { onClick: onClick, style: {
  padding: '16px',
  background: critical ? '#fef2f2' : '#fff7ed',
  border: `2px solid ${critical ? '#fecaca' : '#fed7aa'}`,
  borderRadius: '10px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
}, onMouseEnter: (e) => {
  e.currentTarget.style.borderColor = critical ? '#dc2626' : '#f97316';
  e.currentTarget.style.transform = 'translateY(-1px)';
}, onMouseLeave: (e) => {
  e.currentTarget.style.borderColor = critical ? '#fecaca' : '#fed7aa';
  e.currentTarget.style.transform = 'translateY(0)';
}, children: [_jsx('div', { style: {
  fontSize: '14px',
  fontWeight: '700',
  color: critical ? '#dc2626' : '#ea580c',
  marginBottom: '4px'
}, children: label }), _jsx('div', { style: {
  fontSize: '12px',
  color: critical ? '#991b1b' : '#9a3412'
}, children: description })] }));
const InfoCard = ({ label, value, icon }) => (_jsxs('div', { style: {
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
}, children: [_jsxs('div', { style: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px'
}, children: [_jsx('span', { style: { fontSize: '18px' }, children: icon }), _jsx('span', { style: {
  fontSize: '13px',
  color: '#64748b',
  fontWeight: '600'
}, children: label })] }), _jsx('div', { style: {
  fontSize: '16px',
  fontWeight: '700',
  color: '#1e293b',
  fontFamily: 'monospace'
}, children: value })] }));
