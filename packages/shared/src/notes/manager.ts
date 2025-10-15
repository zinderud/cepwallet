/**
 * Note Manager - Railgun Note Storage and Lifecycle Management
 * Handles note creation, storage, retrieval, and statistics
 */

import { PrivacyLevel } from '../privacy/manager';

/**
 * Sync Status Enum
 */
export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

/**
 * Note Data - Core note information
 */
export interface NoteData {
  commitmentHash: string;
  encryptedData: string;
  privacyLevel: PrivacyLevel;
  timestamp: number;
  salt?: string;
  iv?: string;
}

/**
 * Note Metadata - Additional note information
 */
export interface NoteMetadata {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  privacyLevel: PrivacyLevel;
  encryptedFlag: boolean;
  syncStatus: SyncStatus;
  createdAt: number;
  syncedAt?: number;
  error?: string;
}

/**
 * Note Store - Complete note storage
 */
export interface NoteStore {
  notes: Map<string, NoteData>;
  metadata: Map<string, NoteMetadata>;
  totalSize: number;
  lastSyncTime: number;
}

/**
 * Note Statistics
 */
export interface NoteStatistics {
  totalNotes: number;
  encryptedNotes: number;
  syncedNotes: number;
  failedNotes: number;
  pendingNotes: number;
  totalSize: number;
  encryptedSize: number;
  compressionRatio: number;
  averageSyncTime: number;
  notesByPrivacyLevel: {
    [key in PrivacyLevel]: number;
  };
  notesByStatus: {
    [key in SyncStatus]: number;
  };
}

/**
 * NoteManager - Singleton for note management
 */
export class NoteManager {
  private static instance: NoteManager;
  private store: NoteStore;
  private maxNotes: number = 10000;
  private maxStorageSize: number = 1000000000; // 1GB
  private compressionThreshold: number = 1000000; // 1MB

  private constructor() {
    this.store = {
      notes: new Map(),
      metadata: new Map(),
      totalSize: 0,
      lastSyncTime: 0,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NoteManager {
    if (!NoteManager.instance) {
      NoteManager.instance = new NoteManager();
    }
    return NoteManager.instance;
  }

  /**
   * Create a new note
   */
  public createNote(
    data: NoteData,
    metadata: Omit<NoteMetadata, 'id' | 'createdAt' | 'syncStatus'>
  ): NoteMetadata {
    // Check limits
    if (this.store.notes.size >= this.maxNotes) {
      throw new Error(`Maximum number of notes (${this.maxNotes}) reached`);
    }

    // Generate unique ID
    const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create metadata
    const noteMetadata: NoteMetadata = {
      ...metadata,
      id,
      createdAt: Date.now(),
      syncStatus: SyncStatus.PENDING,
    };

    // Store note and metadata
    this.store.notes.set(id, data);
    this.store.metadata.set(id, noteMetadata);

    // Update storage size
    this.updateStorageSize();

    return noteMetadata;
  }

  /**
   * Get a single note by ID
   */
  public getNote(id: string): NoteData | undefined {
    return this.store.notes.get(id);
  }

  /**
   * Get note metadata by ID
   */
  public getNoteMetadata(id: string): NoteMetadata | undefined {
    return this.store.metadata.get(id);
  }

  /**
   * Get all notes
   */
  public getNotes(limit?: number): NoteData[] {
    const notes = Array.from(this.store.notes.values());
    return limit ? notes.slice(0, limit) : notes;
  }

  /**
   * Get all note metadata
   */
  public getAllMetadata(limit?: number): NoteMetadata[] {
    const metadata = Array.from(this.store.metadata.values());
    return limit ? metadata.slice(0, limit) : metadata;
  }

  /**
   * Get notes by privacy level
   */
  public getNotesByPrivacyLevel(level: PrivacyLevel): NoteMetadata[] {
    return Array.from(this.store.metadata.values()).filter(
      (meta) => meta.privacyLevel === level
    );
  }

  /**
   * Get notes by sync status
   */
  public getNotesByStatus(status: SyncStatus): NoteMetadata[] {
    return Array.from(this.store.metadata.values()).filter(
      (meta) => meta.syncStatus === status
    );
  }

  /**
   * Update note sync status
   */
  public updateNoteStatus(
    id: string,
    status: SyncStatus,
    syncedAt?: number,
    error?: string
  ): void {
    const metadata = this.store.metadata.get(id);
    if (!metadata) {
      throw new Error(`Note ${id} not found`);
    }

    metadata.syncStatus = status;
    if (syncedAt) {
      metadata.syncedAt = syncedAt;
    }
    if (error) {
      metadata.error = error;
    }
  }

  /**
   * Delete a single note
   */
  public deleteNote(id: string): void {
    this.store.notes.delete(id);
    this.store.metadata.delete(id);
    this.updateStorageSize();
  }

  /**
   * Clear all notes
   */
  public clearNotes(): void {
    this.store.notes.clear();
    this.store.metadata.clear();
    this.store.totalSize = 0;
  }

  /**
   * Get complete statistics
   */
  public getStatistics(): NoteStatistics {
    const metadata = Array.from(this.store.metadata.values());
    const data = Array.from(this.store.notes.values());

    // Count by privacy level
    const notesByPrivacyLevel = {
      [PrivacyLevel.PUBLIC]: 0,
      [PrivacyLevel.SEMI_PRIVATE]: 0,
      [PrivacyLevel.FULL_PRIVATE]: 0,
    };

    metadata.forEach((meta) => {
      notesByPrivacyLevel[meta.privacyLevel]++;
    });

    // Count by status
    const notesByStatus = {
      [SyncStatus.PENDING]: 0,
      [SyncStatus.SYNCING]: 0,
      [SyncStatus.SYNCED]: 0,
      [SyncStatus.FAILED]: 0,
      [SyncStatus.RETRYING]: 0,
    };

    metadata.forEach((meta) => {
      notesByStatus[meta.syncStatus]++;
    });

    // Calculate encryption stats
    const encryptedNotes = metadata.filter((m) => m.encryptedFlag).length;
    const encryptedSize = data
      .filter((_, i) => {
        const meta = metadata[i];
        return meta && meta.encryptedFlag;
      })
      .reduce((sum, note) => sum + this.estimateSize(note), 0);

    // Calculate averages
    const syncedNotes = metadata.filter((m) => m.syncStatus === SyncStatus.SYNCED).length;
    const syncTimes = metadata
      .filter((m) => m.syncedAt && m.createdAt)
      .map((m) => (m.syncedAt! - m.createdAt) / 1000); // Convert to seconds
    const averageSyncTime =
      syncTimes.length > 0
        ? syncTimes.reduce((sum, time) => sum + time, 0) / syncTimes.length
        : 0;

    return {
      totalNotes: this.store.notes.size,
      encryptedNotes,
      syncedNotes,
      failedNotes: notesByStatus[SyncStatus.FAILED],
      pendingNotes: notesByStatus[SyncStatus.PENDING],
      totalSize: this.store.totalSize,
      encryptedSize,
      compressionRatio: this.getCompressionRatio(),
      averageSyncTime,
      notesByPrivacyLevel,
      notesByStatus,
    };
  }

  /**
   * Get full store
   */
  public getStore(): NoteStore {
    return this.store;
  }

  /**
   * Export notes for backup
   */
  public exportNotes(): any {
    return {
      version: '1.0',
      exportedAt: Date.now(),
      notes: Array.from(this.store.notes.entries()),
      metadata: Array.from(this.store.metadata.entries()),
      statistics: this.getStatistics(),
    };
  }

  /**
   * Import notes from backup
   */
  public importNotes(data: any): void {
    if (!data.notes || !data.metadata) {
      throw new Error('Invalid import data format');
    }

    this.store.notes.clear();
    this.store.metadata.clear();

    // Import notes
    data.notes.forEach((entry: [string, NoteData]) => {
      this.store.notes.set(entry[0], entry[1]);
    });

    // Import metadata
    data.metadata.forEach((entry: [string, NoteMetadata]) => {
      this.store.metadata.set(entry[0], entry[1]);
    });

    this.updateStorageSize();
  }

  /**
   * Compress notes if needed
   */
  public compressNotes(): void {
    // In real implementation, would use gzip or similar
    // For now, this is a placeholder for compression logic
    if (this.store.totalSize > this.compressionThreshold) {
      // Would trigger compression logic
      console.log('Compression would be triggered');
    }
  }

  /**
   * Decompress notes if needed
   */
  public decompressNotes(): void {
    // Placeholder for decompression logic
    console.log('Decompression would be applied');
  }

  /**
   * Estimate size of a note
   */
  public estimateSize(note: NoteData): number {
    // Rough estimation: JSON stringified size + overhead
    const stringified = JSON.stringify(note);
    // Estimate: each character is roughly 1 byte in UTF-8
    return stringified.length;
  }

  /**
   * Get compression ratio
   */
  public getCompressionRatio(): number {
    // Placeholder: would calculate actual compression ratio
    // For now returns estimated ratio based on privacy level distribution
    const stats = this.getStatistics();
    const avgRatio = (stats.notesByPrivacyLevel[PrivacyLevel.FULL_PRIVATE] || 0) * 0.0015;
    return Math.min(avgRatio, 0.3);
  }

  /**
   * Update total storage size
   */
  private updateStorageSize(): void {
    let totalSize = 0;
    this.store.notes.forEach((note) => {
      totalSize += this.estimateSize(note);
    });
    this.store.totalSize = totalSize;
  }

  /**
   * Check if storage limit exceeded
   */
  public isStorageLimitExceeded(): boolean {
    return this.store.totalSize > this.maxStorageSize;
  }

  /**
   * Get remaining storage
   */
  public getRemainingStorage(): number {
    return Math.max(0, this.maxStorageSize - this.store.totalSize);
  }

  /**
   * Get storage percentage used
   */
  public getStoragePercentage(): number {
    return (this.store.totalSize / this.maxStorageSize) * 100;
  }

  /**
   * Set last sync time
   */
  public setLastSyncTime(timestamp: number): void {
    this.store.lastSyncTime = timestamp;
  }

  /**
   * Get time since last sync (in seconds)
   */
  public getTimeSinceLastSync(): number {
    return (Date.now() - this.store.lastSyncTime) / 1000;
  }
}

/**
 * Get or create NoteManager instance
 */
export function getNoteManager(): NoteManager {
  return NoteManager.getInstance();
}
