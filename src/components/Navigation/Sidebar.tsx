/**
 * Sidebar Navigation for Tauri App
 * 
 * Collapsible navigation with icons and labels
 */

import React, { useState } from 'react';

export type NavigationPage = 
  | 'dashboard' 
  | 'wallet' 
  | 'privacy' 
  | 'transactions' 
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
}

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Overview & balances'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: '👛',
    description: 'RAILGUN wallet'
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: '🔒',
    description: 'Private transactions'
  },
  {
    id: 'transactions',
    label: 'History',
    icon: '📜',
    description: 'Transaction history'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'App settings'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav style={{
      width: isCollapsed ? '80px' : '240px',
      height: '100vh',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      position: 'relative',
      transition: 'width 0.3s ease',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 20px 30px',
        borderBottom: '1px solid #334155',
        marginBottom: '20px',
        position: 'relative'
      }}>
        {!isCollapsed ? (
          <>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🔐 <span>CepWallet</span>
            </h1>
            <p style={{
              margin: '5px 0 0',
              fontSize: '12px',
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              Privacy-First Wallet
            </p>
          </>
        ) : (
          <div style={{
            fontSize: '32px',
            textAlign: 'center'
          }}>
            🔐
          </div>
        )}

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            top: '50%',
            right: '-12px',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#3b82f6',
            border: '2px solid #1e293b',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            zIndex: 101,
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Items */}
      <div style={{
        flex: 1,
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              style={{
                padding: isCollapsed ? '12px 8px' : '12px 16px',
                background: isActive 
                  ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' 
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                transition: 'all 0.2s',
                textAlign: 'left',
                fontFamily: 'inherit',
                outline: 'none',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#334155';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: isActive ? '#e0e7ff' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div style={{
          padding: '20px',
          borderTop: '1px solid #334155',
          fontSize: '11px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '4px', fontWeight: '600' }}>
            CepWallet v1.0
          </div>
          <div>Tauri 2.8 • RAILGUN v3</div>
        </div>
      )}
    </nav>
  );
};
