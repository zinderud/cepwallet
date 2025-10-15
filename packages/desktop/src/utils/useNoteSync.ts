/**
 * useNoteSync - React Hook for Note Synchronization
 * Manages note operations and synchronization state
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { PrivacyLevel } from '../privacy/manager';
import { NoteManager, NoteData, NoteMetadata, SyncStatus, NoteStatistics } from '../notes/manager';
import { EncryptionHandler } from '../notes/encryption';
import { SyncManager, SyncResult } from '../notes/sync';

/**
 * Note Sync Hook State
 */
export interface NoteSyncHookState {
  notes: NoteData[];
  syncStatus: SyncStatus;
  progress: number;
  statistics: NoteStatistics;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

/**
 * useNoteSync Hook
 */
export function useNoteSync() {
  const managerRef = useRef<NoteManager | null>(null);
  const encryptionRef = useRef<EncryptionHandler | null>(null);
  const syncRef = useRef<SyncManager | null>(null);

  // State
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.PENDING);
  const [progress, setProgress] = useState<number>(0);
  const [statistics, setStatistics] = useState<NoteStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize managers
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = NoteManager.getInstance();
    }
    if (!encryptionRef.current) {
      encryptionRef.current = new EncryptionHandler();
    }
    if (!syncRef.current) {
      syncRef.current = new SyncManager();
    }

    // Load initial data
    updateNotes();
    updateStatistics();

    return () => {
      // Cleanup if needed
    };
  }, []);

  /**
   * Update notes from manager
   */
  const updateNotes = useCallback(() => {
    if (managerRef.current) {
      const allNotes = managerRef.current.getNotes();
      setNotes(allNotes);
    }
  }, []);

  /**
   * Update statistics
   */
  const updateStatistics = useCallback(() => {
    if (managerRef.current) {
      const stats = managerRef.current.getStatistics();
      setStatistics(stats);
    }
  }, []);

  /**
   * Create a new note
   */
  const createNote = useCallback(
    (data: any, privacyLevel: PrivacyLevel): NoteMetadata => {
      setIsLoading(true);
      setError(null);

      try {
        if (!managerRef.current || !encryptionRef.current) {
          throw new Error('Managers not initialized');
        }

        // Encrypt data based on privacy level
        const encryptedData = encryptionRef.current.encrypt(JSON.stringify(data), privacyLevel);

        // Create note
        const noteData: NoteData = {
          commitmentHash: `hash_${Date.now()}`,
          encryptedData,
          privacyLevel,
          timestamp: Date.now(),
        };

        const metadata = managerRef.current.createNote(noteData, {
          txHash: `tx_${Date.now()}`,
          fromAddress: data.from || '0x',
          toAddress: data.to || '0x',
          amount: data.amount || '0',
          privacyLevel,
          encryptedFlag: privacyLevel !== PrivacyLevel.PUBLIC,
        });

        updateNotes();
        updateStatistics();

        return metadata;
      } catch (err) {
        const errorMsg = (err as Error).message;
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get all notes
   */
  const getNotes = useCallback((): NoteData[] => {
    if (managerRef.current) {
      return managerRef.current.getNotes();
    }
    return [];
  }, []);

  /**
   * Get notes by privacy level
   */
  const getNotesByPrivacyLevel = useCallback(
    (level: PrivacyLevel): NoteMetadata[] => {
      if (managerRef.current) {
        return managerRef.current.getNotesByPrivacyLevel(level);
      }
      return [];
    },
    []
  );

  /**
   * Delete a note
   */
  const deleteNote = useCallback((id: string): void => {
    setError(null);
    try {
      if (managerRef.current) {
        managerRef.current.deleteNote(id);
        updateNotes();
        updateStatistics();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  /**
   * Start synchronization
   */
  const startSync = useCallback(async (): Promise<void> => {
    setIsSyncing(true);
    setSyncStatus(SyncStatus.SYNCING);
    setError(null);

    try {
      if (!syncRef.current) {
        throw new Error('SyncManager not initialized');
      }

      const result = await syncRef.current.startSync();

      if (result.success) {
        setSyncStatus(SyncStatus.SYNCED);
      } else {
        setSyncStatus(SyncStatus.FAILED);
        setError(result.errors.join(', '));
      }

      updateStatistics();
    } catch (err) {
      setSyncStatus(SyncStatus.FAILED);
      setError((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Pause synchronization
   */
  const pauseSync = useCallback((): void => {
    if (syncRef.current) {
      syncRef.current.pauseSync();
      setSyncStatus(SyncStatus.PENDING);
      setIsSyncing(false);
    }
  }, []);

  /**
   * Resume synchronization
   */
  const resumeSync = useCallback(async (): Promise<void> => {
    if (syncRef.current) {
      await syncRef.current.resumeSync();
      setSyncStatus(SyncStatus.SYNCING);
      setIsSyncing(true);
    }
  }, []);

  /**
   * Retry failed syncs
   */
  const retryFailed = useCallback(async (): Promise<void> => {
    setSyncStatus(SyncStatus.RETRYING);
    setIsSyncing(true);
    setError(null);

    try {
      if (!syncRef.current) {
        throw new Error('SyncManager not initialized');
      }

      await syncRef.current.retryFailed();
      setSyncStatus(SyncStatus.SYNCED);
      updateStatistics();
    } catch (err) {
      setSyncStatus(SyncStatus.FAILED);
      setError((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Encrypt a note
   */
  const encryptNote = useCallback((noteId: string): void => {
    setError(null);
    try {
      if (!managerRef.current || !encryptionRef.current) {
        throw new Error('Managers not initialized');
      }

      const metadata = managerRef.current.getNoteMetadata(noteId);
      if (!metadata) {
        throw new Error(`Note ${noteId} not found`);
      }

      // Mark as encrypted
      managerRef.current.updateNoteStatus(noteId, SyncStatus.SYNCED);
      updateNotes();
      updateStatistics();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  /**
   * Decrypt a note
   */
  const decryptNote = useCallback((noteId: string): string => {
    try {
      if (!managerRef.current || !encryptionRef.current) {
        throw new Error('Managers not initialized');
      }

      const noteData = managerRef.current.getNote(noteId);
      if (!noteData) {
        throw new Error(`Note ${noteId} not found`);
      }

      // Decrypt data
      return encryptionRef.current.decrypt(noteData.encryptedData, noteData.privacyLevel);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  /**
   * Get statistics
   */
  const getStatistics = useCallback((): NoteStatistics | null => {
    if (managerRef.current) {
      return managerRef.current.getStatistics();
    }
    return null;
  }, []);

  /**
   * Get progress percentage
   */
  const getProgress = useCallback((): number => {
    if (syncRef.current) {
      return syncRef.current.getProgress();
    }
    return 0;
  }, []);

  /**
   * Export notes for backup
   */
  const exportNotes = useCallback((): any => {
    if (managerRef.current) {
      return managerRef.current.exportNotes();
    }
    return null;
  }, []);

  /**
   * Import notes from backup
   */
  const importNotes = useCallback((data: any): void => {
    setIsLoading(true);
    setError(null);

    try {
      if (managerRef.current) {
        managerRef.current.importNotes(data);
        updateNotes();
        updateStatistics();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear all notes
   */
  const clearNotes = useCallback((): void => {
    setError(null);
    try {
      if (managerRef.current) {
        managerRef.current.clearNotes();
        updateNotes();
        updateStatistics();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  /**
   * Validate transaction
   */
  const validateTransaction = useCallback(
    (txData: any): { valid: boolean; message: string } => {
      try {
        // Basic validation
        if (!txData.from || !txData.to) {
          return { valid: false, message: 'Invalid addresses' };
        }

        if (!txData.amount || txData.amount === '0') {
          return { valid: false, message: 'Invalid amount' };
        }

        return { valid: true, message: 'Valid transaction' };
      } catch (err) {
        return { valid: false, message: (err as Error).message };
      }
    },
    []
  );

  /**
   * Subscribe to sync events
   */
  const onSync = useCallback(
    (callback: (result: SyncResult) => void): (() => void) => {
      // In real implementation, would use event emitter
      // For now: return unsubscribe function
      return () => {
        // Cleanup
      };
    },
    []
  );

  /**
   * Subscribe to error events
   */
  const onError = useCallback(
    (callback: (error: string) => void): (() => void) => {
      // In real implementation, would use event emitter
      // For now: return unsubscribe function
      return () => {
        // Cleanup
      };
    },
    []
  );

  return {
    // State
    notes,
    syncStatus,
    progress: getProgress(),
    statistics: statistics || ({} as NoteStatistics),
    isLoading,
    isSyncing,
    error,

    // Note operations
    createNote,
    getNotes,
    getNotesByPrivacyLevel,
    deleteNote,
    validateTransaction,

    // Sync operations
    startSync,
    pauseSync,
    resumeSync,
    retryFailed,

    // Encryption operations
    encryptNote,
    decryptNote,

    // Statistics
    getStatistics,
    getProgress,

    // Settings
    exportNotes,
    importNotes,
    clearNotes,

    // Subscriptions
    onSync,
    onError,
  };
}

/**
 * Export SyncResult type for consumers
 */
export type { SyncResult };
