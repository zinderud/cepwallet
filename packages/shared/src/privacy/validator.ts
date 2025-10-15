/**
 * Privacy Validator - Transaction Privacy Validation
 * Validates privacy levels and configurations
 */

import {
  PrivacyLevel,
  PrivacyManager,
  PrivacyPreferences,
} from './manager';

/**
 * Privacy Validation Result
 */
export interface PrivacyValidationResult {
  valid: boolean;
  warnings: string[];
  suggestions: string[];
  recommendedLevel?: PrivacyLevel;
}

/**
 * Privacy Requirements
 */
export interface PrivacyRequirements {
  minPrivacyLevel?: PrivacyLevel;
  maxGasPremiumPercent?: number;
  requireFullPrivacy?: boolean;
  compatibleLevels?: PrivacyLevel[];
}

/**
 * Transaction Privacy Info
 */
export interface TransactionPrivacyInfo {
  txHash?: string;
  txType: 'shield' | 'transfer' | 'unshield' | 'unknown';
  selectedLevel: PrivacyLevel;
  from: string;
  to: string;
  amount: string;
  gasCostPublic: string;
  gasCostPrivate: string;
  estimatedTime: number;
}

/**
 * Privacy Validator Class
 */
export class PrivacyValidator {
  private manager: PrivacyManager;

  constructor(manager: PrivacyManager) {
    this.manager = manager;
  }

  /**
   * Validate privacy level for transaction
   */
  public validatePrivacyLevel(
    level: PrivacyLevel,
    requirements?: PrivacyRequirements
  ): PrivacyValidationResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if level is allowed
    if (!this.manager.isLevelAllowed(level)) {
      return {
        valid: false,
        warnings: [`Privacy level ${level} is not allowed by current settings`],
        suggestions: [
          `Enable ${level} in privacy settings or choose a different level`,
        ],
      };
    }

    // Check minimum privacy requirement
    if (requirements?.minPrivacyLevel) {
      const minScore = this.manager.getPrivacyScore(
        requirements.minPrivacyLevel
      );
      const levelScore = this.manager.getPrivacyScore(level);

      if (levelScore < minScore) {
        return {
          valid: false,
          warnings: [
            `Selected privacy level is below minimum requirement (${requirements.minPrivacyLevel})`,
          ],
          suggestions: [
            `Select at least ${requirements.minPrivacyLevel} privacy level`,
          ],
        };
      }
    }

    // Check full privacy requirement
    if (
      requirements?.requireFullPrivacy &&
      level !== PrivacyLevel.FULL_PRIVATE
    ) {
      return {
        valid: false,
        warnings: ['This transaction requires full privacy'],
        suggestions: ['Select Full Private privacy level'],
      };
    }

    // Check compatible levels
    if (requirements?.compatibleLevels && !requirements.compatibleLevels.includes(level)) {
      return {
        valid: false,
        warnings: [
          `Privacy level ${level} is not compatible with this transaction type`,
        ],
        suggestions: [
          `Use one of these levels: ${requirements.compatibleLevels.join(', ')}`,
        ],
      };
    }

    return {
      valid: true,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate transaction with privacy
   */
  public validateTransaction(
    info: TransactionPrivacyInfo,
    requirements?: PrivacyRequirements
  ): PrivacyValidationResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let recommendedLevel: PrivacyLevel | undefined;

    // Validate privacy level
    const levelValidation = this.validatePrivacyLevel(
      info.selectedLevel,
      requirements
    );

    if (!levelValidation.valid) {
      return levelValidation;
    }

    // Check gas cost ratio
    try {
      const gasCostPublic = BigInt(info.gasCostPublic);
      const gasCostPrivate = BigInt(info.gasCostPrivate);
      const gapRatio = gasCostPrivate > BigInt(0)
        ? Number((gasCostPrivate * BigInt(100)) / gasCostPublic)
        : 0;

      if (
        info.selectedLevel === PrivacyLevel.FULL_PRIVATE &&
        gapRatio > this.manager.getPreferences().maxGasPremiumPercent
      ) {
        warnings.push(
          `Gas cost for full privacy is ${gapRatio}% higher than public transaction`
        );
        suggestions.push(
          `Consider using ${PrivacyLevel.SEMI_PRIVATE} to reduce costs`
        );
      }

      // Recommend optimal level
      recommendedLevel = this.manager.getRecommendation(
        info.amount,
        info.gasCostPublic,
        info.gasCostPrivate
      );

      if (
        recommendedLevel !== info.selectedLevel &&
        this.manager.isLevelAllowed(recommendedLevel)
      ) {
        suggestions.push(
          `Recommended privacy level: ${recommendedLevel} (better cost/privacy ratio)`
        );
      }
    } catch (error) {
      warnings.push('Could not calculate gas cost ratio');
    }

    // Validate addresses
    if (!this.isValidAddress(info.from)) {
      return {
        valid: false,
        warnings: ['Invalid sender address'],
        suggestions: ['Use a valid Ethereum address'],
      };
    }

    if (!this.isValidAddress(info.to)) {
      return {
        valid: false,
        warnings: ['Invalid recipient address'],
        suggestions: ['Use a valid Ethereum address'],
      };
    }

    // Check for self-transfer with privacy
    if (
      info.from.toLowerCase() === info.to.toLowerCase() &&
      info.selectedLevel !== PrivacyLevel.FULL_PRIVATE
    ) {
      warnings.push(
        'Sending to yourself - privacy will not hide the self-transfer'
      );
    }

    // Validate amount
    if (!this.isValidAmount(info.amount)) {
      return {
        valid: false,
        warnings: ['Invalid amount'],
        suggestions: ['Use a valid amount'],
      };
    }

    return {
      valid: true,
      warnings,
      suggestions,
      recommendedLevel,
    };
  }

  /**
   * Check if addresses match (for compatibility)
   */
  public validateAddressCompatibility(
    from: string,
    to: string,
    level: PrivacyLevel
  ): {
    valid: boolean;
    reason?: string;
  } {
    // Normalize addresses
    const fromNorm = from.toLowerCase();
    const toNorm = to.toLowerCase();

    // Check for self-transfer
    if (fromNorm === toNorm) {
      if (level === PrivacyLevel.PUBLIC) {
        return {
          valid: false,
          reason: 'Cannot send to yourself without privacy',
        };
      }
      // Self-transfer is ok with privacy
      return { valid: true };
    }

    return { valid: true };
  }

  /**
   * Validate privacy level for transaction type
   */
  public validateLevelForTxType(
    txType: 'shield' | 'transfer' | 'unshield',
    level: PrivacyLevel
  ): {
    valid: boolean;
    reason?: string;
  } {
    // Shield operations are Semi-Private (moving to private)
    if (txType === 'shield') {
      if (level === PrivacyLevel.PUBLIC) {
        return {
          valid: false,
          reason: 'Shield operations require at least Semi-Private',
        };
      }
      return { valid: true };
    }

    // Transfers can be any level
    if (txType === 'transfer') {
      return { valid: true };
    }

    // Unshield is Semi-Private (moving from private)
    if (txType === 'unshield') {
      if (level === PrivacyLevel.PUBLIC) {
        return {
          valid: false,
          reason: 'Unshield operations require at least Semi-Private',
        };
      }
      return { valid: true };
    }

    return { valid: true };
  }

  /**
   * Get compatible levels for transaction type
   */
  public getCompatibleLevels(
    txType: 'shield' | 'transfer' | 'unshield'
  ): PrivacyLevel[] {
    switch (txType) {
      case 'shield':
        return [PrivacyLevel.SEMI_PRIVATE, PrivacyLevel.FULL_PRIVATE];
      case 'transfer':
        return this.manager.getAvailableLevels();
      case 'unshield':
        return [PrivacyLevel.SEMI_PRIVATE, PrivacyLevel.FULL_PRIVATE];
      default:
        return this.manager.getAvailableLevels();
    }
  }

  /**
   * Recommend privacy level for transaction
   */
  public recommendLevel(
    txType: 'shield' | 'transfer' | 'unshield',
    amount: string,
    gasCostPublic: string,
    gasCostPrivate: string
  ): PrivacyLevel {
    // Get recommendation from manager
    let recommended = this.manager.getRecommendation(
      amount,
      gasCostPublic,
      gasCostPrivate
    );

    // Check if compatible with transaction type
    const compatible = this.getCompatibleLevels(txType);
    if (!compatible.includes(recommended)) {
      // Use first available compatible level
      recommended = compatible[0] || this.manager.getPreferences().defaultLevel;
    }

    return recommended;
  }

  /**
   * Validate address format
   */
  private isValidAddress(address: string): boolean {
    if (!address) return false;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
    return true;
  }

  /**
   * Validate amount format
   */
  private isValidAmount(amount: string): boolean {
    if (!amount) return false;

    try {
      const bigAmount = BigInt(amount);
      return bigAmount >= BigInt(0);
    } catch {
      return false;
    }
  }

  /**
   * Calculate privacy score for multiple transactions
   */
  public calculateAggregatePrivacy(
    transactions: Array<{ level: PrivacyLevel }>
  ): number {
    if (transactions.length === 0) return 0;

    const totalScore = transactions.reduce(
      (sum, tx) => sum + this.manager.getPrivacyScore(tx.level),
      0
    );

    return Math.round(totalScore / transactions.length);
  }

  /**
   * Get privacy impact report
   */
  public getPrivacyImpact(level: PrivacyLevel): {
    onChainVisibility: number; // 0-100 (0 = invisible, 100 = fully visible)
    anonymity: number; // 0-100 (0 = no anonymity, 100 = full anonymity)
    traceability: number; // 0-100 (0 = not traceable, 100 = fully traceable)
  } {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return {
          onChainVisibility: 100,
          anonymity: 0,
          traceability: 100,
        };

      case PrivacyLevel.SEMI_PRIVATE:
        return {
          onChainVisibility: 30,
          anonymity: 70,
          traceability: 20,
        };

      case PrivacyLevel.FULL_PRIVATE:
        return {
          onChainVisibility: 0,
          anonymity: 100,
          traceability: 0,
        };
    }
  }

  /**
   * Check if privacy configuration is optimal
   */
  public isOptimalConfiguration(preferences: PrivacyPreferences): {
    optimal: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check if user is only using public
    if (
      !preferences.allowSemiPrivate &&
      !preferences.allowPublic &&
      preferences.defaultLevel !== PrivacyLevel.FULL_PRIVATE
    ) {
      issues.push('No privacy levels enabled');
      suggestions.push('Enable at least one privacy level');
    }

    // Check if max gas premium is too high
    if (preferences.maxGasPremiumPercent > 100) {
      issues.push('Max gas premium percentage is unrealistic (>100%)');
      suggestions.push('Set max gas premium to 100% or lower');
    }

    // Check if max gas premium is too low for full privacy
    if (preferences.maxGasPremiumPercent < 20) {
      suggestions.push(
        'Max gas premium is very low - full privacy may be unavailable'
      );
    }

    return {
      optimal: issues.length === 0,
      issues,
      suggestions,
    };
  }
}

/**
 * Create validator with default manager
 */
export function createPrivacyValidator(
  manager: PrivacyManager
): PrivacyValidator {
  return new PrivacyValidator(manager);
}
