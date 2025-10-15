import React from 'react';
import type { WalletState } from '@cepwallet/shared';

interface DashboardProps {
  state: WalletState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CepWallet</h1>
        <div className="wallet-status">
          <div className={`status-indicator ${state.connected ? 'connected' : ''}`} />
          <span>
            {state.connected 
              ? `${state.type} Connected` 
              : 'Waiting for device connection...'}
          </span>
        </div>
      </div>

      {state.error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {state.error}
        </div>
      )}

      {state.accounts && state.accounts.length > 0 ? (
        <div className="accounts-section">
          <h2>Your Accounts</h2>
          <div className="account-list">
            {state.accounts.map((account, idx) => (
              <div
                key={idx}
                className={`account-card ${
                  state.selectedAccount === account.address ? 'active' : ''
                }`}
              >
                <div className="account-info">
                  <div className="account-name">
                    {account.name || `Account ${idx + 1}`}
                  </div>
                  <div className="account-address">
                    {account.address.substring(0, 6)}...{account.address.substring(38)}
                  </div>
                </div>
                <div className="account-balance">
                  <div className="balance-amount">{account.balance} ETH</div>
                  <div className="balance-usd">~$0.00</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-accounts">
          <p>No accounts found. Connect your device to continue.</p>
        </div>
      )}
    </div>
  );
};
