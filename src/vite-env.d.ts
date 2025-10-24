/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MNEMONIC: string;
  readonly VITE_SEPOLIA_RPC_URL: string;
  readonly VITE_ETHEREUM_RPC_URL: string;
  readonly VITE_SEPOLIA_CHAIN_ID: string;
  readonly VITE_ETHEREUM_CHAIN_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
