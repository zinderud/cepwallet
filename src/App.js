import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { WalletConnect } from './components/Wallet/WalletConnect';
import { TransactionList } from './components/Wallet/TransactionList';
import { TrezorConnect } from './components/Hardware/TrezorConnect';
import './styles/globals.css';
const App = () => {
    const [greetMsg, setGreetMsg] = useState('');
    const [testName, setTestName] = useState('Tauri User');
    const testGreet = async () => {
        try {
            const result = await invoke('greet', { name: testName });
            setGreetMsg(result);
        }
        catch (error) {
            setGreetMsg(`Error: ${error}`);
        }
    };
    return (_jsxs("div", { className: "app", style: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }, children: [_jsxs("header", { style: {
                    textAlign: 'center',
                    marginBottom: '40px',
                    borderBottom: '2px solid #3b82f6',
                    paddingBottom: '20px'
                }, children: [_jsx("h1", { style: { margin: '0 0 10px 0', color: '#1e40af' }, children: "\uD83D\uDD10 CepWallet" }), _jsx("p", { style: { color: '#64748b', margin: 0 }, children: "Privacy-First Hardware Wallet" })] }), _jsxs("section", { style: {
                    marginBottom: '30px',
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }, children: [_jsx("h2", { style: { marginTop: 0, color: '#475569' }, children: "\uD83E\uDDEA Test Tauri IPC" }), _jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center' }, children: [_jsx("input", { type: "text", value: testName, onChange: (e) => setTestName(e.target.value), placeholder: "Enter your name", style: {
                                    padding: '10px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    flex: 1
                                } }), _jsx("button", { onClick: testGreet, style: {
                                    padding: '10px 20px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }, children: "Test Greet" })] }), greetMsg && (_jsx("p", { style: {
                            marginTop: '15px',
                            padding: '10px',
                            background: '#dbeafe',
                            borderRadius: '4px',
                            color: '#1e40af'
                        }, children: greetMsg }))] }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }, children: [_jsx("section", { style: {
                            padding: '20px',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0'
                        }, children: _jsx(WalletConnect, {}) }), _jsx("section", { style: {
                            padding: '20px',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0'
                        }, children: _jsx(TrezorConnect, {}) })] }), _jsx("section", { style: {
                    padding: '20px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                }, children: _jsx(TransactionList, {}) }), _jsxs("footer", { style: {
                    textAlign: 'center',
                    marginTop: '40px',
                    padding: '20px',
                    color: '#94a3b8',
                    fontSize: '14px',
                    borderTop: '1px solid #e2e8f0'
                }, children: [_jsx("p", { children: "CepWallet v0.1.0 | Tauri 2.8.5 | Built with React + Rust" }), _jsxs("p", { style: { marginTop: '5px' }, children: ["Press ", _jsx("kbd", { style: {
                                    padding: '2px 6px',
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '3px',
                                    fontFamily: 'monospace'
                                }, children: "Cmd+Option+I" }), " to open DevTools"] })] })] }));
};
export default App;
