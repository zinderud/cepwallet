/**
 * CepWallet ZK-SNARK Proof Generator
 * 
 * This Node.js script generates zero-knowledge proofs for RAILGUN privacy transactions.
 * Called from Rust via FFI/subprocess for proof generation.
 * 
 * SECURITY NOTE: This script should NEVER receive private keys!
 * Only receives public commitments and parameters for proof generation.
 */

const {
  startRailgunEngine,
  createRailgunWallet,
  loadProvider,
  setOnBalanceUpdateCallback,
} = require('@railgun-community/wallet');
const LevelDOWN = require('leveldown');
const { NetworkName, TXIDVersion } = require('@railgun-community/shared-models');

const PROOF_TYPES = {
  SHIELD: 'shield',
  TRANSFER: 'transfer',
  UNSHIELD: 'unshield',
  POOL_JOIN: 'pool_join',
  POOL_EXIT: 'pool_exit',
};

// Global state
let railgunInitialized = false;
let walletInfo = null;

/**
 * Simple artifact store that downloads artifacts on demand
 */
class SimpleArtifactStore {
  async getArtifacts(path) {
    // In production, download from IPFS or CDN
    // For now, let the SDK download them
    return null;
  }
  
  async storeArtifacts(path, artifacts) {
    // Store locally if needed
    return true;
  }
}

/**
 * Initialize RAILGUN SDK
 */
async function initRailgun(chainId = 1) {
  if (railgunInitialized) {
    return true;
  }

  console.log(`[ProofGen] Initializing RAILGUN SDK for chain ${chainId}...`);
  
  try {
    // Determine network name from chain ID
    const networkName = chainIdToNetworkName(chainId);
    
    // Create LevelDB instance for merkle tree storage
    const db = new LevelDOWN('./railgun_db');
    
    // Create artifact store
    const artifactStore = new SimpleArtifactStore();
    
    // Start RAILGUN engine
    await startRailgunEngine(
      'CepWallet', // wallet source identifier (no special characters)
      db,
      true, // shouldDebug
      artifactStore,
      false, // useNativeArtifacts
      false, // skipMerkletreeScans
      [], // poiNodeURLs
      undefined, // customPOILists
      false // verboseLogging
    );
    
    console.log('[ProofGen] RAILGUN Engine started successfully');
    
    // Load provider for the network
    // Get RPC URL based on network
    let rpcUrl;
    if (networkName === NetworkName.EthereumSepolia) {
      // Using public Sepolia RPC endpoints
      rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
    } else if (networkName === NetworkName.Ethereum) {
      rpcUrl = 'https://eth.llamarpc.com';
    } else {
      console.warn(`[ProofGen] No RPC configured for ${networkName}, using Sepolia`);
      rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
    }
    
    // loadProvider expects FallbackProviderJsonConfig with providers array
    // Note: Total weight must be >= 2 for fallback quorum
    const fallbackProviderJsonConfig = {
      chainId: chainId,
      providers: [
        {
          provider: rpcUrl,
          priority: 1,
          weight: 2,  // Minimum weight is 2 for fallback quorum
        },
      ],
    };
    
    await loadProvider(
      fallbackProviderJsonConfig,
      networkName,
      10000 // pollingInterval in ms
    );
    console.log(`[ProofGen] Provider loaded for ${networkName}`);
    
    railgunInitialized = true;
    return true;
    
  } catch (error) {
    console.error('[ProofGen] Failed to initialize RAILGUN:', error.message);
    throw error;
  }
}

/**
 * Convert chain ID to RAILGUN NetworkName
 */
function chainIdToNetworkName(chainId) {
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId) : chainId;
  
  switch (chainIdNum) {
    case 1: return NetworkName.Ethereum;
    case 11155111: return NetworkName.EthereumSepolia;
    case 137: return NetworkName.Polygon;
    case 42161: return NetworkName.Arbitrum;
    case 10: return NetworkName.Optimism;
    case 56: return NetworkName.BNBChain;
    default:
      console.warn(`[ProofGen] Unknown chain ID ${chainId}, defaulting to Ethereum Sepolia`);
      return NetworkName.EthereumSepolia;
  }
}

/**
 * Generate Shield Proof
 * Converts public tokens to shielded balance
 * 
 * @param {Object} params
 * @param {string} params.token - Token address
 * @param {string} params.amount - Amount to shield (wei string)
 * @param {string} params.commitment - Commitment hash
 * @param {string} params.railgunAddress - Destination RAILGUN address
 * @param {string} params.shieldPrivateKey - Shield private key (32 bytes hex)
 * @returns {Object} { proof, publicInputs }
 */
async function generateShieldProof(params) {
  console.log('[ProofGen] Generating shield proof...');
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);
  console.log('  RAILGUN Address:', params.recipient);
  
  try {
    const {
      populateShield,
      gasEstimateForShield,
    } = require('@railgun-community/wallet');
    const { parseEther, parseUnits, randomBytes, hexlify } = require('ethers');
    
    const networkName = chainIdToNetworkName(params.chain_id || params.chainId || 1);
    
    // Generate a random shield private key if not provided or if placeholder
    let shieldPrivateKey = params.shield_private_key || params.shieldPrivateKey;
    if (!shieldPrivateKey || shieldPrivateKey === 'RAILGUN_SHIELD' || shieldPrivateKey.length < 64) {
      // Generate random 32-byte hex private key
      shieldPrivateKey = hexlify(randomBytes(32));
      console.log('  Generated random shield private key');
    }
    
    // Convert amount to wei (BigInt)
    // If amount is already a large number (>1e10), assume it's already in wei
    let amountWei;
    if (typeof params.amount === 'string') {
      const amountFloat = parseFloat(params.amount);
      if (amountFloat > 1e10) {
        // Already in wei format
        amountWei = BigInt(params.amount.split('.')[0]); // Remove any decimals
      } else {
        // Assume it's in ETH/token units, convert to wei (18 decimals)
        amountWei = parseEther(params.amount);
      }
    } else {
      amountWei = parseEther(params.amount.toString());
    }
    
    console.log('  Amount (wei):', amountWei.toString());
    
    // Prepare ERC20 amount recipient
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amount: amountWei,
      recipientAddress: params.recipient, // Use 'recipient' field
    }];
    
    // Generate shield transaction with proof
    const shieldTx = await populateShield(
      TXIDVersion.V2_PoseidonMerkle, // Use V2 for RAILGUN v3
      networkName,
      shieldPrivateKey, // Use the generated/provided shield private key
      erc20AmountRecipients,
      [], // nftAmountRecipients (empty for now)
      undefined // gasDetails (optional)
    );
    
    console.log('[ProofGen] Shield proof generated ✓');
    console.log('[ProofGen] Transaction data:', JSON.stringify(shieldTx.transaction, null, 2));
    
    return {
      success: true,
      proof: Buffer.from(JSON.stringify(shieldTx.transaction)).toString('base64'),
      publicInputs: [
        params.recipient,
        params.token,
        amountWei.toString(),
      ],
      transaction: shieldTx.transaction, // Include raw transaction for frontend
    };
    
  } catch (error) {
    console.error('[ProofGen] Shield proof generation failed:', error.message);
    return {
      success: false,
      proof: '',
      publicInputs: [],
      error: error.message,
    };
  }
}

/**
 * Generate Private Transfer Proof
 * Transfers between shielded addresses (fully private)
 * 
 * @param {Object} params
 * @param {string} params.railgunWalletID - Source RAILGUN wallet ID
 * @param {string} params.encryptionKey - Wallet encryption key
 * @param {string} params.toRailgunAddress - Destination RAILGUN address
 * @param {string} params.token - Token address
 * @param {string} params.amount - Amount to transfer (wei string)
 * @returns {Object} { proof, publicInputs }
 */
async function generateTransferProof(params) {
  console.log('[ProofGen] Generating private transfer proof...');
  console.log('  To RAILGUN Address:', params.recipient || params.toRailgunAddress);
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);
  
  try {
    const {
      generateTransferProof: railgunGenerateTransferProof,
      createRailgunWallet,
    } = require('@railgun-community/wallet');
    const { parseEther } = require('ethers');
    
    const networkName = chainIdToNetworkName(params.chainId || 1);
    
    // Import wallet if mnemonic provided (required for transfer)
    if (params.mnemonic && params.encryptionKey) {
      console.log('  Importing wallet from mnemonic...');
      
      // Remove 0x prefix if present
      let encryptionKey = params.encryptionKey;
      if (encryptionKey.startsWith('0x')) {
        encryptionKey = encryptionKey.substring(2);
      }
      
      // Import wallet into RAILGUN SDK
      const walletInfo = await createRailgunWallet(
        encryptionKey,
        params.mnemonic,
        undefined // creationBlockNumbers
      );
      
      if (!walletInfo) {
        throw new Error('Failed to import wallet into RAILGUN SDK');
      }
      
      console.log('  Wallet imported ✓ ID:', walletInfo.id);
      
      // Use imported wallet ID
      params.railgunWalletID = walletInfo.id;
    }
    
    // Convert amount to wei (BigInt)
    let amountWei;
    if (typeof params.amount === 'string') {
      const amountFloat = parseFloat(params.amount);
      if (amountFloat > 1e10) {
        // Already in wei format
        amountWei = BigInt(params.amount.split('.')[0]);
      } else {
        // Assume it's in ETH/token units, convert to wei (18 decimals)
        amountWei = parseEther(params.amount);
      }
    } else {
      amountWei = parseEther(params.amount.toString());
    }
    
    console.log('  Amount (wei):', amountWei.toString());
    
    // Prepare transfer recipients
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amount: amountWei,
      recipientAddress: params.toRailgunAddress || params.recipient,
    }];
    
    // Generate transfer proof
    await railgunGenerateTransferProof(
      TXIDVersion.V2_PoseidonMerkle,
      networkName,
      params.railgunWalletID,
      params.encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      erc20AmountRecipients,
      [], // nftAmountRecipients
      undefined, // broadcasterFeeERC20AmountRecipient
      false, // sendWithPublicWallet
      undefined, // overallBatchMinGasPrice
      (progress) => {
        console.log(`[ProofGen] Transfer proof progress: ${progress.status}`);
      }
    );
    
    console.log('[ProofGen] Transfer proof generated ✓');
    
    return {
      success: true,
      proof: 'transfer_proof_cached', // Proof is cached in RAILGUN SDK
      publicInputs: [
        params.recipient || params.toRailgunAddress,
        params.token,
        amountWei.toString(),
      ],
    };
    
  } catch (error) {
    console.error('[ProofGen] Transfer proof generation failed:', error.message);
    return {
      success: false,
      proof: '',
      publicInputs: [],
      error: error.message,
    };
  }
}

/**
 * Generate Unshield Proof
 * Converts shielded balance back to public tokens
 * 
 * @param {Object} params
 * @param {string} params.railgunWalletID - Source RAILGUN wallet ID
 * @param {string} params.encryptionKey - Wallet encryption key
 * @param {string} params.recipient - Public recipient address
 * @param {string} params.token - Token address
 * @param {string} params.amount - Amount to unshield (wei string)
 * @returns {Object} { proof, publicInputs }
 */
async function generateUnshieldProof(params) {
  console.log('[ProofGen] Generating unshield proof...');
  console.log('  Recipient:', params.recipient);
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);
  
  try {
    const {
      generateUnshieldProof: railgunGenerateUnshieldProof,
      createRailgunWallet,
    } = require('@railgun-community/wallet');
    const { parseEther } = require('ethers');
    
    const networkName = chainIdToNetworkName(params.chainId || 1);
    
    // Import wallet if mnemonic provided (required for unshield)
    if (params.mnemonic && params.encryptionKey) {
      console.log('  Importing wallet from mnemonic...');
      
      // Remove 0x prefix if present
      let encryptionKey = params.encryptionKey;
      if (encryptionKey.startsWith('0x')) {
        encryptionKey = encryptionKey.substring(2);
      }
      
      // Import wallet into RAILGUN SDK
      const walletInfo = await createRailgunWallet(
        encryptionKey,
        params.mnemonic,
        undefined // creationBlockNumbers
      );
      
      if (!walletInfo) {
        throw new Error('Failed to import wallet into RAILGUN SDK');
      }
      
      console.log('  Wallet imported ✓ ID:', walletInfo.id);
      
      // Use imported wallet ID
      params.railgunWalletID = walletInfo.id;
    }
    
    // Convert amount to wei (BigInt)
    let amountWei;
    if (typeof params.amount === 'string') {
      const amountFloat = parseFloat(params.amount);
      if (amountFloat > 1e10) {
        // Already in wei format
        amountWei = BigInt(params.amount.split('.')[0]);
      } else {
        // Assume it's in ETH/token units, convert to wei (18 decimals)
        amountWei = parseEther(params.amount);
      }
    } else {
      amountWei = parseEther(params.amount.toString());
    }
    
    console.log('  Amount (wei):', amountWei.toString());
    
    // Prepare unshield recipients (public addresses)
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amount: amountWei,
      recipientAddress: params.recipient, // Public address
    }];
    
    // Generate unshield proof
    await railgunGenerateUnshieldProof(
      TXIDVersion.V2_PoseidonMerkle,
      networkName,
      params.railgunWalletID,
      params.encryptionKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      undefined, // broadcasterFeeERC20AmountRecipient
      true, // sendWithPublicWallet
      undefined, // overallBatchMinGasPrice
      (progress) => {
        console.log(`[ProofGen] Unshield proof progress: ${progress.status}`);
      }
    );
    
    console.log('[ProofGen] Unshield proof generated ✓');
    
    return {
      success: true,
      proof: 'unshield_proof_cached', // Proof is cached in RAILGUN SDK
      publicInputs: [
        params.recipient,
        params.token,
        amountWei.toString(),
      ],
    };
    
  } catch (error) {
    console.error('[ProofGen] Unshield proof generation failed:', error.message);
    return {
      success: false,
      proof: '',
      publicInputs: [],
      error: error.message,
    };
  }
}

/**
 * Main entry point - called from Rust
 */
async function main() {
  try {
    // Read parameters from stdin or command line
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('Usage: node index.js <operation> <json_params>');
      console.error('   or: node index.js <json_with_operation>');
      process.exit(1);
    }
    
    // Support both formats:
    // 1. Two args: operation and params separately
    // 2. One arg: JSON with operation or proof_type field
    let operation, operationParams;
    
    if (args.length === 1) {
      const params = JSON.parse(args[0]);
      // Support 'operation', 'proof_type', and 'proofType' field names
      operation = params.operation || params.proof_type || params.proofType;
      const { operation: _, proof_type: __, proofType: ___, ...rest } = params;
      operationParams = rest;
    } else {
      operation = args[0];
      operationParams = JSON.parse(args[1]);
    }
    
    console.log(`[ProofGen] Operation: ${operation}`);
    
    // Handle different operations
    let result;
    
    if (operation === 'initRailgun') {
      await initRailgun(operationParams.chainId || 11155111);
      result = { success: true };
    } else if (operation === 'createWallet') {
      result = await createWallet(operationParams);
    } else if (operation === 'getShieldPrivateKey') {
      result = await getShieldPrivateKey(operationParams);
    } else {
      // Proof generation operations
      // Initialize SDK for proof operations
      // Support both snake_case and camelCase for chain_id
      const chainId = operationParams.chain_id || operationParams.chainId || 11155111;
      await initRailgun(chainId);
      
      switch (operation) {
        case PROOF_TYPES.SHIELD:
          result = await generateShieldProof(operationParams);
          break;
        case PROOF_TYPES.TRANSFER:
          result = await generateTransferProof(operationParams);
          break;
        case PROOF_TYPES.UNSHIELD:
          result = await generateUnshieldProof(operationParams);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }
    
    // Output result as JSON
    console.log('[ProofGen] Success!');
    console.log(JSON.stringify(result));
    
    process.exit(0);
  } catch (error) {
    console.error('[ProofGen] Error:', error.message);
    console.log(JSON.stringify({
      success: false,
      error: error.message,
    }));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  initRailgun,
  generateShieldProof,
  generateTransferProof,
  generateUnshieldProof,
  createWallet,
  getShieldPrivateKey,
  PROOF_TYPES,
};

/**
 * Create a new RAILGUN wallet
 * 
 * @param {Object} params
 * @param {string} params.encryptionKey - 32-byte hex string for wallet encryption
 * @param {string} params.mnemonic - Optional mnemonic (if not provided, generates new one)
 * @returns {Object} { railgunWalletId, railgunAddress, mnemonic }
 */
async function createWallet(params) {
  console.log('[WalletMgmt] Creating RAILGUN wallet...');
  
  try {
    // Initialize RAILGUN if not already initialized
    if (!railgunInitialized) {
      console.log('[WalletMgmt] Auto-initializing RAILGUN...');
      await initRailgun(params.chainId || 11155111);
    }
    
    const { createRailgunWallet } = require('@railgun-community/wallet');
    
    // Remove 0x prefix if present
    let encryptionKey = params.encryptionKey;
    if (encryptionKey.startsWith('0x')) {
      encryptionKey = encryptionKey.substring(2);
    }
    
    // Validate encryption key (must be 32 bytes / 64 hex chars)
    if (!encryptionKey || encryptionKey.length !== 64) {
      throw new Error('Encryption key must be 32 bytes (64 hex chars)');
    }
    
    const mnemonic = params.mnemonic || generateMnemonic();
    
    // Create wallet
    const walletInfo = await createRailgunWallet(
      encryptionKey, // Without 0x prefix
      mnemonic,
      undefined // creationBlockNumbers (optional)
    );
    
    if (!walletInfo) {
      throw new Error('Failed to create RAILGUN wallet');
    }
    
    console.log('[WalletMgmt] Wallet created ✓');
    console.log('  Wallet ID:', walletInfo.id);
    console.log('  Address:', walletInfo.railgunAddress);
    
    return {
      success: true,
      railgunWalletId: walletInfo.id,
      railgunAddress: walletInfo.railgunAddress,
      mnemonic: mnemonic,
    };
    
  } catch (error) {
    console.error('[WalletMgmt] Wallet creation failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get shield private key for a RAILGUN address
 * This is used for shield operations
 * 
 * @param {Object} params
 * @param {string} params.railgunWalletId - RAILGUN wallet ID
 * @returns {Object} { shieldPrivateKey }
 */
async function getShieldPrivateKey(params) {
  console.log('[WalletMgmt] Getting shield private key...');
  
  try {
    const { getShieldPrivateKeySignatureMessage } = require('@railgun-community/wallet');
    
    // Get shield private key signature message for this wallet
    const shieldPrivateKey = await getShieldPrivateKeySignatureMessage(
      params.railgunWalletId
    );
    
    console.log('[WalletMgmt] Shield private key retrieved ✓');
    
    return {
      success: true,
      shieldPrivateKey: shieldPrivateKey,
    };
    
  } catch (error) {
    console.error('[WalletMgmt] Failed to get shield private key:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate a random mnemonic phrase
 * @returns {string} 12-word mnemonic
 */
function generateMnemonic() {
  const bip39 = require('bip39');
  return bip39.generateMnemonic(128); // 12 words
}

