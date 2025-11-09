import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
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
      return _jsx(DashboardPage, {});
    case 'wallet':
      return _jsx(WalletPage, {});
    case 'privacy':
      return _jsx(PrivacyPage, {});
    case 'transactions':
      return _jsx(TransactionsPage, {});
    case 'settings':
      return _jsx(SettingsPage, {});
    default:
      return _jsx(DashboardPage, {});
    }
  };
  return (_jsxs('div', { style: {
    display: 'flex',
    height: '100vh',
    background: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }, children: [_jsx(Sidebar, { currentPage: currentPage, onNavigate: navigate }), _jsx('div', { style: {
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    background: '#f8fafc'
  }, children: renderPage() })] }));
};
export default App;
