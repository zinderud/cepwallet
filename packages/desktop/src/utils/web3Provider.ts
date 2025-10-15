/**
 * Web3 Provider EIP-1193 Implementation
 * Injects Ethereum provider into dApp context
 */

export interface RequestArguments {
  method: string;
  params?: unknown[];
}

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

export interface EthereumProvider {
  request(args: RequestArguments): Promise<unknown>;
  on(eventName: string, listener: (...args: any[]) => void): void;
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
  isMetaMask?: boolean;
  isCepWallet?: boolean;
}

export class Web3ProviderError extends Error implements ProviderRpcError {
  code: number;
  data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = 'ProviderRpcError';
  }
}

/**
 * Create EIP-1193 compatible provider
 */
export function createWeb3Provider(
  onRequest: (method: string, params?: unknown[]) => Promise<unknown>
): EthereumProvider {
  const listeners: Map<string, Set<Function>> = new Map();

  return {
    request: async (args: RequestArguments): Promise<unknown> => {
      if (!args.method) {
        throw new Web3ProviderError(-32602, 'Method is required');
      }

      try {
        const result = await onRequest(args.method, args.params);
        return result;
      } catch (error: any) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }

        throw new Web3ProviderError(
          -32603,
          error.message || 'Internal error',
          error
        );
      }
    },

    on: (eventName: string, listener: Function) => {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName)?.add(listener);
    },

    removeListener: (eventName: string, listener: Function) => {
      listeners.get(eventName)?.delete(listener);
    },

    isCepWallet: true,
  };
}

/**
 * EIP-1193 Method Handlers
 */

// Wallet methods
export async function handleRequestAccounts(): Promise<string[]> {
  // Mock: return first account
  return ['0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6'];
}

export async function handleGetAccounts(): Promise<string[]> {
  return ['0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6'];
}

export async function handleGetBalance(address: string): Promise<string> {
  // Mock balance query
  return '1000000000000000000'; // 1 ETH
}

export async function handleGetChainId(): Promise<string> {
  return '0x1'; // Mainnet
}

export async function handleGetNetworkVersion(): Promise<string> {
  return '1'; // Mainnet
}

// Transaction methods
export async function handleSendTransaction(
  params: Array<{ to: string; from: string; value?: string; data?: string }>
): Promise<string> {
  if (!params || !params[0]) {
    throw new Web3ProviderError(-32602, 'Transaction params required');
  }

  const tx = params[0];
  if (!tx.to || !tx.from) {
    throw new Web3ProviderError(-32602, 'to and from fields required');
  }

  // Mock transaction hash
  return '0x' + Array(64).fill('0').join('');
}

export async function handleSignTransaction(
  params: Array<{ to: string; from: string; data?: string }>
): Promise<string> {
  if (!params || !params[0]) {
    throw new Web3ProviderError(-32602, 'Transaction params required');
  }

  // Mock signed transaction
  return '0x' + Array(132).fill('0').join('');
}

// Signing methods
export async function handlePersonalSign(
  params: [string, string, string?]
): Promise<string> {
  if (!params || params.length < 2) {
    throw new Web3ProviderError(-32602, 'Message and address required');
  }

  // Mock signature
  return '0x' + Array(130).fill('0').join('');
}

export async function handleSignTypedData(
  params: [string, string]
): Promise<string> {
  if (!params || params.length < 2) {
    throw new Web3ProviderError(-32602, 'Address and data required');
  }

  // Mock EIP-712 signature
  return '0x' + Array(130).fill('0').join('');
}

// Account methods
export async function handleGetCode(address: string): Promise<string> {
  // Mock contract code query
  return '0x';
}

export async function handleGetStorageAt(
  address: string,
  position: string
): Promise<string> {
  // Mock storage query
  return '0x' + Array(64).fill('0').join('');
}

// Network methods
export async function handleEstimateGas(
  params: Array<{ to: string; from: string; data?: string; value?: string }>
): Promise<string> {
  if (!params || !params[0]) {
    throw new Web3ProviderError(-32602, 'Transaction params required');
  }

  // Mock gas estimate
  return '21000';
}

export async function handleGasPrice(): Promise<string> {
  // Mock gas price: 20 Gwei
  return '20000000000';
}

export async function handleGetTransactionCount(
  address: string,
  _block: string
): Promise<string> {
  // Mock nonce
  return '0x1';
}

export async function handleCall(
  params: Array<{ to: string; data: string }>
): Promise<string> {
  if (!params || !params[0]) {
    throw new Web3ProviderError(-32602, 'Call params required');
  }

  // Mock call result
  return '0x';
}

// Switch methods
export async function handleWalletSwitchEthereumChain(
  params: Array<{ chainId: string }>
): Promise<null> {
  if (!params || !params[0]) {
    throw new Web3ProviderError(-32602, 'chainId required');
  }

  // Mock chain switch
  return null;
}

export async function handleWalletAddEthereumChain(
  params: Array<{
    chainId: string;
    rpcUrls: string[];
    chainName: string;
  }>
): Promise<null> {
  if (!params || !params[0]) {
    throw new Web3ProviderError(-32602, 'Chain params required');
  }

  // Mock chain add
  return null;
}

/**
 * Route and handle EIP-1193 methods
 */
export async function handleEIP1193Request(
  method: string,
  params?: unknown[]
): Promise<unknown> {
  switch (method) {
    // Account methods
    case 'eth_requestAccounts':
      return handleRequestAccounts();

    case 'eth_accounts':
      return handleGetAccounts();

    case 'eth_getBalance':
      return handleGetBalance((params?.[0] as string) || '');

    case 'eth_chainId':
      return handleGetChainId();

    case 'net_version':
      return handleGetNetworkVersion();

    // Transaction methods
    case 'eth_sendTransaction':
      return handleSendTransaction(params as any);

    case 'eth_signTransaction':
      return handleSignTransaction(params as any);

    // Signing methods
    case 'personal_sign':
      return handlePersonalSign(params as any);

    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return handleSignTypedData(params as any);

    // Contract methods
    case 'eth_getCode':
      return handleGetCode((params?.[0] as string) || '');

    case 'eth_getStorageAt':
      return handleGetStorageAt(
        (params?.[0] as string) || '',
        (params?.[1] as string) || ''
      );

    // Network methods
    case 'eth_estimateGas':
      return handleEstimateGas(params as any);

    case 'eth_gasPrice':
      return handleGasPrice();

    case 'eth_getTransactionCount':
      return handleGetTransactionCount(
        (params?.[0] as string) || '',
        (params?.[1] as string) || 'latest'
      );

    case 'eth_call':
      return handleCall(params as any);

    // Wallet methods
    case 'wallet_switchEthereumChain':
      return handleWalletSwitchEthereumChain(params as any);

    case 'wallet_addEthereumChain':
      return handleWalletAddEthereumChain(params as any);

    // Not implemented
    default:
      throw new Web3ProviderError(
        -32601,
        `Method "${method}" not supported`
      );
  }
}

/**
 * Validate EIP-1193 request
 */
export function validateRequest(args: RequestArguments): boolean {
  if (!args.method || typeof args.method !== 'string') {
    return false;
  }

  if (args.params && !Array.isArray(args.params)) {
    return false;
  }

  return true;
}

/**
 * Check if method requires approval
 */
export function requiresApproval(method: string): boolean {
  const approvalRequiredMethods = [
    'eth_requestAccounts',
    'eth_sendTransaction',
    'eth_signTransaction',
    'personal_sign',
    'eth_signTypedData',
    'wallet_switchEthereumChain',
    'wallet_addEthereumChain',
  ];

  return approvalRequiredMethods.includes(method);
}

/**
 * Format method for display
 */
export function formatMethodName(method: string): string {
  const humanReadable: Record<string, string> = {
    eth_requestAccounts: 'Request Accounts',
    eth_accounts: 'Get Accounts',
    eth_sendTransaction: 'Send Transaction',
    eth_signTransaction: 'Sign Transaction',
    personal_sign: 'Sign Message',
    eth_signTypedData: 'Sign Typed Data',
    eth_chainId: 'Get Chain ID',
    net_version: 'Get Network Version',
    eth_getBalance: 'Get Balance',
    eth_estimateGas: 'Estimate Gas',
    eth_gasPrice: 'Get Gas Price',
    wallet_switchEthereumChain: 'Switch Chain',
    wallet_addEthereumChain: 'Add Chain',
  };

  return humanReadable[method] || method;
}

/**
 * Inject provider into window
 */
export function injectWeb3Provider(provider: EthereumProvider): void {
  if (typeof window !== 'undefined') {
    (window as any).ethereum = provider;
  }
}

/**
 * Remove provider from window
 */
export function removeWeb3Provider(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).ethereum;
  }
}
