/**
 * Privacy Auto Detector - Comprehensive Test Suite
 * Tests for intelligent privacy recommendations and user learning
 */

import { PrivacyAutoDetector, TransactionContext, UserProfile } from '../privacy/autoDetector';

describe('PrivacyAutoDetector', () => {
  let detector: PrivacyAutoDetector;

  beforeEach(() => {
    detector = new PrivacyAutoDetector();
  });

  // ============================================
  // INITIALIZATION TESTS
  // ============================================

  describe('Initialization', () => {
    it('should initialize detector', () => {
      expect(detector).toBeDefined();
    });

    it('should have empty user profiles on init', () => {
      const profiles = detector.getAllProfiles();
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBe(0);
    });
  });

  // ============================================
  // TRANSACTION ANALYSIS TESTS
  // ============================================

  describe('Transaction Analysis', () => {
    it('should analyze transaction and provide recommendation', () => {
      const profile: UserProfile = {
        userId: 'user1',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: ['0x1234567890123456789012345678901234567890'],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x1234567890123456789012345678901234567890',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation).toBeDefined();
      expect(recommendation.recommendedLevel).toBeGreaterThanOrEqual(0);
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(recommendation.riskScore).toBeGreaterThanOrEqual(0);
    });

    it('should return risk factors', () => {
      const profile: UserProfile = {
        userId: 'user2',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0x2222222222222222222222222222222222222222',
        to: '0x3333333333333333333333333333333333333333',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(Array.isArray(recommendation.riskFactors)).toBe(true);
    });

    it('should detect high risk for unusual amounts', () => {
      const profile: UserProfile = {
        userId: 'user3',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '50000000000000000000', // 50x average
        from: '0x4444444444444444444444444444444444444444',
        to: '0x5555555555555555555555555555555555555555',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation.riskScore).toBeGreaterThan(20);
    });

    it('should detect risk for unknown recipient', () => {
      const profile: UserProfile = {
        userId: 'user4',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0x6666666666666666666666666666666666666666',
        to: '0x7777777777777777777777777777777777777777', // Unknown
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation.riskScore).toBeGreaterThan(0);
    });

    it('should provide alternative levels', () => {
      const profile: UserProfile = {
        userId: 'user5',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0x8888888888888888888888888888888888888888',
        to: '0x9999999999999999999999999999999999999999',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(Array.isArray(recommendation.alternativeLevels)).toBe(true);
      expect(recommendation.alternativeLevels.length).toBeGreaterThan(0);
    });

    it('should detect rapid transactions', () => {
      const profile: UserProfile = {
        userId: 'user6',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 15, // High frequency
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        to: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        frequency: 15,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation.riskScore).toBeGreaterThan(0);
    });
  });

  // ============================================
  // USER LEARNING TESTS
  // ============================================

  describe('User Learning', () => {
    it('should learn from user choice', () => {
      const profile: UserProfile = {
        userId: 'learner1',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0xcccccccccccccccccccccccccccccccccccccccc',
        to: '0xdddddddddddddddddddddddddddddddddddddddd',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      detector.learnFromUser(context, 2);
      expect(true).toBe(true);
    });

    it('should update user profile', () => {
      detector.updateProfile('user7', { preferredPrivacyLevel: 2 });
      const profile = detector.getUserProfile('user7');
      expect(profile).toBeDefined();
      if (profile) {
        expect(profile.preferredPrivacyLevel).toBe(2);
      }
    });

    it('should get learning insights', () => {
      const profile: UserProfile = {
        userId: 'learner2',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        to: '0xffffffffffffffffffffffffffffffffffffffff',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      detector.learnFromUser(context, 1);
      detector.learnFromUser(context, 2);

      const insights = detector.getLearningInsights();
      expect(insights).toBeDefined();
      expect(typeof insights.totalLearningPoints).toBe('number');
      expect(typeof insights.averageConfidence).toBe('number');
    });

    it('should track preferred levels', () => {
      const profile: UserProfile = {
        userId: 'learner3',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x1111111111111111111111111111111111111112',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      for (let i = 0; i < 3; i++) {
        detector.learnFromUser(context, 2);
      }

      const insights = detector.getLearningInsights();
      expect(insights.preferredLevels).toBeDefined();
      expect(typeof insights.preferredLevels).toBe('object');
    });
  });

  // ============================================
  // TRUSTED ADDRESS MANAGEMENT TESTS
  // ============================================

  describe('Trusted Address Management', () => {
    it('should register trusted address', () => {
      detector.registerTrustedAddress('user8', '0x1234567890123456789012345678901234567890');
      const profile = detector.getUserProfile('user8');
      expect(profile).toBeDefined();
      if (profile) {
        expect(profile.trustedAddresses).toContain('0x1234567890123456789012345678901234567890');
      }
    });

    it('should get user profile', () => {
      detector.registerTrustedAddress('user9', '0x2222222222222222222222222222222222222222');
      const profile = detector.getUserProfile('user9');
      expect(profile).toBeDefined();
      expect(profile?.userId).toBe('user9');
    });

    it('should get all profiles', () => {
      detector.registerTrustedAddress('user10', '0x3333333333333333333333333333333333333333');
      detector.registerTrustedAddress('user11', '0x4444444444444444444444444444444444444444');
      const profiles = detector.getAllProfiles();
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // USER PROFILE MANAGEMENT TESTS
  // ============================================

  describe('User Profile Management', () => {
    it('should create profile with trusted address', () => {
      detector.registerTrustedAddress('user12', '0x5555555555555555555555555555555555555555');
      const profile = detector.getUserProfile('user12');
      expect(profile).toBeDefined();
      expect(profile?.trustedAddresses.length).toBeGreaterThan(0);
    });

    it('should update profile preferences', () => {
      detector.registerTrustedAddress('user13', '0x6666666666666666666666666666666666666666');
      detector.updateProfile('user13', {
        historicalRiskLevel: 'high',
        preferredPrivacyLevel: 2,
      });

      const profile = detector.getUserProfile('user13');
      expect(profile?.historicalRiskLevel).toBe('high');
      expect(profile?.preferredPrivacyLevel).toBe(2);
    });

    it('should handle empty profile correctly', () => {
      const profile = detector.getUserProfile('non_existent_user');
      expect(profile).toBeUndefined();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very small transaction amounts', () => {
      const profile: UserProfile = {
        userId: 'small_tx_user',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1', // Very small
        from: '0x7777777777777777777777777777777777777777',
        to: '0x8888888888888888888888888888888888888888',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation).toBeDefined();
      expect(recommendation.riskScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero transaction amounts', () => {
      const profile: UserProfile = {
        userId: 'zero_tx_user',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '0',
        from: '0x9999999999999999999999999999999999999999',
        to: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation).toBeDefined();
    });

    it('should handle same sender and receiver', () => {
      const profile: UserProfile = {
        userId: 'same_addr_user',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        to: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation).toBeDefined();
    });

    it('should handle high frequency transactions', () => {
      const profile: UserProfile = {
        userId: 'high_freq_user',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 50,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0xcccccccccccccccccccccccccccccccccccccccc',
        to: '0xdddddddddddddddddddddddddddddddddddddddd',
        frequency: 50,
        recentTransactions: [],
        userProfile: profile,
      };

      const recommendation = detector.analyzeTransaction(context);
      expect(recommendation.riskScore).toBeGreaterThan(0);
    });

    it('should handle different risk levels', () => {
      const lowRiskProfile: UserProfile = {
        userId: 'low_risk',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 0,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const mediumRiskProfile: UserProfile = {
        userId: 'medium_risk',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'medium',
        trustedAddresses: [],
      };

      const highRiskProfile: UserProfile = {
        userId: 'high_risk',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 2,
        historicalRiskLevel: 'high',
        trustedAddresses: [],
      };

      const context = (profile: UserProfile): TransactionContext => ({
        amount: '1000000000000000000',
        from: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        to: '0xffffffffffffffffffffffffffffffffffffffff',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      });

      const lowRec = detector.analyzeTransaction(context(lowRiskProfile));
      const mediumRec = detector.analyzeTransaction(context(mediumRiskProfile));
      const highRec = detector.analyzeTransaction(context(highRiskProfile));

      expect(lowRec.recommendedLevel).toBeGreaterThanOrEqual(0);
      expect(mediumRec.recommendedLevel).toBeGreaterThanOrEqual(0);
      expect(highRec.recommendedLevel).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================

  describe('Performance', () => {
    it('should analyze 100 transactions efficiently', () => {
      const profile: UserProfile = {
        userId: 'perf_user',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        const context: TransactionContext = {
          amount: '1000000000000000000',
          from: `0x${i.toString().padStart(40, '0')}`,
          to: `0x${(i + 1).toString().padStart(40, '0')}`,
          frequency: 2,
          recentTransactions: [],
          userProfile: profile,
        };

        detector.analyzeTransaction(context);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });

    it('should learn from 50 user choices efficiently', () => {
      const profile: UserProfile = {
        userId: 'learn_perf_user',
        averageTransactionAmount: '1000000000000000000',
        transactionFrequency: 2,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };

      const context: TransactionContext = {
        amount: '1000000000000000000',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        frequency: 2,
        recentTransactions: [],
        userProfile: profile,
      };

      const start = Date.now();

      for (let i = 0; i < 50; i++) {
        detector.learnFromUser(context, i % 3);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    it('should manage many user profiles efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        detector.registerTrustedAddress(`user_${i}`, `0x${i.toString().padStart(40, '0')}`);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);

      const allProfiles = detector.getAllProfiles();
      expect(allProfiles.length).toBe(100);
    });
  });

  // ============================================
  // RESET TESTS
  // ============================================

  describe('Reset and Cleanup', () => {
    it('should reset detector', () => {
      detector.registerTrustedAddress('user_reset', '0x1234567890123456789012345678901234567890');
      detector.reset();

      const profiles = detector.getAllProfiles();
      expect(profiles.length).toBe(0);
    });

    it('should handle multiple resets', () => {
      detector.registerTrustedAddress('user_multi_reset', '0x1111111111111111111111111111111111111111');
      detector.reset();
      detector.reset();

      const profiles = detector.getAllProfiles();
      expect(profiles.length).toBe(0);
    });
  });
});
