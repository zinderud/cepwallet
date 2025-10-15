/**
 * TransactionPreview - Transaction Preview Modal
 * Displays transaction details for user approval
 */

import React, { useMemo } from 'react';
import { TransactionPreview as TransactionPreviewType } from '../utils/useBrowser';
import './Browser.css';

interface TransactionPreviewProps {
  previewId: string;
  transaction?: TransactionPreviewType;
  onApprove: () => Promise<void>;
  onReject: () => void;
}

const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  previewId,
  transaction,
  onApprove,
  onReject,
}) => {
  const [approving, setApproving] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  /**
   * Format address for display
   */
  const formatAddress = (address: string, chars: number = 6): string => {
    if (!address) return 'N/A';
    if (address.length <= chars * 2 + 2) return address;
    return `${address.substring(0, chars)}...${address.substring(
      address.length - chars
    )}`;
  };

  /**
   * Convert Wei to Ether
   */
  const weiToEther = (wei: string): string => {
    try {
      const value = BigInt(wei || '0');
      const ethValue = Number(value) / 1e18;
      return ethValue.toFixed(6);
    } catch {
      return '0';
    }
  };

  /**
   * Convert Wei to Gwei
   */
  const weiToGwei = (wei: string): string => {
    try {
      const value = BigInt(wei || '0');
      const gweiValue = Number(value) / 1e9;
      return gweiValue.toFixed(2);
    } catch {
      return '0';
    }
  };

  /**
   * Calculate total cost
   */
  const totalCost = useMemo(() => {
    if (!transaction) return '0';

    try {
      const value = BigInt(transaction.value || '0');
      const gasPrice = BigInt(transaction.gasPrice || '0');
      const gas = BigInt(transaction.gas || '0');
      const gasCost = gasPrice * gas;
      const total = value + gasCost;

      return weiToEther(total.toString());
    } catch {
      return '0';
    }
  }, [transaction]);

  /**
   * Handle approve
   */
  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  if (!transaction) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="transaction-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Confirm Transaction</h2>
          <button className="modal-close" onClick={onReject} disabled={approving}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Transaction summary */}
          <div className="tx-summary">
            <div className="tx-field">
              <label>From:</label>
              <div className="tx-value">
                <span className="address">{formatAddress(transaction.from)}</span>
                <span className="copy-btn" onClick={() => {
                  navigator.clipboard.writeText(transaction.from);
                }}>
                  📋
                </span>
              </div>
            </div>

            <div className="tx-arrow">↓</div>

            <div className="tx-field">
              <label>To:</label>
              <div className="tx-value">
                <span className="address">{formatAddress(transaction.to)}</span>
                <span className="copy-btn" onClick={() => {
                  navigator.clipboard.writeText(transaction.to);
                }}>
                  📋
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="tx-amount">
            <div className="amount-main">
              <span className="label">Amount:</span>
              <span className="value">{weiToEther(transaction.value)} ETH</span>
            </div>
            <div className="amount-usd">
              ≈ ${(parseFloat(weiToEther(transaction.value)) * 1800).toFixed(2)}
            </div>
          </div>

          {/* Gas details */}
          <div className="tx-gas">
            <div className="gas-row">
              <span className="label">Gas Price:</span>
              <span className="value">{weiToGwei(transaction.gasPrice)} Gwei</span>
            </div>
            <div className="gas-row">
              <span className="label">Gas Limit:</span>
              <span className="value">{transaction.gas}</span>
            </div>
            <div className="gas-row gas-cost">
              <span className="label">Gas Cost:</span>
              <span className="value">
                {weiToEther(
                  (
                    BigInt(transaction.gasPrice || '0') *
                    BigInt(transaction.gas || '0')
                  ).toString()
                )}{' '}
                ETH
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="tx-total">
            <span className="label">Total Cost:</span>
            <span className="value">{totalCost} ETH</span>
          </div>

          {/* Data section */}
          {transaction.data && transaction.data !== '0x' && (
            <div className="tx-data-section">
              <button
                className="expand-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '▼' : '▶'} Data ({transaction.data.length / 2} bytes)
              </button>

              {expanded && (
                <div className="tx-data">
                  <div className="data-content">{transaction.data}</div>
                  <button
                    className="copy-data-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(transaction.data);
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="tx-warning">
            <strong>⚠️ Security Warning:</strong>
            <p>
              Always verify the transaction details before approving. Check the
              recipient address carefully to avoid fraud.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn-reject"
            onClick={onReject}
            disabled={approving}
          >
            Reject
          </button>
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={approving}
          >
            {approving ? 'Confirming...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPreview;
