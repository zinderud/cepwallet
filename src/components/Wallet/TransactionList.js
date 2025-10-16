import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TransactionList = () => {
    // Replace with actual transaction data from Tauri backend
    const transactions = [];
    return (_jsxs("div", { children: [_jsx("h2", { style: { marginTop: 0, color: '#475569' }, children: "\uD83D\uDCCB Transaction History" }), transactions.length === 0 ? (_jsxs("div", { style: {
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#94a3b8'
                }, children: [_jsx("p", { style: { fontSize: '48px', margin: '0 0 10px 0' }, children: "\uD83D\uDCED" }), _jsx("p", { style: { margin: 0, fontSize: '16px' }, children: "No transactions yet" }), _jsx("p", { style: { margin: '5px 0 0 0', fontSize: '14px' }, children: "Your transaction history will appear here" })] })) : (_jsx("div", { children: transactions.map((transaction, index) => (_jsxs("div", { style: {
                        padding: '15px',
                        background: '#f8fafc',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        border: '1px solid #e2e8f0'
                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [_jsx("span", { style: { fontWeight: 'bold', color: '#475569' }, children: transaction.amount }), _jsx("span", { style: {
                                        padding: '2px 8px',
                                        background: transaction.status === 'completed' ? '#d1fae5' : '#fef3c7',
                                        color: transaction.status === 'completed' ? '#065f46' : '#92400e',
                                        borderRadius: '3px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }, children: transaction.status })] }), _jsx("p", { style: { margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }, children: transaction.date }), transaction.hash && (_jsx("p", { style: {
                                margin: '5px 0 0 0',
                                fontSize: '11px',
                                color: '#94a3b8',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                            }, children: transaction.hash }))] }, index))) }))] }));
};
