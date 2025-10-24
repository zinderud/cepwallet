/**
 * Transaction Broadcasting Service
 * 
 * Handles signing and broadcasting RAILGUN transactions to the blockchain
 */

import { ethers } from 'ethers';

interface TransactionData {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
}

interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  receipt?: ethers.TransactionReceipt;
}

/**
 * TransactionService
 * 
 * Broadcasts RAILGUN transactions to Ethereum networks
 */
export class TransactionService {
  private provider: ethers.JsonRpcProvider;
  private chainId: number;

  constructor(rpcUrl: string, chainId: number) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.chainId = chainId;
  }

  /**
   * Get provider for reading blockchain data
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Create a wallet from mnemonic
   */
  private createWallet(mnemonic: string): ethers.HDNodeWallet {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return wallet.connect(this.provider);
  }

  /**
   * Estimate gas for a transaction
   */
  private async estimateGas(
    wallet: ethers.HDNodeWallet,
    tx: TransactionData
  ): Promise<bigint> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        from: wallet.address,
        to: tx.to,
        data: tx.data,
        value: tx.value || '0',
      });

      // Add 20% buffer for safety
      return (gasEstimate * 120n) / 100n;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      // Fallback to a safe default (500k gas)
      return 500000n;
    }
  }

  /**
   * Get current gas price with buffer
   */
  private async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    
    if (feeData.gasPrice) {
      // Add 10% buffer to gas price
      return (feeData.gasPrice * 110n) / 100n;
    }

    // Fallback to 50 gwei
    return ethers.parseUnits('50', 'gwei');
  }

  /**
   * Broadcast a shield transaction
   * 
   * @param transactionData - Shield transaction from RAILGUN proof
   * @param mnemonic - Wallet mnemonic for signing
   * @returns Transaction result with hash and receipt
   */
  async broadcastShieldTransaction(
    transactionData: TransactionData,
    mnemonic: string
  ): Promise<TransactionResult> {
    try {
      console.log('🚀 Broadcasting shield transaction...');
      console.log('🔍 [TransactionService] Received transaction data:', JSON.stringify(transactionData, null, 2));
      console.log('  To:', transactionData.to);
      console.log('  Data:', transactionData.data);
      console.log('  Data length:', transactionData.data?.length || 0);
      console.log('  Value:', transactionData.value);

      // Create wallet from mnemonic
      const wallet = this.createWallet(mnemonic);
      console.log('  From:', wallet.address);

      // Check balance
      const balance = await this.provider.getBalance(wallet.address);
      console.log('  Balance:', ethers.formatEther(balance), 'ETH');

      if (balance === 0n) {
        throw new Error('Insufficient balance. Please fund your wallet with Sepolia ETH.');
      }

      // Estimate gas
      const gasLimit = await this.estimateGas(wallet, transactionData);
      console.log('  Gas limit:', gasLimit.toString());

      // Get EIP-1559 fee data (Sepolia uses EIP-1559)
      const feeData = await this.provider.getFeeData();
      console.log('  Fee data:', {
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      });

      // Prepare transaction with EIP-1559 parameters
      const tx: ethers.TransactionRequest = {
        to: transactionData.to,
        data: transactionData.data,
        value: transactionData.value || '0',
        gasLimit: gasLimit,
        maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits('2', 'gwei'),
        chainId: this.chainId,
        type: 2, // EIP-1559 transaction
      };

      // Send transaction
      console.log('📤 Sending transaction...');
      const txResponse = await wallet.sendTransaction(tx);
      console.log('✅ Transaction sent!');
      console.log('  Hash:', txResponse.hash);
      console.log('  Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await txResponse.wait(1); // Wait for 1 confirmation
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      console.log('✅ Transaction confirmed!');
      console.log('  Block:', receipt.blockNumber);
      console.log('  Gas used:', receipt.gasUsed.toString());
      console.log('  Status:', receipt.status === 1 ? 'Success' : 'Failed');

      return {
        success: true,
        txHash: txResponse.hash,
        receipt: receipt,
      };

    } catch (error) {
      console.error('❌ Transaction broadcast failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse base64 encoded transaction proof
   */
  static parseProofTransaction(base64Proof: string): TransactionData {
    try {
      const jsonString = Buffer.from(base64Proof, 'base64').toString('utf-8');
      const txData = JSON.parse(jsonString);
      
      return {
        to: txData.to,
        data: txData.data,
        value: txData.value || '0',
      };
    } catch (error) {
      throw new Error('Failed to parse transaction proof: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    receipt?: ethers.TransactionReceipt;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          status: 'pending',
          confirmations: 0,
        };
      }

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmations,
        receipt,
      };
    } catch (error) {
      throw new Error('Failed to get transaction status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

/**
 * Create a transaction service for Sepolia testnet
 */
export function createSepoliaTransactionService(): TransactionService {
  const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
  const SEPOLIA_CHAIN_ID = 11155111;
  
  return new TransactionService(SEPOLIA_RPC, SEPOLIA_CHAIN_ID);
}

/**
 * Create a transaction service for Ethereum mainnet
 */
export function createMainnetTransactionService(): TransactionService {
  const MAINNET_RPC = 'https://eth.llamarpc.com';
  const MAINNET_CHAIN_ID = 1;
  
  return new TransactionService(MAINNET_RPC, MAINNET_CHAIN_ID);
}
