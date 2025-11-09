/**
 * Config Contracts Tests
 *
 * Tests for chain configuration and contract address utilities
 */
import { describe, it, expect } from 'vitest';
import { getChainContracts, isNativeToken, getWrappedNativeToken, requiresApproval, validateChainConfig, getSupportedChains, isChainSupported } from '../contracts';
describe('Contract Configuration', () => {
    describe('getChainContracts', () => {
        it('should return Sepolia contracts', () => {
            const contracts = getChainContracts(11155111);
            expect(contracts).toBeDefined();
            expect(contracts.railgun).toBe('0xeCFCf3b4eC647c4Ca6D49108b311b7a7C9543fea');
            expect(contracts.weth).toBe('0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14');
        });
        it('should return Mainnet contracts', () => {
            const contracts = getChainContracts(1);
            expect(contracts).toBeDefined();
            expect(contracts.railgun).toBeDefined();
            expect(contracts.weth).toBeDefined();
        });
        it('should throw for unsupported chain', () => {
            expect(() => {
                getChainContracts(999999);
            }).toThrow('Unsupported chain ID');
        });
    });
    describe('isNativeToken', () => {
        it('should recognize zero address as native', () => {
            expect(isNativeToken('0x0000000000000000000000000000000000000000')).toBe(true);
        });
        it('should recognize alternative native representation', () => {
            expect(isNativeToken('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')).toBe(true);
        });
        it('should not recognize WETH as native', () => {
            expect(isNativeToken('0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14')).toBe(false);
        });
    });
    describe('getWrappedNativeToken', () => {
        it('should return WETH for Sepolia', () => {
            const weth = getWrappedNativeToken(11155111);
            expect(weth).toBe('0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14');
        });
        it('should return WETH for Mainnet', () => {
            const weth = getWrappedNativeToken(1);
            expect(weth).toBe('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
        });
    });
    describe('requiresApproval', () => {
        it('should not require approval for native token', () => {
            expect(requiresApproval('0x0000000000000000000000000000000000000000')).toBe(false);
        });
        it('should require approval for ERC20 tokens', () => {
            expect(requiresApproval('0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14')).toBe(true);
        });
    });
    describe('validateChainConfig', () => {
        it('should validate Sepolia config', () => {
            expect(validateChainConfig(11155111)).toBe(true);
        });
        it('should validate Mainnet config', () => {
            expect(validateChainConfig(1)).toBe(true);
        });
        it('should fail for invalid chain', () => {
            expect(validateChainConfig(999999)).toBe(false);
        });
    });
    describe('getSupportedChains', () => {
        it('should return array of chain IDs', () => {
            const chains = getSupportedChains();
            expect(Array.isArray(chains)).toBe(true);
            expect(chains).toContain(1);
            expect(chains).toContain(11155111);
            expect(chains).toContain(137);
        });
    });
    describe('isChainSupported', () => {
        it('should return true for supported chains', () => {
            expect(isChainSupported(1)).toBe(true);
            expect(isChainSupported(11155111)).toBe(true);
            expect(isChainSupported(137)).toBe(true);
        });
        it('should return false for unsupported chains', () => {
            expect(isChainSupported(999999)).toBe(false);
        });
    });
});
