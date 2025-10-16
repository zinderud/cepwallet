# CepWallet

## Overview

CepWallet is a privacy-first hardware wallet application that integrates with Ethereum and Kohaku. It is designed to provide users with a secure and user-friendly experience for managing their cryptocurrency assets.

## Project Structure

The project is organized into several key directories:

- **src-tauri**: Contains the Tauri application code.
  - **src**: The main source code for the Tauri application.
    - **main.rs**: The entry point for the Tauri application, responsible for initializing the app and starting necessary components.
    - **commands.rs**: Defines commands that handle requests from the user interface.
    - **crypto**: Contains modules related to cryptocurrency functionalities.
      - **mod.rs**: Provides access to other crypto-related files.
      - **wallet.rs**: Defines functions and data structures related to wallet operations.
    - **hardware**: Contains modules related to hardware interactions.
      - **mod.rs**: Provides access to hardware-related files.
      - **trezor.rs**: Defines functions for interacting with the Trezor hardware wallet.
    - **utils**: Contains utility functions used throughout the application.
  - **Cargo.toml**: Defines dependencies and configurations for the Rust project.
  - **tauri.conf.json**: Contains configuration settings for the Tauri application.
  - **build.rs**: Manages the build process for the application.
  - **icons**: Contains application icons.

- **src**: Contains the React application code.
  - **main.tsx**: The entry point for the React application, initializing components.
  - **App.tsx**: Defines the main component of the application.
  - **components**: Contains React components for various functionalities.
    - **Wallet**: Components related to wallet functionalities.
      - **WalletConnect.tsx**: Allows users to connect their wallets.
      - **TransactionList.tsx**: Displays the list of past transactions.
    - **Hardware**: Components related to hardware interactions.
      - **TrezorConnect.tsx**: Connects to the Trezor wallet.
  - **hooks**: Contains custom React hooks.
    - **useWallet.ts**: Manages wallet state.
  - **store**: Manages wallet data.
    - **walletStore.ts**: State management for wallet data.
  - **types**: Defines types used throughout the application.
    - **index.ts**: Contains type definitions.
  - **styles**: Contains global styles.
    - **globals.css**: Global style settings.

- **packages**: Contains shared and bridge packages.
  - **shared**: Shared package for common functionalities.
    - **package.json**: Defines dependencies for the shared package.
  - **bridge**: Bridge package for communication.
    - **package.json**: Defines dependencies for the bridge package.

- **package.json**: Defines dependencies and configurations for the npm project.
- **pnpm-workspace.yaml**: Contains pnpm workspace configuration.
- **tsconfig.json**: TypeScript compiler settings.
- **vite.config.ts**: Vite configuration settings.

## Getting Started

To get started with the CepWallet project, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/zinderud/cepwallet.git
   cd cepwallet
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Run the application:
   ```
   pnpm dev
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the GPL-3.0 License. See the [LICENSE](LICENSE) file for more details.