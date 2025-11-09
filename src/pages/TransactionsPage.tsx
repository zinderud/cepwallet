/**
 * Transactions Page
 * 
 * View transaction history with privacy indicators
 */

import React, { useState } from 'react';

type TransactionType = 'shield' | 'transfer' | 'unshield' | 'public';
type TransactionStatus = 'pending' | 'confirmed' | 'failed';

interface Transaction {
  id: string;
  type: TransactionType;
  token: string;
  amount: string;
  from?: string;
  to?: string;
  timestamp: number;
  status: TransactionStatus;
  txHash?: string;
  isPrivate: boolean;
}

// Mock transaction data for demonstration
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'shield',
    token: 'ETH',
    amount: '0.5',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    timestamp: Date.now() - 3600000,
    status: 'confirmed',
    txHash: '0xabc123...',
    isPrivate: true
  },
  {
    id: '2',
    type: 'transfer',
    token: 'USDC',
    amount: '100',
    to: '0zk1q2w3e4r5t6y7u8i9o0p...',
    timestamp: Date.now() - 7200000,
    status: 'confirmed',
    isPrivate: true
  },
  {
    id: '3',
    type: 'unshield',
    token: 'DAI',
    amount: '50',
    to: '0x123d45Cc6634C0532925a3b844Bc9e7595f0789',
    timestamp: Date.now() - 86400000,
    status: 'confirmed',
    txHash: '0xdef456...',
    isPrivate: true
  },
  {
    id: '4',
    type: 'shield',
    token: 'USDT',
    amount: '200',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    timestamp: Date.now() - 172800000,
    status: 'pending',
    isPrivate: true
  },
];

const TOKEN_ICONS: Record<string, string> = {
  ETH: '⟠',
  USDC: '💵',
  USDT: '💰',
  DAI: '💎',
};

export const TransactionsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = 
      searchQuery === '' ||
      tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.includes(searchQuery) ||
      tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 10px',
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📊 <span>Transaction History</span>
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#64748b'
        }}>
          Track all your public and private transactions
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flex: 1,
            flexWrap: 'wrap'
          }}>
            <FilterButton
              label="All"
              count={MOCK_TRANSACTIONS.length}
              isActive={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <FilterButton
              label="🛡️ Shield"
              count={MOCK_TRANSACTIONS.filter(tx => tx.type === 'shield').length}
              isActive={filter === 'shield'}
              onClick={() => setFilter('shield')}
            />
            <FilterButton
              label="🔄 Transfer"
              count={MOCK_TRANSACTIONS.filter(tx => tx.type === 'transfer').length}
              isActive={filter === 'transfer'}
              onClick={() => setFilter('transfer')}
            />
            <FilterButton
              label="🔓 Unshield"
              count={MOCK_TRANSACTIONS.filter(tx => tx.type === 'unshield').length}
              isActive={filter === 'unshield'}
              onClick={() => setFilter('unshield')}
            />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by token, amount, or hash..."
            style={{
              padding: '10px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              minWidth: '250px',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
            }}
          />
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px',
          border: '2px dashed #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            No transactions found
          </div>
          <div style={{
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Your transaction history will appear here'
            }
          </div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {filteredTransactions.map((tx, index) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              isLast={index === filteredTransactions.length - 1}
            />
          ))}
        </div>
      )}

      {/* Privacy Notice */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        fontSize: '13px',
        color: '#0369a1',
        lineHeight: '1.6'
      }}>
        <strong>🔒 Privacy Note:</strong> Private transactions (Shield, Transfer, Unshield) 
        are tracked locally for your convenience. RAILGUN ensures on-chain privacy - 
        transaction amounts and recipients are not visible on the blockchain.
      </div>
    </div>
  );
};

// Helper Components

interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  count,
  isActive,
  onClick
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      background: isActive ? '#3b82f6' : 'white',
      color: isActive ? 'white' : '#64748b',
      border: `2px solid ${isActive ? '#3b82f6' : '#e2e8f0'}`,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.color = '#3b82f6';
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.color = '#64748b';
      }
    }}
  >
    <span>{label}</span>
    <span style={{
      padding: '2px 6px',
      background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '700'
    }}>
      {count}
    </span>
  </button>
);

interface TransactionRowProps {
  transaction: Transaction;
  isLast: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeInfo = () => {
    switch (transaction.type) {
    case 'shield':
      return { icon: '🛡️', label: 'Shield', color: '#3b82f6', bg: '#eff6ff' };
    case 'transfer':
      return { icon: '🔄', label: 'Transfer', color: '#8b5cf6', bg: '#f5f3ff' };
    case 'unshield':
      return { icon: '🔓', label: 'Unshield', color: '#f59e0b', bg: '#fffbeb' };
    default:
      return { icon: '💸', label: 'Public', color: '#64748b', bg: '#f8fafc' };
    }
  };

  const getStatusInfo = () => {
    switch (transaction.status) {
    case 'confirmed':
      return { icon: '✅', label: 'Confirmed', color: '#059669' };
    case 'pending':
      return { icon: '⏳', label: 'Pending', color: '#f59e0b' };
    case 'failed':
      return { icon: '❌', label: 'Failed', color: '#dc2626' };
    }
  };

  const typeInfo = getTypeInfo();
  const statusInfo = getStatusInfo();
  const tokenIcon = TOKEN_ICONS[transaction.token] || '🪙';

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f8fafc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Type Badge */}
          <div style={{
            padding: '12px',
            background: typeInfo.bg,
            borderRadius: '12px',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {typeInfo.icon}
          </div>

          {/* Transaction Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                {typeInfo.label}
              </span>
              {transaction.isPrivate && (
                <span style={{
                  padding: '2px 8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  🔒 PRIVATE
                </span>
              )}
              <span style={{
                padding: '2px 8px',
                background: statusInfo.color + '20',
                color: statusInfo.color,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{formatTimestamp(transaction.timestamp)}</span>
              {transaction.txHash && (
                <>
                  <span>•</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {truncateAddress(transaction.txHash)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Amount */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{tokenIcon}</span>
              <span>{transaction.amount}</span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                {transaction.token}
              </span>
            </div>
          </div>

          {/* Expand Arrow */}
          <div style={{
            fontSize: '20px',
            color: '#94a3b8',
            transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          padding: '20px 24px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {transaction.from && (
              <DetailItem label="From" value={transaction.from} isMono />
            )}
            {transaction.to && (
              <DetailItem label="To" value={transaction.to} isMono />
            )}
            {transaction.txHash && (
              <DetailItem label="Transaction Hash" value={transaction.txHash} isMono />
            )}
            <DetailItem 
              label="Privacy Status" 
              value={transaction.isPrivate ? '🔒 Shielded' : '👁️ Public'} 
            />
          </div>

          {transaction.txHash && (
            <button
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#3b82f6',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => {
                alert(`🔗 Open block explorer: https://etherscan.io/tx/${transaction.txHash}`);
              }}
            >
              🔗 View on Explorer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
  isMono?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, isMono = false }) => (
  <div>
    <div style={{
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '14px',
      color: '#1e293b',
      fontWeight: '600',
      fontFamily: isMono ? 'monospace' : 'inherit',
      wordBreak: 'break-all'
    }}>
      {value}
    </div>
  </div>
);
