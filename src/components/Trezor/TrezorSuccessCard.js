import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TrezorSuccessCard = ({ secretWalletAddress, railgunAddress, deviceLabel = 'Trezor', onContinue, }) => {
    return (_jsxs("div", { style: {
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '700px',
            margin: '0 auto',
            border: '1px solid #2d2d44',
        }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '35px' }, children: [_jsx("div", { style: {
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 25px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '64px',
                            animation: 'successPulse 1s ease-out',
                            boxShadow: '0 8px 40px rgba(16, 185, 129, 0.4)',
                        }, children: "\uD83C\uDF89" }), _jsx("h2", { style: {
                            margin: '0 0 12px 0',
                            color: '#10b981',
                            fontSize: '28px',
                        }, children: "RAILGUN Wallet Activated!" }), _jsx("p", { style: { color: '#6ee7b7', margin: 0, fontSize: '16px' }, children: "Your private transactions are ready" })] }), _jsxs("div", { style: {
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%)',
                    borderRadius: '12px',
                    padding: '30px',
                    marginBottom: '25px',
                    border: '2px solid #667eea',
                }, children: [_jsxs("h3", { style: {
                            margin: '0 0 20px 0',
                            color: '#fff',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }, children: [_jsx("span", { children: "\u2705" }), " Setup Complete"] }), _jsxs("div", { style: {
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '15px',
                        }, children: [_jsx("div", { style: { color: '#999', fontSize: '13px', marginBottom: '8px' }, children: "Hardware Wallet:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: { fontSize: '24px' }, children: "\uD83D\uDCB3" }), _jsxs("div", { style: { color: '#fff', fontSize: '16px', fontWeight: 'bold' }, children: [deviceLabel, " (Secret Wallet)"] })] })] }), _jsxs("div", { style: {
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '15px',
                        }, children: [_jsx("div", { style: { color: '#999', fontSize: '13px', marginBottom: '8px' }, children: "Secret Wallet Address:" }), _jsx("div", { style: {
                                    background: '#1e1e3f',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    fontFamily: 'monospace',
                                    color: '#4a9eff',
                                    fontSize: '13px',
                                    wordBreak: 'break-all',
                                    border: '1px solid #2d2d44',
                                }, children: secretWalletAddress })] }), railgunAddress && (_jsxs("div", { style: {
                            background: 'rgba(16, 185, 129, 0.2)',
                            borderRadius: '8px',
                            padding: '15px',
                            border: '1px solid #10b981',
                        }, children: [_jsx("div", { style: { color: '#6ee7b7', fontSize: '13px', marginBottom: '8px' }, children: "\uD83D\uDEE1\uFE0F RAILGUN Private Address:" }), _jsx("div", { style: {
                                    background: '#1e1e3f',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    fontFamily: 'monospace',
                                    color: '#10b981',
                                    fontSize: '13px',
                                    wordBreak: 'break-all',
                                    border: '1px solid #2d2d44',
                                }, children: railgunAddress })] }))] }), _jsxs("div", { style: {
                    background: '#252541',
                    borderRadius: '12px',
                    padding: '25px',
                    marginBottom: '25px',
                }, children: [_jsxs("h3", { style: {
                            margin: '0 0 15px 0',
                            color: '#fff',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }, children: [_jsx("span", { children: "\uD83D\uDD12" }), " Active Security Features"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [
                            {
                                icon: '🔐',
                                title: 'Hardware-Secured Keys',
                                desc: 'All keys derived inside Trezor device',
                            },
                            {
                                icon: '🎭',
                                title: 'Secret Wallet Protection',
                                desc: 'Hidden wallet with passphrase encryption',
                            },
                            {
                                icon: '🛡️',
                                title: 'Zero-Knowledge Proofs',
                                desc: 'RAILGUN privacy for all transactions',
                            },
                            {
                                icon: '👻',
                                title: 'Anonymous Transactions',
                                desc: 'Untraceable amounts and recipients',
                            },
                        ].map((feature, index) => (_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: '#1e1e3f',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #2d2d44',
                            }, children: [_jsx("div", { style: { fontSize: '24px' }, children: feature.icon }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { color: '#fff', fontWeight: 'bold', fontSize: '14px' }, children: feature.title }), _jsx("div", { style: { color: '#999', fontSize: '12px' }, children: feature.desc })] }), _jsx("div", { style: { color: '#10b981', fontSize: '20px' }, children: "\u2713" })] }, index))) })] }), _jsxs("div", { style: {
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid #667eea',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '25px',
                }, children: [_jsxs("h3", { style: {
                            margin: '0 0 15px 0',
                            color: '#667eea',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }, children: [_jsx("span", { children: "\uD83D\uDE80" }), " What You Can Do Now"] }), _jsxs("ul", { style: {
                            color: '#bbb',
                            paddingLeft: '20px',
                            margin: 0,
                            fontSize: '14px',
                            lineHeight: '1.8',
                        }, children: [_jsx("li", { children: "Shield funds to RAILGUN for private storage" }), _jsx("li", { children: "Make anonymous transfers to any address" }), _jsx("li", { children: "Use private DeFi with DEXs and protocols" }), _jsx("li", { children: "Unshield funds back to public wallet when needed" })] })] }), _jsx("button", { onClick: onContinue, style: {
                    width: '100%',
                    padding: '18px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.4)';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }, children: "Continue to Dashboard \u2192" }), _jsx("div", { style: {
                    marginTop: '20px',
                    padding: '15px',
                    background: '#1f2937',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    textAlign: 'center',
                }, children: _jsxs("p", { style: { color: '#9ca3af', margin: 0, fontSize: '12px', lineHeight: '1.5' }, children: ["\uD83D\uDD10 ", _jsx("strong", { children: "Remember:" }), " Keep your Trezor device safe and never share your passphrase. Each passphrase creates a different wallet."] }) }), _jsx("style", { children: `
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      ` })] }));
};
