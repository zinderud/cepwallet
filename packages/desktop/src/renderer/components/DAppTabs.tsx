/**
 * DAppTabs - Tab Management Component
 * Manages multiple browser tabs
 */

import React from 'react';
import { BrowserTab } from '../utils/useBrowser';
import './Browser.css';

interface DAppTabsProps {
  tabs: BrowserTab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const DAppTabs: React.FC<DAppTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}) => {
  /**
   * Truncate long titles
   */
  const truncateTitle = (title: string, maxLength: number = 20): string => {
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength - 3) + '...';
  };

  /**
   * Extract domain from URL
   */
  const extractDomain = (url: string): string => {
    try {
      if (url === 'about:blank') {
        return 'New Tab';
      }
      const urlObj = new URL(url);
      return urlObj.hostname || url;
    } catch {
      return url;
    }
  };

  return (
    <div className="browser-tabs">
      {/* Tab bar */}
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''} ${
              tab.isLoading ? 'loading' : ''
            }`}
            onClick={() => onTabClick(tab.id)}
          >
            {/* Tab favicon/icon */}
            <div className="tab-icon">
              {tab.favicon ? (
                <img src={tab.favicon} alt="favicon" />
              ) : tab.isLoading ? (
                <div className="tab-loader" />
              ) : (
                <span>🔗</span>
              )}
            </div>

            {/* Tab title */}
            <div className="tab-title">
              {truncateTitle(tab.title || extractDomain(tab.url))}
            </div>

            {/* Close button */}
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close tab"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* New tab button */}
      <button className="new-tab-btn" onClick={onNewTab} title="New tab">
        +
      </button>
    </div>
  );
};

export default DAppTabs;
