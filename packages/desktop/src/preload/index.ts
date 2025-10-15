import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Account, WalletState } from '@cepwallet/shared';

declare global {
  interface Window {
    cepwallet: {
      wallet: {
        getStatus: () => Promise<WalletState>;
        getAccounts: () => Promise<Account[]>;
        signTransaction: (txData: any) => Promise<string>;
        switchAccount: (accountId: string) => Promise<void>;
        connectDevice: () => Promise<boolean>;
      };
      bridge: {
        connectDevice: () => Promise<{ success: boolean; data?: any; error?: string }>;
        disconnectDevice: () => Promise<{ success: boolean; data?: any; error?: string }>;
        getPublicKey: (path: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        signTransaction: (path: string, tx: Record<string, unknown>) => Promise<{ success: boolean; data?: any; error?: string }>;
        signMessage: (path: string, message: string, type?: 'utf8' | 'hex') => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void;
      once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void;
      off: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void;
    };
  }
}

contextBridge.exposeInMainWorld('cepwallet', {
  wallet: {
    getStatus: () => ipcRenderer.invoke('get-wallet-status'),
    getAccounts: () => ipcRenderer.invoke('get-accounts'),
    signTransaction: (txData: any) => ipcRenderer.invoke('sign-transaction', txData),
    switchAccount: (accountId: string) => ipcRenderer.invoke('switch-account', accountId),
    connectDevice: () => ipcRenderer.invoke('connect-device')
  },
  bridge: {
    connectDevice: () => ipcRenderer.invoke('bridge:connect-device'),
    disconnectDevice: () => ipcRenderer.invoke('bridge:disconnect-device'),
    getPublicKey: (path: string) => ipcRenderer.invoke('bridge:get-public-key', path),
    signTransaction: (path: string, tx: Record<string, unknown>) =>
      ipcRenderer.invoke('bridge:sign-transaction', path, tx),
    signMessage: (path: string, message: string, type: 'utf8' | 'hex' = 'utf8') =>
      ipcRenderer.invoke('bridge:sign-message', path, message, type)
  },
  on: (channel: string, listener: any) => {
    ipcRenderer.on(channel, listener);
  },
  once: (channel: string, listener: any) => {
    ipcRenderer.once(channel, listener);
  },
  off: (channel: string, listener: any) => {
    ipcRenderer.off(channel, listener);
  }
});
