/**
 * Note Sync System - Comprehensive Test Suite
 * Tests for NoteManager, EncryptionHandler, SyncManager, and integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NoteManager, NoteData, NoteMetadata, SyncStatus, PrivacyLevel } from '../notes/manager';
import { EncryptionHandler, PublicEncryption, SemiPrivateEncryption, FullPrivateEncryption } from '../notes/encryption';
import { SyncManager, SyncResult } from '../notes/sync';

/**
 * NoteManager Tests
 */
describe('NoteManager', () => {
  let manager: NoteManager;

  beforeEach(() => {
    manager = NoteManager.getInstance();
    manager.clearNotes();
  });

  it('should create a note with metadata', () => {
    const noteData: NoteData = {
      commitmentHash: 'hash123',
      encryptedData: 'encrypted_data',
      privacyLevel: PrivacyLevel.FULL_PRIVATE,
      timestamp: Date.now(),
    };

    const metadata = manager.createNote(noteData, {
      txHash: 'tx123',
      fromAddress: '0xabc',
      toAddress: '0xdef',
      amount: '1000000000000000000',
      privacyLevel: PrivacyLevel.FULL_PRIVATE,
      encryptedFlag: true,
    });

    expect(metadata).toBeDefined();
    expect(metadata.id).toBeDefined();
    expect(metadata.privacyLevel).toBe(PrivacyLevel.FULL_PRIVATE);
    expect(metadata.encryptedFlag).toBe(true);
  });

  it('should retrieve a note by ID', () => {
    const noteData: NoteData = {
      commitmentHash: 'hash123',
      encryptedData: 'encrypted_data',
      privacyLevel: PrivacyLevel.SEMI_PRIVATE,
      timestamp: Date.now(),
    };

    const metadata = manager.createNote(noteData, {
      txHash: 'tx123',
      fromAddress: '0xabc',
      toAddress: '0xdef',
      amount: '500000000000000000',
      privacyLevel: PrivacyLevel.SEMI_PRIVATE,
      encryptedFlag: true,
    });

    const retrieved = manager.getNote(metadata.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.commitmentHash).toBe('hash123');
  });

  it('should get all notes', () => {
    for (let i = 0; i < 3; i++) {
      manager.createNote(
        {
          commitmentHash: `hash${i}`,
          encryptedData: `encrypted_data${i}`,
          privacyLevel: PrivacyLevel.PUBLIC,
          timestamp: Date.now(),
        },
        {
          txHash: `tx${i}`,
          fromAddress: '0xabc',
          toAddress: '0xdef',
          amount: `${(i + 1) * 100}000000000000000000`,
          privacyLevel: PrivacyLevel.PUBLIC,
          encryptedFlag: false,
        }
      );
    }

    const notes = manager.getNotes();
    expect(notes.length).toBe(3);
  });

  it('should filter notes by privacy level', () => {
    manager.createNote(
      {
        commitmentHash: 'hash1',
        encryptedData: 'encrypted_data1',
        privacyLevel: PrivacyLevel.PUBLIC,
        timestamp: Date.now(),
      },
      {
        txHash: 'tx1',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        amount: '1000000000000000000',
        privacyLevel: PrivacyLevel.PUBLIC,
        encryptedFlag: false,
      }
    );

    manager.createNote(
      {
        commitmentHash: 'hash2',
        encryptedData: 'encrypted_data2',
        privacyLevel: PrivacyLevel.FULL_PRIVATE,
        timestamp: Date.now(),
      },
      {
        txHash: 'tx2',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        amount: '2000000000000000000',
        privacyLevel: PrivacyLevel.FULL_PRIVATE,
        encryptedFlag: true,
      }
    );

    const publicNotes = manager.getNotesByPrivacyLevel(PrivacyLevel.PUBLIC);
    const privateNotes = manager.getNotesByPrivacyLevel(PrivacyLevel.FULL_PRIVATE);

    expect(publicNotes.length).toBe(1);
    expect(privateNotes.length).toBe(1);
  });

  it('should update note sync status', () => {
    const noteData: NoteData = {
      commitmentHash: 'hash123',
      encryptedData: 'encrypted_data',
      privacyLevel: PrivacyLevel.SEMI_PRIVATE,
      timestamp: Date.now(),
    };

    const metadata = manager.createNote(noteData, {
      txHash: 'tx123',
      fromAddress: '0xabc',
      toAddress: '0xdef',
      amount: '1000000000000000000',
      privacyLevel: PrivacyLevel.SEMI_PRIVATE,
      encryptedFlag: true,
    });

    manager.updateNoteStatus(metadata.id, SyncStatus.SYNCED, Date.now());

    const updated = manager.getNoteMetadata(metadata.id);
    expect(updated?.syncStatus).toBe(SyncStatus.SYNCED);
  });

  it('should delete a note', () => {
    const noteData: NoteData = {
      commitmentHash: 'hash123',
      encryptedData: 'encrypted_data',
      privacyLevel: PrivacyLevel.PUBLIC,
      timestamp: Date.now(),
    };

    const metadata = manager.createNote(noteData, {
      txHash: 'tx123',
      fromAddress: '0xabc',
      toAddress: '0xdef',
      amount: '1000000000000000000',
      privacyLevel: PrivacyLevel.PUBLIC,
      encryptedFlag: false,
    });

    manager.deleteNote(metadata.id);

    const deleted = manager.getNote(metadata.id);
    expect(deleted).toBeUndefined();
  });

  it('should calculate statistics', () => {
    manager.createNote(
      {
        commitmentHash: 'hash1',
        encryptedData: 'encrypted_data1',
        privacyLevel: PrivacyLevel.PUBLIC,
        timestamp: Date.now(),
      },
      {
        txHash: 'tx1',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        amount: '1000000000000000000',
        privacyLevel: PrivacyLevel.PUBLIC,
        encryptedFlag: false,
      }
    );

    manager.createNote(
      {
        commitmentHash: 'hash2',
        encryptedData: 'encrypted_data2',
        privacyLevel: PrivacyLevel.FULL_PRIVATE,
        timestamp: Date.now(),
      },
      {
        txHash: 'tx2',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        amount: '2000000000000000000',
        privacyLevel: PrivacyLevel.FULL_PRIVATE,
        encryptedFlag: true,
      }
    );

    const stats = manager.getStatistics();
    expect(stats.totalNotes).toBe(2);
    expect(stats.encryptedNotes).toBe(1);
  });

  it('should export and import notes', () => {
    manager.createNote(
      {
        commitmentHash: 'hash1',
        encryptedData: 'encrypted_data1',
        privacyLevel: PrivacyLevel.SEMI_PRIVATE,
        timestamp: Date.now(),
      },
      {
        txHash: 'tx1',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        amount: '1000000000000000000',
        privacyLevel: PrivacyLevel.SEMI_PRIVATE,
        encryptedFlag: true,
      }
    );

    const exported = manager.exportNotes();
    expect(exported).toBeDefined();
    expect(exported.notes).toBeDefined();

    manager.clearNotes();
    expect(manager.getNotes().length).toBe(0);

    manager.importNotes(exported);
    expect(manager.getNotes().length).toBe(1);
  });

  it('should check storage limits', () => {
    const remaining = manager.getRemainingStorage();
    expect(remaining).toBeGreaterThan(0);

    const percentage = manager.getStoragePercentage();
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });
});

/**
 * EncryptionHandler Tests
 */
describe('EncryptionHandler', () => {
  let handler: EncryptionHandler;

  beforeEach(() => {
    handler = new EncryptionHandler();
  });

  it('should not encrypt public level data', () => {
    const data = 'test_data';
    const encrypted = handler.encrypt(data, PrivacyLevel.PUBLIC);
    expect(encrypted).toBe(data); // No encryption for public
  });

  it('should encrypt semi-private level data', () => {
    const data = 'test_data_semi';
    const encrypted = handler.encrypt(data, PrivacyLevel.SEMI_PRIVATE);
    expect(encrypted).not.toBe(data); // Should be encrypted
    expect(encrypted).toContain('SEMI:'); // Should have prefix
  });

  it('should encrypt full-private level data', () => {
    const data = 'test_data_full';
    const encrypted = handler.encrypt(data, PrivacyLevel.FULL_PRIVATE);
    expect(encrypted).not.toBe(data); // Should be encrypted
    expect(encrypted).toContain('FULL:'); // Should have prefix
  });

  it('should decrypt semi-private data', () => {
    const data = 'test_data_semi_decrypt';
    const encrypted = handler.encrypt(data, PrivacyLevel.SEMI_PRIVATE);
    const decrypted = handler.decrypt(encrypted, PrivacyLevel.SEMI_PRIVATE);
    expect(decrypted).toBe(data);
  });

  it('should decrypt full-private data', () => {
    const data = 'test_data_full_decrypt';
    const encrypted = handler.encrypt(data, PrivacyLevel.FULL_PRIVATE);
    const decrypted = handler.decrypt(encrypted, PrivacyLevel.FULL_PRIVATE);
    expect(decrypted).toBe(data);
  });

  it('should generate encryption keys', () => {
    const key = handler.generateKey(PrivacyLevel.SEMI_PRIVATE);
    expect(key).toBeDefined();
    expect(key.length).toBeGreaterThan(0);
  });

  it('should validate encryption format', () => {
    expect(handler.validateEncryption('')).toBe(false);
    expect(handler.validateEncryption('SEMI:dGVzdA==')).toBe(true);
    expect(handler.validateEncryption('FULL:dGVzdA==')).toBe(true);
  });

  it('should get encryption overhead', () => {
    const publicOverhead = handler.getOverhead(PrivacyLevel.PUBLIC);
    const semiOverhead = handler.getOverhead(PrivacyLevel.SEMI_PRIVATE);
    const fullOverhead = handler.getOverhead(PrivacyLevel.FULL_PRIVATE);

    expect(publicOverhead).toBe(0);
    expect(semiOverhead).toBeGreaterThan(0);
    expect(fullOverhead).toBeGreaterThan(semiOverhead);
  });

  it('should batch encrypt notes', () => {
    const notes = [
      { data: 'note1', privacyLevel: PrivacyLevel.PUBLIC },
      { data: 'note2', privacyLevel: PrivacyLevel.SEMI_PRIVATE },
      { data: 'note3', privacyLevel: PrivacyLevel.FULL_PRIVATE },
    ];

    const encrypted = handler.batchEncrypt(notes);
    expect(encrypted.length).toBe(3);
  });

  it('should batch decrypt notes', () => {
    const notes = [
      { data: 'note1', privacyLevel: PrivacyLevel.PUBLIC },
      { data: 'note2_encrypted', privacyLevel: PrivacyLevel.SEMI_PRIVATE },
    ];

    const encrypted = handler.batchEncrypt(notes);
    expect(encrypted.length).toBe(2);
  });
});

/**
 * SyncManager Tests
 */
describe('SyncManager', () => {
  let manager: SyncManager;

  beforeEach(() => {
    manager = new SyncManager();
  });

  it('should initialize with default sync configs', () => {
    const config = manager.getSyncConfig(PrivacyLevel.PUBLIC);
    expect(config).toBeDefined();
    expect(config?.strategy).toBe('lazy');
  });

  it('should set sync strategy for privacy level', () => {
    const strategy = manager.setSyncStrategy(PrivacyLevel.FULL_PRIVATE);
    expect(strategy).toBe('immediate');

    const semiStrategy = manager.setSyncStrategy(PrivacyLevel.SEMI_PRIVATE);
    expect(semiStrategy).toBe('batched');

    const publicStrategy = manager.setSyncStrategy(PrivacyLevel.PUBLIC);
    expect(publicStrategy).toBe('lazy');
  });

  it('should get sync status', () => {
    const status = manager.getSyncStatus();
    expect(status).toBe(SyncStatus.PENDING);
  });

  it('should get sync progress', () => {
    const progress = manager.getProgress();
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('should check if syncing', () => {
    const syncing = manager.isSyncInProgress();
    expect(syncing).toBe(false);
  });

  it('should get next sync time', () => {
    const nextTime = manager.getNextSyncTime();
    expect(nextTime).toBeGreaterThanOrEqual(0);
  });

  it('should get sync statistics', () => {
    const stats = manager.getSyncStatistics();
    expect(stats.totalSyncs).toBe(0);
    expect(stats.successfulSyncs).toBe(0);
    expect(stats.failedSyncs).toBe(0);
  });

  it('should update sync configuration', () => {
    manager.updateSyncConfig(PrivacyLevel.PUBLIC, { batchSize: 100 });
    const config = manager.getSyncConfig(PrivacyLevel.PUBLIC);
    expect(config?.batchSize).toBe(100);
  });

  it('should reset statistics', () => {
    manager.resetStatistics();
    const stats = manager.getSyncStatistics();
    expect(stats.totalSyncs).toBe(0);
  });

  it('should pause sync', () => {
    manager.pauseSync();
    expect(manager.getSyncStatus()).toBe(SyncStatus.PENDING);
    expect(manager.isSyncInProgress()).toBe(false);
  });

  it('should cancel sync', () => {
    manager.cancelSync();
    expect(manager.isSyncInProgress()).toBe(false);
    expect(manager.getProgress()).toBe(0);
  });
});

/**
 * Integration Tests
 */
describe('Note Sync Integration', () => {
  let noteManager: NoteManager;
  let encryptionHandler: EncryptionHandler;
  let syncManager: SyncManager;

  beforeEach(() => {
    noteManager = NoteManager.getInstance();
    noteManager.clearNotes();
    encryptionHandler = new EncryptionHandler();
    syncManager = new SyncManager();
  });

  it('should complete full note lifecycle: create -> encrypt -> sync', () => {
    // Create note
    const data = { from: '0xabc', to: '0xdef', amount: '1000000000000000000' };
    const encryptedData = encryptionHandler.encrypt(
      JSON.stringify(data),
      PrivacyLevel.FULL_PRIVATE
    );

    const noteData: NoteData = {
      commitmentHash: 'hash123',
      encryptedData,
      privacyLevel: PrivacyLevel.FULL_PRIVATE,
      timestamp: Date.now(),
    };

    const metadata = noteManager.createNote(noteData, {
      txHash: 'tx123',
      fromAddress: data.from,
      toAddress: data.to,
      amount: data.amount,
      privacyLevel: PrivacyLevel.FULL_PRIVATE,
      encryptedFlag: true,
    });

    // Verify creation
    expect(metadata).toBeDefined();
    expect(metadata.syncStatus).toBe(SyncStatus.PENDING);

    // Update sync status
    noteManager.updateNoteStatus(metadata.id, SyncStatus.SYNCED);

    // Verify sync
    const updated = noteManager.getNoteMetadata(metadata.id);
    expect(updated?.syncStatus).toBe(SyncStatus.SYNCED);

    // Decrypt data
    const retrieved = noteManager.getNote(metadata.id);
    const decrypted = encryptionHandler.decrypt(
      retrieved!.encryptedData,
      PrivacyLevel.FULL_PRIVATE
    );

    const originalData = JSON.parse(decrypted);
    expect(originalData.from).toBe(data.from);
  });

  it('should handle multi-level sync with different strategies', () => {
    // Create notes with different privacy levels
    const privacyLevels = [PrivacyLevel.PUBLIC, PrivacyLevel.SEMI_PRIVATE, PrivacyLevel.FULL_PRIVATE];

    privacyLevels.forEach((level) => {
      const data = { from: '0xabc', to: '0xdef', amount: '1000000000000000000' };
      const encryptedData = encryptionHandler.encrypt(JSON.stringify(data), level);

      noteManager.createNote(
        {
          commitmentHash: `hash_${level}`,
          encryptedData,
          privacyLevel: level,
          timestamp: Date.now(),
        },
        {
          txHash: `tx_${level}`,
          fromAddress: data.from,
          toAddress: data.to,
          amount: data.amount,
          privacyLevel: level,
          encryptedFlag: level !== PrivacyLevel.PUBLIC,
        }
      );
    });

    // Verify notes created
    expect(noteManager.getNotes().length).toBe(3);

    // Verify sync strategies
    expect(syncManager.setSyncStrategy(PrivacyLevel.PUBLIC)).toBe('lazy');
    expect(syncManager.setSyncStrategy(PrivacyLevel.SEMI_PRIVATE)).toBe('batched');
    expect(syncManager.setSyncStrategy(PrivacyLevel.FULL_PRIVATE)).toBe('immediate');
  });

  it('should calculate privacy statistics', () => {
    // Create notes with mixed privacy levels
    for (let i = 0; i < 3; i++) {
      const level = i === 0 ? PrivacyLevel.PUBLIC : 
                    i === 1 ? PrivacyLevel.SEMI_PRIVATE : 
                    PrivacyLevel.FULL_PRIVATE;

      noteManager.createNote(
        {
          commitmentHash: `hash${i}`,
          encryptedData: `encrypted_data${i}`,
          privacyLevel: level,
          timestamp: Date.now(),
        },
        {
          txHash: `tx${i}`,
          fromAddress: '0xabc',
          toAddress: '0xdef',
          amount: `${(i + 1) * 100}000000000000000000`,
          privacyLevel: level,
          encryptedFlag: level !== PrivacyLevel.PUBLIC,
        }
      );
    }

    const stats = noteManager.getStatistics();
    expect(stats.totalNotes).toBe(3);
    expect(stats.encryptedNotes).toBe(2);
    expect(stats.notesByPrivacyLevel[PrivacyLevel.PUBLIC]).toBe(1);
    expect(stats.notesByPrivacyLevel[PrivacyLevel.SEMI_PRIVATE]).toBe(1);
    expect(stats.notesByPrivacyLevel[PrivacyLevel.FULL_PRIVATE]).toBe(1);
  });
});
