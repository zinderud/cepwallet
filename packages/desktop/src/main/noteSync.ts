/**
 * Note Sync IPC Handlers
 * Handles main process communication for note management operations
 */

import { ipcMain, IpcMainEvent } from 'electron';
import { NoteManager } from '../../../shared/src/notes/manager';
import { EncryptionHandler } from '../../../shared/src/notes/encryption';
import { SyncManager } from '../../../shared/src/notes/sync';
import { PrivacyLevel, SyncStatus } from '../../../shared/src/notes/manager';

/**
 * Initialize IPC handlers for note sync operations
 */
export function initializeNoteSyncHandlers(): void {
  const noteManager = NoteManager.getInstance();
  const encryptionHandler = new EncryptionHandler();
  const syncManager = new SyncManager();

  /**
   * Create a new note
   * Event: 'note-create'
   * Arguments: { commitmentHash, encryptedData, privacyLevel, txHash, fromAddress, toAddress, amount }
   */
  ipcMain.handle('note-create', async (_event: IpcMainEvent, data: any) => {
    try {
      const metadata = noteManager.createNote(
        {
          commitmentHash: data.commitmentHash,
          encryptedData: data.encryptedData,
          privacyLevel: data.privacyLevel,
          timestamp: Date.now(),
        },
        {
          txHash: data.txHash,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
          amount: data.amount,
          privacyLevel: data.privacyLevel,
          encryptedFlag: data.privacyLevel !== PrivacyLevel.PUBLIC,
        }
      );

      return { success: true, metadata };
    } catch (error) {
      console.error('Error creating note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get a note by ID
   * Event: 'note-get'
   * Arguments: { id }
   */
  ipcMain.handle('note-get', async (_event: IpcMainEvent, { id }: { id: string }) => {
    try {
      const note = noteManager.getNote(id);
      const metadata = noteManager.getNoteMetadata(id);

      return { success: true, note, metadata };
    } catch (error) {
      console.error('Error getting note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get all notes
   * Event: 'note-get-all'
   * Arguments: { limit }
   */
  ipcMain.handle('note-get-all', async (_event: IpcMainEvent, { limit }: { limit?: number }) => {
    try {
      const notes = noteManager.getNotes(limit);
      return { success: true, notes };
    } catch (error) {
      console.error('Error getting all notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get notes by privacy level
   * Event: 'note-get-by-privacy-level'
   * Arguments: { privacyLevel }
   */
  ipcMain.handle('note-get-by-privacy-level', async (_event: IpcMainEvent, { privacyLevel }: { privacyLevel: number }) => {
    try {
      const notes = noteManager.getNotesByPrivacyLevel(privacyLevel);
      return { success: true, notes };
    } catch (error) {
      console.error('Error getting notes by privacy level:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Delete a note
   * Event: 'note-delete'
   * Arguments: { id }
   */
  ipcMain.handle('note-delete', async (_event: IpcMainEvent, { id }: { id: string }) => {
    try {
      noteManager.deleteNote(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Clear all notes
   * Event: 'note-clear-all'
   * Arguments: {}
   */
  ipcMain.handle('note-clear-all', async (_event: IpcMainEvent) => {
    try {
      noteManager.clearNotes();
      return { success: true };
    } catch (error) {
      console.error('Error clearing notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Encrypt note
   * Event: 'note-encrypt'
   * Arguments: { noteId }
   */
  ipcMain.handle('note-encrypt', async (_event: IpcMainEvent, { noteId }: { noteId: string }) => {
    try {
      const note = noteManager.getNote(noteId);
      if (!note) {
        return { success: false, error: 'Note not found' };
      }

      const encrypted = encryptionHandler.encrypt(note.encryptedData, note.privacyLevel);
      return { success: true, encrypted };
    } catch (error) {
      console.error('Error encrypting note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Decrypt note
   * Event: 'note-decrypt'
   * Arguments: { noteId }
   */
  ipcMain.handle('note-decrypt', async (_event: IpcMainEvent, { noteId }: { noteId: string }) => {
    try {
      const note = noteManager.getNote(noteId);
      if (!note) {
        return { success: false, error: 'Note not found' };
      }

      const decrypted = encryptionHandler.decrypt(note.encryptedData, note.privacyLevel);
      return { success: true, decrypted };
    } catch (error) {
      console.error('Error decrypting note:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Start sync
   * Event: 'sync-start'
   * Arguments: {}
   */
  ipcMain.handle('sync-start', async (_event: IpcMainEvent) => {
    try {
      const result = await syncManager.startSync();
      return { success: true, result };
    } catch (error) {
      console.error('Error starting sync:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Pause sync
   * Event: 'sync-pause'
   * Arguments: {}
   */
  ipcMain.handle('sync-pause', async (_event: IpcMainEvent) => {
    try {
      syncManager.pauseSync();
      return { success: true };
    } catch (error) {
      console.error('Error pausing sync:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Resume sync
   * Event: 'sync-resume'
   * Arguments: {}
   */
  ipcMain.handle('sync-resume', async (_event: IpcMainEvent) => {
    try {
      syncManager.resumeSync();
      return { success: true };
    } catch (error) {
      console.error('Error resuming sync:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Cancel sync
   * Event: 'sync-cancel'
   * Arguments: {}
   */
  ipcMain.handle('sync-cancel', async (_event: IpcMainEvent) => {
    try {
      syncManager.cancelSync();
      return { success: true };
    } catch (error) {
      console.error('Error canceling sync:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get sync status
   * Event: 'sync-get-status'
   * Arguments: {}
   */
  ipcMain.handle('sync-get-status', async (_event: IpcMainEvent) => {
    try {
      const status = syncManager.getSyncStatus();
      const progress = syncManager.getProgress();
      const statistics = syncManager.getSyncStatistics();

      return { success: true, status, progress, statistics };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get sync progress
   * Event: 'sync-get-progress'
   * Arguments: {}
   */
  ipcMain.handle('sync-get-progress', async (_event: IpcMainEvent) => {
    try {
      const progress = syncManager.getProgress();
      const status = syncManager.getSyncStatus();

      return { success: true, progress, status };
    } catch (error) {
      console.error('Error getting sync progress:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Retry failed sync
   * Event: 'sync-retry-failed'
   * Arguments: {}
   */
  ipcMain.handle('sync-retry-failed', async (_event: IpcMainEvent) => {
    try {
      const result = await syncManager.retryFailed();
      return { success: true, result };
    } catch (error) {
      console.error('Error retrying sync:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get note statistics
   * Event: 'note-get-statistics'
   * Arguments: {}
   */
  ipcMain.handle('note-get-statistics', async (_event: IpcMainEvent) => {
    try {
      const statistics = noteManager.getStatistics();
      return { success: true, statistics };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Export notes
   * Event: 'note-export'
   * Arguments: {}
   */
  ipcMain.handle('note-export', async (_event: IpcMainEvent) => {
    try {
      const exported = noteManager.exportNotes();
      return { success: true, exported };
    } catch (error) {
      console.error('Error exporting notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Import notes
   * Event: 'note-import'
   * Arguments: { data }
   */
  ipcMain.handle('note-import', async (_event: IpcMainEvent, { data }: { data: any }) => {
    try {
      noteManager.importNotes(data);
      return { success: true };
    } catch (error) {
      console.error('Error importing notes:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Set sync strategy
   * Event: 'sync-set-strategy'
   * Arguments: { privacyLevel, strategy }
   */
  ipcMain.handle('sync-set-strategy', async (_event: IpcMainEvent, { privacyLevel, strategy }: any) => {
    try {
      syncManager.setSyncStrategy(privacyLevel);
      syncManager.updateSyncConfig(privacyLevel, { strategy });
      return { success: true };
    } catch (error) {
      console.error('Error setting sync strategy:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get sync configuration
   * Event: 'sync-get-config'
   * Arguments: { privacyLevel }
   */
  ipcMain.handle('sync-get-config', async (_event: IpcMainEvent, { privacyLevel }: { privacyLevel: number }) => {
    try {
      const config = syncManager.getSyncConfig(privacyLevel);
      return { success: true, config };
    } catch (error) {
      console.error('Error getting sync config:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Update sync configuration
   * Event: 'sync-update-config'
   * Arguments: { privacyLevel, config }
   */
  ipcMain.handle('sync-update-config', async (_event: IpcMainEvent, { privacyLevel, config }: any) => {
    try {
      syncManager.updateSyncConfig(privacyLevel, config);
      return { success: true };
    } catch (error) {
      console.error('Error updating sync config:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}

/**
 * Remove IPC handlers (cleanup)
 */
export function removeNoteSyncHandlers(): void {
  const handlers = [
    'note-create',
    'note-get',
    'note-get-all',
    'note-get-by-privacy-level',
    'note-delete',
    'note-clear-all',
    'note-encrypt',
    'note-decrypt',
    'sync-start',
    'sync-pause',
    'sync-resume',
    'sync-cancel',
    'sync-get-status',
    'sync-get-progress',
    'sync-retry-failed',
    'note-get-statistics',
    'note-export',
    'note-import',
    'sync-set-strategy',
    'sync-get-config',
    'sync-update-config',
  ];

  handlers.forEach((handler) => {
    ipcMain.removeHandler(handler);
  });
}
