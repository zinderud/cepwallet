import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ShieldedTransaction {
  tx_hash: string;
  status: string;
  privacy_level: string;
  timestamp: string;
  proof_time_ms?: number;
}

interface PrivacyTransactionFormProps {
  selectedPrivacyLevel?: string;
}

export const PrivacyTransactionForm: React.FC<PrivacyTransactionFormProps> = ({
  selectedPrivacyLevel = 'Railgun',
}) => {
  const [txType, setTxType] = useState<'shield' | 'transfer' | 'unshield'>('shield');
  const [recipient, setRecipient] = useState('');
  const [token, setToken] = useState('0x0000000000000000000000000000000000000000');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShieldedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proofEstimate, setProofEstimate] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let tx: ShieldedTransaction;

      if (txType === 'shield') {
        tx = await invoke<ShieldedTransaction>('shield_transaction', {
          token,
          amount,
        });
      } else if (txType === 'transfer') {
        tx = await invoke<ShieldedTransaction>('private_transfer', {
          recipient,
          token,
          amount,
        });
      } else {
        // unshield
        tx = await invoke<ShieldedTransaction>('unshield_transaction', {
          token,
          amount,
          recipient,
        });
      }

      setResult(tx);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const estimateProofTime = async () => {
    try {
      const proofType = txType === 'shield' ? 'Shield' : txType === 'transfer' ? 'Transfer' : 'Unshield';
      const time = await invoke<number>('estimate_proof_time', { proofType });
      setProofEstimate(time);
    } catch (err) {
      console.error('Failed to estimate proof time:', err);
    }
  };

  React.useEffect(() => {
    estimateProofTime();
  }, [txType]);

  return (
    <div style={{
      padding: '24px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: 'white',
    }}>
      <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
        🔐 Privacy Transaction
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Send private transactions using {selectedPrivacyLevel}
      </p>

      {/* Transaction Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Transaction Type
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['shield', 'transfer', 'unshield'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTxType(type)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: txType === type ? '#3b82f6' : '#f3f4f6',
                color: txType === type ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {type === 'shield' && '🛡️ '}{type === 'transfer' && '🔀 '}{type === 'unshield' && '🔓 '}
              {type}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Token Address */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Token Address
          </label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
          >
            <option value="0x0000000000000000000000000000000000000000">ETH (Native)</option>
            <option value="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
            <option value="0xdAC17F958D2ee523a2206206994597C13D831ec7">USDT</option>
            <option value="0x6B175474E89094C44Da98b954EedeAC495271d0F">DAI</option>
          </select>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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

        {/* Recipient (for transfer and unshield) */}
        {(txType === 'transfer' || txType === 'unshield') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
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
        )}

        {/* Proof Time Estimate */}
        {proofEstimate !== null && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#92400e',
          }}>
            ⏱️ Estimated proof generation time: <strong>{proofEstimate}s</strong>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing...' : `${txType.charAt(0).toUpperCase()}${txType.slice(1)} Transaction`}
        </button>
      </form>

      {/* Success Result */}
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: '8px',
        }}>
          <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#065f46' }}>
            ✅ Transaction Successful
          </div>
          <div style={{ fontSize: '14px', color: '#047857', marginBottom: '4px' }}>
            <strong>TX Hash:</strong> {result.tx_hash}
          </div>
          <div style={{ fontSize: '14px', color: '#047857', marginBottom: '4px' }}>
            <strong>Status:</strong> {result.status}
          </div>
          {result.proof_time_ms && (
            <div style={{ fontSize: '14px', color: '#047857' }}>
              <strong>Proof Time:</strong> {(result.proof_time_ms / 1000).toFixed(2)}s
            </div>
          )}
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
