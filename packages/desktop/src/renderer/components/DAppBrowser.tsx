/**
 * DAppBrowser - Main Browser Component
 * Renders URL bar, navigation, and content area
 */

import React, { useState, useRef } from 'react';
import { useBrowser, BrowserTab } from '../utils/useBrowser';
import { EthereumProvider } from '../utils/web3Provider';
import DAppTabs from './DAppTabs';
import PermissionModal from './PermissionModal';
import TransactionPreview from './TransactionPreview';
import './Browser.css';

interface DAppBrowserProps {
  provider?: EthereumProvider;
  onTransactionSend?: (tx: any) => Promise<string>;
  onSignMessage?: (message: string) => Promise<string>;
}

interface URLBarState {
  input: string;
  showSuggestions: boolean;
}

const DAppBrowser: React.FC<DAppBrowserProps> = ({
  provider,
  onTransactionSend,
  onSignMessage,
}) => {
  const browser = useBrowser();
  const [urlBarState, setUrlBarState] = useState<URLBarState>({
    input: '',
    showSuggestions: false,
  });
  const [selectedPermission, setSelectedPermission] = useState<string | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Initialize with home tab
  React.useEffect(() => {
    if (browser.tabs.length === 0) {
      browser.addTab('about:blank', 'Home');
    }
  }, []);

  /**
   * Handle URL bar input change
   */
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlBarState({
      input: value,
      showSuggestions: value.length > 0,
    });
  };

  /**
   * Handle URL bar key press
   */
  const handleUrlKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  /**
   * Navigate to URL
   */
  const handleNavigate = () => {
    let url = urlBarState.input.trim();

    if (!url) {
      return;
    }

    // Add protocol if missing
    if (
      !url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('about:')
    ) {
      if (url.includes('.')) {
        url = 'https://' + url;
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
    }

    browser.navigate(url);
    setUrlBarState({ input: '', showSuggestions: false });
  };

  /**
   * Handle focus on active tab
   */
  const handleTabFocus = (tabId: string) => {
    browser.switchTab(tabId);
    if (urlInputRef.current) {
      const tab = browser.getTab(tabId);
      if (tab) {
        setUrlBarState({ input: tab.url, showSuggestions: false });
      }
    }
  };

  /**
   * Get address from URL
   */
  const extractDAppName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || 'Unknown dApp';
    } catch {
      return 'Unknown dApp';
    }
  };

  const activeTab = browser.activeTab;
  const currentUrl = activeTab?.url || '';

  return (
    <div className="dapp-browser">
      {/* Header with controls */}
      <div className="browser-header">
        <div className="browser-controls">
          {/* Back button */}
          <button
            className="control-btn"
            onClick={() => browser.goBack()}
            disabled={!activeTab?.canGoBack}
            title="Go back"
          >
            ←
          </button>

          {/* Forward button */}
          <button
            className="control-btn"
            onClick={() => browser.goForward()}
            disabled={!activeTab?.canGoForward}
            title="Go forward"
          >
            →
          </button>

          {/* Reload button */}
          <button
            className="control-btn"
            onClick={() => browser.reload()}
            title="Reload"
          >
            ↻
          </button>

          {/* Stop button */}
          <button
            className="control-btn"
            onClick={() => browser.stopLoading()}
            disabled={!activeTab?.isLoading}
            title="Stop loading"
          >
            ⊗
          </button>

          {/* URL bar */}
          <div className="url-bar-container">
            <input
              ref={urlInputRef}
              type="text"
              className="url-bar"
              placeholder="Enter URL or search..."
              value={
                urlBarState.input || currentUrl
              }
              onChange={handleUrlChange}
              onKeyPress={handleUrlKeyPress}
              onFocus={() => {
                if (activeTab) {
                  setUrlBarState({
                    input: activeTab.url,
                    showSuggestions: false,
                  });
                }
              }}
            />

            {/* Suggestions */}
            {urlBarState.showSuggestions && (
              <div className="suggestions">
                <div className="suggestion-item" onClick={handleNavigate}>
                  Search for "{urlBarState.input}"
                </div>
                <div
                  className="suggestion-item"
                  onClick={() => {
                    const url = 'https://' + urlBarState.input;
                    browser.navigate(url);
                    setUrlBarState({
                      input: '',
                      showSuggestions: false,
                    });
                  }}
                >
                  Visit {urlBarState.input}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {activeTab?.isLoading && <div className="loading-spinner" />}
          </div>

          {/* Security indicator */}
          <div className="security-indicator">
            {currentUrl.startsWith('https://') ? '🔒' : ''}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <DAppTabs
        tabs={browser.tabs}
        activeTabId={browser.activeTabId}
        onTabClick={handleTabFocus}
        onTabClose={browser.closeTab}
        onNewTab={() => {
          const tabId = browser.addTab('about:blank', 'New Tab');
          browser.switchTab(tabId);
        }}
      />

      {/* Main content area */}
      <div className="browser-content">
        {browser.tabs.length === 0 ? (
          <div className="browser-empty">
            <h2>No tabs open</h2>
            <button
              className="new-tab-button"
              onClick={() => {
                const tabId = browser.addTab('about:blank', 'Home');
                browser.switchTab(tabId);
              }}
            >
              Open New Tab
            </button>
          </div>
        ) : activeTab ? (
          <div className="browser-view">
            {/* Mock content area - in production would use BrowserView */}
            <div className="browser-mock-content">
              <div className="content-header">
                <h3>{activeTab.title}</h3>
                <p className="url">{activeTab.url}</p>
              </div>

              {activeTab.url === 'about:blank' ? (
                <div className="about-blank">
                  <h2>Start browsing</h2>
                  <p>Enter a URL to navigate</p>
                </div>
              ) : (
                <div className="content-body">
                  <p>Content from: {extractDAppName(activeTab.url)}</p>
                  {provider && (
                    <p className="web3-notice">
                      ✓ Web3 provider injected
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Permission modal */}
      {selectedPermission && (
        <PermissionModal
          requestId={selectedPermission}
          method={
            browser.permissionRequests.find((r) => r.id === selectedPermission)
              ?.method || ''
          }
          dapp={
            browser.permissionRequests.find((r) => r.id === selectedPermission)
              ?.dapp || 'Unknown'
          }
          permissions={
            browser.permissionRequests.find((r) => r.id === selectedPermission)
              ?.permissions || []
          }
          onApprove={() => {
            browser.handlePermissionRequest(selectedPermission, true);
            setSelectedPermission(null);
          }}
          onReject={() => {
            browser.handlePermissionRequest(selectedPermission, false);
            setSelectedPermission(null);
          }}
        />
      )}

      {/* Transaction preview modal */}
      {selectedTransaction && (
        <TransactionPreview
          previewId={selectedTransaction}
          transaction={
            browser.transactionPreviews.find((t) => t.id === selectedTransaction)
          }
          onApprove={async () => {
            const tx = browser.transactionPreviews.find(
              (t) => t.id === selectedTransaction
            );
            if (tx && onTransactionSend) {
              await onTransactionSend(tx);
            }
            browser.removeTransactionPreview(selectedTransaction);
            setSelectedTransaction(null);
          }}
          onReject={() => {
            browser.removeTransactionPreview(selectedTransaction);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
};

export default DAppBrowser;
