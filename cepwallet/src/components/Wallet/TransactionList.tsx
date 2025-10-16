import React from 'react';

const TransactionList = () => {
  const transactions = []; // Replace with actual transaction data

  return (
    <div>
      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>
              <p>{transaction.date}</p>
              <p>{transaction.amount}</p>
              <p>{transaction.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;