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
