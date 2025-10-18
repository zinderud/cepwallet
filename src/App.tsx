/**
 * Main App Component
 * 
 * CepWallet - Privacy-First Hardware Wallet
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { WalletPage } from './pages/WalletPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles/globals.css';

export type NavigationPage = 'dashboard' | 'wallet' | 'privacy' | 'transactions' | 'settings';

const App = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'wallet':
        return <WalletPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        background: '#f8fafc'
      }}>
        {renderPage()}
      </div>
    </div>
  );
};

export default App;