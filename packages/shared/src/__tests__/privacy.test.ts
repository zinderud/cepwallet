/**
 * Privacy Management Tests
 * Tests for privacy manager, validator, and hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PrivacyLevel,
  PrivacyManager,
  PRIVACY_DESCRIPTIONS,
  PRIVACY_BENEFITS,
  getPrivacyLevelName,
  getPrivacyLevelIcon,
  getPrivacyLevelColor,
} from '../privacy/manager';
import { PrivacyValidator } from '../privacy/validator';

/**
 * Privacy Manager Tests
 */
describe('PrivacyManager', () => {
  beforeEach(() => {
    PrivacyManager.reset();
  });

  it('should initialize as singleton', () => {
    const manager1 = PrivacyManager.getInstance();
    const manager2 = PrivacyManager.getInstance();

    expect(manager1).toBe(manager2);
  });

  it('should get privacy score', () => {
    const manager = PrivacyManager.getInstance();

    expect(manager.getPrivacyScore(PrivacyLevel.PUBLIC)).toBe(0);
    expect(manager.getPrivacyScore(PrivacyLevel.SEMI_PRIVATE)).toBe(50);
    expect(manager.getPrivacyScore(PrivacyLevel.FULL_PRIVATE)).toBe(100);
  });

  it('should get privacy description', () => {
    const manager = PrivacyManager.getInstance();

    expect(manager.getDescription(PrivacyLevel.PUBLIC)).toBeTruthy();
    expect(manager.getDescription(PrivacyLevel.SEMI_PRIVATE)).toBeTruthy();
    expect(manager.getDescription(PrivacyLevel.FULL_PRIVATE)).toBeTruthy();
  });

  it('should get privacy benefits', () => {
    const manager = PrivacyManager.getInstance();

    const publicBenefits = manager.getBenefits(PrivacyLevel.PUBLIC);
    expect(Array.isArray(publicBenefits)).toBe(true);
    expect(publicBenefits.length).toBeGreaterThan(0);

    const fullPrivateBenefits = manager.getBenefits(PrivacyLevel.FULL_PRIVATE);
    expect(fullPrivateBenefits.length).toBeGreaterThan(publicBenefits.length);
  });

  it('should check if level is allowed', () => {
    const manager = PrivacyManager.getInstance({
      allowPublic: true,
      allowSemiPrivate: false,
    });

    expect(manager.isLevelAllowed(PrivacyLevel.FULL_PRIVATE)).toBe(true);
    expect(manager.isLevelAllowed(PrivacyLevel.PUBLIC)).toBe(true);
    expect(manager.isLevelAllowed(PrivacyLevel.SEMI_PRIVATE)).toBe(false);
  });

  it('should get available levels', () => {
    const manager = PrivacyManager.getInstance({
      allowPublic: true,
      allowSemiPrivate: false,
    });

    const levels = manager.getAvailableLevels();
    expect(levels).toContain(PrivacyLevel.FULL_PRIVATE);
    expect(levels).toContain(PrivacyLevel.PUBLIC);
    expect(levels).not.toContain(PrivacyLevel.SEMI_PRIVATE);
  });

  it('should calculate privacy cost', () => {
    const manager = PrivacyManager.getInstance();

    const publicCost = manager.calculatePrivacyCost('20000000000', '21000', PrivacyLevel.PUBLIC);
    const fullPrivateCost = manager.calculatePrivacyCost('20000000000', '21000', PrivacyLevel.FULL_PRIVATE);

    expect(parseInt(fullPrivateCost.totalGasCost) > parseInt(publicCost.totalGasCost)).toBe(true);
    expect(fullPrivateCost.gasPremiumPercent).toBeGreaterThan(publicCost.gasPremiumPercent);
  });

  it('should get privacy recommendation', () => {
    const manager = PrivacyManager.getInstance();

    // Large transaction should recommend full privacy
    const largeRecommendation = manager.getRecommendation(
      '10000000000000000000', // 10 ETH
      '420000000000', // public gas
      '567000000000' // full private gas
    );

    expect([PrivacyLevel.FULL_PRIVATE, PrivacyLevel.SEMI_PRIVATE]).toContain(largeRecommendation);
  });

  it('should add and retrieve history entries', () => {
    const manager = PrivacyManager.getInstance();

    const id = manager.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.FULL_PRIVATE,
      txType: 'transfer',
      gasCost: '630000000000',
      privacyGainPercent: 100,
    });

    const entry = manager.getHistoryEntry(id);
    expect(entry).toBeTruthy();
    expect(entry?.level).toBe(PrivacyLevel.FULL_PRIVATE);
  });

  it('should get history by level', () => {
    const manager = PrivacyManager.getInstance();

    manager.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.PUBLIC,
      txType: 'transfer',
      gasCost: '420000000000',
      privacyGainPercent: 0,
    });

    manager.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.FULL_PRIVATE,
      txType: 'transfer',
      gasCost: '630000000000',
      privacyGainPercent: 100,
    });

    const publicHistory = manager.getHistoryByLevel(PrivacyLevel.PUBLIC);
    expect(publicHistory.length).toBe(1);

    const fullPrivateHistory = manager.getHistoryByLevel(PrivacyLevel.FULL_PRIVATE);
    expect(fullPrivateHistory.length).toBe(1);
  });

  it('should update statistics', () => {
    const manager = PrivacyManager.getInstance();

    for (let i = 0; i < 3; i++) {
      manager.addHistoryEntry({
        timestamp: Date.now(),
        level: PrivacyLevel.FULL_PRIVATE,
        txType: 'transfer',
        gasCost: '630000000000',
        privacyGainPercent: 100,
      });
    }

    const stats = manager.getStatistics();
    expect(stats.totalTransactions).toBe(3);
    expect(stats.fullPrivateCount).toBe(3);
    expect(stats.averagePrivacyLevel).toBe(100);
  });

  it('should update preferences', () => {
    const manager = PrivacyManager.getInstance();

    const updated = manager.updatePreferences({
      defaultLevel: PrivacyLevel.SEMI_PRIVATE,
      maxGasPremiumPercent: 30,
    });

    expect(updated.defaultLevel).toBe(PrivacyLevel.SEMI_PRIVATE);
    expect(updated.maxGasPremiumPercent).toBe(30);
  });

  it('should export and import settings', () => {
    const manager1 = PrivacyManager.getInstance();

    manager1.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.FULL_PRIVATE,
      txType: 'transfer',
      gasCost: '630000000000',
      privacyGainPercent: 100,
    });

    const exported = manager1.exportSettings();
    expect(exported.history.length).toBe(1);

    PrivacyManager.reset();
    const manager2 = PrivacyManager.getInstance();
    manager2.importSettings(exported);

    const history = manager2.getHistory();
    expect(history.length).toBe(1);
  });
});

/**
 * Privacy Validator Tests
 */
describe('PrivacyValidator', () => {
  let manager: PrivacyManager;
  let validator: PrivacyValidator;

  beforeEach(() => {
    PrivacyManager.reset();
    manager = PrivacyManager.getInstance();
    validator = new PrivacyValidator(manager);
  });

  it('should validate privacy level', () => {
    const result = validator.validatePrivacyLevel(PrivacyLevel.FULL_PRIVATE);

    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(0);
  });

  it('should reject disallowed privacy level', () => {
    const manager2 = PrivacyManager.getInstance({
      allowSemiPrivate: false,
    });
    const validator2 = new PrivacyValidator(manager2);

    const result = validator2.validatePrivacyLevel(PrivacyLevel.SEMI_PRIVATE);

    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should validate transaction with privacy', () => {
    const result = validator.validateTransaction({
      txType: 'transfer',
      selectedLevel: PrivacyLevel.FULL_PRIVATE,
      from: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      amount: '1000000000000000000',
      gasCostPublic: '420000000000',
      gasCostPrivate: '630000000000',
      estimatedTime: 45000,
    });

    expect(result.valid).toBe(true);
  });

  it('should reject invalid sender address', () => {
    const result = validator.validateTransaction({
      txType: 'transfer',
      selectedLevel: PrivacyLevel.FULL_PRIVATE,
      from: 'invalid_address',
      to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      amount: '1000000000000000000',
      gasCostPublic: '420000000000',
      gasCostPrivate: '630000000000',
      estimatedTime: 45000,
    });

    expect(result.valid).toBe(false);
  });

  it('should validate address compatibility', () => {
    const result = validator.validateAddressCompatibility(
      '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      PrivacyLevel.FULL_PRIVATE
    );

    expect(result.valid).toBe(true);
  });

  it('should get compatible levels for transaction type', () => {
    const shieldLevels = validator.getCompatibleLevels('shield');
    expect(shieldLevels).toContain(PrivacyLevel.FULL_PRIVATE);
    expect(shieldLevels).toContain(PrivacyLevel.SEMI_PRIVATE);
    expect(shieldLevels).not.toContain(PrivacyLevel.PUBLIC);

    const transferLevels = validator.getCompatibleLevels('transfer');
    expect(transferLevels).toContain(PrivacyLevel.FULL_PRIVATE);
  });

  it('should recommend privacy level for transaction', () => {
    const recommended = validator.recommendLevel(
      'transfer',
      '10000000000000000000',
      '420000000000',
      '567000000000'
    );

    expect(recommended).toBeTruthy();
    expect([
      PrivacyLevel.PUBLIC,
      PrivacyLevel.SEMI_PRIVATE,
      PrivacyLevel.FULL_PRIVATE,
    ]).toContain(recommended);
  });

  it('should calculate aggregate privacy', () => {
    const transactions = [
      { level: PrivacyLevel.PUBLIC },
      { level: PrivacyLevel.SEMI_PRIVATE },
      { level: PrivacyLevel.FULL_PRIVATE },
    ];

    const aggregate = validator.calculateAggregatePrivacy(transactions);
    expect(aggregate).toBe(50); // Average of 0, 50, 100
  });

  it('should get privacy impact', () => {
    const publicImpact = validator.getPrivacyImpact(PrivacyLevel.PUBLIC);
    expect(publicImpact.onChainVisibility).toBe(100);
    expect(publicImpact.anonymity).toBe(0);

    const fullPrivateImpact = validator.getPrivacyImpact(PrivacyLevel.FULL_PRIVATE);
    expect(fullPrivateImpact.onChainVisibility).toBe(0);
    expect(fullPrivateImpact.anonymity).toBe(100);
  });

  it('should check optimal configuration', () => {
    const result = validator.isOptimalConfiguration(manager.getPreferences());

    expect(typeof result.optimal).toBe('boolean');
    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.suggestions)).toBe(true);
  });
});

/**
 * Helper Functions Tests
 */
describe('Privacy Helper Functions', () => {
  it('should get privacy level name', () => {
    expect(getPrivacyLevelName(PrivacyLevel.PUBLIC)).toBe('Public');
    expect(getPrivacyLevelName(PrivacyLevel.SEMI_PRIVATE)).toBe('Semi-Private');
    expect(getPrivacyLevelName(PrivacyLevel.FULL_PRIVATE)).toBe('Full Private');
  });

  it('should get privacy level icon', () => {
    expect(getPrivacyLevelIcon(PrivacyLevel.PUBLIC)).toBe('🌐');
    expect(getPrivacyLevelIcon(PrivacyLevel.SEMI_PRIVATE)).toBe('🔒');
    expect(getPrivacyLevelIcon(PrivacyLevel.FULL_PRIVATE)).toBe('🔐');
  });

  it('should get privacy level color', () => {
    expect(getPrivacyLevelColor(PrivacyLevel.PUBLIC)).toBe('#ef4444');
    expect(getPrivacyLevelColor(PrivacyLevel.SEMI_PRIVATE)).toBe('#f59e0b');
    expect(getPrivacyLevelColor(PrivacyLevel.FULL_PRIVATE)).toBe('#10b981');
  });

  it('should have descriptions for all levels', () => {
    expect(PRIVACY_DESCRIPTIONS[PrivacyLevel.PUBLIC]).toBeTruthy();
    expect(PRIVACY_DESCRIPTIONS[PrivacyLevel.SEMI_PRIVATE]).toBeTruthy();
    expect(PRIVACY_DESCRIPTIONS[PrivacyLevel.FULL_PRIVATE]).toBeTruthy();
  });

  it('should have benefits for all levels', () => {
    expect(PRIVACY_BENEFITS[PrivacyLevel.PUBLIC]).toBeTruthy();
    expect(PRIVACY_BENEFITS[PrivacyLevel.SEMI_PRIVATE]).toBeTruthy();
    expect(PRIVACY_BENEFITS[PrivacyLevel.FULL_PRIVATE]).toBeTruthy();
  });
});

/**
 * Integration Tests
 */
describe('Privacy Integration', () => {
  beforeEach(() => {
    PrivacyManager.reset();
  });

  it('should complete privacy flow from selection to history', () => {
    const manager = PrivacyManager.getInstance();
    const validator = new PrivacyValidator(manager);

    // User selects privacy level
    const selectedLevel = PrivacyLevel.FULL_PRIVATE;
    const validation = validator.validatePrivacyLevel(selectedLevel);
    expect(validation.valid).toBe(true);

    // Calculate costs
    const cost = manager.calculatePrivacyCost('20000000000', '21000', selectedLevel);
    expect(cost.totalGasCost).toBeTruthy();

    // Add to history
    const entryId = manager.addHistoryEntry({
      timestamp: Date.now(),
      level: selectedLevel,
      txType: 'transfer',
      gasCost: cost.totalGasCost,
      privacyGainPercent: 100,
      txHash: '0x123',
    });

    expect(entryId).toBeTruthy();

    // Check statistics
    const stats = manager.getStatistics();
    expect(stats.totalTransactions).toBe(1);
    expect(stats.fullPrivateCount).toBe(1);
  });

  it('should handle multiple transactions with different privacy levels', () => {
    const manager = PrivacyManager.getInstance();

    // Add transactions with different levels
    manager.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.PUBLIC,
      txType: 'transfer',
      gasCost: '420000000000',
      privacyGainPercent: 0,
    });

    manager.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.SEMI_PRIVATE,
      txType: 'transfer',
      gasCost: '483000000000',
      privacyGainPercent: 50,
    });

    manager.addHistoryEntry({
      timestamp: Date.now(),
      level: PrivacyLevel.FULL_PRIVATE,
      txType: 'transfer',
      gasCost: '630000000000',
      privacyGainPercent: 100,
    });

    const stats = manager.getStatistics();
    expect(stats.totalTransactions).toBe(3);
    expect(stats.averagePrivacyLevel).toBe(50);
  });
});
