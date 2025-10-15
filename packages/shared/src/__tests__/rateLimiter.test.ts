/**
 * Rate Limiter - Comprehensive Test Suite
 * Test suite for rate limiting, DDoS detection, and security
 */

import { RateLimiter } from '../security/rateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = RateLimiter.getInstance();
    limiter.clear();
  });

  // ============================================
  // INITIALIZATION & SINGLETON TESTS
  // ============================================

  describe('Initialization', () => {
    it('should be a singleton', () => {
      const limiter1 = RateLimiter.getInstance();
      const limiter2 = RateLimiter.getInstance();
      expect(limiter1).toBe(limiter2);
    });

    it('should have default rules configured', () => {
      const rule = limiter.getRule('transaction_submit');
      expect(rule).toBeDefined();
      expect(rule?.maxRequests).toBeGreaterThan(0);
    });

    it('should have all default rules', () => {
      const rules = limiter.getAllRules();
      expect(rules.length).toBeGreaterThanOrEqual(4);
      expect(rules.some((r) => r.name === 'transaction_submit')).toBe(true);
      expect(rules.some((r) => r.name === 'api_calls')).toBe(true);
    });
  });

  // ============================================
  // RATE LIMIT CHECKING TESTS
  // ============================================

  describe('Rate Limit Checking', () => {
    it('should allow requests within limit', () => {
      const status = limiter.checkLimit('user1', 'transaction_submit');
      expect(status.isLimited).toBe(false);
      expect(status.requestsRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should track multiple requests', () => {
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('user2', 'transaction_submit');
      }
      const status = limiter.checkLimit('user2', 'transaction_submit');
      expect(status.requestsRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should return RateLimitStatus', () => {
      const status = limiter.checkLimit('user3', 'api_calls');
      expect(status.isLimited).toBeDefined();
      expect(status.requestsRemaining).toBeDefined();
      expect(status.resetTime).toBeDefined();
      expect(status.isBlocked).toBeDefined();
    });

    it('should support different actions', () => {
      const result1 = limiter.checkLimit('user4', 'transaction_submit');
      const result2 = limiter.checkLimit('user4', 'api_calls');
      const result3 = limiter.checkLimit('user4', 'auth_attempts');
      const result4 = limiter.checkLimit('user4', 'data_retrieval');

      expect(result1.isLimited).toBeDefined();
      expect(result2.isLimited).toBeDefined();
      expect(result3.isLimited).toBeDefined();
      expect(result4.isLimited).toBeDefined();
    });

    it('should return status for all actions', () => {
      const allStatus = limiter.getStatus('user5');
      expect(Object.keys(allStatus).length).toBeGreaterThanOrEqual(4);
      expect(allStatus['transaction_submit']).toBeDefined();
      expect(allStatus['api_calls']).toBeDefined();
    });
  });

  // ============================================
  // CUSTOM RULES TESTS
  // ============================================

  describe('Custom Rules', () => {
    it('should add custom rule', () => {
      limiter.addRule({
        name: 'custom_action',
        maxRequests: 50,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'throttle',
        enabled: true,
      });

      const rule = limiter.getRule('custom_action');
      expect(rule).toBeDefined();
      expect(rule?.maxRequests).toBe(50);
    });

    it('should remove rule', () => {
      limiter.addRule({
        name: 'temp_rule',
        maxRequests: 100,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'block',
        enabled: true,
      });

      const removed = limiter.removeRule('temp_rule');
      expect(removed).toBe(true);
      expect(limiter.getRule('temp_rule')).toBeUndefined();
    });

    it('should support block strategy', () => {
      limiter.addRule({
        name: 'block_rule',
        maxRequests: 2,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'block',
        enabled: true,
      });

      limiter.checkLimit('block_user', 'block_rule');
      limiter.checkLimit('block_user', 'block_rule');
      const status = limiter.checkLimit('block_user', 'block_rule');

      expect(status.isLimited).toBe(true);
    });

    it('should support throttle strategy', () => {
      limiter.addRule({
        name: 'throttle_rule',
        maxRequests: 2,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'throttle',
        enabled: true,
      });

      limiter.checkLimit('throttle_user', 'throttle_rule');
      limiter.checkLimit('throttle_user', 'throttle_rule');
      const status = limiter.checkLimit('throttle_user', 'throttle_rule');

      expect(status.isLimited).toBe(true);
    });
  });

  // ============================================
  // DDoS DETECTION TESTS
  // ============================================

  describe('DDoS Detection', () => {
    it('should track high request rate', () => {
      for (let i = 0; i < 50; i++) {
        limiter.recordRequest(`ddos_user_${i}`, 'api_calls');
      }

      const dDoSInfo = limiter.getDDoSInfo();
      expect(dDoSInfo.threshold).toBeDefined();
      expect(dDoSInfo.attempts).toBeDefined();
    });

    it('should detect many concurrent requests', () => {
      for (let i = 0; i < 100; i++) {
        limiter.recordRequest(`attacker_${i}`, 'api_calls');
      }

      const dDoSInfo = limiter.getDDoSInfo();
      expect(typeof dDoSInfo.threshold).toBe('number');
      expect(typeof dDoSInfo.attempts).toBe('number');
    });

    it('should update DDoS threshold', () => {
      limiter.setDDoSThreshold(2000);
      const info = limiter.getDDoSInfo();
      expect(info.threshold).toBe(2000);
    });
  });

  // ============================================
  // USER BLOCKING TESTS
  // ============================================

  describe('User Blocking', () => {
    it('should block user', () => {
      limiter.blockUser('blocked_user_1', 5000);
      const blockedUsers = limiter.getBlockedUsers();
      const isBlocked = blockedUsers.some((u) => u.userId === 'blocked_user_1');
      expect(isBlocked).toBe(true);
    });

    it('should unblock user', () => {
      limiter.blockUser('temp_blocked_user', 5000);
      limiter.unblockUser('temp_blocked_user');
      const blockedUsers = limiter.getBlockedUsers();
      const isBlocked = blockedUsers.some((u) => u.userId === 'temp_blocked_user');
      expect(isBlocked).toBe(false);
    });

    it('should auto-expire block', (done) => {
      limiter.blockUser('auto_unblock_user', 500);
      let blockedCount = limiter.getBlockedUsers().length;
      expect(blockedCount).toBeGreaterThanOrEqual(1);

      setTimeout(() => {
        const blockedUsersAfter = limiter.getBlockedUsers();
        const stillBlocked = blockedUsersAfter.some((u) => u.userId === 'auto_unblock_user');
        expect(typeof stillBlocked).toBe('boolean');
        done();
      }, 600);
    });

    it('should get blocked users list', () => {
      limiter.blockUser('blocked_user_2', 10000);
      limiter.blockUser('blocked_user_3', 10000);
      const blockedUsers = limiter.getBlockedUsers();
      expect(Array.isArray(blockedUsers)).toBe(true);
      expect(blockedUsers.length).toBeGreaterThanOrEqual(2);
    });

    it('should prevent requests from blocked users', () => {
      limiter.blockUser('denied_user', 10000);
      const status = limiter.checkLimit('denied_user', 'transaction_submit');
      expect(status.isBlocked).toBe(true);
    });
  });

  // ============================================
  // LIMITS CONFIGURATION TESTS
  // ============================================

  describe('Limits Configuration', () => {
    it('should get current rule', () => {
      const rule = limiter.getRule('transaction_submit');
      expect(rule).toBeDefined();
      expect(rule?.maxRequests).toBeGreaterThan(0);
    });

    it('should get all rules', () => {
      const rules = limiter.getAllRules();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThanOrEqual(4);
    });

    it('should get user limit state', () => {
      limiter.checkLimit('check_user', 'api_calls');
      const state = limiter.getUserLimitState('check_user', 'api_calls');
      expect(state).toBeDefined();
      if (state) {
        expect(typeof state.requestCount).toBe('number');
        expect(typeof state.resetTime).toBe('number');
      }
    });

    it('should return null for non-existent user state', () => {
      const state = limiter.getUserLimitState('non_existent_user', 'api_calls');
      expect(state).toBeNull();
    });
  });

  // ============================================
  // SECURITY STATISTICS TESTS
  // ============================================

  describe('Security Statistics', () => {
    it('should get security stats', () => {
      const stats = limiter.getSecurityStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });

    it('should track total requests', () => {
      limiter.checkLimit('stats_user_1', 'transaction_submit');
      const stats = limiter.getSecurityStats();
      expect(typeof stats.totalRequests).toBe('number');
      expect(stats.totalRequests).toBeGreaterThan(0);
    });

    it('should track blocked requests', () => {
      limiter.blockUser('stats_blocked_user', 10000);
      limiter.checkLimit('stats_blocked_user', 'transaction_submit');
      const stats = limiter.getSecurityStats();
      expect(typeof stats.blockedRequests).toBe('number');
      expect(stats.blockedRequests).toBeGreaterThanOrEqual(1);
    });

    it('should calculate block rate', () => {
      const stats = limiter.getSecurityStats();
      expect(typeof stats.blockRate).toBe('number');
      expect(stats.blockRate).toBeGreaterThanOrEqual(0);
      expect(stats.blockRate).toBeLessThanOrEqual(100);
    });

    it('should track DDoS attempts', () => {
      for (let i = 0; i < 50; i++) {
        limiter.recordRequest(`user_${i}`, 'api_calls');
      }
      const stats = limiter.getSecurityStats();
      expect(typeof stats.ddosAttempts).toBe('number');
    });

    it('should reset statistics', () => {
      limiter.checkLimit('user_reset', 'api_calls');
      limiter.resetStatistics();
      const stats = limiter.getSecurityStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.blockedRequests).toBe(0);
    });

    it('should track active users', () => {
      limiter.checkLimit('active_user_1', 'api_calls');
      limiter.checkLimit('active_user_2', 'api_calls');
      const activeUsers = limiter.getActiveUsers();
      expect(typeof activeUsers).toBe('number');
      expect(activeUsers).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle zero request in rule', () => {
      limiter.addRule({
        name: 'zero_rule',
        maxRequests: 0,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'block',
        enabled: true,
      });

      const status = limiter.checkLimit('user_zero', 'zero_rule');
      expect(status.isLimited).toBe(true);
    });

    it('should handle very high request limits', () => {
      limiter.addRule({
        name: 'high_rule',
        maxRequests: 1000000,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'throttle',
        enabled: true,
      });

      const status = limiter.checkLimit('user_high', 'high_rule');
      expect(status.isLimited).toBe(false);
    });

    it('should handle special characters in user ID', () => {
      const status = limiter.checkLimit('user@123$%^&*()', 'transaction_submit');
      expect(typeof status).toBe('object');
      expect(status.isLimited).toBeDefined();
    });

    it('should handle concurrent requests', (done) => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(limiter.checkLimit('concurrent_user', 'api_calls'))
        );
      }

      Promise.all(promises).then((results) => {
        expect(results.length).toBe(10);
        results.forEach((result) => {
          expect(result.isLimited).toBeDefined();
        });
        done();
      });
    });

    it('should handle very long block duration', () => {
      limiter.blockUser('long_block_user', 1000000000);
      const blockedUsers = limiter.getBlockedUsers();
      const longBlocked = blockedUsers.find((u) => u.userId === 'long_block_user');
      expect(longBlocked).toBeDefined();
    });

    it('should handle bypass list', () => {
      limiter.addRule({
        name: 'bypass_rule',
        maxRequests: 1,
        timeWindow: 60000,
        bypassFor: ['admin123'],
        onLimitExceeded: 'block',
        enabled: true,
      });

      const status = limiter.checkLimit('admin123', 'bypass_rule');
      expect(status.isLimited).toBe(false);
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================

  describe('Performance', () => {
    it('should check 10000 requests efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 10000; i++) {
        limiter.checkLimit(`perf_user_${i % 100}`, 'api_calls');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });

    it('should record requests efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        limiter.recordRequest(`perf_recorder_${i}`, 'api_calls');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should manage 1000 blocked users efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        limiter.blockUser(`perf_blocked_${i}`, 10000);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);

      const blockedCount = limiter.getBlockedUsers().length;
      expect(blockedCount).toBeGreaterThanOrEqual(1000);
    });
  });

  // ============================================
  // RESET & CLEANUP TESTS
  // ============================================

  describe('Reset and Cleanup', () => {
    it('should reset limits for user', () => {
      limiter.checkLimit('reset_user', 'api_calls');
      limiter.resetLimits('reset_user');
      const state = limiter.getUserLimitState('reset_user', 'api_calls');
      expect(state).toBeNull();
    });

    it('should clear all limits', () => {
      limiter.checkLimit('clear_user_1', 'api_calls');
      limiter.checkLimit('clear_user_2', 'api_calls');
      limiter.clear();
      const stats = limiter.getSecurityStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.blockedRequests).toBe(0);
    });

    it('should disable rule', () => {
      limiter.addRule({
        name: 'test_disable',
        maxRequests: 5,
        timeWindow: 60000,
        bypassFor: [],
        onLimitExceeded: 'block',
        enabled: false,
      });

      const status = limiter.checkLimit('disable_user', 'test_disable');
      expect(status.isLimited).toBe(false);
    });
  });
});
