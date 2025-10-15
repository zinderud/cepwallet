import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

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

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for wallet operations
ipcMain.handle('get-wallet-status', async () => {
  return { connected: false, message: 'Bridge connection pending' };
});

ipcMain.handle('get-accounts', async () => {
  return [];
});
