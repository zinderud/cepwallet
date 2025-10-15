/**
 * Security Monitor Component
 * Real-time display of rate limits, anomalies, and security alerts
 */

import React, { useState, useEffect } from 'react';

interface RateLimitAlert {
  userId: string;
  action: string;
  requestsRemaining: number;
  resetTime: number;
  isBlocked: boolean;
}

interface AnomalyAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  affectedEntities: number;
}

interface BlockedUser {
  userId: string;
  reason: string;
  unblockTime: number;
  blockedAt: number;
}

interface SecurityMonitorProps {
  alerts?: RateLimitAlert[];
  anomalies?: AnomalyAlert[];
  blockedUsers?: BlockedUser[];
  securityStats?: {
    totalRequests: number;
    blockedRequests: number;
    ddosAttempts: number;
    lastDdosDetection?: number;
  };
  onDismissAlert?: (alertId: string) => void;
  onUnblockUser?: (userId: string) => void;
}

/**
 * Get severity color
 */
const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  const colors: Record<string, string> = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
  };
  return colors[severity] || '#757575';
};

/**
 * Get severity icon
 */
const getSeverityIcon = (severity: 'low' | 'medium' | 'high'): string => {
  const icons: Record<string, string> = {
    low: '⚠️',
    medium: '⚠️⚠️',
    high: '🚨',
  };
  return icons[severity] || '⚠️';
};

/**
 * Format time remaining
 */
const formatTimeRemaining = (timestamp: number): string => {
  const now = Date.now();
  const diff = Math.max(0, timestamp - now);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Security Monitor Component
 */
const SecurityMonitor: React.FC<SecurityMonitorProps> = ({
  alerts = [],
  anomalies = [],
  blockedUsers = [],
  securityStats = {
    totalRequests: 0,
    blockedRequests: 0,
    ddosAttempts: 0,
  },
  onDismissAlert,
  onUnblockUser,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'alerts' | 'anomalies' | 'blocked' | 'stats'>('alerts');

  const blockedPercentage = securityStats.totalRequests > 0
    ? Math.round((securityStats.blockedRequests / securityStats.totalRequests) * 100)
    : 0;

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(`${alert.userId}-${alert.action}`));
  const visibleAnomalies = anomalies.filter((a) => !dismissedAlerts.has(a.id));

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
    onDismissAlert?.(alertId);
  };

  return (
    <div className="security-monitor">
      {/* Tabs */}
      <div className="security-monitor-tabs">
        <button
          className={`security-monitor-tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Rate Limits ({visibleAlerts.length})
        </button>
        <button
          className={`security-monitor-tab ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          ⚠️ Anomalies ({visibleAnomalies.length})
        </button>
        <button
          className={`security-monitor-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          🔒 Blocked ({blockedUsers.length})
        </button>
        <button
          className={`security-monitor-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="security-monitor-content">
        {/* Rate Limits Tab */}
        {activeTab === 'alerts' && (
          <div className="security-monitor-section">
            {visibleAlerts.length > 0 ? (
              <div className="alert-list">
                {visibleAlerts.map((alert) => (
                  <div
                    key={`${alert.userId}-${alert.action}`}
                    className={`alert-item ${alert.isBlocked ? 'alert-item-blocked' : 'alert-item-throttled'}`}
                  >
                    <div className="alert-header">
                      <span className="alert-icon">
                        {alert.isBlocked ? '🔴' : '🟡'}
                      </span>
                      <span className="alert-title">
                        {alert.isBlocked ? 'BLOCKED' : 'THROTTLED'} - {alert.action}
                      </span>
                      <span className="alert-time">
                        Resets in {formatTimeRemaining(alert.resetTime)}
                      </span>
                    </div>
                    <div className="alert-details">
                      <span className="alert-user">User: {alert.userId.substring(0, 12)}...</span>
                      <span className="alert-remaining">
                        Remaining: {alert.requestsRemaining}
                      </span>
                    </div>
                    <button
                      className="alert-dismiss-btn"
                      onClick={() => handleDismissAlert(`${alert.userId}-${alert.action}`)}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="security-monitor-empty">✅ No rate limit alerts</div>
            )}
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === 'anomalies' && (
          <div className="security-monitor-section">
            {visibleAnomalies.length > 0 ? (
              <div className="anomaly-list">
                {visibleAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="anomaly-item"
                    style={{ borderLeftColor: getSeverityColor(anomaly.severity) }}
                  >
                    <div className="anomaly-header">
                      <span className="anomaly-icon">{getSeverityIcon(anomaly.severity)}</span>
                      <span className="anomaly-type">{anomaly.type}</span>
                      <span
                        className="anomaly-severity"
                        style={{ color: getSeverityColor(anomaly.severity) }}
                      >
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="anomaly-message">{anomaly.message}</p>
                    <div className="anomaly-footer">
                      <span className="anomaly-time">
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </span>
                      <span className="anomaly-entities">
                        Affected: {anomaly.affectedEntities}
                      </span>
                    </div>
                    <button
                      className="anomaly-dismiss-btn"
                      onClick={() => handleDismissAlert(anomaly.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="security-monitor-empty">✅ No anomalies detected</div>
            )}
          </div>
        )}

        {/* Blocked Users Tab */}
        {activeTab === 'blocked' && (
          <div className="security-monitor-section">
            {blockedUsers.length > 0 ? (
              <div className="blocked-users-list">
                {blockedUsers.map((user) => (
                  <div key={user.userId} className="blocked-user-item">
                    <div className="blocked-user-header">
                      <span className="blocked-user-icon">🔒</span>
                      <span className="blocked-user-id">{user.userId.substring(0, 12)}...</span>
                      <span className="blocked-user-reason">{user.reason}</span>
                    </div>
                    <div className="blocked-user-details">
                      <span className="blocked-user-time">
                        Blocked: {new Date(user.blockedAt).toLocaleString()}
                      </span>
                      <span className="blocked-user-unblock">
                        Unblocks in: {formatTimeRemaining(user.unblockTime)}
                      </span>
                    </div>
                    <button
                      className="blocked-user-unblock-btn"
                      onClick={() => onUnblockUser?.(user.userId)}
                    >
                      Unblock Manually
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="security-monitor-empty">✅ No blocked users</div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="security-monitor-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Requests</div>
                <div className="stat-value">{securityStats.totalRequests.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Blocked Requests</div>
                <div className="stat-value" style={{ color: '#F44336' }}>
                  {securityStats.blockedRequests.toLocaleString()}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Block Rate</div>
                <div className="stat-value" style={{ color: blockedPercentage > 5 ? '#FF9800' : '#4CAF50' }}>
                  {blockedPercentage}%
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">DDoS Attempts</div>
                <div className="stat-value" style={{ color: securityStats.ddosAttempts > 0 ? '#F44336' : '#4CAF50' }}>
                  {securityStats.ddosAttempts}
                </div>
              </div>

              {securityStats.lastDdosDetection && (
                <div className="stat-card">
                  <div className="stat-label">Last DDoS Detection</div>
                  <div className="stat-value stat-value-small">
                    {new Date(securityStats.lastDdosDetection).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityMonitor;
