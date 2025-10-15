/**
 * NoteSyncSettings - Note Sync Settings Panel
 * Allows configuration of sync strategy and manual sync trigger
 */

import React, { useState } from 'react';
import { SyncStrategy } from '../notes/sync';

interface NoteSyncSettingsProps {
  currentStrategy?: SyncStrategy;
  onStrategyChange?: (strategy: SyncStrategy) => void;
  onSync?: () => void;
  onClear?: () => void;
  isSyncing?: boolean;
}

/**
 * NoteSyncSettings Component
 */
export const NoteSyncSettings: React.FC<NoteSyncSettingsProps> = ({
  currentStrategy = 'batched',
  onStrategyChange,
  onSync,
  onClear,
  isSyncing = false,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<SyncStrategy>(currentStrategy);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  /**
   * Handle strategy change
   */
  const handleStrategyChange = (strategy: SyncStrategy) => {
    setSelectedStrategy(strategy);
    onStrategyChange?.(strategy);
  };

  /**
   * Get strategy description
   */
  const getStrategyDescription = (strategy: SyncStrategy): string => {
    switch (strategy) {
      case 'immediate':
        return 'Real-time sync - syncs immediately (higher resource usage)';
      case 'batched':
        return 'Batched sync - syncs periodically in batches';
      case 'lazy':
        return 'Lazy sync - syncs on-demand or with long intervals';
      default:
        return '';
    }
  };

  /**
   * Get strategy icon
   */
  const getStrategyIcon = (strategy: SyncStrategy): string => {
    switch (strategy) {
      case 'immediate':
        return '⚡';
      case 'batched':
        return '📦';
      case 'lazy':
        return '⏱️';
      default:
        return '❓';
    }
  };

  return (
    <div className="note-sync-settings">
      <div className="note-sync-settings-header">
        <h3 className="note-sync-settings-title">Sync Settings</h3>
        <span className="note-sync-settings-subtitle">Configure note synchronization</span>
      </div>

      <div className="note-sync-settings-section">
        <label className="note-sync-settings-label">Sync Strategy</label>

        <div className="note-sync-settings-options">
          {(['immediate', 'batched', 'lazy'] as SyncStrategy[]).map((strategy) => (
            <div key={strategy} className="note-sync-settings-option">
              <input
                type="radio"
                id={`sync-strategy-${strategy}`}
                name="sync-strategy"
                value={strategy}
                checked={selectedStrategy === strategy}
                onChange={() => handleStrategyChange(strategy)}
                disabled={isSyncing}
                style={{ cursor: isSyncing ? 'not-allowed' : 'pointer' }}
              />
              <label htmlFor={`sync-strategy-${strategy}`} style={{ cursor: isSyncing ? 'not-allowed' : 'pointer' }}>
                <span className="note-sync-settings-icon">{getStrategyIcon(strategy)}</span>
                <div className="note-sync-settings-radio-content">
                  <span className="note-sync-settings-radio-label">
                    {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                  </span>
                  <span className="note-sync-settings-radio-description">
                    {getStrategyDescription(strategy)}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="note-sync-settings-section">
        <div className="note-sync-settings-info">
          <span className="note-sync-settings-info-icon">ℹ️</span>
          <span className="note-sync-settings-info-text">
            Different strategies have different impacts on resource usage and sync timing.
          </span>
        </div>
      </div>

      <div className="note-sync-settings-actions">
        <button
          className="note-sync-settings-button note-sync-settings-button-primary"
          onClick={onSync}
          disabled={isSyncing}
          title={isSyncing ? 'Sync in progress...' : 'Start synchronization'}
        >
          {isSyncing ? '⏳ Syncing...' : '▶️ Sync Now'}
        </button>

        <button
          className="note-sync-settings-button note-sync-settings-button-danger"
          onClick={() => setShowConfirmClear(true)}
          disabled={isSyncing}
          title="Clear all notes"
        >
          🗑️ Clear All
        </button>
      </div>

      {showConfirmClear && (
        <div className="note-sync-settings-modal">
          <div className="note-sync-settings-modal-content">
            <div className="note-sync-settings-modal-header">
              <span className="note-sync-settings-modal-icon">⚠️</span>
              <h4 className="note-sync-settings-modal-title">Clear All Notes</h4>
            </div>

            <p className="note-sync-settings-modal-message">
              Are you sure you want to clear all notes? This action cannot be undone.
            </p>

            <div className="note-sync-settings-modal-actions">
              <button
                className="note-sync-settings-button note-sync-settings-button-secondary"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                className="note-sync-settings-button note-sync-settings-button-danger"
                onClick={() => {
                  onClear?.();
                  setShowConfirmClear(false);
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteSyncSettings;
