import { invoke } from '@tauri-apps/api/core';

interface WalletData {
  address: string;
  balance: number;
  transactions: any[];
}

export const getWalletData = async (): Promise<WalletData> => {
  try {
    const data = await invoke<WalletData>('get_wallet_data');
    return data;
  } catch (error) {
    console.error('Failed to get wallet data:', error);
    throw error;
  }
};

export const connectWallet = async (): Promise<WalletData> => {
  try {
    const data = await invoke<WalletData>('connect_wallet');
    return data;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};