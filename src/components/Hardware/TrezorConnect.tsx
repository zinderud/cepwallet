import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface DeviceInfo {
  model: string;
  label: string;
  features: any;
}

export const TrezorConnect = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectToTrezor = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await invoke<DeviceInfo>('connect_device');
      setDeviceInfo(info);
      setConnected(true);
    } catch (err) {
      setError((err as Error).message || String(err));
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await invoke('disconnect_device');
      setConnected(false);
      setDeviceInfo(null);
    } catch (err) {
      setError((err as Error).message || String(err));
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#475569' }}>🔐 Hardware Wallet</h2>
      
      {!connected ? (
        <div>
          <p style={{ color: '#64748b', marginBottom: '15px' }}>
            Connect your Trezor device to get started
          </p>
          <button 
            onClick={connectToTrezor}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#94a3b8' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            {loading ? 'Connecting...' : '🔌 Connect Trezor'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ 
            padding: '15px', 
            background: '#d1fae5',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            <p style={{ margin: 0, color: '#065f46', fontWeight: 'bold' }}>
              ✅ Connected Successfully!
            </p>
            {deviceInfo && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#047857' }}>
                <p style={{ margin: '5px 0' }}>Model: {deviceInfo.model}</p>
                <p style={{ margin: '5px 0' }}>Label: {deviceInfo.label}</p>
              </div>
            )}
          </div>
          <button 
            onClick={disconnect}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            Disconnect
          </button>
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: '15px',
          padding: '10px',
          background: '#fee2e2',
          borderRadius: '4px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          <strong>⚠️ Note:</strong> {error}
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
            Make sure Trezor is plugged in and Trezor Suite is closed.
          </p>
        </div>
      )}
    </div>
  );
};