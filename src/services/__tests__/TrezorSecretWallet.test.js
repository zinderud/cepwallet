/**
 * TrezorSecretWallet Service Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrezorSecretWalletService } from '../TrezorSecretWallet';
// Mock TrezorConnect
vi.mock('@trezor/connect-web', () => ({
  default: {
    init: vi.fn(),
    getDeviceState: vi.fn(),
    ethereumGetAddress: vi.fn(),
    cipherKeyValue: vi.fn(),
    ethereumSignTransaction: vi.fn(),
    ethereumSignMessage: vi.fn(),
    dispose: vi.fn(),
  },
}));
describe('TrezorSecretWalletService', () => {
  let service;
  beforeEach(() => {
    service = new TrezorSecretWalletService(true); // Demo mode
    vi.clearAllMocks();
  });
  describe('Demo Mode', () => {
    it('should connect in demo mode', async () => {
      const deviceInfo = await service.connect();
      expect(deviceInfo.connected).toBe(true);
      expect(deviceInfo.model).toContain('Demo');
      expect(deviceInfo.session).toBeDefined();
    });
    it('should enable secret wallet in demo mode', async () => {
      await service.connect();
      const walletInfo = await service.enableSecretWallet();
      expect(walletInfo.isSecretWallet).toBe(true);
      expect(walletInfo.address).toBeDefined();
      expect(walletInfo.path).toBe("m/44'/60'/0'/0/0");
    });
    it('should derive RAILGUN keys in demo mode', async () => {
      await service.connect();
      await service.enableSecretWallet();
      const keySet = await service.deriveRailgunKeySet('test-wallet-id');
      expect(keySet.spendingKey).toMatch(/^0x[0-9a-f]{64}$/);
      expect(keySet.viewingKey).toMatch(/^0x[0-9a-f]{64}$/);
      expect(keySet.nullifyingKey).toMatch(/^0x[0-9a-f]{64}$/);
      expect(keySet.walletId).toBe('test-wallet-id');
    });
  });
  describe('Service State', () => {
    it('should track connection state', async () => {
      expect(service.isConnected()).toBe(false);
      await service.connect();
      expect(service.isConnected()).toBe(true);
      await service.disconnect();
      expect(service.isConnected()).toBe(false);
    });
    it('should provide session ID', async () => {
      expect(service.getSessionId()).toBeNull();
      await service.connect();
      expect(service.getSessionId()).toBeDefined();
    });
  });
});
