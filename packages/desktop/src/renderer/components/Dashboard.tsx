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
          {state.error}
        </div>
      )}

      {state.accounts && state.accounts.length > 0 ? (
        <div className="accounts-section">
          <h2>Your Accounts</h2>
          <div className="account-list">
            {state.accounts.map((account, idx) => (
              <div
                key={account.id}
                className={`account-card ${
                  state.selectedAccount?.id === account.id ? 'active' : ''
                }`}
              >
                <div className="account-name">
                  {account.name || `Account ${idx + 1}`}
                </div>
                <div className="account-address">
                  {account.address.substring(0, 6)}...{account.address.substring(-4)}
                </div>
                <div className="account-balance">
                  {account.balance.formatted} ETH
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="accounts-section">
          <div className="error-message">
            No accounts found. Connect your device to start.
          </div>
        </div>
      )}
    </div>
  );
};
