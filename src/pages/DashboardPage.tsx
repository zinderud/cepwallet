/**
 * Dashboard Page
 * 
 * Main overview page with wallet status, balances, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useRailgunWallet } from '../hooks/useRailgunWallet';

interface DashboardStats {
  totalBalance: string;
  shieldedBalance: string;
  publicBalance: string;
  privacyLevel: 'Not Initialized' | 'Ready';
}

export const DashboardPage: React.FC = () => {
  const { wallet, isInitialized, shieldPrivateKey } = useRailgunWallet(11155111);
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: '0.00',
    shieldedBalance: '0.00',
    publicBalance: '0.00',
    privacyLevel: 'Not Initialized'
  });

  useEffect(() => {
    if (isInitialized) {
      setStats(prev => ({ ...prev, privacyLevel: 'Ready' }));
    }
  }, [isInitialized]);

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 10px',
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          Welcome to CepWallet
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#64748b'
        }}>
          Your privacy-first cryptocurrency wallet powered by RAILGUN
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Total Balance
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            ${stats.totalBalance}
          </div>
          <div style={{
            fontSize: '12px',
            opacity: 0.8
          }}>
            USD equivalent
          </div>
        </div>

        {/* Shielded Balance Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            🔒 Shielded Balance
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '4px'
          }}>
            ${stats.shieldedBalance}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#10b981',
            fontWeight: '600'
          }}>
            ✓ Private & Secure
          </div>
        </div>

        {/* Public Balance Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            🌐 Public Balance
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '4px'
          }}>
            ${stats.publicBalance}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            On-chain visible
          </div>
        </div>

        {/* Privacy Status Card */}
        <div style={{
          background: isInitialized 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: isInitialized 
            ? '0 10px 30px rgba(16, 185, 129, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Privacy Status
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            {stats.privacyLevel}
          </div>
          <div style={{
            fontSize: '12px',
            opacity: 0.8
          }}>
            {isInitialized ? 'RAILGUN active' : 'Initialize required'}
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid #e2e8f0',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{
          margin: '0 0 20px',
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🛡️ <span>RAILGUN Wallet Status</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <StatusItem
            label="Privacy Features"
            status={isInitialized ? 'Active' : 'Inactive'}
            isActive={isInitialized}
          />
          <StatusItem
            label="Wallet Created"
            status={wallet ? 'Yes' : 'No'}
            isActive={!!wallet}
          />
          <StatusItem
            label="Shield Key"
            status={shieldPrivateKey ? 'Loaded' : 'Not Loaded'}
            isActive={!!shieldPrivateKey}
          />
        </div>

        {wallet && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              RAILGUN ADDRESS
            </div>
            <div style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#1e293b',
              wordBreak: 'break-all',
              fontWeight: '500'
            }}>
              {wallet.railgunAddress}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{
          margin: '0 0 20px',
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          ⚡ Quick Actions
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <QuickActionButton
            icon="🛡️"
            label="Shield Tokens"
            description="Make private"
            disabled={!isInitialized}
          />
          <QuickActionButton
            icon="🔄"
            label="Private Transfer"
            description="Send privately"
            disabled={!wallet}
          />
          <QuickActionButton
            icon="🔓"
            label="Unshield Tokens"
            description="Make public"
            disabled={!wallet}
          />
          <QuickActionButton
            icon="📜"
            label="View History"
            description="See transactions"
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components

interface StatusItemProps {
  label: string;
  status: string;
  isActive: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status, isActive }) => (
  <div style={{
    padding: '12px',
    background: isActive ? '#f0fdf4' : '#f8fafc',
    borderRadius: '8px',
    border: `1px solid ${isActive ? '#86efac' : '#e2e8f0'}`
  }}>
    <div style={{
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px',
      fontWeight: '600'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '16px',
      fontWeight: '700',
      color: isActive ? '#059669' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      {isActive ? '✅' : '⏳'} {status}
    </div>
  </div>
);

interface QuickActionButtonProps {
  icon: string;
  label: string;
  description: string;
  disabled: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  description,
  disabled
}) => (
  <button
    disabled={disabled}
    style={{
      padding: '16px',
      background: disabled ? '#f8fafc' : 'white',
      border: `2px solid ${disabled ? '#e2e8f0' : '#3b82f6'}`,
      borderRadius: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left',
      opacity: disabled ? 0.6 : 1,
      outline: 'none',
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.2)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    <div style={{
      fontSize: '24px',
      marginBottom: '8px'
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '14px',
      fontWeight: '700',
      color: disabled ? '#94a3b8' : '#1e293b',
      marginBottom: '4px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '12px',
      color: '#64748b'
    }}>
      {description}
    </div>
  </button>
);
