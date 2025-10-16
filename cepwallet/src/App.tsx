import React from 'react';
import { WalletConnect } from './components/Wallet/WalletConnect';
import { TransactionList } from './components/Wallet/TransactionList';
import { TrezorConnect } from './components/Hardware/TrezorConnect';
import './styles/globals.css';

const App = () => {
  return (
    <div className="app">
      <h1>Welcome to CepWallet</h1>
      <WalletConnect />
      <TransactionList />
      <TrezorConnect />
    </div>
  );
};

export default App;