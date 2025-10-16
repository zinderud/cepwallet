import React from 'react';

interface Transaction {
  date: string;
  amount: string;
  status: string;
  hash?: string;
}

export const TransactionList = () => {
  // Replace with actual transaction data from Tauri backend
  const transactions: Transaction[] = [];

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#475569' }}>📋 Transaction History</h2>
      
      {transactions.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>📭</p>
          <p style={{ margin: 0, fontSize: '16px' }}>No transactions yet</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            Your transaction history will appear here
          </p>
        </div>
      ) : (
        <div>
          {transactions.map((transaction, index) => (
            <div key={index} style={{
              padding: '15px',
              background: '#f8fafc',
              borderRadius: '4px',
              marginBottom: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#475569' }}>{transaction.amount}</span>
                <span style={{
                  padding: '2px 8px',
                  background: transaction.status === 'completed' ? '#d1fae5' : '#fef3c7',
                  color: transaction.status === 'completed' ? '#065f46' : '#92400e',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {transaction.status}
                </span>
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                {transaction.date}
              </p>
              {transaction.hash && (
                <p style={{ 
                  margin: '5px 0 0 0', 
                  fontSize: '11px', 
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {transaction.hash}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};