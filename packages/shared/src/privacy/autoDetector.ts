/**
 * Privacy Auto-Detector - Intelligent Privacy Level Recommendation
 * Analyzes transactions and recommends appropriate privacy levels
 */

/**
 * Risk Factor
 */
export interface RiskFactor {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

/**
 * Privacy Recommendation
 */
export interface PrivacyRecommendation {
  recommendedLevel: number;
  confidence: number;
  reasons: string[];
  alternativeLevels: number[];
  riskFactors: RiskFactor[];
  riskScore: number;
}

/**
 * User Profile
 */
export interface UserProfile {
  userId: string;
  averageTransactionAmount: string;
  transactionFrequency: number;
  preferredPrivacyLevel: number;
  historicalRiskLevel: 'low' | 'medium' | 'high';
  trustedAddresses: string[];
}

/**
 * Transaction Context
 */
export interface TransactionContext {
  amount: string;
  from: string;
  to: string;
  frequency: number;
  recentTransactions: any[];
  userProfile: UserProfile;
}

/**
 * Privacy Auto-Detector
 */
export class PrivacyAutoDetector {
  private userProfiles: Map<string, UserProfile>;
  private anomalyThresholds: Map<string, number>;
  private learningData: any[];

  constructor() {
    this.userProfiles = new Map();
    this.anomalyThresholds = new Map([
      ['highVolume', 5], // 5x normal
      ['unusual_recipient', 0.8], // 80% confidence threshold
      ['rapid_succession', 10], // 10 transactions in 1 minute
    ]);
    this.learningData = [];
  }

  /**
   * Analyze transaction and recommend privacy level
   */
  analyzeTransaction(context: TransactionContext): PrivacyRecommendation {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    // Analyze transaction amount
    const amountRisk = this.analyzeAmount(context.amount, context.userProfile);
    if (amountRisk) {
      riskFactors.push(amountRisk);
      riskScore += amountRisk.weight;
    }

    // Analyze recipient
    const recipientRisk = this.analyzeRecipient(context.to, context.userProfile);
    if (recipientRisk) {
      riskFactors.push(recipientRisk);
      riskScore += recipientRisk.weight;
    }

    // Analyze frequency
    const frequencyRisk = this.analyzeFrequency(context.frequency, context.recentTransactions);
    if (frequencyRisk) {
      riskFactors.push(frequencyRisk);
      riskScore += frequencyRisk.weight;
    }

    // Analyze patterns
    const patternRisk = this.analyzePattern(context.recentTransactions);
    if (patternRisk) {
      riskFactors.push(patternRisk);
      riskScore += patternRisk.weight;
    }

    // Detect anomalies
    const anomalies = this.detectAnomalies(context.userProfile);
    riskFactors.push(...anomalies);
    riskScore += anomalies.reduce((sum, a) => sum + a.weight, 0);

    // Determine recommended level
    const recommendation = this.getRecommendation(riskScore, context.userProfile);

    return {
      recommendedLevel: recommendation.level,
      confidence: recommendation.confidence,
      reasons: recommendation.reasons,
      alternativeLevels: this.getAlternativeLevels(recommendation.level),
      riskFactors,
      riskScore: Math.min(100, riskScore),
    };
  }

  /**
   * Analyze transaction amount
   */
  private analyzeAmount(amount: string, profile: UserProfile): RiskFactor | null {
    try {
      const amountBig = BigInt(amount);
      const avgAmountBig = BigInt(profile.averageTransactionAmount || '0');

      if (avgAmountBig === BigInt(0)) return null;

      const ratio = Number(amountBig) / Number(avgAmountBig);

      if (ratio > 10) {
        return {
          name: 'Unusually High Amount',
          severity: 'high',
          description: `Transaction amount is ${ratio.toFixed(1)}x the user's average`,
          weight: 30,
        };
      }

      if (ratio > 5) {
        return {
          name: 'High Amount',
          severity: 'medium',
          description: `Transaction amount is ${ratio.toFixed(1)}x the user's average`,
          weight: 15,
        };
      }

      if (ratio < 0.1) {
        return {
          name: 'Very Small Amount',
          severity: 'low',
          description: 'Transaction is unusually small',
          weight: 5,
        };
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  /**
   * Analyze recipient address
   */
  private analyzeRecipient(toAddress: string, profile: UserProfile): RiskFactor | null {
    const isTrusted = profile.trustedAddresses.includes(toAddress);

    if (!isTrusted) {
      return {
        name: 'Unknown Recipient',
        severity: 'medium',
        description: 'Recipient address is not in trusted list',
        weight: 20,
      };
    }

    return null;
  }

  /**
   * Analyze transaction frequency
   */
  private analyzeFrequency(frequency: number, recentTransactions: any[]): RiskFactor | null {
    const rapidThreshold = this.anomalyThresholds.get('rapid_succession') || 10;

    if (frequency > rapidThreshold) {
      return {
        name: 'Rapid Transactions',
        severity: 'high',
        description: `${frequency} transactions in recent period`,
        weight: 25,
      };
    }

    if (frequency > rapidThreshold / 2) {
      return {
        name: 'High Frequency',
        severity: 'medium',
        description: `${frequency} transactions in recent period`,
        weight: 15,
      };
    }

    return null;
  }

  /**
   * Analyze transaction patterns
   */
  private analyzePattern(recentTransactions: any[]): RiskFactor | null {
    if (recentTransactions.length < 3) return null;

    const amounts = recentTransactions.map((t) => BigInt(t.amount));
    const uniqueAmounts = new Set(amounts.map((a) => a.toString()));

    // Check for unusual variance
    const variance = this.calculateVariance(amounts);
    if (variance > 0.8) {
      return {
        name: 'Unusual Pattern',
        severity: 'low',
        description: 'Transaction amounts show unusual variance',
        weight: 10,
      };
    }

    // Check for repeating recipients
    const recipients = recentTransactions.map((t) => t.to);
    const uniqueRecipients = new Set(recipients);

    if (uniqueRecipients.size === 1) {
      return {
        name: 'Single Recipient Pattern',
        severity: 'low',
        description: 'All recent transactions to same recipient',
        weight: 5,
      };
    }

    return null;
  }

  /**
   * Calculate variance
   */
  private calculateVariance(amounts: bigint[]): number {
    if (amounts.length === 0) return 0;

    const avgBig = amounts.reduce((a, b) => a + b, BigInt(0)) / BigInt(amounts.length);
    const avg = Number(avgBig);

    const variance =
      amounts.reduce((sum, amt) => {
        const diff = Number(amt) - avg;
        return sum + diff * diff;
      }, 0) / amounts.length;

    return Math.sqrt(variance) / Math.max(avg, 1);
  }

  /**
   * Detect anomalies
   */
  private detectAnomalies(profile: UserProfile): RiskFactor[] {
    const anomalies: RiskFactor[] = [];

    if (profile.historicalRiskLevel === 'high') {
      anomalies.push({
        name: 'High Risk Profile',
        severity: 'high',
        description: 'User has high historical risk level',
        weight: 20,
      });
    }

    if (profile.historicalRiskLevel === 'medium') {
      anomalies.push({
        name: 'Medium Risk Profile',
        severity: 'medium',
        description: 'User has medium historical risk level',
        weight: 10,
      });
    }

    return anomalies;
  }

  /**
   * Get recommendation
   */
  private getRecommendation(
    riskScore: number,
    profile: UserProfile
  ): { level: number; confidence: number; reasons: string[] } {
    const reasons: string[] = [];
    let level = profile.preferredPrivacyLevel;
    let confidence = 100;

    if (riskScore > 80) {
      level = 2; // FULL_PRIVATE
      confidence = 95;
      reasons.push('High risk detected - maximum privacy recommended');
    } else if (riskScore > 50) {
      level = 1; // SEMI_PRIVATE
      confidence = 85;
      reasons.push('Medium risk detected - standard encryption recommended');
    } else if (riskScore > 20) {
      level = Math.max(profile.preferredPrivacyLevel, 1);
      confidence = 75;
      reasons.push('Low-medium risk detected');
    } else {
      level = profile.preferredPrivacyLevel;
      confidence = 90;
      reasons.push('Low risk - user preference applied');
    }

    return { level, confidence, reasons };
  }

  /**
   * Get alternative levels
   */
  private getAlternativeLevels(baseLevel: number): number[] {
    const alternatives: number[] = [];

    if (baseLevel !== 0) alternatives.push(0);
    if (baseLevel !== 1) alternatives.push(1);
    if (baseLevel !== 2) alternatives.push(2);

    return alternatives.filter((l) => l !== baseLevel);
  }

  /**
   * Learn from user choice
   */
  learnFromUser(context: TransactionContext, userChoice: number): void {
    this.learningData.push({
      context,
      userChoice,
      timestamp: Date.now(),
    });

    // Update user profile
    const profile = this.getOrCreateProfile(context.userProfile.userId);
    profile.preferredPrivacyLevel = userChoice;
  }

  /**
   * Get or create user profile
   */
  private getOrCreateProfile(userId: string): UserProfile {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        averageTransactionAmount: '0',
        transactionFrequency: 0,
        preferredPrivacyLevel: 1,
        historicalRiskLevel: 'low',
        trustedAddresses: [],
      };
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, updates: Partial<UserProfile>): void {
    const profile = this.getOrCreateProfile(userId);
    Object.assign(profile, updates);
  }

  /**
   * Register trusted address
   */
  registerTrustedAddress(userId: string, address: string): void {
    const profile = this.getOrCreateProfile(userId);
    if (!profile.trustedAddresses.includes(address)) {
      profile.trustedAddresses.push(address);
    }
  }

  /**
   * Get learning insights
   */
  getLearningInsights(): {
    totalLearningPoints: number;
    averageConfidence: number;
    preferredLevels: Record<number, number>;
  } {
    const totalPoints = this.learningData.length;

    const confidenceSum = this.learningData.reduce((sum, data) => {
      return sum + 80; // Average confidence from learning
    }, 0);

    const avgConfidence = totalPoints > 0 ? confidenceSum / totalPoints : 0;

    const preferredLevels: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    this.learningData.forEach((data) => {
      preferredLevels[data.userChoice] = (preferredLevels[data.userChoice] || 0) + 1;
    });

    return {
      totalLearningPoints: totalPoints,
      averageConfidence: avgConfidence,
      preferredLevels,
    };
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.userProfiles.clear();
    this.learningData = [];
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): UserProfile[] {
    return Array.from(this.userProfiles.values());
  }
}
