/**
 * Unshield Transaction Module
 * Converting private Railgun balance to public funds
 */

import { getRailgunEngine, validateTokenAddress, validateAmount } from './index';

export interface UnshieldInput {
  fromRailgun: string;
  toPublicAddress: string;
  tokenAddress: string;
  amount: string;
  relayerAddress: string;
}

export interface UnshieldOutput {
  txData: string;
  to: string;
  value: string;
  gasEstimate: string;
  fee: string;
}

export interface UnshieldValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate unshield inputs
 */
export function validateUnshieldInputs(
  input: UnshieldInput
): UnshieldValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate from Railgun address
  if (!input.fromRailgun || input.fromRailgun.length < 64) {
    errors.push('Invalid sender Railgun address');
  }

  // Validate to public address
  if (!input.toPublicAddress || input.toPublicAddress.length < 40) {
    errors.push('Invalid recipient public address');
  }

  // Validate token address
  if (!validateTokenAddress(input.tokenAddress)) {
    errors.push('Invalid token address');
  }

  // Validate amount
  if (!validateAmount(input.amount)) {
    errors.push('Invalid amount: must be positive');
  }

  // Validate relayer
  if (!input.relayerAddress || input.relayerAddress.length < 40) {
    warnings.push('No relayer specified - transaction may be slower');
  }

  // Amount size warning
  try {
    const amount = BigInt(input.amount);
    if (amount < BigInt(10) ** BigInt(15)) {
      warnings.push('Very small amount detected');
    }
  } catch {
    errors.push('Failed to parse amount');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create unshield transaction
 */
export async function createUnshieldTx(
  input: UnshieldInput
): Promise<UnshieldOutput> {
  // Validate inputs
  const validation = validateUnshieldInputs(input);
  if (!validation.valid) {
    throw new Error(
      `Unshield validation failed: ${validation.errors.join(', ')}`
    );
  }

  const engine = getRailgunEngine();
  if (!engine.isInitialized()) {
    throw new Error('Railgun Engine not initialized');
  }

  // Get fee
  const feeData = await engine.estimateUnshieldFee(input.tokenAddress, input.amount);

  // Mock transaction data
  const txData =
    '0x' +
    Array.from(
      JSON.stringify({
        type: 'UNSHIELD',
        from: input.fromRailgun,
        to: input.toPublicAddress,
        token: input.tokenAddress,
        amount: input.amount,
        relayer: input.relayerAddress,
      })
    )
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .substring(0, 128);

  // Estimate gas
  const gasEstimate = '200000';

  return {
    txData,
    to: '0x1234567890123456789012345678901234567890',
    value: '0',
    gasEstimate,
    fee: feeData.totalFee,
  };
}

/**
 * Estimate gas for unshield transaction
 */
export async function estimateGasUnshield(input: UnshieldInput): Promise<string> {
  const validation = validateUnshieldInputs(input);
  if (!validation.valid) {
    throw new Error(
      `Unshield validation failed: ${validation.errors.join(', ')}`
    );
  }

  const engine = getRailgunEngine();
  if (!engine.isInitialized()) {
    throw new Error('Railgun Engine not initialized');
  }

  // Base gas + variable based on amount
  const baseGas = 150000;
  const variableGas = Math.min(50000, Number(input.amount) / 1000);

  return (baseGas + variableGas).toString();
}

/**
 * Simulate unshield transaction (dry-run)
 */
export async function simulateUnshield(input: UnshieldInput): Promise<boolean> {
  const validation = validateUnshieldInputs(input);
  if (!validation.valid) {
    return false;
  }

  try {
    const engine = getRailgunEngine();
    if (!engine.isInitialized()) {
      return false;
    }

    await estimateGasUnshield(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate total unshield cost (amount + fees)
 */
export async function getUnshieldTotalCost(
  input: UnshieldInput
): Promise<{ amount: string; fee: string; total: string }> {
  const engine = getRailgunEngine();
  if (!engine.isInitialized()) {
    throw new Error('Railgun Engine not initialized');
  }

  const feeData = await engine.estimateUnshieldFee(input.tokenAddress, input.amount);
  const total = (BigInt(input.amount) + BigInt(feeData.totalFee)).toString();

  return {
    amount: input.amount,
    fee: feeData.totalFee,
    total,
  };
}

/**
 * Check if account has sufficient private balance
 */
export async function checkUnshieldBalance(
  _railgunAddress: string,
  _tokenAddress: string,
  _amount: string
): Promise<boolean> {
  // In real implementation, would check Railgun contract balance
  return true;
}

/**
 * Get unshield transaction history
 */
export async function getUnshieldHistory(
  _railgunAddress: string
): Promise<
  Array<{
    txHash: string;
    to: string;
    amount: string;
    token: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
  }>
> {
  // Mock implementation
  return [
    {
      txHash: '0xfedcba0987654321',
      to: '0x742d35Cc6634C0532925a3b844Bc0e8a5f4Ec3c6',
      amount: '750000000000000000',
      token: '0xA0b86991d4F39E206F97DB7Fd89feeda8c059FB6',
      timestamp: Math.floor(Date.now() / 1000) - 1800,
      status: 'confirmed',
    },
  ];
}

/**
 * Prepare unshield for specific recipient with custom parameters
 */
export async function prepareUnshield(
  railgunAddress: string,
  publicAddress: string,
  tokenAddress: string,
  amount: string
): Promise<UnshieldOutput> {
  const input: UnshieldInput = {
    fromRailgun: railgunAddress,
    toPublicAddress: publicAddress,
    tokenAddress,
    amount,
    relayerAddress: '0x0000000000000000000000000000000000000000',
  };

  return createUnshieldTx(input);
}

/**
 * Get recommended gas price for unshield
 */
export async function getUnshieldGasPrice(): Promise<string> {
  // Mock: 45 Gwei
  return '45000000000';
}

/**
 * Verify unshield can complete without issues
 */
export async function verifyUnshieldFeasibility(
  input: UnshieldInput
): Promise<{ feasible: boolean; reason?: string }> {
  const validation = validateUnshieldInputs(input);
  if (!validation.valid) {
    return {
      feasible: false,
      reason: validation.errors[0],
    };
  }

  try {
    const hasBalance = await checkUnshieldBalance(
      input.fromRailgun,
      input.tokenAddress,
      input.amount
    );

    if (!hasBalance) {
      return {
        feasible: false,
        reason: 'Insufficient private balance',
      };
    }

    return { feasible: true };
  } catch (error) {
    return {
      feasible: false,
      reason: 'Failed to verify unshield feasibility',
    };
  }
}

/**
 * Get time estimate for unshield completion
 */
export async function getUnshieldTimeEstimate(): Promise<{
  minTime: number;
  maxTime: number;
  avgTime: number;
}> {
  // Time in seconds
  return {
    minTime: 30, // 30 seconds
    avgTime: 120, // 2 minutes
    maxTime: 300, // 5 minutes
  };
}
