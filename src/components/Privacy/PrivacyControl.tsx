import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface PrivacyControlProps {
  onPrivacyLevelChange?: (level: string) => void;
}

export const PrivacyControl: React.FC<PrivacyControlProps> = ({ onPrivacyLevelChange }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('Public');
  const [error, setError] = useState<string | null>(null);

  // Check if privacy is already initialized
  useEffect(() => {
    checkPrivacyStatus();
  }, []);

  const checkPrivacyStatus = async () => {
    try {
      const ready = await invoke<boolean>('is_privacy_ready');
      setIsInitialized(ready);
    } catch (err) {
      console.error('Privacy status check failed:', err);
    }
  };

  const initializePrivacy = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      await invoke('initialize_privacy');
      setIsInitialized(true);
    } catch (err) {
      setError(err as string);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLevelChange = (level: string) => {
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
    return (
      <div style={{
        padding: '24px',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: '#f9fafb',
      }}>
        <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>
          🔐 Privacy Features
        </h3>
        <p style={{ color: '#6b7280' }}>
          Initialize privacy features to enable RAILGUN, Privacy Pools, and ZK-SNARK proofs.
        </p>
        <button
          onClick={initializePrivacy}
          disabled={isInitializing}
          style={{
            padding: '12px 24px',
            backgroundColor: isInitializing ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isInitializing ? 'not-allowed' : 'pointer',
            marginTop: '16px',
          }}
        >
          {isInitializing ? 'Initializing...' : 'Initialize Privacy'}
        </button>
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#dc2626',
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: 'white',
    }}>
      <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
        🔐 Privacy Level
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Choose your desired privacy level for transactions
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {privacyLevels.map((level) => (
          <div
            key={level.name}
            onClick={() => handleLevelChange(level.name)}
            style={{
              padding: '16px',
              border: selectedLevel === level.name ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: selectedLevel === level.name ? '#eff6ff' : 'white',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{level.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                  {level.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {level.description}
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#3b82f6',
                backgroundColor: '#dbeafe',
                padding: '4px 12px',
                borderRadius: '12px',
              }}>
                {level.fee} fee
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#92400e',
      }}>
        ⚡ Selected: <strong>{selectedLevel}</strong> - Privacy features are active
      </div>
    </div>
  );
};
