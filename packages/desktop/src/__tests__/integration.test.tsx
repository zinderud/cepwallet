import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';
import { ConnectDevice } from '../components/ConnectDevice';
import { Dashboard } from '../components/Dashboard';
import type { WalletState } from '@cepwallet/shared';

/**
 * Mock window.cepwallet for testing
 */
const mockBridge = {
  connectDevice: jest.fn(),
  disconnectDevice: jest.fn(),
  getPublicKey: jest.fn(),
  signTransaction: jest.fn(),
  signMessage: jest.fn()
};

const mockWallet = {
  getStatus: jest.fn(),
  getAccounts: jest.fn(),
  signTransaction: jest.fn(),
  switchAccount: jest.fn(),
  connectDevice: jest.fn()
};

Object.defineProperty(window, 'cepwallet', {
  value: {
    bridge: mockBridge,
    wallet: mockWallet,
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn()
  },
  writable: true
});

/**
 * App Component Tests
 */
describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    mockWallet.getStatus.mockResolvedValue({
      connected: false,
      type: 'trezor',
      accounts: [],
      selectedAccount: null,
      selectedChain: 1,
      networks: [],
      isLoading: false,
      error: null
    });

    render(<App />);
    expect(screen.getByText(/CepWallet/i)).toBeInTheDocument();
  });

  it('should show ConnectDevice when not connected', async () => {
    mockWallet.getStatus.mockResolvedValue({
      connected: false,
      type: 'trezor',
      accounts: [],
      selectedAccount: null,
      selectedChain: 1,
      networks: [],
      isLoading: false,
      error: null
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Connect Device/i)).toBeInTheDocument();
    });
  });

  it('should show Dashboard when connected', async () => {
    mockWallet.getStatus.mockResolvedValue({
      connected: true,
      type: 'trezor',
      accounts: [
        {
          name: 'Account 1',
          address: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
          publicKey: '0x...',
          path: "m/44'/60'/0'/0/0",
          balance: '1.5'
        }
      ],
      selectedAccount: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      selectedChain: 1,
      networks: [],
      isLoading: false,
      error: null
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Your Accounts/i)).toBeInTheDocument();
    });
  });
});

/**
 * ConnectDevice Component Tests
 */
describe('ConnectDevice Component', () => {
  const mockOnConnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockBridge.connectDevice.mockResolvedValue({
      success: true,
      data: { connected: true }
    });
  });

  it('should render connect screen', () => {
    render(<ConnectDevice onConnect={mockOnConnect} />);
    
    expect(screen.getByText(/Trezor Hardware Wallet/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect Your Device/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connect Device/i })).toBeInTheDocument();
  });

  it('should show instructions', () => {
    render(<ConnectDevice onConnect={mockOnConnect} />);
    
    expect(screen.getByText(/Connect your Trezor device via USB/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter your PIN on the device/i)).toBeInTheDocument();
  });

  it('should call onConnect after successful connection', async () => {
    render(<ConnectDevice onConnect={mockOnConnect} />);
    
    const button = screen.getByRole('button', { name: /Connect Device/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockBridge.connectDevice).toHaveBeenCalled();
    }, { timeout: 2500 });

    await waitFor(() => {
      expect(mockOnConnect).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should display error on connection failure', async () => {
    mockBridge.connectDevice.mockResolvedValue({
      success: false,
      error: 'Device not found'
    });

    render(<ConnectDevice onConnect={mockOnConnect} />);
    
    const button = screen.getByRole('button', { name: /Connect Device/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Device not found/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while connecting', async () => {
    mockBridge.connectDevice.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<ConnectDevice onConnect={mockOnConnect} />);
    
    const button = screen.getByRole('button', { name: /Connect Device/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Connecting/i)).toBeInTheDocument();
    });
  });
});

/**
 * Dashboard Component Tests
 */
describe('Dashboard Component', () => {
  const mockWalletState: WalletState = {
    connected: true,
    type: 'trezor',
    accounts: [
      {
        name: 'Account 1',
        address: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        publicKey: '0x...',
        path: "m/44'/60'/0'/0/0",
        balance: '1.5'
      },
      {
        name: 'Account 2',
        address: '0x123456789abcdef123456789abcdef1234567890',
        publicKey: '0x...',
        path: "m/44'/60'/0'/0/1",
        balance: '0.75'
      }
    ],
    selectedAccount: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
    selectedChain: 1,
    networks: [],
    isLoading: false,
    error: null
  };

  it('should display wallet status', () => {
    render(<Dashboard state={mockWalletState} />);
    
    expect(screen.getByText(/trezor Connected/i)).toBeInTheDocument();
  });

  it('should display all accounts', () => {
    render(<Dashboard state={mockWalletState} />);
    
    expect(screen.getByText(/Account 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Account 2/i)).toBeInTheDocument();
  });

  it('should display account balances', () => {
    render(<Dashboard state={mockWalletState} />);
    
    expect(screen.getByText(/1.5 ETH/i)).toBeInTheDocument();
    expect(screen.getByText(/0.75 ETH/i)).toBeInTheDocument();
  });

  it('should truncate addresses', () => {
    render(<Dashboard state={mockWalletState} />);
    
    const addressElements = screen.getAllByText(/\.\.\./);
    expect(addressElements.length).toBeGreaterThan(0);
  });

  it('should show loading state', () => {
    const loadingState = { ...mockWalletState, isLoading: true };
    render(<Dashboard state={loadingState} />);
    
    expect(screen.getByText(/Loading wallet/i)).toBeInTheDocument();
  });

  it('should show error message', () => {
    const errorState = { ...mockWalletState, error: 'Connection failed' };
    render(<Dashboard state={errorState} />);
    
    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
  });

  it('should show no accounts message when empty', () => {
    const emptyState = { ...mockWalletState, accounts: [] };
    render(<Dashboard state={emptyState} />);
    
    expect(screen.getByText(/No accounts found/i)).toBeInTheDocument();
  });
});

/**
 * Integration Tests
 */
describe('App Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should flow from ConnectDevice to Dashboard', async () => {
    // Initially not connected
    mockWallet.getStatus.mockResolvedValue({
      connected: false,
      type: 'trezor',
      accounts: [],
      selectedAccount: null,
      selectedChain: 1,
      networks: [],
      isLoading: false,
      error: null
    });

    const { rerender } = render(<App />);
    expect(screen.getByText(/Connect Device/i)).toBeInTheDocument();

    // Simulate device connection
    mockBridge.connectDevice.mockResolvedValue({
      success: true,
      data: { connected: true }
    });

    const connectButton = screen.getByRole('button', { name: /Connect Device/i });
    fireEvent.click(connectButton);

    // Update status to connected
    mockWallet.getStatus.mockResolvedValue({
      connected: true,
      type: 'trezor',
      accounts: [
        {
          name: 'Account 1',
          address: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
          publicKey: '0x...',
          path: "m/44'/60'/0'/0/0",
          balance: '1.5'
        }
      ],
      selectedAccount: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      selectedChain: 1,
      networks: [],
      isLoading: false,
      error: null
    });

    await waitFor(() => {
      expect(screen.queryByText(/Your Accounts/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

export { mockBridge, mockWallet };
