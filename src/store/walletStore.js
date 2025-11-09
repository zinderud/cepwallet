import { invoke } from '@tauri-apps/api/core';
export const getWalletData = async () => {
    try {
        const data = await invoke('get_wallet_data');
        return data;
    }
    catch (error) {
        console.error('Failed to get wallet data:', error);
        throw error;
    }
};
export const connectWallet = async () => {
    try {
        const data = await invoke('connect_wallet');
        return data;
    }
    catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
    }
};
