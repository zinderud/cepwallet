/**
 * useBrowser - React Hook for Browser State Management
 * Manages tabs, navigation, and browser state
 */

import { useState, useCallback, useRef } from 'react';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  history: string[];
  historyIndex: number;
}

export interface BrowserState {
  activeTabId: string | null;
  tabs: BrowserTab[];
  permissionRequests: PermissionRequest[];
  transactionPreviews: TransactionPreview[];
}

export interface PermissionRequest {
  id: string;
  method: string;
  dapp: string;
  permissions: string[];
  timestamp: number;
  handled: boolean;
}

export interface TransactionPreview {
  id: string;
  from: string;
  to: string;
  value: string;
  data: string;
  gas: string;
  gasPrice: string;
  nonce: number;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * useBrowser Hook
 */
export function useBrowser() {
  const [state, setState] = useState<BrowserState>({
    activeTabId: null,
    tabs: [],
    permissionRequests: [],
    transactionPreviews: [],
  });

  const tabRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());

  /**
   * Add new tab
   */
  const addTab = useCallback((url: string = 'about:blank', title?: string) => {
    const tabId = generateId();
    const newTab: BrowserTab = {
      id: tabId,
      title: title || 'New Tab',
      url,
      isLoading: url !== 'about:blank',
      canGoBack: false,
      canGoForward: false,
      history: [url],
      historyIndex: 0,
    };

    setState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: prev.activeTabId || tabId,
    }));

    return tabId;
  }, []);

  /**
   * Close tab
   */
  const closeTab = useCallback((tabId: string) => {
    setState((prev) => {
      const newTabs = prev.tabs.filter((tab) => tab.id !== tabId);
      let newActiveTabId = prev.activeTabId;

      if (newActiveTabId === tabId) {
        newActiveTabId = newTabs.length > 0 ? newTabs[0].id : null;
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });

    tabRefs.current.delete(tabId);
  }, []);

  /**
   * Switch to tab
   */
  const switchTab = useCallback((tabId: string) => {
    setState((prev) => ({
      ...prev,
      activeTabId: prev.tabs.some((tab) => tab.id === tabId) ? tabId : prev.activeTabId,
    }));
  }, []);

  /**
   * Navigate to URL
   */
  const navigate = useCallback((url: string, tabId?: string) => {
    const targetTabId = tabId || state.activeTabId;
    if (!targetTabId) return;

    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) => {
        if (tab.id !== targetTabId) return tab;

        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(url);

        return {
          ...tab,
          url,
          title: url,
          isLoading: true,
          canGoBack: true,
          canGoForward: false,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),
    }));
  }, [state.activeTabId]);

  /**
   * Go back
   */
  const goBack = useCallback((tabId?: string) => {
    const targetTabId = tabId || state.activeTabId;
    if (!targetTabId) return;

    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) => {
        if (tab.id !== targetTabId || tab.historyIndex === 0) return tab;

        const newIndex = tab.historyIndex - 1;
        const newUrl = tab.history[newIndex];

        return {
          ...tab,
          url: newUrl,
          title: newUrl,
          isLoading: true,
          canGoBack: newIndex > 0,
          canGoForward: true,
          historyIndex: newIndex,
        };
      }),
    }));
  }, [state.activeTabId]);

  /**
   * Go forward
   */
  const goForward = useCallback((tabId?: string) => {
    const targetTabId = tabId || state.activeTabId;
    if (!targetTabId) return;

    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) => {
        if (tab.id !== targetTabId || tab.historyIndex === tab.history.length - 1)
          return tab;

        const newIndex = tab.historyIndex + 1;
        const newUrl = tab.history[newIndex];

        return {
          ...tab,
          url: newUrl,
          title: newUrl,
          isLoading: true,
          canGoBack: true,
          canGoForward: newIndex < tab.history.length - 1,
          historyIndex: newIndex,
        };
      }),
    }));
  }, [state.activeTabId]);

  /**
   * Reload current tab
   */
  const reload = useCallback((tabId?: string) => {
    const targetTabId = tabId || state.activeTabId;
    if (!targetTabId) return;

    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === targetTabId ? { ...tab, isLoading: true } : tab
      ),
    }));
  }, [state.activeTabId]);

  /**
   * Stop loading
   */
  const stopLoading = useCallback((tabId?: string) => {
    const targetTabId = tabId || state.activeTabId;
    if (!targetTabId) return;

    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === targetTabId ? { ...tab, isLoading: false } : tab
      ),
    }));
  }, [state.activeTabId]);

  /**
   * Update tab title
   */
  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, title } : tab
      ),
    }));
  }, []);

  /**
   * Update tab favicon
   */
  const updateTabFavicon = useCallback((tabId: string, favicon: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, favicon } : tab
      ),
    }));
  }, []);

  /**
   * Add permission request
   */
  const addPermissionRequest = useCallback(
    (method: string, dapp: string, permissions: string[]) => {
      const requestId = generateId();
      const request: PermissionRequest = {
        id: requestId,
        method,
        dapp,
        permissions,
        timestamp: Date.now(),
        handled: false,
      };

      setState((prev) => ({
        ...prev,
        permissionRequests: [...prev.permissionRequests, request],
      }));

      return requestId;
    },
    []
  );

  /**
   * Handle permission request
   */
  const handlePermissionRequest = useCallback(
    (requestId: string, approved: boolean) => {
      setState((prev) => ({
        ...prev,
        permissionRequests: prev.permissionRequests.map((req) =>
          req.id === requestId ? { ...req, handled: true } : req
        ),
      }));

      return approved;
    },
    []
  );

  /**
   * Clear permission requests
   */
  const clearPermissionRequests = useCallback(() => {
    setState((prev) => ({
      ...prev,
      permissionRequests: [],
    }));
  }, []);

  /**
   * Add transaction preview
   */
  const addTransactionPreview = useCallback(
    (tx: Omit<TransactionPreview, 'id'>) => {
      const previewId = generateId();
      const preview: TransactionPreview = {
        ...tx,
        id: previewId,
      };

      setState((prev) => ({
        ...prev,
        transactionPreviews: [...prev.transactionPreviews, preview],
      }));

      return previewId;
    },
    []
  );

  /**
   * Remove transaction preview
   */
  const removeTransactionPreview = useCallback((previewId: string) => {
    setState((prev) => ({
      ...prev,
      transactionPreviews: prev.transactionPreviews.filter(
        (preview) => preview.id !== previewId
      ),
    }));
  }, []);

  /**
   * Clear all transaction previews
   */
  const clearTransactionPreviews = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactionPreviews: [],
    }));
  }, []);

  /**
   * Get active tab
   */
  const getActiveTab = useCallback((): BrowserTab | undefined => {
    return state.tabs.find((tab) => tab.id === state.activeTabId);
  }, [state.tabs, state.activeTabId]);

  /**
   * Get tab by ID
   */
  const getTab = useCallback(
    (tabId: string): BrowserTab | undefined => {
      return state.tabs.find((tab) => tab.id === tabId);
    },
    [state.tabs]
  );

  /**
   * Get all tabs
   */
  const getTabs = useCallback((): BrowserTab[] => {
    return state.tabs;
  }, [state.tabs]);

  /**
   * Close all tabs
   */
  const closeAllTabs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tabs: [],
      activeTabId: null,
    }));

    tabRefs.current.clear();
  }, []);

  /**
   * Get tab ref
   */
  const getTabRef = useCallback((tabId: string): HTMLIFrameElement | null => {
    return tabRefs.current.get(tabId) || null;
  }, []);

  /**
   * Set tab ref
   */
  const setTabRef = useCallback((tabId: string, ref: HTMLIFrameElement | null) => {
    if (ref) {
      tabRefs.current.set(tabId, ref);
    } else {
      tabRefs.current.delete(tabId);
    }
  }, []);

  return {
    // State
    state,
    activeTab: getActiveTab(),
    activeTabId: state.activeTabId,
    tabs: state.tabs,
    permissionRequests: state.permissionRequests,
    transactionPreviews: state.transactionPreviews,

    // Tab operations
    addTab,
    closeTab,
    switchTab,
    navigate,
    goBack,
    goForward,
    reload,
    stopLoading,
    updateTabTitle,
    updateTabFavicon,
    getActiveTab,
    getTab,
    getTabs,
    closeAllTabs,

    // Permission operations
    addPermissionRequest,
    handlePermissionRequest,
    clearPermissionRequests,

    // Transaction operations
    addTransactionPreview,
    removeTransactionPreview,
    clearTransactionPreviews,

    // Ref operations
    getTabRef,
    setTabRef,
  };
}

/**
 * Browser hook return type
 */
export type UseBrowserReturn = ReturnType<typeof useBrowser>;
