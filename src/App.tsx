/**
 * Main App Component
 * 
 * CepWallet - Privacy-First Hardware Wallet
 */

import React from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { WalletPage } from './pages/WalletPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useNavigation } from './hooks/useNavigation';
import './styles/globals.css';

const App = () => {
  const { currentPage, navigate } = useNavigation();

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
        onNavigate={navigate} 
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