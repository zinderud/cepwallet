/**
 * NoteSyncStatus - Note Synchronization Status Component
 * Displays sync status, progress, and error details
 */

import React, { useState } from 'react';
import { SyncStatus } from '../notes/manager';

interface NoteSyncStatusProps {
  syncStatus: SyncStatus;
  progress: number;
  showDetails?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
}

/**
 * NoteSyncStatus Component
 */
export const NoteSyncStatus: React.FC<NoteSyncStatusProps> = ({
  syncStatus,
  progress,
  showDetails = false,
  onRetry,
  errorMessage,
}) => {
  const [showDetailsState, setShowDetailsState] = useState(showDetails);

  /**
   * Get status display text
   */
  const getStatusText = (): string => {
    switch (syncStatus) {
      case SyncStatus.PENDING:
        return 'Pending';
      case SyncStatus.SYNCING:
        return 'Syncing...';
      case SyncStatus.SYNCED:
        return 'Synced ✓';
      case SyncStatus.FAILED:
        return 'Failed ✗';
      case SyncStatus.RETRYING:
        return 'Retrying...';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (): string => {
    switch (syncStatus) {
      case SyncStatus.PENDING:
        return '#6B7280';
      case SyncStatus.SYNCING:
        return '#3B82F6';
      case SyncStatus.SYNCED:
        return '#10B981';
      case SyncStatus.FAILED:
        return '#EF4444';
      case SyncStatus.RETRYING:
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  /**
   * Get spinner animation
   */
  const isSpinning = syncStatus === SyncStatus.SYNCING || syncStatus === SyncStatus.RETRYING;

  return (
    <div className="note-sync-status" style={{ borderLeftColor: getStatusColor() }}>
      <div className="note-sync-status-header">
        <div className={`note-sync-status-indicator ${isSpinning ? 'spinning' : ''}`}>
          <div
            className="note-sync-status-dot"
            style={{ backgroundColor: getStatusColor() }}
          />
        </div>

        <div className="note-sync-status-text">
          <span className="note-sync-status-label">{getStatusText()}</span>
          {syncStatus !== SyncStatus.SYNCED && syncStatus !== SyncStatus.PENDING && (
            <span className="note-sync-status-percentage">{progress}%</span>
          )}
        </div>

        {showDetailsState && (
          <button
            className="note-sync-status-toggle"
            onClick={() => setShowDetailsState(!showDetailsState)}
            title="Toggle details"
          >
            ▼
          </button>
        )}
      </div>

      {syncStatus === SyncStatus.SYNCING || syncStatus === SyncStatus.RETRYING ? (
        <div className="note-sync-progress">
          <div className="note-sync-progress-bar">
            <div
              className="note-sync-progress-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: getStatusColor(),
              }}
            />
          </div>
          <span className="note-sync-progress-text">{progress}%</span>
        </div>
      ) : null}

      {syncStatus === SyncStatus.FAILED && errorMessage && showDetailsState && (
        <div className="note-sync-error">
          <div className="note-sync-error-header">
            <span className="note-sync-error-icon">⚠️</span>
            <span className="note-sync-error-title">Sync Error</span>
          </div>
          <div className="note-sync-error-message">{errorMessage}</div>
          {onRetry && (
            <button
              className="note-sync-error-retry"
              onClick={onRetry}
              title="Retry synchronization"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteSyncStatus;
