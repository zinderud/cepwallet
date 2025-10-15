/**
 * Analytics Manager - Transaction Metrics and Performance Analytics
 * Tracks transaction metrics, detects anomalies, and provides insights
 */

import { PrivacyLevel } from '../notes/manager';

/**
 * Transaction Metric Interface
 */
export interface TransactionMetric {
  id: string;
  timestamp: number;
  txHash: string;
  privacyLevel: PrivacyLevel;
  amount: string;
  gasUsed: string;
  status: 'success' | 'pending' | 'failed';
  duration: number;
  fromAddress: string;
  toAddress: string;
  estimatedValue?: string;
}

/**
 * Metric Point for Time Series
 */
export interface MetricPoint {
  timestamp: number;
  value: number;
  label: string;
}

/**
 * Address Metric
 */
export interface AddressMetric {
  address: string;
  transactionCount: number;
  totalVolume: string;
  avgDuration: number;
  successRate: number;
  lastActivity: number;
}

/**
 * Analytics Data Interface
 */
export interface AnalyticsData {
  totalTransactions: number;
  successRate: number;
  avgDuration: number;
  totalVolume: string;
  byPrivacyLevel: Record<number, number>;
  byStatus: Record<string, number>;
  timeSeriesData: MetricPoint[];
  topAddresses: AddressMetric[];
  peakHours: number[];
  averageAmount: string;
  medianDuration: number;
}

/**
 * Anomaly Alert Interface
 */
export interface AnomalyAlert {
  id: string;
  type: 'high_volume' | 'slow_transaction' | 'failure_spike' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  affectedTransactions: string[];
}

/**
 * Analytics Manager - Singleton Pattern
 * Tracks and analyzes transaction metrics
 */
export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private metrics: Map<string, TransactionMetric>;
  private anomalies: Map<string, AnomalyAlert>;
  private lastAnalysisTime: number;
  private analysisCacheTimeout: number;

  private constructor() {
    this.metrics = new Map();
    this.anomalies = new Map();
    this.lastAnalysisTime = 0;
    this.analysisCacheTimeout = 60000; // 1 minute
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Record a transaction metric
   */
  recordTransaction(metric: TransactionMetric): void {
    this.metrics.set(metric.id, metric);
  }

  /**
   * Get metric by ID
   */
  getMetric(id: string): TransactionMetric | undefined {
    return this.metrics.get(id);
  }

  /**
   * Get metrics for time range
   */
  getMetrics(startTime: number, endTime: number): TransactionMetric[] {
    return Array.from(this.metrics.values()).filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get privacy level statistics
   */
  getPrivacyLevelStats(privacyLevel: PrivacyLevel): AnalyticsData {
    const filtered = Array.from(this.metrics.values()).filter(
      (m) => m.privacyLevel === privacyLevel
    );

    return this.calculateStats(filtered);
  }

  /**
   * Get address-specific metrics
   */
  getAddressMetrics(address: string): AddressMetric | null {
    const relevant = Array.from(this.metrics.values()).filter(
      (m) => m.fromAddress === address || m.toAddress === address
    );

    if (relevant.length === 0) return null;

    const totalVolume = relevant.reduce((sum, m) => {
      return (BigInt(sum) + BigInt(m.amount)).toString();
    }, '0');

    const avgDuration =
      relevant.reduce((sum, m) => sum + m.duration, 0) / relevant.length;

    const successCount = relevant.filter((m) => m.status === 'success').length;
    const successRate = (successCount / relevant.length) * 100;

    return {
      address,
      transactionCount: relevant.length,
      totalVolume,
      avgDuration,
      successRate,
      lastActivity: Math.max(...relevant.map((m) => m.timestamp)),
    };
  }

  /**
   * Get time series data
   */
  getTimeSeriesData(
    startTime: number,
    endTime: number,
    intervalMs: number
  ): MetricPoint[] {
    const data: MetricPoint[] = [];
    const metrics = this.getMetrics(startTime, endTime);

    for (let time = startTime; time <= endTime; time += intervalMs) {
      const intervalMetrics = metrics.filter(
        (m) => m.timestamp >= time && m.timestamp < time + intervalMs
      );

      data.push({
        timestamp: time,
        value: intervalMetrics.length,
        label: new Date(time).toISOString(),
      });
    }

    return data;
  }

  /**
   * Calculate anomalies
   */
  calculateAnomalies(): AnomalyAlert[] {
    const now = Date.now();

    if (now - this.lastAnalysisTime < this.analysisCacheTimeout) {
      return Array.from(this.anomalies.values());
    }

    this.anomalies.clear();
    const recentMetrics = this.getMetrics(now - 3600000, now); // Last hour

    if (recentMetrics.length === 0) return [];

    // High volume detection
    const avgDuration =
      recentMetrics.reduce((sum, m) => sum + m.duration, 0) /
      recentMetrics.length;
    const slowTransactions = recentMetrics.filter(
      (m) => m.duration > avgDuration * 3
    );

    if (slowTransactions.length > recentMetrics.length * 0.2) {
      const alert: AnomalyAlert = {
        id: `anomaly_${Date.now()}_slow`,
        type: 'slow_transaction',
        severity: 'medium',
        message: `${slowTransactions.length} slow transactions detected`,
        timestamp: now,
        affectedTransactions: slowTransactions.map((m) => m.id),
      };
      this.anomalies.set(alert.id, alert);
    }

    // Failure spike detection
    const failureCount = recentMetrics.filter(
      (m) => m.status === 'failed'
    ).length;
    const failureRate = (failureCount / recentMetrics.length) * 100;

    if (failureRate > 10) {
      const alert: AnomalyAlert = {
        id: `anomaly_${Date.now()}_failure`,
        type: 'failure_spike',
        severity: 'high',
        message: `High failure rate detected: ${failureRate.toFixed(2)}%`,
        timestamp: now,
        affectedTransactions: recentMetrics
          .filter((m) => m.status === 'failed')
          .map((m) => m.id),
      };
      this.anomalies.set(alert.id, alert);
    }

    // High volume detection
    if (recentMetrics.length > 1000) {
      const alert: AnomalyAlert = {
        id: `anomaly_${Date.now()}_volume`,
        type: 'high_volume',
        severity: 'low',
        message: `High transaction volume: ${recentMetrics.length} transactions`,
        timestamp: now,
        affectedTransactions: recentMetrics.map((m) => m.id),
      };
      this.anomalies.set(alert.id, alert);
    }

    this.lastAnalysisTime = now;
    return Array.from(this.anomalies.values());
  }

  /**
   * Get peak hours
   */
  getPeakHours(startTime: number, endTime: number): number[] {
    const metrics = this.getMetrics(startTime, endTime);
    const hourCounts = new Array(24).fill(0);

    metrics.forEach((m) => {
      const hour = new Date(m.timestamp).getHours();
      hourCounts[hour]++;
    });

    const avgCount =
      hourCounts.reduce((a, b) => a + b, 0) / hourCounts.length;
    return hourCounts
      .map((count, hour) => (count > avgCount * 1.5 ? hour : -1))
      .filter((h) => h !== -1);
  }

  /**
   * Get success rate
   */
  getSuccessRate(startTime?: number, endTime?: number): number {
    const now = Date.now();
    const start = startTime || now - 86400000; // 24 hours
    const end = endTime || now;

    const metrics = this.getMetrics(start, end);
    if (metrics.length === 0) return 100;

    const successful = metrics.filter((m) => m.status === 'success').length;
    return (successful / metrics.length) * 100;
  }

  /**
   * Get average duration
   */
  getAvgDuration(startTime?: number, endTime?: number): number {
    const now = Date.now();
    const start = startTime || now - 86400000;
    const end = endTime || now;

    const metrics = this.getMetrics(start, end);
    if (metrics.length === 0) return 0;

    return metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  }

  /**
   * Get top addresses
   */
  getTopAddresses(limit: number = 10): AddressMetric[] {
    const addressMap = new Map<string, TransactionMetric[]>();

    this.metrics.forEach((metric) => {
      const addAddresses = (addr: string) => {
        if (!addressMap.has(addr)) {
          addressMap.set(addr, []);
        }
        addressMap.get(addr)!.push(metric);
      };

      addAddresses(metric.fromAddress);
      addAddresses(metric.toAddress);
    });

    const addressMetrics: AddressMetric[] = [];

    addressMap.forEach((metrics, address) => {
      const totalVolume = metrics.reduce((sum, m) => {
        return (BigInt(sum) + BigInt(m.amount)).toString();
      }, '0');

      const avgDuration =
        metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      const successCount = metrics.filter((m) => m.status === 'success').length;
      const successRate = (successCount / metrics.length) * 100;

      addressMetrics.push({
        address,
        transactionCount: metrics.length,
        totalVolume,
        avgDuration,
        successRate,
        lastActivity: Math.max(...metrics.map((m) => m.timestamp)),
      });
    });

    return addressMetrics
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, limit);
  }

  /**
   * Export metrics
   */
  exportMetrics(): { metrics: TransactionMetric[]; exportedAt: number } {
    return {
      metrics: Array.from(this.metrics.values()),
      exportedAt: Date.now(),
    };
  }

  /**
   * Import metrics
   */
  importMetrics(data: {
    metrics: TransactionMetric[];
    exportedAt: number;
  }): void {
    data.metrics.forEach((metric) => {
      this.metrics.set(metric.id, metric);
    });
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics.clear();
    this.anomalies.clear();
    this.lastAnalysisTime = 0;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): TransactionMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metric count
   */
  getMetricCount(): number {
    return this.metrics.size;
  }

  /**
   * Calculate statistics
   */
  private calculateStats(metrics: TransactionMetric[]): AnalyticsData {
    if (metrics.length === 0) {
      return {
        totalTransactions: 0,
        successRate: 0,
        avgDuration: 0,
        totalVolume: '0',
        byPrivacyLevel: {},
        byStatus: {},
        timeSeriesData: [],
        topAddresses: [],
        peakHours: [],
        averageAmount: '0',
        medianDuration: 0,
      };
    }

    const byPrivacyLevel: Record<number, number> = {};
    const byStatus: Record<string, number> = {};
    let totalVolume = BigInt(0);
    let totalDuration = 0;

    metrics.forEach((m) => {
      byPrivacyLevel[m.privacyLevel] = (byPrivacyLevel[m.privacyLevel] || 0) + 1;
      byStatus[m.status] = (byStatus[m.status] || 0) + 1;
      totalVolume += BigInt(m.amount);
      totalDuration += m.duration;
    });

    const successCount = byStatus['success'] || 0;
    const successRate = (successCount / metrics.length) * 100;
    const avgDuration = totalDuration / metrics.length;
    const averageAmount = (totalVolume / BigInt(metrics.length)).toString();

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const medianDuration =
      durations.length % 2 === 0
        ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
        : durations[Math.floor(durations.length / 2)];

    return {
      totalTransactions: metrics.length,
      successRate,
      avgDuration,
      totalVolume: totalVolume.toString(),
      byPrivacyLevel,
      byStatus,
      timeSeriesData: [],
      topAddresses: [],
      peakHours: [],
      averageAmount,
      medianDuration,
    };
  }

  /**
   * Get anomalies
   */
  getAnomalies(): AnomalyAlert[] {
    return Array.from(this.anomalies.values());
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(daysOld: number): number {
    const cutoffTime = Date.now() - daysOld * 86400000;
    let count = 0;

    this.metrics.forEach((metric, id) => {
      if (metric.timestamp < cutoffTime) {
        this.metrics.delete(id);
        count++;
      }
    });

    return count;
  }
}
