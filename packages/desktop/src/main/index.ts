import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { BridgeRPCClient } from '@cepwallet/shared/rpc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let bridgeClient: BridgeRPCClient | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'dist/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true
    }
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'dist/renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
};

/**
 * Bridge connection lifecycle
 */
const initBridge = async () => {
  try {
    if (!bridgeClient) {
      bridgeClient = new BridgeRPCClient();
    }
    await bridgeClient.connect();
    console.log('✓ Bridge connected');
  } catch (error) {
    console.error('✗ Bridge connection failed:', error);
    // Retry after 2 seconds
    setTimeout(initBridge, 2000);
  }
};

const closeBridge = () => {
  if (bridgeClient) {
    bridgeClient.disconnect();
    bridgeClient = null;
  }
};

/**
 * IPC Handlers - Main Process Bridge Communication
 */

// Connect Device
ipcMain.handle('bridge:connect-device', async () => {
  try {
    if (!bridgeClient) {
      throw new Error('Bridge not connected');
    }
    const result = await bridgeClient.connectDevice();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Disconnect Device
ipcMain.handle('bridge:disconnect-device', async () => {
  try {
    if (!bridgeClient) {
      throw new Error('Bridge not connected');
    }
    const result = await bridgeClient.disconnectDevice();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Get Public Key
ipcMain.handle('bridge:get-public-key', async (event, path: string) => {
  try {
    if (!bridgeClient) {
      throw new Error('Bridge not connected');
    }
    const result = await bridgeClient.getPublicKey(path);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Sign Transaction
ipcMain.handle('bridge:sign-transaction', async (event, path: string, transaction: Record<string, unknown>) => {
  try {
    if (!bridgeClient) {
      throw new Error('Bridge not connected');
    }
    const result = await bridgeClient.signTransaction(path, transaction);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Sign Message
ipcMain.handle(
  'bridge:sign-message',
  async (event, path: string, message: string, messageType: 'utf8' | 'hex' = 'utf8') => {
    try {
      if (!bridgeClient) {
        throw new Error('Bridge not connected');
      }
      const result = await bridgeClient.signMessage(path, message, messageType);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
);

const createMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.webContents.reload()
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow?.webContents.toggleDevTools()
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));
};

app.on('ready', () => {
  createWindow();
  initBridge();
});

app.on('window-all-closed', () => {
  closeBridge();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  closeBridge();
});

// IPC handlers for wallet operations
ipcMain.handle('get-wallet-status', async () => {
  return { connected: false, message: 'Bridge connection pending' };
});

ipcMain.handle('get-accounts', async () => {
  return [];
});
