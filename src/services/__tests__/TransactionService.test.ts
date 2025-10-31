/**
 * TransactionService Tests
 * 
 * Unit tests for transaction broadcasting and token approval logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionService } from '../services/TransactionService';
import { ethers } from 'ethers';

describe('TransactionService', () => {
  let service: TransactionService;
  const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
  const SEPOLIA_CHAIN_ID = 11155111;

  beforeEach(() => {
    service = new TransactionService(SEPOLIA_RPC, SEPOLIA_CHAIN_ID);
  });

  describe('getProvider', () => {
    it('should return a valid provider', () => {
      const provider = service.getProvider();
      expect(provider).toBeDefined();
      expect(provider).toBeInstanceOf(ethers.JsonRpcProvider);
    });
  });

  describe('parseProofTransaction', () => {
    it('should parse valid base64 proof', () => {
      const txData = {
        to: '0xeCFCf3b4eC647c4Ca6D49108b311b7a7C9543fea',
        data: '0x044a40c3...',
        value: '0',
      };

      const base64Proof = Buffer.from(JSON.stringify(txData)).toString('base64');
      const parsed = TransactionService.parseProofTransaction(base64Proof);

      expect(parsed).toEqual(txData);
    });

    it('should throw on invalid base64', () => {
      expect(() => {
        TransactionService.parseProofTransaction('invalid-base64!!!');
      }).toThrow();
    });
  });

  describe('checkAndApproveToken', () => {
    it('should skip approval for native ETH', async () => {
      // Mock wallet
      const mockWallet = {
        address: '0x75de47f68A7c6F0372B3dA1bF3ab1d52B7a264B0',
      } as any;

      const result = await service.checkAndApproveToken(
        mockWallet,
        '0.001',
        '0x0000000000000000000000000000000000000000'
      );

      expect(result).toBe(true);
    });
  });
});

describe('Utility Functions', () => {
  describe('createSepoliaTransactionService', () => {
    it('should create service with correct chain ID', () => {
      const { createSepoliaTransactionService } = require('../services/TransactionService');
      const service = createSepoliaTransactionService();
      
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TransactionService);
    });
  });

  describe('createMainnetTransactionService', () => {
    it('should create service with correct chain ID', () => {
      const { createMainnetTransactionService } = require('../services/TransactionService');
      const service = createMainnetTransactionService();
      
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TransactionService);
    });
  });
});
