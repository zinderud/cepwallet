/**
 * Railgun Bridge Integration Tests
 * Tests for Railgun operations through bridge
 */

import * as railgun from '../railgun/index';
import * as shield from '../railgun/shield';
import * as transfer from '../railgun/transfer';
import * as unshield from '../railgun/unshield';

describe('Railgun Bridge Integration', () => {
  // ==================== SHIELD INTEGRATION ====================

  describe('Shield Integration', () => {
    it('should handle shield request with all validations', async () => {
      const input: shield.ShieldInput = {
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '1000000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      };

      const validation = shield.validateShieldInputs(input);
      expect(validation.valid).toBe(true);

      const tx = await shield.createShieldTx(input);
      expect(tx.txData).toBeDefined();
      expect(tx.to).toBeDefined();
      expect(tx.gasEstimate).toBeDefined();
      expect(tx.fee).toBeDefined();
    });

    it('should handle shield with rejected invalid inputs', async () => {
      const invalidInputs = [
        {
          tokenAddress: 'invalid',
          amount: '1000000000000000000',
          recipient: '0x' + '1'.repeat(64),
          publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        },
        {
          tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
          amount: '0',
          recipient: '0x' + '1'.repeat(64),
          publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        },
        {
          tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
          amount: '1000000000000000000',
          recipient: 'invalid',
          publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        },
      ];

      for (const invalid of invalidInputs) {
        const validation = shield.validateShieldInputs(invalid as any);
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      }
    });

    it('should estimate shield costs accurately', async () => {
      const input: shield.ShieldInput = {
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '1000000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      };

      const cost = await shield.getShieldTotalCost(input);
      expect(BigInt(cost.total)).toBeGreaterThan(BigInt(cost.amount));
      expect(BigInt(cost.fee)).toBeGreaterThan(0n);
    });

    it('should simulate shield successfully', async () => {
      const input: shield.ShieldInput = {
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '1000000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      };

      const simulated = await shield.simulateShield(input);
      expect(simulated).toBe(true);
    });
  });

  // ==================== TRANSFER INTEGRATION ====================

  describe('Transfer Integration', () => {
    it('should handle private transfer with relayer selection', async () => {
      const input: transfer.PrivateTransferInput = {
        fromRailgun: '0x' + '1'.repeat(64),
        toRailgun: '0x' + '2'.repeat(64),
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '500000000000000000',
        relayerAddress: '',
      };

      // Get recommended relayer
      const relayer = await transfer.getRecommendedRelayer(input.amount);
      expect(relayer).toBeDefined();
      input.relayerAddress = relayer || '';

      // Create transfer
      const tx = await transfer.createPrivateTransfer(input);
      expect(tx.txData).toBeDefined();
      expect(tx.relayerFee).toBeDefined();
      expect(tx.protocolFee).toBeDefined();
    });

    it('should validate transfer addresses correctly', async () => {
      const input: transfer.PrivateTransferInput = {
        fromRailgun: '0x' + '1'.repeat(64),
        toRailgun: '0x' + '2'.repeat(64),
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '500000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      };

      const validation = transfer.validateTransferInputs(input);
      expect(validation.valid).toBe(true);
    });

    it('should prevent transfer to self', async () => {
      const input: transfer.PrivateTransferInput = {
        fromRailgun: '0x' + '1'.repeat(64),
        toRailgun: '0x' + '1'.repeat(64), // Same address
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '500000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      };

      const validation = transfer.validateTransferInputs(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors.join('')).toContain('self');
    });

    it('should check relayer compatibility', async () => {
      const amount = '500000000000000000';
      const relayerAddress = '0xRelayer1234567890123456789012345678901234';

      const compatible = await transfer.checkRelayerCompatibility(relayerAddress, amount);
      expect(typeof compatible).toBe('boolean');
    });

    it('should list available relayers', async () => {
      const relayers = await transfer.getAvailableRelayers();
      expect(Array.isArray(relayers)).toBe(true);
      expect(relayers.length).toBeGreaterThan(0);

      if (relayers.length > 0) {
        const relayer = relayers[0];
        expect(relayer.address).toBeDefined();
        expect(relayer.feePercentage).toBeGreaterThan(0);
        expect(relayer.status).toBe('active');
      }
    });

    it('should estimate transfer fees correctly', async () => {
      const input: transfer.PrivateTransferInput = {
        fromRailgun: '0x' + '1'.repeat(64),
        toRailgun: '0x' + '2'.repeat(64),
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '500000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      };

      const cost = await transfer.getTransferTotalCost(input);
      expect(BigInt(cost.totalFee)).toBeGreaterThan(0n);
      expect(BigInt(cost.total)).toEqual(
        BigInt(cost.amount) + BigInt(cost.totalFee)
      );
    });
  });

  // ==================== UNSHIELD INTEGRATION ====================

  describe('Unshield Integration', () => {
    it('should handle unshield with validation', async () => {
      const input: unshield.UnshieldInput = {
        fromRailgun: '0x' + '1'.repeat(64),
        toPublicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '750000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      };

      const validation = unshield.validateUnshieldInputs(input);
      expect(validation.valid).toBe(true);

      const tx = await unshield.createUnshieldTx(input);
      expect(tx.txData).toBeDefined();
      expect(tx.fee).toBeDefined();
    });

    it('should verify unshield feasibility', async () => {
      const input: unshield.UnshieldInput = {
        fromRailgun: '0x' + '1'.repeat(64),
        toPublicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '750000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      };

      const feasibility = await unshield.verifyUnshieldFeasibility(input);
      expect(feasibility.feasible).toBe(true);
    });

    it('should estimate unshield time', async () => {
      const timeEstimate = await unshield.getUnshieldTimeEstimate();
      expect(timeEstimate.minTime).toBeLessThanOrEqual(timeEstimate.avgTime);
      expect(timeEstimate.avgTime).toBeLessThanOrEqual(timeEstimate.maxTime);
    });

    it('should handle unshield gas pricing', async () => {
      const gasPrice = await unshield.getUnshieldGasPrice();
      expect(Number(gasPrice)).toBeGreaterThan(0);
    });

    it('should prepare unshield with all parameters', async () => {
      const tx = await unshield.prepareUnshield(
        '0x' + '1'.repeat(64),
        '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        '750000000000000000'
      );

      expect(tx.txData).toBeDefined();
      expect(tx.fee).toBeDefined();
    });
  });

  // ==================== CROSS-MODULE INTEGRATION ====================

  describe('Cross-Module Integration', () => {
    it('should handle complete Shield -> Transfer -> Unshield flow', async () => {
      // STEP 1: Shield
      const shieldInput: shield.ShieldInput = {
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '1000000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      };

      const shieldTx = await shield.createShieldTx(shieldInput);
      expect(shieldTx.txData).toBeDefined();

      // STEP 2: Transfer between private accounts
      const transferInput: transfer.PrivateTransferInput = {
        fromRailgun: shieldInput.recipient,
        toRailgun: '0x' + '2'.repeat(64),
        tokenAddress: shieldInput.tokenAddress,
        amount: '500000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      };

      const transferTx = await transfer.createPrivateTransfer(transferInput);
      expect(transferTx.txData).toBeDefined();

      // STEP 3: Unshield back to public
      const unshieldInput: unshield.UnshieldInput = {
        fromRailgun: transferInput.toRailgun,
        toPublicAddress: shieldInput.publicAddress,
        tokenAddress: shieldInput.tokenAddress,
        amount: '500000000000000000',
        relayerAddress: transferInput.relayerAddress,
      };

      const unshieldTx = await unshield.createUnshieldTx(unshieldInput);
      expect(unshieldTx.txData).toBeDefined();

      // Verify all transactions are created
      expect([shieldTx.txData, transferTx.txData, unshieldTx.txData].every((d) => d)).toBe(true);
    });

    it('should handle multiple sequential operations', async () => {
      const operations: Array<{ type: string; result: any }> = [];

      // Shield 1
      const shield1 = await shield.createShieldTx({
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '1000000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      });
      operations.push({ type: 'shield', result: shield1 });

      // Shield 2 (different token)
      const shield2 = await shield.createShieldTx({
        tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        amount: '500000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      });
      operations.push({ type: 'shield', result: shield2 });

      // Transfer
      const transfer1 = await transfer.createPrivateTransfer({
        fromRailgun: '0x' + '1'.repeat(64),
        toRailgun: '0x' + '2'.repeat(64),
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '500000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      });
      operations.push({ type: 'transfer', result: transfer1 });

      // Unshield
      const unshield1 = await unshield.createUnshieldTx({
        fromRailgun: '0x' + '2'.repeat(64),
        toPublicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
        amount: '500000000000000000',
        relayerAddress: '0xRelayer1234567890123456789012345678901234',
      });
      operations.push({ type: 'unshield', result: unshield1 });

      expect(operations.length).toBe(4);
      expect(operations.every((op) => op.result.txData)).toBe(true);
    });

    it('should validate fee consistency across operations', async () => {
      const amount = '1000000000000000000';
      const token = '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6';

      const shieldFee = await railgun.getShieldingFee(token, amount);
      const transferFee = await railgun.getTransferFee(amount);
      const unshieldFee = await railgun.getUnshieldingFee(token, amount);

      expect(Number(shieldFee.totalFee)).toBeGreaterThan(0);
      expect(Number(transferFee.totalFee)).toBeGreaterThan(0);
      expect(Number(unshieldFee.totalFee)).toBeGreaterThan(0);

      // Shield and unshield should have similar structure
      expect(typeof shieldFee.feePercentage).toBe('number');
      expect(typeof unshieldFee.feePercentage).toBe('number');
    });
  });

  // ==================== ERROR HANDLING ====================

  describe('Error Handling', () => {
    it('should handle invalid amounts gracefully', async () => {
      const invalidAmounts = ['0', '-100', 'abc', ''];

      for (const amount of invalidAmounts) {
        const input: shield.ShieldInput = {
          tokenAddress: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
          amount,
          recipient: '0x' + '1'.repeat(64),
          publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
        };

        const validation = shield.validateShieldInputs(input);
        expect(validation.valid).toBe(false);
      }
    });

    it('should handle invalid addresses gracefully', async () => {
      const invalidAddresses = ['', 'short', '0x12345'];

      for (const address of invalidAddresses) {
        expect(railgun.validateTokenAddress(address)).toBe(false);
      }
    });

    it('should provide meaningful error messages', async () => {
      const input: shield.ShieldInput = {
        tokenAddress: 'invalid-token',
        amount: '1000000000000000000',
        recipient: '0x' + '1'.repeat(64),
        publicAddress: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      };

      const validation = shield.validateShieldInputs(input);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0].length).toBeGreaterThan(0);
    });
  });
});
