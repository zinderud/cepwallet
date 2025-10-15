/**
 * Analytics Dashboard Component
 * Displays transaction metrics, anomalies, and real-time statistics
 */

import React, { useState, useEffect } from 'react';

interface DashboardMetric {
  label: string;
  value: string | number;
  format?: 'currency' | 'percent' | 'number';
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface AnalyticsDashboardProps {
  metrics?: DashboardMetric[];
  anomalies?: any[];
  topAddresses?: any[];
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Format metric value
 */
const formatMetricValue = (value: string | number, format?: string): string => {
  if (format === 'currency') {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }

  if (format === 'percent') {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  }

  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }

  return value as string;
};

/**
 * Analytics Dashboard Component
 */
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics = [],
  anomalies = [],
  topAddresses = [],
  onRefresh,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      onRefresh?.();
      setLastUpdate(Date.now());
      setIsRefreshing(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setLastUpdate(Date.now());
    setIsRefreshing(false);
  };

  const getTrendIcon = (trend?: string): string => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend?: string): string => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-dashboard-header">
        <h2 className="analytics-dashboard-title">Analytics Dashboard</h2>
        <div className="analytics-dashboard-controls">
          <button
            className={`analytics-dashboard-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh data"
          >
            🔄
          </button>
          <span className="analytics-dashboard-last-update">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="analytics-metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="analytics-metric-card">
            <div className="analytics-metric-header">
              <span className="analytics-metric-label">{metric.label}</span>
              {metric.trend && (
                <span
                  className="analytics-metric-trend"
                  style={{ color: getTrendColor(metric.trend) }}
                >
                  {getTrendIcon(metric.trend)}
                </span>
              )}
            </div>
            <div className="analytics-metric-value">
              {formatMetricValue(metric.value, metric.format)}
            </div>
          </div>
        ))}
      </div>

      {/* Anomalies Section */}
      {anomalies.length > 0 && (
        <div className="analytics-anomalies-section">
          <h3 className="analytics-section-title">⚠️ Anomalies Detected</h3>
          <div className="analytics-anomalies-list">
            {anomalies.slice(0, 5).map((anomaly, index) => (
              <div
                key={index}
                className={`analytics-anomaly-item severity-${anomaly.severity}`}
              >
                <div className="analytics-anomaly-type">{anomaly.type}</div>
                <div className="analytics-anomaly-message">{anomaly.message}</div>
                <div className="analytics-anomaly-count">
                  {anomaly.affectedTransactions?.length || 0} transactions affected
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Addresses Section */}
      {topAddresses.length > 0 && (
        <div className="analytics-addresses-section">
          <h3 className="analytics-section-title">👥 Top Active Addresses</h3>
          <div className="analytics-addresses-table">
            <div className="analytics-table-header">
              <div className="analytics-table-cell">Address</div>
              <div className="analytics-table-cell">Transactions</div>
              <div className="analytics-table-cell">Success Rate</div>
              <div className="analytics-table-cell">Avg Duration</div>
            </div>
            {topAddresses.slice(0, 10).map((address, index) => (
              <div key={index} className="analytics-table-row">
                <div className="analytics-table-cell">
                  {address.address?.substring(0, 16)}...
                </div>
                <div className="analytics-table-cell">{address.transactionCount}</div>
                <div className="analytics-table-cell">
                  {address.successRate?.toFixed(1)}%
                </div>
                <div className="analytics-table-cell">{address.avgDuration?.toFixed(0)}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {metrics.length === 0 && anomalies.length === 0 && topAddresses.length === 0 && (
        <div className="analytics-empty-state">
          <p>No data available. Start with some transactions to see analytics.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
