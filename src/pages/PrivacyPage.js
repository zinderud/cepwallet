import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Privacy Operations Page
 *
 * Shield, Transfer, and Unshield operations
 */
import { useState, useEffect } from 'react';
import { useRailgunWallet } from '../hooks/useRailgunWallet';
const TOKENS = [
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', icon: '⟠', decimals: 18 },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', icon: '💵', decimals: 6 },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', icon: '💰', decimals: 6 },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', icon: '💎', decimals: 18 },
];
export const PrivacyPage = () => {
    // Get encryption key from localStorage (stored during wallet creation)
    const encryptionKey = localStorage.getItem('railgun_encryption_key') || undefined;
    const { wallet, isInitialized, shield, transfer, unshield, getBalance } = useRailgunWallet(11155111, encryptionKey);
    const [operationType, setOperationType] = useState('shield');
    const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [balances, setBalances] = useState({});
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [showTestMode, setShowTestMode] = useState(true);
    // Load balances on mount and after operations
    useEffect(() => {
        if (isInitialized && wallet) {
            loadBalances();
        }
    }, [isInitialized, wallet]);
    const loadBalances = async () => {
        if (!isInitialized || !wallet)
            return;
        setIsLoadingBalances(true);
        try {
            const newBalances = {};
            for (const token of TOKENS) {
                try {
                    const balance = await getBalance(token.address);
                    newBalances[token.symbol] = balance;
                }
                catch (err) {
                    console.warn(`Failed to load balance for ${token.symbol}:`, err);
                    newBalances[token.symbol] = '0';
                }
            }
            setBalances(newBalances);
        }
        catch (err) {
            console.error('Failed to load balances:', err);
        }
        finally {
            setIsLoadingBalances(false);
        }
    };
    const addToHistory = (type, token, amount, status, txHash) => {
        const newTransaction = {
            id: Date.now().toString(),
            type,
            token,
            amount,
            timestamp: new Date(),
            status,
            txHash,
        };
        setTransactionHistory(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep last 10 transactions
    };
    const handleOperation = async () => {
        setIsProcessing(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            let result;
            if (operationType === 'shield') {
                result = await shield({
                    token: selectedToken.address,
                    amount,
                });
                setSuccessMessage(`✅ Successfully shielded ${amount} ${selectedToken.symbol}`);
                addToHistory('shield', selectedToken.symbol, amount, 'success');
            }
            else if (operationType === 'transfer') {
                if (!recipientAddress) {
                    throw new Error('Recipient address is required');
                }
                result = await transfer({
                    recipient: recipientAddress,
                    token: selectedToken.address,
                    amount,
                    mnemonic: wallet?.mnemonic || '',
                });
                setSuccessMessage(`✅ Successfully transferred ${amount} ${selectedToken.symbol}`);
                addToHistory('transfer', selectedToken.symbol, amount, 'success');
            }
            else if (operationType === 'unshield') {
                if (!recipientAddress) {
                    throw new Error('Recipient address is required');
                }
                result = await unshield({
                    token: selectedToken.address,
                    amount,
                    recipient: recipientAddress,
                    mnemonic: wallet?.mnemonic || '',
                });
                setSuccessMessage(`✅ Successfully unshielded ${amount} ${selectedToken.symbol}`);
                addToHistory('unshield', selectedToken.symbol, amount, 'success');
            }
            // Clear form
            setAmount('');
            setRecipientAddress('');
            // Reload balances after operation
            setTimeout(() => loadBalances(), 3000); // Wait for blockchain confirmation
        }
        catch (error) {
            setErrorMessage(error.message || 'Operation failed');
            addToHistory(operationType, selectedToken.symbol, amount, 'failed');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const canOperate = isInitialized && wallet && amount && parseFloat(amount) > 0;
    return (_jsxs("div", { style: { padding: '30px', maxWidth: '1200px', margin: '0 auto' }, children: [_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsxs("h1", { style: {
                            margin: '0 0 10px',
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }, children: ["\uD83D\uDD12 ", _jsx("span", { children: "Privacy Operations" })] }), _jsx("p", { style: {
                            margin: 0,
                            fontSize: '16px',
                            color: '#64748b'
                        }, children: "Shield, transfer, and unshield tokens with RAILGUN privacy" })] }), (!isInitialized || !wallet) && (_jsxs("div", { style: {
                    padding: '20px',
                    background: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '12px',
                    marginBottom: '30px'
                }, children: [_jsx("div", { style: {
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#92400e',
                            marginBottom: '8px'
                        }, children: "\u26A0\uFE0F Setup Required" }), _jsxs("div", { style: {
                            fontSize: '14px',
                            color: '#78350f',
                            lineHeight: '1.6'
                        }, children: [!isInitialized && '• Initialize privacy features first', !wallet && _jsxs(_Fragment, { children: [_jsx("br", {}), "\u2022 Create a RAILGUN wallet"] })] }), _jsxs("div", { style: {
                            marginTop: '12px',
                            fontSize: '13px',
                            color: '#78350f'
                        }, children: ["Please visit the ", _jsx("strong", { children: "Wallet" }), " page to complete setup."] })] })), isInitialized && wallet && (_jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    marginBottom: '20px'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }, children: [_jsx("h2", { style: {
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }, children: "\uD83D\uDEE1\uFE0F Shielded Balances" }), _jsx("button", { onClick: loadBalances, disabled: isLoadingBalances, style: {
                                    padding: '8px 16px',
                                    background: '#f1f5f9',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    cursor: isLoadingBalances ? 'not-allowed' : 'pointer',
                                    opacity: isLoadingBalances ? 0.6 : 1,
                                }, children: isLoadingBalances ? '⏳ Refreshing...' : '🔄 Refresh' })] }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px'
                        }, children: TOKENS.map((token) => (_jsxs("div", { style: {
                                padding: '16px',
                                background: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: token.icon }), _jsx("div", { style: {
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#64748b',
                                        marginBottom: '4px'
                                    }, children: token.symbol }), _jsx("div", { style: {
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#1e293b'
                                    }, children: isLoadingBalances ? '...' : (balances[token.symbol] || '0') })] }, token.symbol))) })] })), isInitialized && wallet && showTestMode && (_jsxs("div", { style: {
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    color: 'white',
                    position: 'relative'
                }, children: [_jsx("button", { onClick: () => setShowTestMode(false), style: {
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }, children: "\u2715" }), _jsx("div", { style: {
                            fontSize: '16px',
                            fontWeight: '700',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }, children: "\uD83E\uDDEA Quick Test Mode" }), _jsx("div", { style: {
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: '16px',
                            opacity: 0.9,
                        }, children: "Test privacy operations with simulated transactions (no real funds required)" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px',
                        }, children: [_jsx("button", { onClick: () => {
                                    setOperationType('shield');
                                    setSelectedToken(TOKENS[0]);
                                    setAmount('0.1');
                                    setSuccessMessage('🧪 Test: Ready to shield 0.1 ETH');
                                }, style: {
                                    padding: '10px 16px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDEE1\uFE0F Test Shield" }), _jsx("button", { onClick: () => {
                                    setOperationType('transfer');
                                    setSelectedToken(TOKENS[0]);
                                    setAmount('0.05');
                                    setRecipientAddress('0zk1qyhxaafkj50hg9j0kr477jq5hxxpzjpklyamnczd4waa6t08uskjtrv7j6fe3z53lu48668ng0jjy5uxepd4nq84vuznvndws0f2cw72stfsjdlzhfsuv746jnk'); // Demo recipient address
                                    setSuccessMessage('🧪 Demo: Transfer test (will fail without balance - shield funds first!)');
                                }, style: {
                                    padding: '10px 16px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDD04 Test Transfer" }), _jsx("button", { onClick: () => {
                                    setOperationType('unshield');
                                    setSelectedToken(TOKENS[0]);
                                    setAmount('0.02');
                                    setRecipientAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
                                    setSuccessMessage('🧪 Test: Ready to unshield 0.02 ETH');
                                }, style: {
                                    padding: '10px 16px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDD13 Test Unshield" })] })] })), isInitialized && wallet && transactionHistory.length > 0 && (_jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    marginBottom: '20px'
                }, children: [_jsx("h2", { style: {
                            margin: '0 0 20px',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e293b'
                        }, children: "\uD83D\uDCCB Recent Transactions" }), _jsx("div", { style: { display: 'grid', gap: '12px' }, children: transactionHistory.map((tx) => (_jsxs("div", { style: {
                                padding: '16px',
                                background: '#f8fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("div", { style: { fontSize: '24px' }, children: tx.type === 'shield' ? '🛡️' : tx.type === 'transfer' ? '🔄' : '🔓' }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                        marginBottom: '2px'
                                                    }, children: [tx.type.charAt(0).toUpperCase() + tx.type.slice(1), " ", tx.amount, " ", tx.token] }), _jsx("div", { style: {
                                                        fontSize: '12px',
                                                        color: '#64748b'
                                                    }, children: tx.timestamp.toLocaleString() })] })] }), _jsx("div", { style: {
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        background: tx.status === 'success' ? '#dcfce7' : tx.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                        color: tx.status === 'success' ? '#166534' : tx.status === 'pending' ? '#92400e' : '#dc2626'
                                    }, children: tx.status === 'success' ? '✅ Success' : tx.status === 'pending' ? '⏳ Pending' : '❌ Failed' })] }, tx.id))) })] })), _jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    marginBottom: '20px'
                }, children: [_jsx("h2", { style: {
                            margin: '0 0 20px',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e293b'
                        }, children: "Select Operation" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px'
                        }, children: [_jsx(OperationButton, { type: "shield", icon: "\uD83D\uDEE1\uFE0F", label: "Shield", description: "Public \u2192 Private", isSelected: operationType === 'shield', onClick: () => setOperationType('shield') }), _jsx(OperationButton, { type: "transfer", icon: "\uD83D\uDD04", label: "Transfer", description: "Private \u2192 Private", isSelected: operationType === 'transfer', onClick: () => setOperationType('transfer') }), _jsx(OperationButton, { type: "unshield", icon: "\uD83D\uDD13", label: "Unshield", description: "Private \u2192 Public", isSelected: operationType === 'unshield', onClick: () => setOperationType('unshield') })] })] }), _jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }, children: [_jsxs("h2", { style: {
                            margin: '0 0 24px',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e293b'
                        }, children: [operationType === 'shield' && '🛡️ Shield Tokens', operationType === 'transfer' && '🔄 Private Transfer', operationType === 'unshield' && '🔓 Unshield Tokens'] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#475569'
                                }, children: "Token" }), _jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '10px'
                                }, children: TOKENS.map((token) => (_jsxs("button", { onClick: () => setSelectedToken(token), style: {
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
                                    }, children: [_jsx("div", { style: { fontSize: '24px', marginBottom: '4px' }, children: token.icon }), token.symbol, _jsxs("div", { style: {
                                                fontSize: '11px',
                                                opacity: 0.8,
                                                marginTop: '2px'
                                            }, children: ["Bal: ", balances[token.symbol] || '0'] })] }, token.symbol))) })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#475569'
                                }, children: "Amount" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "0.00", step: "0.000001", style: {
                                            width: '100%',
                                            padding: '14px 60px 14px 14px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '10px',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            outline: 'none',
                                        }, onFocus: (e) => {
                                            e.target.style.borderColor = '#3b82f6';
                                        }, onBlur: (e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        } }), _jsx("div", { style: {
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
                                        }, children: selectedToken.symbol })] }), operationType === 'transfer' && (_jsxs("div", { style: {
                                    marginTop: '8px',
                                    fontSize: '12px',
                                    color: '#64748b'
                                }, children: ["Available: ", balances[selectedToken.symbol] || '0', " ", selectedToken.symbol] }))] }), (operationType === 'transfer' || operationType === 'unshield') && (_jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("label", { style: {
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#475569'
                                }, children: ["Recipient Address", operationType === 'transfer' && ' (RAILGUN address)', operationType === 'unshield' && ' (Public 0x... address)'] }), _jsx("input", { type: "text", value: recipientAddress, onChange: (e) => setRecipientAddress(e.target.value), placeholder: operationType === 'transfer'
                                    ? '0zk1q...'
                                    : '0x...', style: {
                                    width: '100%',
                                    padding: '14px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                }, onFocus: (e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                }, onBlur: (e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                } })] })), _jsx("div", { style: {
                            padding: '16px',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '10px',
                            marginBottom: '24px'
                        }, children: _jsxs("div", { style: {
                                fontSize: '13px',
                                color: '#0369a1',
                                lineHeight: '1.6'
                            }, children: [operationType === 'shield' && (_jsxs(_Fragment, { children: [_jsx("strong", { children: "Shield:" }), " Converts public tokens to shielded (private) balance. Your tokens will no longer be visible on the blockchain."] })), operationType === 'transfer' && (_jsxs(_Fragment, { children: [_jsx("strong", { children: "Private Transfer:" }), " Sends tokens between shielded addresses. The amount and recipient are completely private. ", _jsx("em", { children: "Note: You must have shielded funds first before you can transfer." })] })), operationType === 'unshield' && (_jsxs(_Fragment, { children: [_jsx("strong", { children: "Unshield:" }), " Converts shielded tokens back to public. Creates an on-chain link to the recipient address."] }))] }) }), successMessage && (_jsx("div", { style: {
                            padding: '16px',
                            background: '#f0fdf4',
                            border: '2px solid #86efac',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            color: '#059669',
                            fontWeight: '600'
                        }, children: successMessage })), errorMessage && (_jsxs("div", { style: {
                            padding: '16px',
                            background: '#fef2f2',
                            border: '2px solid #fecaca',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            color: '#dc2626',
                            fontWeight: '600'
                        }, children: ["\u274C ", errorMessage] })), _jsx("button", { onClick: handleOperation, disabled: !canOperate || isProcessing, style: {
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
                        }, children: isProcessing ? (_jsx(_Fragment, { children: "\u23F3 Processing..." })) : operationType === 'shield' ? (_jsxs(_Fragment, { children: ["\uD83D\uDEE1\uFE0F Shield ", amount || '0', " ", selectedToken.symbol] })) : operationType === 'transfer' ? (_jsxs(_Fragment, { children: ["\uD83D\uDD04 Transfer ", amount || '0', " ", selectedToken.symbol] })) : (_jsxs(_Fragment, { children: ["\uD83D\uDD13 Unshield ", amount || '0', " ", selectedToken.symbol] })) }), canOperate && (_jsxs("div", { style: {
                            marginTop: '16px',
                            fontSize: '13px',
                            color: '#64748b',
                            textAlign: 'center'
                        }, children: ["\u23F1\uFE0F Estimated time: ~", operationType === 'shield' ? '8' :
                                operationType === 'transfer' ? '20' : '10', " seconds (ZK proof generation)"] }))] })] }));
};
const OperationButton = ({ icon, label, description, isSelected, onClick }) => (_jsxs("button", { onClick: onClick, style: {
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
    }, onMouseEnter: (e) => {
        if (!isSelected) {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(-2px)';
        }
    }, onMouseLeave: (e) => {
        if (!isSelected) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
        }
    }, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: icon }), _jsx("div", { style: {
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '4px'
            }, children: label }), _jsx("div", { style: {
                fontSize: '12px',
                opacity: isSelected ? 0.9 : 0.7,
                fontWeight: '500'
            }, children: description })] }));
