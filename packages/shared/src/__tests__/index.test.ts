import { describe, it, expect, beforeEach } from '@jest/globals';
import * as crypto from '../crypto/index';
import { sleep, retry, deepClone, isEmpty, debounce, formatAddress } from '../utils/index';
import BridgeRPCClient from '../rpc/index';

/**
 * Crypto Utils Tests
 */
describe('Crypto Utils', () => {
  describe('hashKeccak256', () => {
    it('should hash string to keccak256', () => {
      const hash = crypto.hashKeccak256('hello');
      expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should produce consistent hash', () => {
      const hash1 = crypto.hashKeccak256('test');
      const hash2 = crypto.hashKeccak256('test');
      expect(hash1).toBe(hash2);
    });
  });

  describe('Address Functions', () => {
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6';

    it('should validate correct ethereum address', () => {
      expect(crypto.validateAddress(testAddress)).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(crypto.validateAddress('0x123')).toBe(false);
      expect(crypto.validateAddress('invalid')).toBe(false);
      expect(crypto.validateAddress('0x')).toBe(false);
    });

    it('should convert to checksum address', () => {
      const checksum = crypto.toChecksumAddress(testAddress);
      expect(checksum).toMatch(/^0x[A-Fa-f0-9]{40}$/);
    });

    it('should format address with truncation', () => {
      const formatted = formatAddress(testAddress, 6);
      expect(formatted).toMatch(/^0x.{6}\.\.\..{6}$/);
    });
  });

  describe('Unit Conversions', () => {
    it('should convert wei to eth', () => {
      const eth = crypto.weiToEth('1000000000000000000');
      expect(parseFloat(eth)).toBe(1);
    });

    it('should convert eth to wei', () => {
      const wei = crypto.ethToWei('1');
      expect(wei).toBe('1000000000000000000');
    });

    it('should convert gwei to wei', () => {
      const wei = crypto.gweiToWei('1');
      expect(wei).toBe('1000000000');
    });

    it('should convert wei to gwei', () => {
      const gwei = crypto.weiToGwei('1000000000');
      expect(gwei).toBe('1');
    });
  });

  describe('Hex Functions', () => {
    it('should convert hex to bytes', () => {
      const bytes = crypto.hexToBytes('0x48656c6c6f');
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(5);
    });

    it('should convert bytes to hex', () => {
      const hex = crypto.bytesToHex(new Uint8Array([72, 101, 108, 108, 111]));
      expect(hex).toBe('0x48656c6c6f');
    });

    it('should throw on invalid hex', () => {
      expect(() => crypto.hexToBytes('invalid')).toThrow();
    });
  });
});

/**
 * Utils Tests
 */
describe('General Utils', () => {
  describe('sleep', () => {
    it('should sleep for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(150);
    });
  });

  describe('retry', () => {
    it('should retry function on failure', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'success';
      };

      const result = await retry(fn, { maxAttempts: 5, delayMs: 10 });
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      const fn = async () => {
        throw new Error('Always fails');
      };

      await expect(retry(fn, { maxAttempts: 2, delayMs: 10 })).rejects.toThrow();
    });
  });

  describe('deepClone', () => {
    it('should clone nested objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should clone arrays', () => {
      const original = [1, 2, [3, 4]];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = jest.fn(() => callCount++);
      const debounced = debounce(fn, 50);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();
      
      await sleep(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * Bridge RPC Client Tests
 */
describe('BridgeRPCClient', () => {
  let client: BridgeRPCClient;

  beforeEach(() => {
    client = new BridgeRPCClient('ws://localhost:21325');
  });

  it('should create client with default URL', () => {
    const defaultClient = new BridgeRPCClient();
    expect(defaultClient).toBeDefined();
  });

  it('should create client with custom URL', () => {
    const customClient = new BridgeRPCClient('ws://example.com:8080');
    expect(customClient).toBeDefined();
  });

  describe('Connection', () => {
    it('should fail to connect to invalid host', async () => {
      const invalidClient = new BridgeRPCClient('ws://invalid-host-xyz:9999');
      await expect(invalidClient.connect()).rejects.toThrow();
    });

    it('should disconnect properly', () => {
      client.disconnect();
      expect(client).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle request timeout', async () => {
      client.disconnect(); // Ensure disconnected
      
      await expect(client.getPublicKey("m/44'/60'/0'/0/0")).rejects.toThrow('Bridge not connected');
    });
  });
});

export { crypto, sleep, retry, deepClone, isEmpty, debounce, formatAddress };
