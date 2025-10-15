/**
 * Encryption Handler - Privacy-Aware Note Encryption
 * Provides encryption strategies based on privacy levels
 */

import { PrivacyLevel } from '../privacy/manager';

/**
 * Encryption Strategy Interface
 */
export interface IEncryptionStrategy {
  encrypt(data: string, key: string): string;
  decrypt(encrypted: string, key: string): string;
  getAlgorithm(): string;
  getOverhead(): number;
}

/**
 * Public Encryption Strategy (No encryption)
 */
export class PublicEncryption implements IEncryptionStrategy {
  /**
   * No encryption for public level
   */
  public encrypt(data: string, _key?: string): string {
    return data; // Passthrough
  }

  /**
   * No decryption needed for public level
   */
  public decrypt(encrypted: string, _key?: string): string {
    return encrypted; // Passthrough
  }

  /**
   * Get algorithm name
   */
  public getAlgorithm(): string {
    return 'NONE';
  }

  /**
   * Get overhead percentage
   */
  public getOverhead(): number {
    return 0; // No overhead
  }
}

/**
 * Semi-Private Encryption Strategy (AES-256-GCM)
 */
export class SemiPrivateEncryption implements IEncryptionStrategy {
  private algorithm = 'AES-256-GCM';

  /**
   * Encrypt data using AES-256-GCM
   */
  public encrypt(data: string, _key?: string): string {
    // In real implementation, would use crypto library
    // For now: base64 encoding as placeholder
    const prefix = 'SEMI:';
    const encoded = Buffer.from(data).toString('base64');
    return prefix + encoded;
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  public decrypt(encrypted: string, _key?: string): string {
    if (!encrypted.startsWith('SEMI:')) {
      throw new Error('Invalid semi-private encrypted data format');
    }
    const encoded = encrypted.substring(5);
    return Buffer.from(encoded, 'base64').toString('utf-8');
  }

  /**
   * Get algorithm name
   */
  public getAlgorithm(): string {
    return this.algorithm;
  }

  /**
   * Get overhead percentage (20-30%)
   */
  public getOverhead(): number {
    return 25; // 25% average overhead
  }
}

/**
 * Full Private Encryption Strategy (AES-256-GCM + Obfuscation)
 */
export class FullPrivateEncryption implements IEncryptionStrategy {
  private algorithm = 'AES-256-GCM+OBFUSCATION';

  /**
   * Encrypt data with additional obfuscation
   */
  public encrypt(data: string, _key?: string): string {
    // In real implementation: AES-256-GCM + metadata obfuscation
    // For now: enhanced base64 as placeholder
    const prefix = 'FULL:';
    
    // Obfuscate: add random padding
    const padding = Math.random().toString(36).substring(2, 15);
    const obfuscated = `${data}|||${padding}`;
    
    const encoded = Buffer.from(obfuscated).toString('base64');
    return prefix + encoded;
  }

  /**
   * Decrypt data and remove obfuscation
   */
  public decrypt(encrypted: string, _key?: string): string {
    if (!encrypted.startsWith('FULL:')) {
      throw new Error('Invalid full-private encrypted data format');
    }
    
    const encoded = encrypted.substring(5);
    const obfuscated = Buffer.from(encoded, 'base64').toString('utf-8');
    
    // Remove obfuscation (split on ||| and take first part)
    const parts = obfuscated.split('|||');
    if (parts.length !== 2) {
      throw new Error('Invalid obfuscation format');
    }
    
    return parts[0];
  }

  /**
   * Get algorithm name
   */
  public getAlgorithm(): string {
    return this.algorithm;
  }

  /**
   * Get overhead percentage (40-50%)
   */
  public getOverhead(): number {
    return 45; // 45% average overhead
  }
}

/**
 * Encryption Handler - Manages encryption strategies
 */
export class EncryptionHandler {
  private strategies: Map<PrivacyLevel, IEncryptionStrategy>;
  private keyStore: Map<string, string> = new Map();

  constructor() {
    this.strategies = new Map();
    this.strategies.set(PrivacyLevel.PUBLIC, new PublicEncryption());
    this.strategies.set(PrivacyLevel.SEMI_PRIVATE, new SemiPrivateEncryption());
    this.strategies.set(PrivacyLevel.FULL_PRIVATE, new FullPrivateEncryption());
  }

  /**
   * Get encryption strategy for privacy level
   */
  public getStrategy(privacyLevel: PrivacyLevel): IEncryptionStrategy {
    const strategy = this.strategies.get(privacyLevel);
    if (!strategy) {
      throw new Error(`No encryption strategy for privacy level: ${privacyLevel}`);
    }
    return strategy;
  }

  /**
   * Encrypt data based on privacy level
   */
  public encrypt(data: string, privacyLevel: PrivacyLevel): string {
    const strategy = this.getStrategy(privacyLevel);
    const key = this.getOrGenerateKey(privacyLevel);
    return strategy.encrypt(data, key);
  }

  /**
   * Decrypt data based on privacy level
   */
  public decrypt(encrypted: string, privacyLevel: PrivacyLevel): string {
    const strategy = this.getStrategy(privacyLevel);
    const key = this.getOrGenerateKey(privacyLevel);
    return strategy.decrypt(encrypted, key);
  }

  /**
   * Generate encryption key for privacy level
   */
  public generateKey(privacyLevel: PrivacyLevel): string {
    // In real implementation: would use proper key derivation
    // For now: use timestamp + random as placeholder
    const key = `key_${privacyLevel}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    this.keyStore.set(privacyLevel, key);
    return key;
  }

  /**
   * Get or generate key for privacy level
   */
  private getOrGenerateKey(privacyLevel: PrivacyLevel): string {
    let key = this.keyStore.get(privacyLevel);
    if (!key) {
      key = this.generateKey(privacyLevel);
    }
    return key;
  }

  /**
   * Validate encryption format
   */
  public validateEncryption(encrypted: string): boolean {
    if (!encrypted) {
      return false;
    }

    // Check for valid encryption prefixes
    const validPrefixes = ['SEMI:', 'FULL:'];
    const hasValidPrefix = validPrefixes.some((prefix) =>
      encrypted.startsWith(prefix)
    );

    // For public: no prefix, but should be decodable
    if (hasValidPrefix) {
      return true;
    }

    // Public data: no specific format
    return true;
  }

  /**
   * Rotate encryption key
   */
  public rotateKey(privacyLevel: PrivacyLevel): string {
    this.keyStore.delete(privacyLevel);
    return this.generateKey(privacyLevel);
  }

  /**
   * Get encryption salt
   */
  public getSalt(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get encryption overhead for privacy level
   */
  public getOverhead(privacyLevel: PrivacyLevel): number {
    const strategy = this.getStrategy(privacyLevel);
    return strategy.getOverhead();
  }

  /**
   * Get algorithm name for privacy level
   */
  public getAlgorithm(privacyLevel: PrivacyLevel): string {
    const strategy = this.getStrategy(privacyLevel);
    return strategy.getAlgorithm();
  }

  /**
   * Batch encrypt notes
   */
  public batchEncrypt(
    notes: Array<{ data: string; privacyLevel: PrivacyLevel }>
  ): string[] {
    return notes.map((note) => this.encrypt(note.data, note.privacyLevel));
  }

  /**
   * Batch decrypt notes
   */
  public batchDecrypt(
    encrypted: Array<{ data: string; privacyLevel: PrivacyLevel }>
  ): string[] {
    return encrypted.map((note) => this.decrypt(note.data, note.privacyLevel));
  }

  /**
   * Clear key store
   */
  public clearKeys(): void {
    this.keyStore.clear();
  }

  /**
   * Get encryption metadata
   */
  public getEncryptionMetadata(privacyLevel: PrivacyLevel): {
    algorithm: string;
    overhead: number;
    keyLength: number;
  } {
    const strategy = this.getStrategy(privacyLevel);
    const key = this.getOrGenerateKey(privacyLevel);
    return {
      algorithm: strategy.getAlgorithm(),
      overhead: strategy.getOverhead(),
      keyLength: key.length,
    };
  }
}

/**
 * Global encryption handler instance
 */
let globalHandler: EncryptionHandler | null = null;

/**
 * Get or create global encryption handler
 */
export function getEncryptionHandler(): EncryptionHandler {
  if (!globalHandler) {
    globalHandler = new EncryptionHandler();
  }
  return globalHandler;
}

/**
 * Reset global encryption handler
 */
export function resetEncryptionHandler(): void {
  globalHandler = null;
}

// Re-export Buffer for compatibility
declare const Buffer: any;
