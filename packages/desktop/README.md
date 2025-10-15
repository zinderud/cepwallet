# @cepwallet/desktop

CepWallet Desktop Application built with Electron and React.

## Architecture

- **Main Process**: Node.js runtime for Electron window management and device communication
- **Preload Script**: Security bridge between main and renderer processes with contextIsolation
- **Renderer**: React UI running in secure sandbox
- **IPC**: Secure inter-process communication for wallet operations

## Development

### Setup

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev:shared # Terminal 1: Watch TypeScript types
pnpm dev:desktop # Terminal 2: Watch Electron + React
```

### Build

```bash
pnpm build:desktop
```

## Features

- **Electron Window Management**: Multi-window support with menu system
- **React UI**: Modern interface with Sidebar navigation and Dashboard
- **Security**: Context isolation, preload sandbox, no nodeIntegration
- **TypeScript**: Full type safety across main, preload, and renderer
- **IPC Communication**: Secure bridge to wallet operations (get accounts, sign tx, connect device)

## File Structure

```
src/
├── main/
│   ├── index.ts          # Electron main entry
│   └── tsconfig.json     # Main process TypeScript config
├── preload/
│   ├── index.ts          # Security bridge & API exposure
│   └── tsconfig.json     # Preload TypeScript config
└── renderer/
    ├── App.tsx           # React root component
    ├── index.tsx         # React DOM render
    ├── index.html        # HTML template
    ├── App.css           # Global styles
    ├── components/
    │   ├── Sidebar.tsx   # Navigation sidebar
    │   └── Dashboard.tsx # Main dashboard view
    └── tsconfig.json     # Renderer TypeScript config
```

## Configuration Files

- **webpack.config.js** (root): Handles React app bundling
- **package.json**: Dependencies (electron, react, typescript, webpack)
- **tsconfig.json** (package): Shared TypeScript config for each context

## IPC Channels

### Main → Renderer
- `wallet-state-changed` - Emitted when wallet connection state changes

### Renderer → Main (Invoke)
- `get-wallet-status` - Returns current wallet state
- `get-accounts` - Returns list of accounts
- `sign-transaction` - Signs a transaction
- `switch-account` - Changes active account
- `connect-device` - Initiates device connection

## Building for Distribution

```bash
pnpm build:desktop
```

Supports building for:
- macOS (DMG, ZIP)
- Windows (NSIS, Portable)
- Linux (AppImage, DEB)
