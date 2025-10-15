import React, { useEffect, useState } from 'react';
import type { Account, WalletState } from '@cepwallet/shared';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import './App.css';

export const App: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    type: 'trezor',
    accounts: [],
    selectedAccount: null,
    selectedChain: 1,
    networks: [],
    isLoading: true,
    error: null
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const initWallet = async () => {
      try {
        const cepwallet = (window as any).cepwallet;
        if (cepwallet?.wallet) {
          const status = await cepwallet.wallet.getStatus();
          setWalletState(status);
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
        setWalletState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Bridge connection failed'
        }));
      }
    };

    initWallet();

    const cepwallet = (window as any).cepwallet;
    if (cepwallet?.on) {
      cepwallet.on('wallet-state-changed', (_: any, newState: WalletState) => {
        setWalletState(newState);
      });
    }

    return () => {
      const cepwallet = (window as any).cepwallet;
      if (cepwallet?.off) {
        cepwallet.off('wallet-state-changed', () => {});
      }
    };
  }, []);

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="app-main">
        <Dashboard state={walletState} />
      </main>
    </div>
  );
};
