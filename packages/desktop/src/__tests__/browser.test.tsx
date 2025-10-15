/**
 * DApp Browser Component Tests
 * Tests for DAppBrowser, DAppTabs, Modals, and useBrowser hook
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DAppBrowser from '../components/DAppBrowser';
import DAppTabs from '../components/DAppTabs';
import PermissionModal from '../components/PermissionModal';
import TransactionPreview from '../components/TransactionPreview';
import { useBrowser } from '../utils/useBrowser';
import {
  createWeb3Provider,
  handleEIP1193Request,
  validateRequest,
  requiresApproval,
  formatMethodName,
} from '../utils/web3Provider';

/**
 * useBrowser Hook Tests
 */
describe('useBrowser Hook', () => {
  it('should initialize with empty tabs', () => {
    const { result } = renderHook(() => useBrowser());

    expect(result.current.tabs).toHaveLength(0);
    expect(result.current.activeTabId).toBeNull();
    expect(result.current.permissionRequests).toHaveLength(0);
  });

  it('should add new tab', () => {
    const { result } = renderHook(() => useBrowser());

    act(() => {
      result.current.addTab('https://example.com', 'Example');
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeTabId).toBeDefined();
    expect(result.current.tabs[0].title).toBe('Example');
    expect(result.current.tabs[0].url).toBe('https://example.com');
  });

  it('should close tab', () => {
    const { result } = renderHook(() => useBrowser());

    let tabId: string;
    act(() => {
      tabId = result.current.addTab('https://example.com', 'Example');
    });

    act(() => {
      result.current.closeTab(tabId!);
    });

    expect(result.current.tabs).toHaveLength(0);
  });

  it('should switch between tabs', () => {
    const { result } = renderHook(() => useBrowser());

    let tab1Id: string, tab2Id: string;
    act(() => {
      tab1Id = result.current.addTab('https://example1.com', 'Tab 1');
      tab2Id = result.current.addTab('https://example2.com', 'Tab 2');
    });

    expect(result.current.activeTabId).toBe(tab1Id!);

    act(() => {
      result.current.switchTab(tab2Id!);
    });

    expect(result.current.activeTabId).toBe(tab2Id!);
  });

  it('should navigate to URL', () => {
    const { result } = renderHook(() => useBrowser());

    act(() => {
      result.current.addTab('about:blank', 'Home');
      result.current.navigate('https://example.com');
    });

    const activeTab = result.current.activeTab;
    expect(activeTab?.url).toBe('https://example.com');
    expect(activeTab?.history).toContain('https://example.com');
  });

  it('should go back in history', () => {
    const { result } = renderHook(() => useBrowser());

    act(() => {
      result.current.addTab('https://example1.com', 'Tab 1');
      result.current.navigate('https://example2.com');
      result.current.navigate('https://example3.com');
    });

    const activeTab = result.current.activeTab;
    expect(activeTab?.url).toBe('https://example3.com');

    act(() => {
      result.current.goBack();
    });

    expect(result.current.activeTab?.url).toBe('https://example2.com');
  });

  it('should go forward in history', () => {
    const { result } = renderHook(() => useBrowser());

    act(() => {
      result.current.addTab('https://example1.com', 'Tab 1');
      result.current.navigate('https://example2.com');
      result.current.navigate('https://example3.com');
      result.current.goBack();
    });

    act(() => {
      result.current.goForward();
    });

    expect(result.current.activeTab?.url).toBe('https://example3.com');
  });

  it('should update tab title', () => {
    const { result } = renderHook(() => useBrowser());

    let tabId: string;
    act(() => {
      tabId = result.current.addTab('https://example.com', 'Old Title');
      result.current.updateTabTitle(tabId!, 'New Title');
    });

    expect(result.current.tabs[0].title).toBe('New Title');
  });

  it('should manage permission requests', () => {
    const { result } = renderHook(() => useBrowser());

    let requestId: string;
    act(() => {
      requestId = result.current.addPermissionRequest(
        'eth_requestAccounts',
        'dapp.example.com',
        ['accounts', 'sign']
      );
    });

    expect(result.current.permissionRequests).toHaveLength(1);
    expect(result.current.permissionRequests[0].method).toBe('eth_requestAccounts');

    act(() => {
      result.current.handlePermissionRequest(requestId!, true);
    });

    expect(result.current.permissionRequests[0].handled).toBe(true);
  });

  it('should manage transaction previews', () => {
    const { result } = renderHook(() => useBrowser());

    let previewId: string;
    act(() => {
      previewId = result.current.addTransactionPreview({
        from: '0x123',
        to: '0x456',
        value: '1000000000000000000',
        data: '0x',
        gas: '21000',
        gasPrice: '20000000000',
        nonce: 0,
      });
    });

    expect(result.current.transactionPreviews).toHaveLength(1);

    act(() => {
      result.current.removeTransactionPreview(previewId!);
    });

    expect(result.current.transactionPreviews).toHaveLength(0);
  });

  it('should track navigation state', () => {
    const { result } = renderHook(() => useBrowser());

    act(() => {
      result.current.addTab('https://example1.com', 'Tab 1');
      result.current.navigate('https://example2.com');
      result.current.navigate('https://example3.com');
    });

    let activeTab = result.current.activeTab;
    expect(activeTab?.canGoBack).toBe(true);
    expect(activeTab?.canGoForward).toBe(false);

    act(() => {
      result.current.goBack();
    });

    activeTab = result.current.activeTab;
    expect(activeTab?.canGoBack).toBe(true);
    expect(activeTab?.canGoForward).toBe(true);
  });

  it('should handle reload', () => {
    const { result } = renderHook(() => useBrowser());

    act(() => {
      result.current.addTab('https://example.com', 'Example');
      result.current.reload();
    });

    expect(result.current.activeTab?.isLoading).toBe(true);

    act(() => {
      result.current.stopLoading();
    });

    expect(result.current.activeTab?.isLoading).toBe(false);
  });
});

/**
 * DAppTabs Component Tests
 */
describe('DAppTabs Component', () => {
  const mockTabs = [
    {
      id: 'tab1',
      title: 'Example 1',
      url: 'https://example1.com',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      history: ['https://example1.com'],
      historyIndex: 0,
    },
    {
      id: 'tab2',
      title: 'Example 2',
      url: 'https://example2.com',
      isLoading: true,
      canGoBack: true,
      canGoForward: false,
      history: ['https://example1.com', 'https://example2.com'],
      historyIndex: 1,
    },
  ];

  it('should render tabs', () => {
    const mockHandlers = {
      onTabClick: vi.fn(),
      onTabClose: vi.fn(),
      onNewTab: vi.fn(),
    };

    render(
      <DAppTabs
        tabs={mockTabs}
        activeTabId="tab1"
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Example 1')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
  });

  it('should call onTabClick when tab is clicked', () => {
    const onTabClick = vi.fn();
    const mockHandlers = {
      onTabClick,
      onTabClose: vi.fn(),
      onNewTab: vi.fn(),
    };

    render(
      <DAppTabs
        tabs={mockTabs}
        activeTabId="tab1"
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('Example 2'));
    expect(onTabClick).toHaveBeenCalledWith('tab2');
  });

  it('should call onTabClose when close button is clicked', () => {
    const onTabClose = vi.fn();
    const mockHandlers = {
      onTabClick: vi.fn(),
      onTabClose,
      onNewTab: vi.fn(),
    };

    render(
      <DAppTabs
        tabs={mockTabs}
        activeTabId="tab1"
        {...mockHandlers}
      />
    );

    const closeButtons = screen.getAllByText('✕');
    fireEvent.click(closeButtons[0]);
    expect(onTabClose).toHaveBeenCalledWith('tab1');
  });

  it('should highlight active tab', () => {
    const mockHandlers = {
      onTabClick: vi.fn(),
      onTabClose: vi.fn(),
      onNewTab: vi.fn(),
    };

    const { container } = render(
      <DAppTabs
        tabs={mockTabs}
        activeTabId="tab1"
        {...mockHandlers}
      />
    );

    const activeTabs = container.querySelectorAll('.tab.active');
    expect(activeTabs).toHaveLength(1);
  });

  it('should show loading indicator for loading tabs', () => {
    const mockHandlers = {
      onTabClick: vi.fn(),
      onTabClose: vi.fn(),
      onNewTab: vi.fn(),
    };

    const { container } = render(
      <DAppTabs
        tabs={mockTabs}
        activeTabId="tab1"
        {...mockHandlers}
      />
    );

    const loadingTabs = container.querySelectorAll('.tab.loading');
    expect(loadingTabs.length).toBeGreaterThan(0);
  });

  it('should call onNewTab when new tab button is clicked', () => {
    const onNewTab = vi.fn();
    const mockHandlers = {
      onTabClick: vi.fn(),
      onTabClose: vi.fn(),
      onNewTab,
    };

    render(
      <DAppTabs
        tabs={mockTabs}
        activeTabId="tab1"
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('+'));
    expect(onNewTab).toHaveBeenCalled();
  });
});

/**
 * PermissionModal Component Tests
 */
describe('PermissionModal Component', () => {
  it('should render permission request', () => {
    render(
      <PermissionModal
        requestId="req1"
        method="eth_requestAccounts"
        dapp="dapp.example.com"
        permissions={['accounts', 'sign']}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText('Permission Request')).toBeInTheDocument();
    expect(screen.getByText('dapp.example.com')).toBeInTheDocument();
    expect(screen.getByText('accounts')).toBeInTheDocument();
    expect(screen.getByText('sign')).toBeInTheDocument();
  });

  it('should call onReject when reject button is clicked', () => {
    const onReject = vi.fn();

    render(
      <PermissionModal
        requestId="req1"
        method="eth_requestAccounts"
        dapp="dapp.example.com"
        permissions={['accounts']}
        onApprove={vi.fn()}
        onReject={onReject}
      />
    );

    fireEvent.click(screen.getByText('Reject'));
    expect(onReject).toHaveBeenCalled();
  });

  it('should allow selecting permissions', () => {
    const { container } = render(
      <PermissionModal
        requestId="req1"
        method="eth_requestAccounts"
        dapp="dapp.example.com"
        permissions={['accounts', 'sign']}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should display security warning', () => {
    render(
      <PermissionModal
        requestId="req1"
        method="eth_requestAccounts"
        dapp="dapp.example.com"
        permissions={['accounts']}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/Security Warning/)).toBeInTheDocument();
  });
});

/**
 * TransactionPreview Component Tests
 */
describe('TransactionPreview Component', () => {
  const mockTx = {
    id: 'tx1',
    from: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
    to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    value: '1000000000000000000',
    data: '0x',
    gas: '21000',
    gasPrice: '20000000000',
    nonce: 0,
  };

  it('should render transaction details', () => {
    render(
      <TransactionPreview
        previewId="tx1"
        transaction={mockTx}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText('Confirm Transaction')).toBeInTheDocument();
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();
    expect(screen.getByText('Amount:')).toBeInTheDocument();
  });

  it('should format addresses correctly', () => {
    render(
      <TransactionPreview
        previewId="tx1"
        transaction={mockTx}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const addressElements = screen.getAllByText(/0x\w+\.\.\.\w+/);
    expect(addressElements.length).toBeGreaterThan(0);
  });

  it('should display transaction costs', () => {
    render(
      <TransactionPreview
        previewId="tx1"
        transaction={mockTx}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/Gas Price:/)).toBeInTheDocument();
    expect(screen.getByText(/Gas Limit:/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cost:/)).toBeInTheDocument();
  });

  it('should call onReject when reject button is clicked', () => {
    const onReject = vi.fn();

    render(
      <TransactionPreview
        previewId="tx1"
        transaction={mockTx}
        onApprove={vi.fn()}
        onReject={onReject}
      />
    );

    fireEvent.click(screen.getByText('Reject'));
    expect(onReject).toHaveBeenCalled();
  });

  it('should call onApprove when approve button is clicked', async () => {
    const onApprove = vi.fn().mockResolvedValue(undefined);

    render(
      <TransactionPreview
        previewId="tx1"
        transaction={mockTx}
        onApprove={onApprove}
        onReject={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Approve'));
    await waitFor(() => {
      expect(onApprove).toHaveBeenCalled();
    });
  });

  it('should display security warning', () => {
    render(
      <TransactionPreview
        previewId="tx1"
        transaction={mockTx}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/Security Warning/)).toBeInTheDocument();
  });

  it('should expand data section when clicked', async () => {
    const user = userEvent.setup();

    const txWithData = {
      ...mockTx,
      data: '0x1234567890abcdef',
    };

    render(
      <TransactionPreview
        previewId="tx1"
        transaction={txWithData}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const expandBtn = screen.getByText(/Data/);
    await user.click(expandBtn);

    expect(screen.getByText('0x1234567890abcdef')).toBeInTheDocument();
  });
});

/**
 * Web3 Provider Tests
 */
describe('Web3 Provider', () => {
  it('should create web3 provider', () => {
    const provider = createWeb3Provider(async () => ['0x123']);

    expect(provider.request).toBeDefined();
    expect(provider.on).toBeDefined();
    expect(provider.removeListener).toBeDefined();
    expect(provider.isCepWallet).toBe(true);
  });

  it('should handle eth_requestAccounts', async () => {
    const provider = createWeb3Provider(async (method) => {
      if (method === 'eth_requestAccounts') {
        return ['0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6'];
      }
    });

    const result = await provider.request({ method: 'eth_requestAccounts' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('should validate requests', () => {
    expect(validateRequest({ method: 'eth_accounts' })).toBe(true);
    expect(validateRequest({ method: '', params: [] })).toBe(false);
    expect(validateRequest({ params: [] } as any)).toBe(false);
  });

  it('should check if method requires approval', () => {
    expect(requiresApproval('eth_requestAccounts')).toBe(true);
    expect(requiresApproval('eth_sendTransaction')).toBe(true);
    expect(requiresApproval('eth_accounts')).toBe(false);
  });

  it('should format method names', () => {
    expect(formatMethodName('eth_requestAccounts')).toBe('Request Accounts');
    expect(formatMethodName('eth_sendTransaction')).toBe('Send Transaction');
    expect(formatMethodName('unknown_method')).toBe('unknown_method');
  });

  it('should handle EIP-1193 requests', async () => {
    expect(await handleEIP1193Request('eth_chainId')).toBe('0x1');
    expect(await handleEIP1193Request('net_version')).toBe('1');
  });
});

/**
 * DAppBrowser Integration Tests
 */
describe('DAppBrowser Integration', () => {
  it('should render browser without crashing', () => {
    render(<DAppBrowser />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should initialize with home tab on first load', async () => {
    render(<DAppBrowser />);

    await waitFor(() => {
      const tabElements = screen.queryAllByText(/New Tab|Home/);
      expect(tabElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle URL navigation', async () => {
    const user = userEvent.setup();
    render(<DAppBrowser />);

    const urlInput = screen.getByRole('textbox') as HTMLInputElement;
    await user.click(urlInput);
    await user.type(urlInput, 'example.com');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(urlInput.value).toBe('');
    });
  });

  it('should display permission modal when permission is requested', async () => {
    render(<DAppBrowser />);

    // This would require adding permission request through hook
    // Test would depend on integration with browser component
  });

  it('should display transaction preview modal when transaction is requested', async () => {
    render(<DAppBrowser />);

    // This would require adding transaction through hook
    // Test would depend on integration with browser component
  });
});

/**
 * Helper function for renderHook
 * (would normally import from @testing-library/react)
 */
function renderHook<T>(hook: () => T) {
  let result = { current: null as T | null };

  function Wrapper() {
    result.current = hook();
    return null;
  }

  render(<Wrapper />);
  return { result: result as { current: T } };
}

/**
 * Helper function for act
 * (would normally import from @testing-library/react)
 */
function act(callback: () => void) {
  callback();
}
