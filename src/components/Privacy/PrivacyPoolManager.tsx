import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface PrivacyPoolOperation {
  pool_id: string;
  operation_type: string;
  status: string;
  timestamp: string;
}

const AVAILABLE_POOLS = [
  {
    id: 'pool-eth-001',
    name: 'ETH Privacy Pool',
    token: 'ETH',
    tvl: '1,234 ETH',
    members: 156,
    icon: '⟠',
  },
  {
    id: 'pool-usdc-001',
    name: 'USDC Privacy Pool',
    token: 'USDC',
    tvl: '567,890 USDC',
    members: 89,
    icon: '💵',
  },
  {
    id: 'pool-dai-001',
    name: 'DAI Privacy Pool',
    token: 'DAI',
    tvl: '234,567 DAI',
    members: 67,
    icon: '💎',
  },
];

export const PrivacyPoolManager: React.FC = () => {
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [operation, setOperation] = useState<'join' | 'exit' | 'swap'>('join');
  const [depositAmount, setDepositAmount] = useState('');
  const [swapFromToken, setSwapFromToken] = useState('ETH');
  const [swapToToken, setSwapToToken] = useState('USDC');
  const [swapAmount, setSwapAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrivacyPoolOperation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJoinPool = async () => {
    if (!selectedPool) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const pool = AVAILABLE_POOLS.find((p) => p.id === selectedPool);
      const tokenAddress = pool?.token === 'ETH' 
        ? '0x0000000000000000000000000000000000000000'
        : pool?.token === 'USDC'
        ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        : '0x6B175474E89094C44Da98b954EedeAC495271d0F';

      const op = await invoke<PrivacyPoolOperation>('join_privacy_pool', {
        poolId: selectedPool,
        token: tokenAddress,
        depositAmount,
      });
      setResult(op);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleExitPool = async () => {
    if (!selectedPool) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const op = await invoke<PrivacyPoolOperation>('exit_privacy_pool', {
        poolId: selectedPool,
        withdrawAddress,
      });
      setResult(op);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!selectedPool) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fromTokenAddress = swapFromToken === 'ETH' 
        ? '0x0000000000000000000000000000000000000000'
        : swapFromToken === 'USDC'
        ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        : '0x6B175474E89094C44Da98b954EedeAC495271d0F';

      const toTokenAddress = swapToToken === 'ETH' 
        ? '0x0000000000000000000000000000000000000000'
        : swapToToken === 'USDC'
        ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        : '0x6B175474E89094C44Da98b954EedeAC495271d0F';

      const op = await invoke<PrivacyPoolOperation>('privacy_pool_swap', {
        poolId: selectedPool,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        amount: swapAmount,
      });
      setResult(op);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: 'white',
    }}>
      <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
        🏊 Privacy Pools
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Join privacy pools for compliant private transactions
      </p>

      {/* Operation Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Operation
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['join', 'exit', 'swap'] as const).map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: operation === op ? '#8b5cf6' : '#f3f4f6',
                color: operation === op ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {op === 'join' && '➕ '}{op === 'exit' && '➖ '}{op === 'swap' && '🔄 '}
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Pool Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Select Pool
        </label>
        <div style={{ display: 'grid', gap: '8px' }}>
          {AVAILABLE_POOLS.map((pool) => (
            <div
              key={pool.id}
              onClick={() => setSelectedPool(pool.id)}
              style={{
                padding: '12px',
                border: selectedPool === pool.id ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedPool === pool.id ? '#f5f3ff' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{pool.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{pool.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    TVL: {pool.tvl} • {pool.members} members
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Pool Form */}
      {operation === 'join' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Deposit Amount
            </label>
            <input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.0"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'monospace',
              }}
            />
          </div>
          <button
            onClick={handleJoinPool}
            disabled={loading || !selectedPool}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading || !selectedPool ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !selectedPool ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Join Pool'}
          </button>
        </div>
      )}

      {/* Exit Pool Form */}
      {operation === 'exit' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Withdraw Address
            </label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="0x..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
          </div>
          <button
            onClick={handleExitPool}
            disabled={loading || !selectedPool}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading || !selectedPool ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !selectedPool ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Exit Pool'}
          </button>
        </div>
      )}

      {/* Swap Form */}
      {operation === 'swap' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              From Token
            </label>
            <select
              value={swapFromToken}
              onChange={(e) => setSwapFromToken(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              To Token
            </label>
            <select
              value={swapToToken}
              onChange={(e) => setSwapToToken(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Amount
            </label>
            <input
              type="text"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="0.0"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <button
            onClick={handleSwap}
            disabled={loading || !selectedPool}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading || !selectedPool ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !selectedPool ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Swap in Pool'}
          </button>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#ddd6fe',
          border: '2px solid #8b5cf6',
          borderRadius: '8px',
        }}>
          <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#5b21b6' }}>
            ✅ Operation Successful
          </div>
          <div style={{ fontSize: '14px', color: '#6b21a8', marginBottom: '4px' }}>
            <strong>Pool:</strong> {result.pool_id}
          </div>
          <div style={{ fontSize: '14px', color: '#6b21a8', marginBottom: '4px' }}>
            <strong>Operation:</strong> {result.operation_type}
          </div>
          <div style={{ fontSize: '14px', color: '#6b21a8' }}>
            <strong>Status:</strong> {result.status}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          color: '#dc2626',
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
};
