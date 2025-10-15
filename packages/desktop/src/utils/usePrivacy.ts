/**
 * usePrivacy - React Hook for Privacy State Management
 * Manages privacy levels, preferences, and history
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  PrivacyLevel,
  PrivacyManager,
  PrivacyPreferences,
  PrivacyHistoryEntry,
  PrivacyStatistics,
} from './manager';
import { PrivacyValidator } from './validator';

/**
 * Privacy Hook State
 */
export interface PrivacyHookState {
  selectedLevel: PrivacyLevel;
  preferences: PrivacyPreferences;
  history: PrivacyHistoryEntry[];
  statistics: PrivacyStatistics;
  isLoading: boolean;
  error: string | null;
}

/**
 * usePrivacy Hook
 */
export function usePrivacy(initialPreferences?: Partial<PrivacyPreferences>) {
  const managerRef = useRef<PrivacyManager | null>(null);
  const validatorRef = useRef<PrivacyValidator | null>(null);

  const [state, setState] = useState<PrivacyHookState>({
    selectedLevel: PrivacyLevel.FULL_PRIVATE,
    preferences: {},
    history: [],
    statistics: {
      totalTransactions: 0,
      publicCount: 0,
      semiPrivateCount: 0,
      fullPrivateCount: 0,
      averagePrivacyLevel: 0,
      totalGasSpentOnPrivacy: '0',
    },
    isLoading: false,
    error: null,
  });

  /**
   * Initialize manager and validator
   */
  useEffect(() => {
    try {
      managerRef.current = PrivacyManager.getInstance(initialPreferences);
      validatorRef.current = new PrivacyValidator(managerRef.current);

      setState((prev) => ({
        ...prev,
        selectedLevel: managerRef.current!.getPreferences().defaultLevel,
        preferences: managerRef.current!.getPreferences(),
        history: managerRef.current!.getHistory(),
        statistics: managerRef.current!.getStatistics(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to initialize privacy manager: ${error}`,
      }));
    }
  }, []);

  /**
   * Set privacy level
   */
  const setPrivacyLevel = useCallback((level: PrivacyLevel) => {
    if (!managerRef.current) return;

    const validation = managerRef.current.validatePrivacyLevel(
      level,
      (managerRef.current.getPreferences() as any).maxGasPremiumPercent
    );

    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        error: validation.reason || 'Invalid privacy level',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      selectedLevel: level,
      error: null,
    }));
  }, []);

  /**
   * Get available privacy levels
   */
  const getAvailableLevels = useCallback((): PrivacyLevel[] => {
    if (!managerRef.current) return [];
    return managerRef.current.getAvailableLevels();
  }, []);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(
    (updates: Partial<PrivacyPreferences>) => {
      if (!managerRef.current) return;

      try {
        const updated = managerRef.current.updatePreferences(updates);

        setState((prev) => ({
          ...prev,
          preferences: updated,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to update preferences: ${error}`,
        }));
      }
    },
    []
  );

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    if (!managerRef.current) return;

    try {
      const defaults = managerRef.current.resetToDefaults();

      setState((prev) => ({
        ...prev,
        preferences: defaults,
        selectedLevel: defaults.defaultLevel,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to reset preferences: ${error}`,
      }));
    }
  }, []);

  /**
   * Calculate privacy cost
   */
  const calculatePrivacyCost = useCallback(
    (
      baseGasPrice: string,
      baseGasAmount: string,
      level: PrivacyLevel
    ) => {
      if (!managerRef.current) return null;

      try {
        return managerRef.current.calculatePrivacyCost(
          baseGasPrice,
          baseGasAmount,
          level
        );
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to calculate privacy cost: ${error}`,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Get privacy recommendation
   */
  const getRecommendation = useCallback(
    (
      txAmount: string,
      gasCostPublic: string,
      gasCostPrivate: string
    ): PrivacyLevel | null => {
      if (!managerRef.current) return null;

      try {
        return managerRef.current.getRecommendation(
          txAmount,
          gasCostPublic,
          gasCostPrivate
        );
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to get recommendation: ${error}`,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Add history entry
   */
  const addHistoryEntry = useCallback(
    (entry: Omit<PrivacyHistoryEntry, 'id'>) => {
      if (!managerRef.current) return null;

      try {
        const id = managerRef.current.addHistoryEntry(entry);

        setState((prev) => ({
          ...prev,
          history: managerRef.current!.getHistory(),
          statistics: managerRef.current!.getStatistics(),
          error: null,
        }));

        return id;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to add history entry: ${error}`,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Get history entries
   */
  const getHistory = useCallback((limit?: number) => {
    if (!managerRef.current) return [];
    return managerRef.current.getHistory(limit);
  }, []);

  /**
   * Get history by level
   */
  const getHistoryByLevel = useCallback((level: PrivacyLevel) => {
    if (!managerRef.current) return [];
    return managerRef.current.getHistoryByLevel(level);
  }, []);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    if (!managerRef.current) return;

    try {
      managerRef.current.clearHistory();

      setState((prev) => ({
        ...prev,
        history: [],
        statistics: managerRef.current!.getStatistics(),
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to clear history: ${error}`,
      }));
    }
  }, []);

  /**
   * Get statistics
   */
  const getStatistics = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.getStatistics();
  }, []);

  /**
   * Export settings
   */
  const exportSettings = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.exportSettings();
  }, []);

  /**
   * Import settings
   */
  const importSettings = useCallback(
    (data: {
      preferences?: PrivacyPreferences;
      history?: PrivacyHistoryEntry[];
    }) => {
      if (!managerRef.current) return;

      try {
        managerRef.current.importSettings(data);

        setState((prev) => ({
          ...prev,
          preferences: managerRef.current!.getPreferences(),
          history: managerRef.current!.getHistory(),
          statistics: managerRef.current!.getStatistics(),
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to import settings: ${error}`,
        }));
      }
    },
    []
  );

  /**
   * Validate transaction privacy
   */
  const validateTransaction = useCallback(
    (txData: {
      txType: 'shield' | 'transfer' | 'unshield';
      from: string;
      to: string;
      amount: string;
      gasCostPublic: string;
      gasCostPrivate: string;
      estimatedTime: number;
    }) => {
      if (!validatorRef.current) return null;

      try {
        return validatorRef.current.validateTransaction({
          ...txData,
          selectedLevel: state.selectedLevel,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to validate transaction: ${error}`,
        }));
        return null;
      }
    },
    [state.selectedLevel]
  );

  /**
   * Get privacy level description
   */
  const getDescription = useCallback((level: PrivacyLevel) => {
    if (!managerRef.current) return '';
    return managerRef.current.getDescription(level);
  }, []);

  /**
   * Get privacy level benefits
   */
  const getBenefits = useCallback((level: PrivacyLevel) => {
    if (!managerRef.current) return [];
    return managerRef.current.getBenefits(level);
  }, []);

  /**
   * Get privacy impact
   */
  const getPrivacyImpact = useCallback((level: PrivacyLevel) => {
    if (!validatorRef.current) return null;
    return validatorRef.current.getPrivacyImpact(level);
  }, []);

  return {
    // State
    selectedLevel: state.selectedLevel,
    preferences: state.preferences,
    history: state.history,
    statistics: state.statistics,
    isLoading: state.isLoading,
    error: state.error,

    // Privacy level management
    setPrivacyLevel,
    getAvailableLevels,
    getDescription,
    getBenefits,

    // Preferences
    updatePreferences,
    resetPreferences,

    // Calculations
    calculatePrivacyCost,
    getRecommendation,
    getPrivacyImpact,

    // History management
    addHistoryEntry,
    getHistory,
    getHistoryByLevel,
    clearHistory,

    // Statistics
    getStatistics,

    // Import/Export
    exportSettings,
    importSettings,

    // Validation
    validateTransaction,
  };
}

/**
 * usePrivacy Hook return type
 */
export type UsePrivacyReturn = ReturnType<typeof usePrivacy>;
