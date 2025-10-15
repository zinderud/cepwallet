/**
 * Privacy IPC Handlers - Electron IPC Integration
 * Handles privacy operations through IPC communication
 */

import { ipcMain, IpcMainEvent } from 'electron';
import {
  PrivacyManager,
  PrivacyLevel,
  PrivacyPreferences,
  PrivacyHistoryEntry,
} from '../../shared/src/privacy/manager';
import { PrivacyValidator } from '../../shared/src/privacy/validator';

/**
 * IPC Response interface
 */
interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Privacy Handler class
 */
export class PrivacyIpcHandler {
  private manager: PrivacyManager;
  private validator: PrivacyValidator;

  constructor() {
    this.manager = PrivacyManager.getInstance();
    this.validator = new PrivacyValidator(this.manager);
  }

  /**
   * Register all privacy IPC handlers
   */
  public registerHandlers(): void {
    // Get privacy level
    ipcMain.handle(
      'privacy:get-level',
      this.getPrivacyLevel.bind(this)
    );

    // Set privacy level
    ipcMain.handle(
      'privacy:set-level',
      this.setPrivacyLevel.bind(this)
    );

    // Get available levels
    ipcMain.handle(
      'privacy:get-available-levels',
      this.getAvailableLevels.bind(this)
    );

    // Get preferences
    ipcMain.handle(
      'privacy:get-preferences',
      this.getPreferences.bind(this)
    );

    // Update preferences
    ipcMain.handle(
      'privacy:update-preferences',
      this.updatePreferences.bind(this)
    );

    // Calculate privacy cost
    ipcMain.handle(
      'privacy:calculate-cost',
      this.calculatePrivacyCost.bind(this)
    );

    // Get privacy recommendation
    ipcMain.handle(
      'privacy:get-recommendation',
      this.getRecommendation.bind(this)
    );

    // Add history entry
    ipcMain.handle(
      'privacy:add-history-entry',
      this.addHistoryEntry.bind(this)
    );

    // Get history
    ipcMain.handle(
      'privacy:get-history',
      this.getHistory.bind(this)
    );

    // Get statistics
    ipcMain.handle(
      'privacy:get-statistics',
      this.getStatistics.bind(this)
    );

    // Validate transaction
    ipcMain.handle(
      'privacy:validate-transaction',
      this.validateTransaction.bind(this)
    );

    // Export settings
    ipcMain.handle(
      'privacy:export-settings',
      this.exportSettings.bind(this)
    );

    // Import settings
    ipcMain.handle(
      'privacy:import-settings',
      this.importSettings.bind(this)
    );

    // Reset preferences
    ipcMain.handle(
      'privacy:reset-preferences',
      this.resetPreferences.bind(this)
    );
  }

  /**
   * Get current privacy level
   */
  private getPrivacyLevel(): IPCResponse<PrivacyLevel> {
    try {
      const level = this.manager.getPreferences().defaultLevel;
      return { success: true, data: level };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'GET_LEVEL_ERROR',
      };
    }
  }

  /**
   * Set privacy level
   */
  private setPrivacyLevel(
    _event: IpcMainEvent,
    level: PrivacyLevel
  ): IPCResponse<PrivacyLevel> {
    try {
      const validation = this.manager.validatePrivacyLevel(
        level,
        this.manager.getPreferences().maxGasPremiumPercent
      );

      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason,
          code: 'INVALID_LEVEL',
        };
      }

      return { success: true, data: level };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'SET_LEVEL_ERROR',
      };
    }
  }

  /**
   * Get available privacy levels
   */
  private getAvailableLevels(): IPCResponse<PrivacyLevel[]> {
    try {
      const levels = this.manager.getAvailableLevels();
      return { success: true, data: levels };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'GET_AVAILABLE_LEVELS_ERROR',
      };
    }
  }

  /**
   * Get preferences
   */
  private getPreferences(): IPCResponse<PrivacyPreferences> {
    try {
      const preferences = this.manager.getPreferences();
      return { success: true, data: preferences };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'GET_PREFERENCES_ERROR',
      };
    }
  }

  /**
   * Update preferences
   */
  private updatePreferences(
    _event: IpcMainEvent,
    updates: Partial<PrivacyPreferences>
  ): IPCResponse<PrivacyPreferences> {
    try {
      const updated = this.manager.updatePreferences(updates);
      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'UPDATE_PREFERENCES_ERROR',
      };
    }
  }

  /**
   * Calculate privacy cost
   */
  private calculatePrivacyCost(
    _event: IpcMainEvent,
    baseGasPrice: string,
    baseGasAmount: string,
    level: PrivacyLevel
  ): IPCResponse<any> {
    try {
      const cost = this.manager.calculatePrivacyCost(
        baseGasPrice,
        baseGasAmount,
        level
      );
      return { success: true, data: cost };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'CALCULATE_COST_ERROR',
      };
    }
  }

  /**
   * Get privacy recommendation
   */
  private getRecommendation(
    _event: IpcMainEvent,
    txAmount: string,
    gasCostPublic: string,
    gasCostPrivate: string
  ): IPCResponse<PrivacyLevel> {
    try {
      const recommended = this.manager.getRecommendation(
        txAmount,
        gasCostPublic,
        gasCostPrivate
      );
      return { success: true, data: recommended };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'GET_RECOMMENDATION_ERROR',
      };
    }
  }

  /**
   * Add history entry
   */
  private addHistoryEntry(
    _event: IpcMainEvent,
    entry: Omit<PrivacyHistoryEntry, 'id'>
  ): IPCResponse<string> {
    try {
      const id = this.manager.addHistoryEntry(entry);
      return { success: true, data: id };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'ADD_HISTORY_ERROR',
      };
    }
  }

  /**
   * Get history
   */
  private getHistory(
    _event: IpcMainEvent,
    limit?: number
  ): IPCResponse<PrivacyHistoryEntry[]> {
    try {
      const history = this.manager.getHistory(limit);
      return { success: true, data: history };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'GET_HISTORY_ERROR',
      };
    }
  }

  /**
   * Get statistics
   */
  private getStatistics(): IPCResponse<any> {
    try {
      const stats = this.manager.getStatistics();
      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'GET_STATISTICS_ERROR',
      };
    }
  }

  /**
   * Validate transaction
   */
  private validateTransaction(
    _event: IpcMainEvent,
    txData: any
  ): IPCResponse<any> {
    try {
      const validation = this.validator.validateTransaction(txData);
      return { success: true, data: validation };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'VALIDATE_TRANSACTION_ERROR',
      };
    }
  }

  /**
   * Export settings
   */
  private exportSettings(): IPCResponse<any> {
    try {
      const exported = this.manager.exportSettings();
      return { success: true, data: exported };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'EXPORT_SETTINGS_ERROR',
      };
    }
  }

  /**
   * Import settings
   */
  private importSettings(
    _event: IpcMainEvent,
    data: any
  ): IPCResponse<PrivacyPreferences> {
    try {
      this.manager.importSettings(data);
      return { success: true, data: this.manager.getPreferences() };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'IMPORT_SETTINGS_ERROR',
      };
    }
  }

  /**
   * Reset preferences
   */
  private resetPreferences(): IPCResponse<PrivacyPreferences> {
    try {
      const defaults = this.manager.resetToDefaults();
      return { success: true, data: defaults };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        code: 'RESET_PREFERENCES_ERROR',
      };
    }
  }

  /**
   * Unregister all handlers
   */
  public unregisterHandlers(): void {
    ipcMain.removeAllListeners('privacy:get-level');
    ipcMain.removeAllListeners('privacy:set-level');
    ipcMain.removeAllListeners('privacy:get-available-levels');
    ipcMain.removeAllListeners('privacy:get-preferences');
    ipcMain.removeAllListeners('privacy:update-preferences');
    ipcMain.removeAllListeners('privacy:calculate-cost');
    ipcMain.removeAllListeners('privacy:get-recommendation');
    ipcMain.removeAllListeners('privacy:add-history-entry');
    ipcMain.removeAllListeners('privacy:get-history');
    ipcMain.removeAllListeners('privacy:get-statistics');
    ipcMain.removeAllListeners('privacy:validate-transaction');
    ipcMain.removeAllListeners('privacy:export-settings');
    ipcMain.removeAllListeners('privacy:import-settings');
    ipcMain.removeAllListeners('privacy:reset-preferences');
  }
}

/**
 * Register privacy IPC handlers
 */
export function registerPrivacyHandlers(): PrivacyIpcHandler {
  const handler = new PrivacyIpcHandler();
  handler.registerHandlers();
  return handler;
}

/**
 * Unregister privacy IPC handlers
 */
export function unregisterPrivacyHandlers(handler: PrivacyIpcHandler): void {
  handler.unregisterHandlers();
}
