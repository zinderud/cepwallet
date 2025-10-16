import React from 'react';
import { useWallet } from '../../hooks/useWallet';

const WalletConnect: React.FC = () => {
  const { connectWallet, walletAddress } = useWallet();

  return (
    <div className="wallet-connect">
      <h2>Connect Your Wallet</h2>
      {walletAddress ? (
        <p>Connected: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;