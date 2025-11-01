/**
 * Privacy Operations Page
 * 
 * Shield, Transfer, and Unshield operations
 */

import React, { useState } from 'react';
import { useRailgunWallet } from '../hooks/useRailgunWallet';

type OperationType = 'shield' | 'transfer' | 'unshield';

const TOKENS = [
  { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', icon: '⟠', decimals: 18 },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', icon: '💵', decimals: 6 },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', icon: '💰', decimals: 6 },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', icon: '💎', decimals: 18 },
];

export const PrivacyPage: React.FC = () => {
  // Get encryption key from localStorage (stored during wallet creation)
  const encryptionKey = localStorage.getItem('railgun_encryption_key') || undefined;
  const { wallet, isInitialized, shield, transfer, unshield } = useRailgunWallet(11155111, encryptionKey);
  
  const [operationType, setOperationType] = useState<OperationType>('shield');
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOperation = async () => {
    setIsProcessing(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (operationType === 'shield') {
        await shield({
          token: selectedToken.address,
          amount,
        });
        setSuccessMessage(`✅ Successfully shielded ${amount} ${selectedToken.symbol}`);
      } else if (operationType === 'transfer') {
        if (!recipientAddress) {
          throw new Error('Recipient address is required');
        }
        await transfer({
          recipient: recipientAddress,
          token: selectedToken.address,
          amount,
          mnemonic: wallet?.mnemonic || '',
        });
        setSuccessMessage(`✅ Successfully transferred ${amount} ${selectedToken.symbol}`);
      } else if (operationType === 'unshield') {
        if (!recipientAddress) {
          throw new Error('Recipient address is required');
        }
        await unshield({
          token: selectedToken.address,
          amount,
          recipient: recipientAddress,
          mnemonic: wallet?.mnemonic || '',
        });
        setSuccessMessage(`✅ Successfully unshielded ${amount} ${selectedToken.symbol}`);
      }
      
      // Clear form
      setAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const canOperate = isInitialized && wallet && amount && parseFloat(amount) > 0;

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
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
          🔒 <span>Privacy Operations</span>
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#64748b'
        }}>
          Shield, transfer, and unshield tokens with RAILGUN privacy
        </p>
      </div>

      {/* Prerequisites Check */}
      {(!isInitialized || !wallet) && (
        <div style={{
          padding: '20px',
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#92400e',
            marginBottom: '8px'
          }}>
            ⚠️ Setup Required
          </div>
          <div style={{
            fontSize: '14px',
            color: '#78350f',
            lineHeight: '1.6'
          }}>
            {!isInitialized && '• Initialize privacy features first'}
            {!wallet && <><br />• Create a RAILGUN wallet</>}
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '13px',
            color: '#78350f'
          }}>
            Please visit the <strong>Wallet</strong> page to complete setup.
          </div>
        </div>
      )}

      {/* Quick Test Section */}
      {isInitialized && wallet && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid #667eea',
          borderRadius: '12px',
          marginBottom: '30px',
          color: 'white',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            🧪 Quick Test Mode
          </div>
          <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '16px',
            opacity: 0.9,
          }}>
            Test privacy operations with simulated transactions (no real funds required)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}>
            <button
              onClick={() => {
                setOperationType('shield');
                setSelectedToken(TOKENS[0]);
                setAmount('0.1');
                setSuccessMessage('🧪 Test: Ready to shield 0.1 ETH');
              }}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🛡️ Test Shield
            </button>
            <button
              onClick={() => {
                setOperationType('transfer');
                setSelectedToken(TOKENS[0]);
                setAmount('0.05');
                setRecipientAddress('0zk1qyhxaafkj50hg9j0kr477jq5hxxpzjpklyamnczd4waa6t08uskjtrv7j6fe3z53lu48668ng0jjy5uxepd4nq84vuznvndws0f2cw72stfsjdlzhfsuv746jnk'); // Demo recipient address
                setSuccessMessage('🧪 Demo: Transfer test (will fail without balance - shield funds first!)');
              }}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🔄 Test Transfer
            </button>
            <button
              onClick={() => {
                setOperationType('unshield');
                setSelectedToken(TOKENS[0]);
                setAmount('0.02');
                setRecipientAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
                setSuccessMessage('🧪 Test: Ready to unshield 0.02 ETH');
              }}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🔓 Test Unshield
            </button>
          </div>
        </div>
      )}

      {/* Operation Type Selector */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        marginBottom: '20px'
      }}>
        <h2 style={{
          margin: '0 0 20px',
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          Select Operation
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <OperationButton
            type="shield"
            icon="🛡️"
            label="Shield"
            description="Public → Private"
            isSelected={operationType === 'shield'}
            onClick={() => setOperationType('shield')}
          />
          <OperationButton
            type="transfer"
            icon="🔄"
            label="Transfer"
            description="Private → Private"
            isSelected={operationType === 'transfer'}
            onClick={() => setOperationType('transfer')}
          />
          <OperationButton
            type="unshield"
            icon="🔓"
            label="Unshield"
            description="Private → Public"
            isSelected={operationType === 'unshield'}
            onClick={() => setOperationType('unshield')}
          />
        </div>
      </div>

      {/* Operation Form */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{
          margin: '0 0 24px',
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          {operationType === 'shield' && '🛡️ Shield Tokens'}
          {operationType === 'transfer' && '🔄 Private Transfer'}
          {operationType === 'unshield' && '🔓 Unshield Tokens'}
        </h2>

        {/* Token Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#475569'
          }}>
            Token
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {TOKENS.map((token) => (
              <button
                key={token.symbol}
                onClick={() => setSelectedToken(token)}
                style={{
                  padding: '12px',
                  background: selectedToken.symbol === token.symbol 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'white',
                  border: `2px solid ${selectedToken.symbol === token.symbol ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: selectedToken.symbol === token.symbol ? 'white' : '#1e293b',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {token.icon}
                </div>
                {token.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#475569'
          }}>
            Amount
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              style={{
                width: '100%',
                padding: '14px 60px 14px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: '600',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
            <div style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              fontWeight: '700',
              color: '#64748b',
              background: '#f1f5f9',
              padding: '4px 12px',
              borderRadius: '6px'
            }}>
              {selectedToken.symbol}
            </div>
          </div>
        </div>

        {/* Recipient Address (for transfer and unshield) */}
        {(operationType === 'transfer' || operationType === 'unshield') && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}>
              Recipient Address
              {operationType === 'transfer' && ' (RAILGUN address)'}
              {operationType === 'unshield' && ' (Public 0x... address)'}
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder={
                operationType === 'transfer' 
                  ? '0zk1q...' 
                  : '0x...'
              }
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'monospace',
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
        )}

        {/* Operation Info */}
        <div style={{
          padding: '16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '13px',
            color: '#0369a1',
            lineHeight: '1.6'
          }}>
            {operationType === 'shield' && (
              <>
                <strong>Shield:</strong> Converts public tokens to shielded (private) balance. 
                Your tokens will no longer be visible on the blockchain.
              </>
            )}
            {operationType === 'transfer' && (
              <>
                <strong>Private Transfer:</strong> Sends tokens between shielded addresses. 
                The amount and recipient are completely private. <em>Note: You must have shielded funds first before you can transfer.</em>
              </>
            )}
            {operationType === 'unshield' && (
              <>
                <strong>Unshield:</strong> Converts shielded tokens back to public. 
                Creates an on-chain link to the recipient address.
              </>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{
            padding: '16px',
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#059669',
            fontWeight: '600'
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            padding: '16px',
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#dc2626',
            fontWeight: '600'
          }}>
            ❌ {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleOperation}
          disabled={!canOperate || isProcessing}
          style={{
            width: '100%',
            padding: '16px',
            background: (!canOperate || isProcessing)
              ? '#94a3b8'
              : operationType === 'shield'
                ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                : operationType === 'transfer'
                  ? 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                  : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: (!canOperate || isProcessing) ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s',
            outline: 'none',
          }}
        >
          {isProcessing ? (
            <>⏳ Processing...</>
          ) : operationType === 'shield' ? (
            <>🛡️ Shield {amount || '0'} {selectedToken.symbol}</>
          ) : operationType === 'transfer' ? (
            <>🔄 Transfer {amount || '0'} {selectedToken.symbol}</>
          ) : (
            <>🔓 Unshield {amount || '0'} {selectedToken.symbol}</>
          )}
        </button>

        {/* Estimated Time */}
        {canOperate && (
          <div style={{
            marginTop: '16px',
            fontSize: '13px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            ⏱️ Estimated time: ~{
              operationType === 'shield' ? '8' : 
              operationType === 'transfer' ? '20' : '10'
            } seconds (ZK proof generation)
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component

interface OperationButtonProps {
  type: OperationType;
  icon: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const OperationButton: React.FC<OperationButtonProps> = ({
  icon,
  label,
  description,
  isSelected,
  onClick
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '20px',
      background: isSelected 
        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        : 'white',
      border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center',
      color: isSelected ? 'white' : '#1e293b',
      boxShadow: isSelected ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none',
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
  >
    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
      {icon}
    </div>
    <div style={{
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '4px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '12px',
      opacity: isSelected ? 0.9 : 0.7,
      fontWeight: '500'
    }}>
      {description}
    </div>
  </button>
);
