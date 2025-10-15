/**
 * Sync Manager - Note Synchronization with Privacy-Aware Strategies
 * Handles synchronization using different strategies per privacy level
 */

import { PrivacyLevel } from '../privacy/manager';
import { SyncStatus } from './manager';

/**
 * Sync Strategy Type
 */
export type SyncStrategy = 'immediate' | 'batched' | 'lazy';

/**
 * Sync Configuration
 */
export interface SyncConfig {
  strategy: SyncStrategy;
  batchSize: number;
  interval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
}

/**
 * Sync Result
 */
export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
  duration: number;
  startTime: number;
  endTime: number;
}

/**
 * Sync Statistics
 */
export interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalNotesSynced: number;
  totalNotesFailed: number;
  averageSyncTime: number;
  lastSyncResult?: SyncResult;
  uptime: number;
}

/**
 * SyncManager - Manages note synchronization
 */
export class SyncManager {
  private syncConfigs: Map<PrivacyLevel, SyncConfig>;
  private currentStatus: SyncStatus = SyncStatus.PENDING;
  private progress: number = 0;
  private isSyncing: boolean = false;
  private syncIntervals: Map<PrivacyLevel, any> = new Map();
  private statistics: SyncStatistics;
  private lastSyncResult?: SyncResult;

  constructor() {
    this.syncConfigs = new Map();
    this.initializeDefaultConfigs();
    this.statistics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalNotesSynced: 0,
      totalNotesFailed: 0,
      averageSyncTime: 0,
      uptime: Date.now(),
    };
  }

  /**
   * Initialize default sync configurations
   */
  private initializeDefaultConfigs(): void {
    this.syncConfigs.set(PrivacyLevel.PUBLIC, {
      strategy: 'lazy',
      batchSize: 50,
      interval: 300000, // 5 minutes
      maxRetries: 3,
      retryDelay: 5000,
    });

    this.syncConfigs.set(PrivacyLevel.SEMI_PRIVATE, {
      strategy: 'batched',
      batchSize: 20,
      interval: 60000, // 1 minute
      maxRetries: 5,
      retryDelay: 3000,
    });

    this.syncConfigs.set(PrivacyLevel.FULL_PRIVATE, {
      strategy: 'immediate',
      batchSize: 1,
      interval: 0, // Real-time
      maxRetries: 10,
      retryDelay: 1000,
    });
  }

  /**
   * Get sync strategy for privacy level
   */
  public setSyncStrategy(privacyLevel: PrivacyLevel): SyncStrategy {
    const config = this.syncConfigs.get(privacyLevel);
    return config?.strategy || 'lazy';
  }

  /**
   * Start synchronization
   */
  public async startSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    this.currentStatus = SyncStatus.SYNCING;
    this.progress = 0;

    const startTime = Date.now();
    const errors: string[] = [];
    let synced = 0;
    let failed = 0;

    try {
      // Simulate sync process
      for (const [privacyLevel, config] of this.syncConfigs.entries()) {
        try {
          const result = await this.executeSyncForLevel(privacyLevel, config);
          synced += result.synced;
          failed += result.failed;
          errors.push(...result.errors);
        } catch (error) {
          failed++;
          errors.push((error as Error).message);
        }
        
        this.progress += 100 / this.syncConfigs.size;
      }

      this.currentStatus = SyncStatus.SYNCED;
      this.progress = 100;

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result: SyncResult = {
        success: failed === 0,
        synced,
        failed,
        errors,
        duration,
        startTime,
        endTime,
      };

      this.updateStatistics(result);
      this.lastSyncResult = result;

      return result;
    } catch (error) {
      this.currentStatus = SyncStatus.FAILED;
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result: SyncResult = {
        success: false,
        synced,
        failed,
        errors: [(error as Error).message],
        duration,
        startTime,
        endTime,
      };

      this.statistics.failedSyncs++;
      this.lastSyncResult = result;

      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Execute sync for specific privacy level
   */
  private async executeSyncForLevel(
    _privacyLevel: PrivacyLevel,
    config: SyncConfig
  ): Promise<{ synced: number; failed: number; errors: string[] }> {
    const result = { synced: 0, failed: 0, errors: [] as string[] };

    // Simulate different sync strategies
    switch (config.strategy) {
      case 'immediate':
        // Real-time sync - process immediately
        result.synced += 1; // Simulate processing
        break;

      case 'batched':
        // Batched sync - process in batches
        result.synced += config.batchSize;
        break;

      case 'lazy':
        // Lazy sync - process with delay
        await this.delay(1000); // Simulate delay
        result.synced += config.batchSize;
        break;
    }

    return result;
  }

  /**
   * Pause synchronization
   */
  public pauseSync(): void {
    this.isSyncing = false;
    this.currentStatus = SyncStatus.PENDING;
    this.clearAllIntervals();
  }

  /**
   * Resume synchronization
   */
  public async resumeSync(): Promise<void> {
    if (!this.isSyncing) {
      await this.startSync();
    }
  }

  /**
   * Cancel synchronization
   */
  public cancelSync(): void {
    this.isSyncing = false;
    this.currentStatus = SyncStatus.PENDING;
    this.progress = 0;
    this.clearAllIntervals();
  }

  /**
   * Get current sync status
   */
  public getSyncStatus(): SyncStatus {
    return this.currentStatus;
  }

  /**
   * Get sync progress percentage
   */
  public getProgress(): number {
    return Math.min(Math.round(this.progress), 100);
  }

  /**
   * Retry failed syncs
   */
  public async retryFailed(): Promise<SyncResult> {
    this.currentStatus = SyncStatus.RETRYING;
    try {
      return await this.startSync();
    } catch (error) {
      this.currentStatus = SyncStatus.FAILED;
      throw error;
    }
  }

  /**
   * Resolve conflict between notes
   */
  public resolveConflict(noteId: string, strategy: 'last-write-wins' | 'keep-both' = 'last-write-wins'): void {
    // In real implementation, would handle conflict resolution
    // For now: logging placeholder
    console.log(`Resolving conflict for note ${noteId} using ${strategy} strategy`);
  }

  /**
   * Get sync statistics
   */
  public getSyncStatistics(): SyncStatistics {
    return {
      ...this.statistics,
      uptime: Date.now() - this.statistics.uptime,
      lastSyncResult: this.lastSyncResult,
    };
  }

  /**
   * Check if currently syncing
   */
  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Get next sync time
   */
  public getNextSyncTime(): number {
    // Find the minimum interval among all enabled strategies
    let minInterval = Infinity;

    for (const config of this.syncConfigs.values()) {
      if (config.interval > 0 && config.interval < minInterval) {
        minInterval = config.interval;
      }
    }

    return minInterval === Infinity ? 0 : minInterval;
  }

  /**
   * Get sync configuration for privacy level
   */
  public getSyncConfig(privacyLevel: PrivacyLevel): SyncConfig | undefined {
    return this.syncConfigs.get(privacyLevel);
  }

  /**
   * Update sync configuration
   */
  public updateSyncConfig(privacyLevel: PrivacyLevel, config: Partial<SyncConfig>): void {
    const existing = this.syncConfigs.get(privacyLevel);
    if (existing) {
      this.syncConfigs.set(privacyLevel, { ...existing, ...config });
    }
  }

  /**
   * Get all sync configurations
   */
  public getAllSyncConfigs(): Map<PrivacyLevel, SyncConfig> {
    return new Map(this.syncConfigs);
  }

  /**
   * Clear all sync intervals
   */
  private clearAllIntervals(): void {
    for (const timeout of this.syncIntervals.values()) {
      clearTimeout(timeout);
    }
    this.syncIntervals.clear();
  }

  /**
   * Reset statistics
   */
  public resetStatistics(): void {
    this.statistics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalNotesSynced: 0,
      totalNotesFailed: 0,
      averageSyncTime: 0,
      uptime: Date.now(),
    };
    this.lastSyncResult = undefined;
  }

  /**
   * Update statistics after sync
   */
  private updateStatistics(result: SyncResult): void {
    this.statistics.totalSyncs++;
    if (result.success) {
      this.statistics.successfulSyncs++;
    } else {
      this.statistics.failedSyncs++;
    }
    this.statistics.totalNotesSynced += result.synced;
    this.statistics.totalNotesFailed += result.failed;

    // Update average sync time
    const totalTime =
      this.statistics.averageSyncTime * (this.statistics.totalSyncs - 1) + result.duration;
    this.statistics.averageSyncTime = totalTime / this.statistics.totalSyncs;
  }

  /**
   * Utility: Delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Export sync settings
   */
  public exportSettings(): any {
    return {
      version: '1.0',
      exportedAt: Date.now(),
      configs: Array.from(this.syncConfigs.entries()),
      statistics: this.statistics,
    };
  }

  /**
   * Import sync settings
   */
  public importSettings(data: any): void {
    if (data.configs && Array.isArray(data.configs)) {
      this.syncConfigs.clear();
      data.configs.forEach(([level, config]: [PrivacyLevel, SyncConfig]) => {
        this.syncConfigs.set(level, config);
      });
    }
  }
}

/**
 * Get or create SyncManager instance
 */
let syncManagerInstance: SyncManager | null = null;

export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager();
  }
  return syncManagerInstance;
}

/**
 * Reset SyncManager instance
 */
export function resetSyncManager(): void {
  syncManagerInstance = null;
}
