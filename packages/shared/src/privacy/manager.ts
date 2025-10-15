/**
 * Privacy Manager - Core Privacy Level Management
 * Handles privacy levels, preferences, and calculations
 */

/**
 * Privacy Levels Enum
 */
export enum PrivacyLevel {
  PUBLIC = 'public', // 0% privacy - standard blockchain
  SEMI_PRIVATE = 'semi-private', // 50% privacy - partial obfuscation
  FULL_PRIVATE = 'full-private', // 100% privacy - Railgun shielded
}

/**
 * Privacy Level Score
 */
export type PrivacyScore = 0 | 50 | 100;

/**
 * Privacy Preferences
 */
export interface PrivacyPreferences {
  defaultLevel: PrivacyLevel;
  autoSelectLevel: boolean;
  allowSemiPrivate: boolean;
  allowPublic: boolean;
  trackPrivacyHistory: boolean;
  maxGasPremiumPercent: number; // Max acceptable gas premium for privacy
}

/**
 * Privacy History Entry
 */
export interface PrivacyHistoryEntry {
  id: string;
  timestamp: number;
  level: PrivacyLevel;
  txHash?: string;
  txType: 'shield' | 'transfer' | 'unshield' | 'unknown';
  gasCost: string;
  privacyGainPercent: number;
  notes?: string;
}

/**
 * Privacy Statistics
 */
export interface PrivacyStatistics {
  totalTransactions: number;
  publicCount: number;
  semiPrivateCount: number;
  fullPrivateCount: number;
  averagePrivacyLevel: PrivacyScore;
  totalGasSpentOnPrivacy: string;
  lastPrivateTransaction?: number;
}

/**
 * Privacy Cost Info
 */
export interface PrivacyCostInfo {
  level: PrivacyLevel;
  baseGasCost: string;
  privacyGasPremium: string;
  totalGasCost: string;
  gasPremiumPercent: number;
  estimatedTime: number; // milliseconds
  privacyBenefit: string;
}

/**
 * Default Privacy Preferences
 */
const DEFAULT_PREFERENCES: PrivacyPreferences = {
  defaultLevel: PrivacyLevel.FULL_PRIVATE,
  autoSelectLevel: false,
  allowSemiPrivate: true,
  allowPublic: true,
  trackPrivacyHistory: true,
  maxGasPremiumPercent: 50, // Max 50% gas premium
};

/**
 * Privacy Level to Score mapping
 */
const PRIVACY_LEVEL_SCORES: Record<PrivacyLevel, PrivacyScore> = {
  [PrivacyLevel.PUBLIC]: 0,
  [PrivacyLevel.SEMI_PRIVATE]: 50,
  [PrivacyLevel.FULL_PRIVATE]: 100,
};

/**
 * Privacy Level Descriptions
 */
export const PRIVACY_DESCRIPTIONS: Record<PrivacyLevel, string> = {
  [PrivacyLevel.PUBLIC]: 'Standard blockchain transaction - no privacy',
  [PrivacyLevel.SEMI_PRIVATE]: 'Partial privacy - amount and recipient hidden',
  [PrivacyLevel.FULL_PRIVATE]: 'Full privacy - all details hidden via Railgun',
};

/**
 * Privacy Benefits
 */
export const PRIVACY_BENEFITS: Record<PrivacyLevel, string[]> = {
  [PrivacyLevel.PUBLIC]: [
    'Fastest transactions',
    'No gas premium',
    'Standard confirmations',
  ],
  [PrivacyLevel.SEMI_PRIVATE]: [
    'Amount hidden',
    'Recipient private',
    'Moderate gas premium',
  ],
  [PrivacyLevel.FULL_PRIVATE]: [
    'Complete privacy',
    'Sender hidden',
    'Amount hidden',
    'Recipient hidden',
    'No blockchain trace',
  ],
};

/**
 * Privacy Manager Class
 */
export class PrivacyManager {
  private static instance: PrivacyManager | null = null;
  private preferences: PrivacyPreferences;
  private history: Map<string, PrivacyHistoryEntry> = new Map();
  private stats: PrivacyStatistics = {
    totalTransactions: 0,
    publicCount: 0,
    semiPrivateCount: 0,
    fullPrivateCount: 0,
    averagePrivacyLevel: 0,
    totalGasSpentOnPrivacy: '0',
  };

  private constructor(preferences?: Partial<PrivacyPreferences>) {
    this.preferences = {
      ...DEFAULT_PREFERENCES,
      ...preferences,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(
    preferences?: Partial<PrivacyPreferences>
  ): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager(preferences);
    }
    return PrivacyManager.instance;
  }

  /**
   * Reset singleton (for testing)
   */
  public static reset(): void {
    PrivacyManager.instance = null;
  }

  /**
   * Get privacy level score (0-100)
   */
  public getPrivacyScore(level: PrivacyLevel): PrivacyScore {
    return PRIVACY_LEVEL_SCORES[level];
  }

  /**
   * Get privacy level description
   */
  public getDescription(level: PrivacyLevel): string {
    return PRIVACY_DESCRIPTIONS[level];
  }

  /**
   * Get privacy benefits
   */
  public getBenefits(level: PrivacyLevel): string[] {
    return PRIVACY_BENEFITS[level];
  }

  /**
   * Check if privacy level is allowed
   */
  public isLevelAllowed(level: PrivacyLevel): boolean {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return this.preferences.allowPublic;
      case PrivacyLevel.SEMI_PRIVATE:
        return this.preferences.allowSemiPrivate;
      case PrivacyLevel.FULL_PRIVATE:
        return true; // Always allowed
    }
  }

  /**
   * Get available privacy levels
   */
  public getAvailableLevels(): PrivacyLevel[] {
    const levels: PrivacyLevel[] = [PrivacyLevel.FULL_PRIVATE];

    if (this.preferences.allowSemiPrivate) {
      levels.push(PrivacyLevel.SEMI_PRIVATE);
    }

    if (this.preferences.allowPublic) {
      levels.push(PrivacyLevel.PUBLIC);
    }

    return levels;
  }

  /**
   * Calculate privacy cost
   */
  public calculatePrivacyCost(
    baseGasPrice: string,
    baseGasAmount: string,
    level: PrivacyLevel
  ): PrivacyCostInfo {
    try {
      const base = BigInt(baseGasPrice) * BigInt(baseGasAmount);

      // Calculate premium based on privacy level
      let premiumPercent = 0;
      let estimatedTime = 0;

      switch (level) {
        case PrivacyLevel.PUBLIC:
          premiumPercent = 0;
          estimatedTime = 10000; // ~10 seconds
          break;

        case PrivacyLevel.SEMI_PRIVATE:
          premiumPercent = 15; // 15% premium
          estimatedTime = 20000; // ~20 seconds
          break;

        case PrivacyLevel.FULL_PRIVATE:
          premiumPercent = 35; // 35% premium
          estimatedTime = 45000; // ~45 seconds
          break;
      }

      const premiumAmount = (base * BigInt(premiumPercent)) / BigInt(100);
      const totalGas = base + premiumAmount;

      return {
        level,
        baseGasCost: base.toString(),
        privacyGasPremium: premiumAmount.toString(),
        totalGasCost: totalGas.toString(),
        gasPremiumPercent: premiumPercent,
        estimatedTime,
        privacyBenefit: this.getDescription(level),
      };
    } catch (error) {
      throw new Error(`Failed to calculate privacy cost: ${error}`);
    }
  }

  /**
   * Get privacy recommendation
   */
  public getRecommendation(
    txAmount: string,
    gasCostPublic: string,
    gasCostFull: string
  ): PrivacyLevel {
    try {
      const amount = BigInt(txAmount);
      const gasDiff =
        BigInt(gasCostFull) - BigInt(gasCostPublic);
      const gasDiffPercent = Number(
        (gasDiff * BigInt(100)) / BigInt(gasCostPublic)
      );

      // If transaction is large, recommend full privacy
      if (amount > BigInt('10000000000000000000')) {
        // > 10 ETH
        if (
          gasDiffPercent <= this.preferences.maxGasPremiumPercent &&
          this.preferences.allowPublic
        ) {
          return PrivacyLevel.FULL_PRIVATE;
        }
      }

      // For moderate amounts, suggest semi-private
      if (
        amount > BigInt('1000000000000000000') &&
        this.preferences.allowSemiPrivate
      ) {
        // > 1 ETH
        return PrivacyLevel.SEMI_PRIVATE;
      }

      // For small amounts, public is fine
      if (this.preferences.allowPublic) {
        return PrivacyLevel.PUBLIC;
      }

      return this.preferences.defaultLevel;
    } catch (error) {
      return this.preferences.defaultLevel;
    }
  }

  /**
   * Add history entry
   */
  public addHistoryEntry(entry: Omit<PrivacyHistoryEntry, 'id'>): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullEntry: PrivacyHistoryEntry = { ...entry, id };

    if (this.preferences.trackPrivacyHistory) {
      this.history.set(id, fullEntry);
      this.updateStatistics();
    }

    return id;
  }

  /**
   * Get history entry
   */
  public getHistoryEntry(id: string): PrivacyHistoryEntry | undefined {
    return this.history.get(id);
  }

  /**
   * Get all history entries
   */
  public getHistory(limit?: number): PrivacyHistoryEntry[] {
    const entries = Array.from(this.history.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );

    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Get history by level
   */
  public getHistoryByLevel(level: PrivacyLevel): PrivacyHistoryEntry[] {
    return this.getHistory().filter((entry) => entry.level === level);
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.history.clear();
    this.updateStatistics();
  }

  /**
   * Update statistics
   */
  private updateStatistics(): void {
    const entries = this.getHistory();

    this.stats.totalTransactions = entries.length;
    this.stats.publicCount = entries.filter(
      (e) => e.level === PrivacyLevel.PUBLIC
    ).length;
    this.stats.semiPrivateCount = entries.filter(
      (e) => e.level === PrivacyLevel.SEMI_PRIVATE
    ).length;
    this.stats.fullPrivateCount = entries.filter(
      (e) => e.level === PrivacyLevel.FULL_PRIVATE
    ).length;

    // Calculate average privacy level
    const totalScore = entries.reduce(
      (sum, e) => sum + this.getPrivacyScore(e.level),
      0
    );
    this.stats.averagePrivacyLevel = (
      entries.length > 0 ? totalScore / entries.length : 0
    ) as PrivacyScore;

    // Calculate total gas spent on privacy
    this.stats.totalGasSpentOnPrivacy = entries
      .reduce((sum, e) => sum + BigInt(e.gasCost), BigInt(0))
      .toString();

    // Get last private transaction time
    const lastPrivate = entries.find(
      (e) => e.level === PrivacyLevel.FULL_PRIVATE
    );
    this.stats.lastPrivateTransaction = lastPrivate?.timestamp;
  }

  /**
   * Get statistics
   */
  public getStatistics(): PrivacyStatistics {
    return { ...this.stats };
  }

  /**
   * Get preferences
   */
  public getPreferences(): PrivacyPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  public updatePreferences(
    updates: Partial<PrivacyPreferences>
  ): PrivacyPreferences {
    this.preferences = {
      ...this.preferences,
      ...updates,
    };
    return this.getPreferences();
  }

  /**
   * Reset to defaults
   */
  public resetToDefaults(): PrivacyPreferences {
    this.preferences = { ...DEFAULT_PREFERENCES };
    return this.getPreferences();
  }

  /**
   * Export privacy settings (for backup)
   */
  public exportSettings(): {
    preferences: PrivacyPreferences;
    history: PrivacyHistoryEntry[];
  } {
    return {
      preferences: this.getPreferences(),
      history: this.getHistory(),
    };
  }

  /**
   * Import privacy settings (for restore)
   */
  public importSettings(data: {
    preferences?: PrivacyPreferences;
    history?: PrivacyHistoryEntry[];
  }): void {
    if (data.preferences) {
      this.updatePreferences(data.preferences);
    }

    if (data.history && Array.isArray(data.history)) {
      data.history.forEach((entry) => {
        this.history.set(entry.id, entry);
      });
      this.updateStatistics();
    }
  }

  /**
   * Get privacy level from transaction type
   */
  public getLevelFromTxType(
    txType: 'shield' | 'transfer' | 'unshield'
  ): PrivacyLevel {
    switch (txType) {
      case 'shield':
      case 'unshield':
        return PrivacyLevel.SEMI_PRIVATE;
      case 'transfer':
        return PrivacyLevel.FULL_PRIVATE;
      default:
        return this.preferences.defaultLevel;
    }
  }

  /**
   * Validate privacy level for transaction
   */
  public validatePrivacyLevel(
    level: PrivacyLevel,
    gasPremiumPercent: number
  ): {
    valid: boolean;
    reason?: string;
  } {
    if (!this.isLevelAllowed(level)) {
      return {
        valid: false,
        reason: `Privacy level ${level} is not allowed`,
      };
    }

    if (gasPremiumPercent > this.preferences.maxGasPremiumPercent) {
      return {
        valid: false,
        reason: `Gas premium ${gasPremiumPercent}% exceeds maximum ${this.preferences.maxGasPremiumPercent}%`,
      };
    }

    return { valid: true };
  }
}

/**
 * Get default privacy manager
 */
export function getPrivacyManager(
  preferences?: Partial<PrivacyPreferences>
): PrivacyManager {
  return PrivacyManager.getInstance(preferences);
}

/**
 * Helper: Get privacy level display name
 */
export function getPrivacyLevelName(level: PrivacyLevel): string {
  switch (level) {
    case PrivacyLevel.PUBLIC:
      return 'Public';
    case PrivacyLevel.SEMI_PRIVATE:
      return 'Semi-Private';
    case PrivacyLevel.FULL_PRIVATE:
      return 'Full Private';
  }
}

/**
 * Helper: Get privacy level icon
 */
export function getPrivacyLevelIcon(level: PrivacyLevel): string {
  switch (level) {
    case PrivacyLevel.PUBLIC:
      return '🌐';
    case PrivacyLevel.SEMI_PRIVATE:
      return '🔒';
    case PrivacyLevel.FULL_PRIVATE:
      return '🔐';
  }
}

/**
 * Helper: Get privacy level color (CSS)
 */
export function getPrivacyLevelColor(level: PrivacyLevel): string {
  switch (level) {
    case PrivacyLevel.PUBLIC:
      return '#ef4444'; // Red
    case PrivacyLevel.SEMI_PRIVATE:
      return '#f59e0b'; // Amber
    case PrivacyLevel.FULL_PRIVATE:
      return '#10b981'; // Green
  }
}
