import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Token {
  symbol: string;
  address: string;
  icon: string;
}

const COMMON_TOKENS: Token[] = [
  { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', icon: '⟠' },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', icon: '💵' },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', icon: '💰' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', icon: '💎' },
];

export const ShieldedBalance: React.FC = () => {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedToken, setSelectedToken] = useState<string>('ETH');

  useEffect(() => {
    // Load balances for all tokens
    COMMON_TOKENS.forEach((token) => {
      loadBalance(token.symbol, token.address);
    });
  }, []);

  const loadBalance = async (symbol: string, tokenAddress: string) => {
    setLoading((prev) => ({ ...prev, [symbol]: true }));
    try {
      const balance = await invoke<string>('get_shielded_balance', {
        token: tokenAddress,
      });
      setBalances((prev) => ({ ...prev, [symbol]: balance }));
    } catch (err) {
      console.error(`Failed to load ${symbol} balance:`, err);
      setBalances((prev) => ({ ...prev, [symbol]: '0.00' }));
    } finally {
      setLoading((prev) => ({ ...prev, [symbol]: false }));
    }
  };

  const refreshBalance = (symbol: string, address: string) => {
    loadBalance(symbol, address);
  };

  return (
    <div style={{
      padding: '24px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: 'white',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          🛡️ Shielded Balances
        </h3>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Private balances protected by RAILGUN
        </span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {COMMON_TOKENS.map((token) => (
          <div
            key={token.symbol}
            style={{
              padding: '16px',
              border: selectedToken === token.symbol ? '2px solid #10b981' : '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: selectedToken === token.symbol ? '#f0fdf4' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setSelectedToken(token.symbol)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{token.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    {token.symbol}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {loading[token.symbol] ? (
                  <div style={{ color: '#6b7280' }}>Loading...</div>
                ) : (
                  <>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                      {balances[token.symbol] || '0.00'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshBalance(token.symbol, token.address);
                      }}
                      style={{
                        marginTop: '4px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af',
      }}>
        ℹ️ Shielded balances are only visible to you and cannot be traced on-chain
      </div>
    </div>
  );
};
