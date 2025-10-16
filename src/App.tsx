import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { WalletConnect } from './components/Wallet/WalletConnect';
import { TransactionList } from './components/Wallet/TransactionList';
import { TrezorConnect } from './components/Hardware/TrezorConnect';
import { PrivacyControl } from './components/Privacy/PrivacyControl';
import { ShieldedBalance } from './components/Privacy/ShieldedBalance';
import { PrivacyTransactionForm } from './components/Privacy/PrivacyTransactionForm';
import { PrivacyPoolManager } from './components/Privacy/PrivacyPoolManager';
import './styles/globals.css';

const App = () => {
  const [greetMsg, setGreetMsg] = useState('');
  const [testName, setTestName] = useState('Tauri User');
  const [selectedPrivacyLevel, setSelectedPrivacyLevel] = useState('Public');

  const testGreet = async () => {
    try {
      const result = await invoke<string>('greet', { name: testName });
      setGreetMsg(result);
    } catch (error) {
      setGreetMsg(`Error: ${error}`);
    }
  };

  return (
    <div className="app" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        borderBottom: '2px solid #3b82f6',
        paddingBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>🔐 CepWallet</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Privacy-First Hardware Wallet</p>
      </header>

      {/* Tauri IPC Test Section */}
      <section style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ marginTop: 0, color: '#475569' }}>🧪 Test Tauri IPC</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter your name"
            style={{
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              flex: 1
            }}
          />
          <button 
            onClick={testGreet}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Test Greet
          </button>
        </div>
        {greetMsg && (
          <p style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: '#dbeafe',
            borderRadius: '4px',
            color: '#1e40af'
          }}>
            {greetMsg}
          </p>
        )}
      </section>

      {/* Main Components Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <section style={{ 
          padding: '20px', 
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <WalletConnect />
        </section>

        <section style={{ 
          padding: '20px', 
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <TrezorConnect />
        </section>
      </div>

      {/* Privacy Features Section */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#1e293b'
      }}>
        🔐 Privacy Features
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <PrivacyControl onPrivacyLevelChange={setSelectedPrivacyLevel} />
        <ShieldedBalance />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <PrivacyTransactionForm selectedPrivacyLevel={selectedPrivacyLevel} />
        <PrivacyPoolManager />
      </div>

      <section style={{ 
        padding: '20px', 
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <TransactionList />
      </section>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px',
        color: '#94a3b8',
        fontSize: '14px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <p>CepWallet v0.1.0 | Tauri 2.8.5 | Built with React + Rust</p>
        <p style={{ marginTop: '5px' }}>
          Press <kbd style={{ 
            padding: '2px 6px', 
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '3px',
            fontFamily: 'monospace'
          }}>Cmd+Option+I</kbd> to open DevTools
        </p>
      </footer>
    </div>
  );
};

export default App;