/**
 * Railgun Bridge IPC Handlers
 * Electron main process handlers for Railgun operations
 */

import { ipcMain } from 'electron';
import { getRailgunEngine } from '../../../shared/src/railgun/index';
import * as shield from '../../../shared/src/railgun/shield';
import * as transfer from '../../../shared/src/railgun/transfer';
import * as unshield from '../../../shared/src/railgun/unshield';

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Register all Railgun IPC handlers
 */
export function registerRailgunHandlers(): void {
  // ==================== Shield Handler ====================

  ipcMain.handle(
    'bridge:shield-request',
    async (_event, input: shield.ShieldInput): Promise<IPCResponse> => {
      try {
        // Validate input
        const validation = shield.validateShieldInputs(input);
        if (!validation.valid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Shield validation failed',
              details: validation.errors.join(', '),
            },
          };
        }

        // Create shield transaction
        const tx = await shield.createShieldTx(input);

        return {
          success: true,
          data: {
            txData: tx.txData,
            to: tx.to,
            value: tx.value,
            gasEstimate: tx.gasEstimate,
            fee: tx.fee,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'SHIELD_ERROR',
            message: error.message || 'Shield operation failed',
          },
        };
      }
    }
  );

  // ==================== Transfer Handler ====================

  ipcMain.handle(
    'bridge:transfer-request',
    async (_event, input: transfer.PrivateTransferInput): Promise<IPCResponse> => {
      try {
        // Validate input
        const validation = transfer.validateTransferInputs(input);
        if (!validation.valid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Transfer validation failed',
              details: validation.errors.join(', '),
            },
          };
        }

        // Get recommended relayer if not provided
        if (!input.relayerAddress || input.relayerAddress === '') {
          const recommendedRelayer = await transfer.getRecommendedRelayer(input.amount);
          if (!recommendedRelayer) {
            return {
              success: false,
              error: {
                code: 'RELAYER_ERROR',
                message: 'No available relayer for this transaction',
              },
            };
          }
          input.relayerAddress = recommendedRelayer;
        }

        // Create transfer transaction
        const tx = await transfer.createPrivateTransfer(input);

        return {
          success: true,
          data: {
            txData: tx.txData,
            to: tx.to,
            value: tx.value,
            gasEstimate: tx.gasEstimate,
            relayerFee: tx.relayerFee,
            protocolFee: tx.protocolFee,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'TRANSFER_ERROR',
            message: error.message || 'Transfer operation failed',
          },
        };
      }
    }
  );

  // ==================== Unshield Handler ====================

  ipcMain.handle(
    'bridge:unshield-request',
    async (_event, input: unshield.UnshieldInput): Promise<IPCResponse> => {
      try {
        // Validate input
        const validation = unshield.validateUnshieldInputs(input);
        if (!validation.valid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Unshield validation failed',
              details: validation.errors.join(', '),
            },
          };
        }

        // Verify feasibility
        const feasibility = await unshield.verifyUnshieldFeasibility(input);
        if (!feasibility.feasible) {
          return {
            success: false,
            error: {
              code: 'FEASIBILITY_ERROR',
              message: feasibility.reason || 'Unshield not feasible',
            },
          };
        }

        // Create unshield transaction
        const tx = await unshield.createUnshieldTx(input);

        // Get time estimate
        const timeEstimate = await unshield.getUnshieldTimeEstimate();

        return {
          success: true,
          data: {
            txData: tx.txData,
            to: tx.to,
            value: tx.value,
            gasEstimate: tx.gasEstimate,
            fee: tx.fee,
            timeEstimate,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'UNSHIELD_ERROR',
            message: error.message || 'Unshield operation failed',
          },
        };
      }
    }
  );

  // ==================== Estimate Gas Handler ====================

  ipcMain.handle(
    'bridge:estimate-railgun-gas',
    async (
      _event,
      params: {
        operationType: 'shield' | 'transfer' | 'unshield';
        amount: string;
        tokenAddress?: string;
        relayerAddress?: string;
      }
    ): Promise<IPCResponse> => {
      try {
        let gasEstimate: string;

        switch (params.operationType) {
          case 'shield': {
            if (!params.amount) {
              throw new Error('Amount required for shield gas estimation');
            }
            const input: shield.ShieldInput = {
              tokenAddress: params.tokenAddress || '0x0',
              amount: params.amount,
              recipient: '0x' + '1'.repeat(64),
              publicAddress: '0x' + 'a'.repeat(40),
            };
            gasEstimate = await shield.estimateGasShield(input);
            break;
          }
          case 'transfer': {
            if (!params.amount) {
              throw new Error('Amount required for transfer gas estimation');
            }
            const input: transfer.PrivateTransferInput = {
              fromRailgun: '0x' + '1'.repeat(64),
              toRailgun: '0x' + '2'.repeat(64),
              tokenAddress: params.tokenAddress || '0x0',
              amount: params.amount,
              relayerAddress: params.relayerAddress || '',
            };
            gasEstimate = await transfer.estimateGasTransfer(input);
            break;
          }
          case 'unshield': {
            if (!params.amount) {
              throw new Error('Amount required for unshield gas estimation');
            }
            const input: unshield.UnshieldInput = {
              fromRailgun: '0x' + '1'.repeat(64),
              toPublicAddress: '0x' + 'a'.repeat(40),
              tokenAddress: params.tokenAddress || '0x0',
              amount: params.amount,
              relayerAddress: params.relayerAddress || '',
            };
            gasEstimate = await unshield.estimateGasUnshield(input);
            break;
          }
          default:
            throw new Error('Unknown operation type');
        }

        return {
          success: true,
          data: {
            gasEstimate,
            operationType: params.operationType,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'GAS_ESTIMATION_ERROR',
            message: error.message || 'Gas estimation failed',
          },
        };
      }
    }
  );

  // ==================== Get Relayers Handler ====================

  ipcMain.handle(
    'bridge:get-railgun-relayers',
    async (): Promise<IPCResponse> => {
      try {
        const relayers = await transfer.getAvailableRelayers();
        return {
          success: true,
          data: relayers,
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'RELAYER_ERROR',
            message: error.message || 'Failed to get relayers',
          },
        };
      }
    }
  );

  // ==================== Get Railgun Status Handler ====================

  ipcMain.handle(
    'bridge:get-railgun-status',
    async (): Promise<IPCResponse> => {
      try {
        const engine = getRailgunEngine();
        const status = {
          initialized: engine.isInitialized?.() ?? false,
          chainId: 0,
          accountCount: 0,
        };

        return {
          success: true,
          data: status,
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'STATUS_ERROR',
            message: error.message || 'Failed to get Railgun status',
          },
        };
      }
    }
  );

  // ==================== Get Shield History Handler ====================

  ipcMain.handle(
    'bridge:get-shield-history',
    async (_event, publicAddress: string): Promise<IPCResponse> => {
      try {
        if (!publicAddress || publicAddress.length < 40) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid public address',
            },
          };
        }

        const history = await shield.getShieldHistory(publicAddress);

        return {
          success: true,
          data: history,
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'HISTORY_ERROR',
            message: error.message || 'Failed to get shield history',
          },
        };
      }
    }
  );

  // ==================== Get Transfer History Handler ====================

  ipcMain.handle(
    'bridge:get-transfer-history',
    async (_event, railgunAddress: string): Promise<IPCResponse> => {
      try {
        if (!railgunAddress || railgunAddress.length < 64) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid Railgun address',
            },
          };
        }

        const history = await transfer.getTransferHistory(railgunAddress);

        return {
          success: true,
          data: history,
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'HISTORY_ERROR',
            message: error.message || 'Failed to get transfer history',
          },
        };
      }
    }
  );

  // ==================== Get Unshield History Handler ====================

  ipcMain.handle(
    'bridge:get-unshield-history',
    async (_event, railgunAddress: string): Promise<IPCResponse> => {
      try {
        if (!railgunAddress || railgunAddress.length < 64) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid Railgun address',
            },
          };
        }

        const history = await unshield.getUnshieldHistory(railgunAddress);

        return {
          success: true,
          data: history,
        };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'HISTORY_ERROR',
            message: error.message || 'Failed to get unshield history',
          },
        };
      }
    }
  );

  console.log('[Railgun] IPC handlers registered successfully');
}

/**
 * Unregister Railgun handlers (cleanup)
 */
export function unregisterRailgunHandlers(): void {
  ipcMain.removeAllListeners('bridge:shield-request');
  ipcMain.removeAllListeners('bridge:transfer-request');
  ipcMain.removeAllListeners('bridge:unshield-request');
  ipcMain.removeAllListeners('bridge:estimate-railgun-gas');
  ipcMain.removeAllListeners('bridge:get-railgun-relayers');
  ipcMain.removeAllListeners('bridge:get-railgun-status');
  ipcMain.removeAllListeners('bridge:get-shield-history');
  ipcMain.removeAllListeners('bridge:get-transfer-history');
  ipcMain.removeAllListeners('bridge:get-unshield-history');

  console.log('[Railgun] IPC handlers unregistered');
}
