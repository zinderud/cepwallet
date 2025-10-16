import { writable } from 'svelte/store';

export const walletStore = writable({
  address: '',
  balance: 0,
  transactions: [],
});

export const setWalletAddress = (address) => {
  walletStore.update((state) => ({
    ...state,
    address,
  }));
};

export const setWalletBalance = (balance) => {
  walletStore.update((state) => ({
    ...state,
    balance,
  }));
};

export const addTransaction = (transaction) => {
  walletStore.update((state) => ({
    ...state,
    transactions: [...state.transactions, transaction],
  }));
};