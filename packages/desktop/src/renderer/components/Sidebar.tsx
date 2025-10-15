import React, { useState } from 'react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
    { id: 'transfer', label: 'Transfer', icon: '📤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'transactions', label: 'Transactions', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <>
      <nav className={`app-sidebar ${!open ? 'closed' : ''}`}>
        <div className="nav-menu">
          {navItems.map(item => (
            <li key={item.id} className="nav-item">
              <a
                href={`#${item.id}`}
                className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span style={{ marginRight: '8px' }}>{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </div>
      </nav>
      <button className="sidebar-toggle" onClick={onToggle}>
        {open ? '←' : '→'}
      </button>
    </>
  );
};
