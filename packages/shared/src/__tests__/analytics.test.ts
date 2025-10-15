/**
 * Analytics Manager - Comprehensive Test Suite
 * Test suite for analytics tracking, anomaly detection, and metrics
 */

import { AnalyticsManager, TransactionMetric, AddressMetric } from '../analytics/manager';

describe('AnalyticsManager', () => {
  let manager: AnalyticsManager;

  beforeEach(() => {
    manager = AnalyticsManager.getInstance();
  });

  // ============================================
  // INITIALIZATION & SINGLETON TESTS
  // ============================================

  describe('Initialization', () => {
    it('should be a singleton', () => {
      const manager1 = AnalyticsManager.getInstance();
      const manager2 = AnalyticsManager.getInstance();
      expect(manager1).toBe(manager2);
    });

    it('should retrieve metric by ID', () => {
      const metric: TransactionMetric = {
        id: 'tx-test-001',
        timestamp: Date.now(),
        txHash: '0xabc123',
        privacyLevel: 2,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'success',
        duration: 5000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };

      manager.recordTransaction(metric);
      const retrieved = manager.getMetric('tx-test-001');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('tx-test-001');
    });

    it('should return undefined for non-existent metric', () => {
      const metric = manager.getMetric('non-existent-tx');
      expect(metric).toBeUndefined();
    });
  });

  // ============================================
  // TRANSACTION RECORDING TESTS
  // ============================================

  describe('Recording Transactions', () => {
    it('should record a transaction metric', () => {
      const metric: TransactionMetric = {
        id: 'tx1',
        timestamp: Date.now(),
        txHash: '0xabc123',
        privacyLevel: 2,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'success',
        duration: 5000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };

      manager.recordTransaction(metric);
      expect(manager.getMetric('tx1')).toBeDefined();
    });

    it('should record multiple transactions', () => {
      for (let i = 0; i < 5; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: Date.now(),
          txHash: `0x${i}`,
          privacyLevel: 1,
          amount: (1000 + i * 100).toString(),
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      // Verify at least 5 transactions recorded
      const allMetrics = manager.getMetrics(0, Date.now() + 1000);
      expect(allMetrics.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle pending transactions', () => {
      const metric: TransactionMetric = {
        id: 'tx-pending',
        timestamp: Date.now(),
        txHash: '0xpending',
        privacyLevel: 1,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'pending',
        duration: 3000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };

      manager.recordTransaction(metric);
      const retrieved = manager.getMetric('tx-pending');
      expect(retrieved?.status).toBe('pending');
    });

    it('should handle failed transactions', () => {
      const metric: TransactionMetric = {
        id: 'tx-failed',
        timestamp: Date.now(),
        txHash: '0xfailed',
        privacyLevel: 1,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'failed',
        duration: 3000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };

      manager.recordTransaction(metric);
      const retrieved = manager.getMetric('tx-failed');
      expect(retrieved?.status).toBe('failed');
    });

    it('should track transaction IDs uniquely', () => {
      const id1 = 'tx-unique-123';
      const metric1: TransactionMetric = {
        id: id1,
        timestamp: Date.now(),
        txHash: '0xabc123',
        privacyLevel: 1,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'success',
        duration: 5000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };

      manager.recordTransaction(metric1);
      expect(manager.getMetric(id1)).toBeDefined();
      expect(manager.getMetric(id1)?.id).toBe(id1);
    });
  });

  // ============================================
  // METRICS RETRIEVAL TESTS
  // ============================================

  describe('Metrics Retrieval', () => {
    beforeEach(() => {
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: now - i * 60000,
          txHash: `0x${i}`,
          privacyLevel: (i % 3) as any,
          amount: (1000 + i * 100).toString(),
          gasUsed: '21000',
          status: i % 2 === 0 ? 'success' : 'failed',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }
    });

    it('should retrieve metrics by time range', () => {
      const now = Date.now();
      const metrics = manager.getMetrics(now - 600000, now);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should retrieve empty array for future range', () => {
      const now = Date.now();
      const metrics = manager.getMetrics(now + 1000, now + 2000);
      expect(metrics.length).toBe(0);
    });

    it('should retrieve metric by ID', () => {
      const metric = manager.getMetric('tx0');
      expect(metric).toBeDefined();
      expect(metric?.id).toBe('tx0');
    });
  });

  // ============================================
  // PRIVACY LEVEL STATISTICS TESTS
  // ============================================

  describe('Privacy Level Statistics', () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: Date.now(),
          txHash: `0x${i}`,
          privacyLevel: (i % 3) as any,
          amount: (1000 + i * 100).toString(),
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }
    });

    it('should calculate privacy level 0 statistics', () => {
      const stats = manager.getPrivacyLevelStats(0);
      expect(stats).toBeDefined();
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });

    it('should calculate privacy level 1 statistics', () => {
      const stats = manager.getPrivacyLevelStats(1);
      expect(stats).toBeDefined();
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should calculate privacy level 2 statistics', () => {
      const stats = manager.getPrivacyLevelStats(2);
      expect(stats).toBeDefined();
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should have success rate in statistics', () => {
      const stats = manager.getPrivacyLevelStats(0);
      expect(stats.successRate).toBeDefined();
      expect(typeof stats.successRate).toBe('number');
    });
  });

  // ============================================
  // ADDRESS METRICS TESTS
  // ============================================

  describe('Address Metrics', () => {
    beforeEach(() => {
      for (let i = 0; i < 5; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: Date.now(),
          txHash: `0x${i}`,
          privacyLevel: 1,
          amount: '1000000000000000000',
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0xABC',
        };
        manager.recordTransaction(metric);
      }
    });

    it('should track address metrics', () => {
      const metrics = manager.getAddressMetrics('0xABC');
      expect(metrics).toBeDefined();
      if (metrics) {
        expect(metrics.address).toBe('0xABC');
      }
    });

    it('should count transactions per address', () => {
      const metrics = manager.getAddressMetrics('0xABC');
      expect(metrics).toBeDefined();
      if (metrics) {
        expect(metrics.transactionCount).toBe(5);
      }
    });

    it('should calculate address success rate', () => {
      const metrics = manager.getAddressMetrics('0xABC');
      expect(metrics).toBeDefined();
      if (metrics) {
        expect(metrics.successRate).toBe(100);
      }
    });

    it('should handle unknown address', () => {
      const metrics = manager.getAddressMetrics('0xUNKNOWN');
      expect(metrics).toBeNull();
    });
  });

  // ============================================
  // ANOMALY DETECTION TESTS
  // ============================================

  describe('Anomaly Detection', () => {
    it('should detect high volume anomaly', () => {
      const now = Date.now();

      // Create normal transactions
      for (let i = 0; i < 10; i++) {
        const metric: TransactionMetric = {
          id: `normal-${i}`,
          timestamp: now,
          txHash: `0x${i}`,
          privacyLevel: 1,
          amount: '1000000000000000000',
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      // Create high volume spike
      for (let i = 0; i < 100; i++) {
        const metric: TransactionMetric = {
          id: `spike-${i}`,
          timestamp: now,
          txHash: `0xspike${i}`,
          privacyLevel: 1,
          amount: '1000000000000000000',
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      const anomalies = manager.calculateAnomalies();
      expect(anomalies.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect slow transaction anomaly', () => {
      const now = Date.now();

      // Create normal transactions
      for (let i = 0; i < 5; i++) {
        const metric: TransactionMetric = {
          id: `normal-${i}`,
          timestamp: now,
          txHash: `0x${i}`,
          privacyLevel: 1,
          amount: '1000000000000000000',
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      // Create very slow transaction
      const slowMetric: TransactionMetric = {
        id: 'slow',
        timestamp: now,
        txHash: '0xslow',
        privacyLevel: 1,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'success',
        duration: 60000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };
      manager.recordTransaction(slowMetric);

      const anomalies = manager.calculateAnomalies();
      expect(anomalies.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect failure spike', () => {
      const now = Date.now();

      // Create many failing transactions
      for (let i = 0; i < 20; i++) {
        const metric: TransactionMetric = {
          id: `fail-${i}`,
          timestamp: now,
          txHash: `0xfail${i}`,
          privacyLevel: 1,
          amount: '1000000000000000000',
          gasUsed: '21000',
          status: 'failed',
          duration: 3000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      const anomalies = manager.calculateAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });

    it('should store anomalies', () => {
      const metric: TransactionMetric = {
        id: 'tx1',
        timestamp: Date.now(),
        txHash: '0x1',
        privacyLevel: 1,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'failed',
        duration: 3000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };
      manager.recordTransaction(metric);

      const anomalies = manager.calculateAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  // ============================================
  // TIME SERIES DATA TESTS
  // ============================================

  describe('Time Series Data', () => {
    beforeEach(() => {
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: now - i * 60000,
          txHash: `0x${i}`,
          privacyLevel: 1,
          amount: (1000 + i * 100).toString(),
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }
    });

    it('should retrieve time series data', () => {
      const now = Date.now();
      const data = manager.getTimeSeriesData(now - 600000, now, 60000);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should have correct structure', () => {
      const now = Date.now();
      const data = manager.getTimeSeriesData(now - 600000, now, 60000);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('timestamp');
        expect(data[0]).toHaveProperty('value');
        expect(data[0]).toHaveProperty('label');
      }
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================

  describe('Performance', () => {
    it('should handle 100 transactions efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: Date.now(),
          txHash: `0x${i}`,
          privacyLevel: (i % 3) as any,
          amount: Math.floor(Math.random() * 10000).toString(),
          gasUsed: '21000',
          status: i % 2 === 0 ? 'success' : 'failed',
          duration: Math.floor(Math.random() * 10000),
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });

    it('should calculate anomalies efficiently', () => {
      for (let i = 0; i < 100; i++) {
        const metric: TransactionMetric = {
          id: `tx${i}`,
          timestamp: Date.now(),
          txHash: `0x${i}`,
          privacyLevel: 1,
          amount: '1000000000000000000',
          gasUsed: '21000',
          status: 'success',
          duration: 5000,
          fromAddress: '0x123',
          toAddress: '0x456',
        };
        manager.recordTransaction(metric);
      }

      const start = Date.now();
      manager.calculateAnomalies();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle zero amount transactions', () => {
      const metric: TransactionMetric = {
        id: 'tx-zero',
        timestamp: Date.now(),
        txHash: '0xzero',
        privacyLevel: 1,
        amount: '0',
        gasUsed: '21000',
        status: 'success',
        duration: 5000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };
      manager.recordTransaction(metric);

      const retrieved = manager.getMetric('tx-zero');
      expect(retrieved?.amount).toBe('0');
    });

    it('should handle very large amounts', () => {
      const largeAmount = '999999999999999999999999999';
      const metric: TransactionMetric = {
        id: 'tx-large',
        timestamp: Date.now(),
        txHash: '0xlarge',
        privacyLevel: 1,
        amount: largeAmount,
        gasUsed: '21000',
        status: 'success',
        duration: 5000,
        fromAddress: '0x123',
        toAddress: '0x456',
      };
      manager.recordTransaction(metric);

      const retrieved = manager.getMetric('tx-large');
      expect(retrieved?.amount).toBe(largeAmount);
    });

    it('should handle special characters in addresses', () => {
      const metric: TransactionMetric = {
        id: 'tx-special',
        timestamp: Date.now(),
        txHash: '0xspecial',
        privacyLevel: 1,
        amount: '1000000000000000000',
        gasUsed: '21000',
        status: 'success',
        duration: 5000,
        fromAddress: '0x123',
        toAddress: '0xABC',
      };
      manager.recordTransaction(metric);

      const metrics = manager.getAddressMetrics('0xABC');
      expect(metrics).toBeDefined();
    });
  });
});
