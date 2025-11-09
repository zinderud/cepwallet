import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TrezorPinCard Component
 *
 * Displays while user enters PIN on Trezor device
 */
import { useEffect } from 'react';
export const TrezorPinCard = ({ deviceLabel = 'Trezor', demoMode = false, onAutoSkip }) => {
    // Auto-skip in demo mode after 2 seconds
    useEffect(() => {
        if (demoMode && onAutoSkip) {
            const timer = setTimeout(() => {
                console.log('🎭 Demo: Auto-skipping PIN entry');
                onAutoSkip();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [demoMode, onAutoSkip]);
    return (_jsxs("div", { style: {
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #2d2d44',
            textAlign: 'center',
        }, children: [demoMode && (_jsx("div", { style: {
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '20px',
                    color: '#fcd34d',
                    fontSize: '14px',
                    fontWeight: '600',
                }, children: "\uD83C\uDFAD Demo Mode - PIN entry simulated (auto-continuing in 2s...)" })), _jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '10px' }, children: "\uD83D\uDD10" }), _jsxs("h2", { style: { margin: '0 0 10px 0', color: '#fff' }, children: [deviceLabel, " Connected"] })] }), _jsxs("div", { style: {
                    background: '#252541',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }, children: [_jsx("span", { style: { color: '#999' }, children: "Device:" }), _jsx("span", { style: { color: '#fff', fontWeight: 'bold' }, children: "Trezor Model T" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx("span", { style: { color: '#999' }, children: "Status:" }), _jsx("span", { style: { color: '#ffa500', display: 'flex', alignItems: 'center', gap: '8px' }, children: "\uD83D\uDD12 Locked" })] })] }), _jsxs("div", { style: {
                    background: '#1e1e3f',
                    borderRadius: '12px',
                    padding: '40px',
                    marginBottom: '30px',
                }, children: [_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("div", { style: {
                                    fontSize: '64px',
                                    marginBottom: '20px',
                                    animation: 'pulse 2s ease-in-out infinite',
                                }, children: "\uD83C\uDFAF" }), _jsx("div", { style: {
                                    width: '120px',
                                    height: '80px',
                                    margin: '0 auto',
                                    border: '3px solid #667eea',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#667eea',
                                }, children: "T" }), _jsx("div", { style: { marginTop: '15px', color: '#999', fontSize: '14px' }, children: "\u2190 Look here" })] }), _jsx("div", { style: { color: '#ffa500', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }, children: "\u23F3 Enter PIN on your Trezor device..." }), _jsx("p", { style: { color: '#999', margin: 0, fontSize: '14px' }, children: "Look at your Trezor screen and enter your PIN using the device buttons" })] }), _jsx("div", { style: {
                    padding: '15px',
                    background: '#1f2937',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }, children: _jsx("p", { style: { color: '#9ca3af', margin: 0, fontSize: '14px', lineHeight: '1.5' }, children: "\u2139\uFE0F Your PIN is never shown on this screen for security reasons. Always enter it directly on your Trezor device." }) }), _jsx("style", { children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      ` })] }));
};
