import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Dashboard Page
 *
 * Main overview page with wallet status, balances, and quick actions
 */
import { useState, useEffect } from 'react';
import { useRailgunWallet } from '../hooks/useRailgunWallet';
export const DashboardPage = () => {
    const { wallet, isInitialized, shieldPrivateKey } = useRailgunWallet(11155111);
    const [stats, setStats] = useState({
        totalBalance: '0.00',
        shieldedBalance: '0.00',
        publicBalance: '0.00',
        privacyLevel: 'Not Initialized'
    });
    useEffect(() => {
        if (isInitialized) {
            setStats(prev => ({ ...prev, privacyLevel: 'Ready' }));
        }
    }, [isInitialized]);
    return (_jsxs("div", { style: { padding: '30px', maxWidth: '1400px', margin: '0 auto' }, children: [_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("h1", { style: {
                            margin: '0 0 10px',
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#1e293b'
                        }, children: "Welcome to CepWallet" }), _jsx("p", { style: {
                            margin: 0,
                            fontSize: '16px',
                            color: '#64748b'
                        }, children: "Your privacy-first cryptocurrency wallet powered by RAILGUN" })] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }, children: [_jsxs("div", { style: {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            color: 'white',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                        }, children: [_jsx("div", { style: {
                                    fontSize: '14px',
                                    opacity: 0.9,
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }, children: "Total Balance" }), _jsxs("div", { style: {
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    marginBottom: '4px'
                                }, children: ["$", stats.totalBalance] }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    opacity: 0.8
                                }, children: "USD equivalent" })] }), _jsxs("div", { style: {
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        }, children: [_jsx("div", { style: {
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }, children: "\uD83D\uDD12 Shielded Balance" }), _jsxs("div", { style: {
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    marginBottom: '4px'
                                }, children: ["$", stats.shieldedBalance] }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#10b981',
                                    fontWeight: '600'
                                }, children: "\u2713 Private & Secure" })] }), _jsxs("div", { style: {
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        }, children: [_jsx("div", { style: {
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }, children: "\uD83C\uDF10 Public Balance" }), _jsxs("div", { style: {
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    marginBottom: '4px'
                                }, children: ["$", stats.publicBalance] }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#64748b',
                                    fontWeight: '500'
                                }, children: "On-chain visible" })] }), _jsxs("div", { style: {
                            background: isInitialized
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            color: 'white',
                            boxShadow: isInitialized
                                ? '0 10px 30px rgba(16, 185, 129, 0.3)'
                                : '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }, children: [_jsx("div", { style: {
                                    fontSize: '14px',
                                    opacity: 0.9,
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }, children: "Privacy Status" }), _jsx("div", { style: {
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    marginBottom: '4px'
                                }, children: stats.privacyLevel }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    opacity: 0.8
                                }, children: isInitialized ? 'RAILGUN active' : 'Initialize required' })] })] }), _jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #e2e8f0',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }, children: [_jsxs("h2", { style: {
                            margin: '0 0 20px',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }, children: ["\uD83D\uDEE1\uFE0F ", _jsx("span", { children: "RAILGUN Wallet Status" })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px'
                        }, children: [_jsx(StatusItem, { label: "Privacy Features", status: isInitialized ? 'Active' : 'Inactive', isActive: isInitialized }), _jsx(StatusItem, { label: "Wallet Created", status: wallet ? 'Yes' : 'No', isActive: !!wallet }), _jsx(StatusItem, { label: "Shield Key", status: shieldPrivateKey ? 'Loaded' : 'Not Loaded', isActive: !!shieldPrivateKey })] }), wallet && (_jsxs("div", { style: {
                            marginTop: '20px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }, children: [_jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#64748b',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }, children: "RAILGUN ADDRESS" }), _jsx("div", { style: {
                                    fontSize: '13px',
                                    fontFamily: 'monospace',
                                    color: '#1e293b',
                                    wordBreak: 'break-all',
                                    fontWeight: '500'
                                }, children: wallet.railgunAddress })] }))] }), _jsxs("div", { style: {
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }, children: [_jsx("h2", { style: {
                            margin: '0 0 20px',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#1e293b'
                        }, children: "\u26A1 Quick Actions" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px'
                        }, children: [_jsx(QuickActionButton, { icon: "\uD83D\uDEE1\uFE0F", label: "Shield Tokens", description: "Make private", disabled: !isInitialized }), _jsx(QuickActionButton, { icon: "\uD83D\uDD04", label: "Private Transfer", description: "Send privately", disabled: !wallet }), _jsx(QuickActionButton, { icon: "\uD83D\uDD13", label: "Unshield Tokens", description: "Make public", disabled: !wallet }), _jsx(QuickActionButton, { icon: "\uD83D\uDCDC", label: "View History", description: "See transactions", disabled: false })] })] })] }));
};
const StatusItem = ({ label, status, isActive }) => (_jsxs("div", { style: {
        padding: '12px',
        background: isActive ? '#f0fdf4' : '#f8fafc',
        borderRadius: '8px',
        border: `1px solid ${isActive ? '#86efac' : '#e2e8f0'}`
    }, children: [_jsx("div", { style: {
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '4px',
                fontWeight: '600'
            }, children: label }), _jsxs("div", { style: {
                fontSize: '16px',
                fontWeight: '700',
                color: isActive ? '#059669' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }, children: [isActive ? '✅' : '⏳', " ", status] })] }));
const QuickActionButton = ({ icon, label, description, disabled }) => (_jsxs("button", { disabled: disabled, style: {
        padding: '16px',
        background: disabled ? '#f8fafc' : 'white',
        border: `2px solid ${disabled ? '#e2e8f0' : '#3b82f6'}`,
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        opacity: disabled ? 0.6 : 1,
        outline: 'none',
    }, onMouseEnter: (e) => {
        if (!disabled) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.2)';
        }
    }, onMouseLeave: (e) => {
        if (!disabled) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }
    }, children: [_jsx("div", { style: {
                fontSize: '24px',
                marginBottom: '8px'
            }, children: icon }), _jsx("div", { style: {
                fontSize: '14px',
                fontWeight: '700',
                color: disabled ? '#94a3b8' : '#1e293b',
                marginBottom: '4px'
            }, children: label }), _jsx("div", { style: {
                fontSize: '12px',
                color: '#64748b'
            }, children: description })] }));
