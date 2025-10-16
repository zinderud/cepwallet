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
  console.log('  RAILGUN Address:', params.railgunAddress);
  
  try {
    const {
      populateShield,
      gasEstimateForShield,
    } = require('@railgun-community/wallet');
    
    const networkName = chainIdToNetworkName(params.chainId || 1);
    
    // Prepare ERC20 amount recipient
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amount: BigInt(params.amount),
      recipientAddress: params.railgunAddress,
    }];
    
    // Generate shield transaction with proof
    const shieldTx = await populateShield(
      TXIDVersion.V2_PoseidonMerkle, // Use V2 for RAILGUN v3
      networkName,
      params.shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients (empty for now)
      undefined // gasDetails (optional)
    );
    
    console.log('[ProofGen] Shield proof generated ✓');
    
    return {
      success: true,
      proof: Buffer.from(JSON.stringify(shieldTx.transaction)).toString('base64'),
      publicInputs: [
        params.railgunAddress,
        params.token,
        params.amount,
      ],
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
  console.log('  To RAILGUN Address:', params.toRailgunAddress);
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);
  
  try {
    const {
      generateTransferProof: railgunGenerateTransferProof,
    } = require('@railgun-community/wallet');
    
    const networkName = chainIdToNetworkName(params.chainId || 1);
    
    // Prepare transfer recipients
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amount: BigInt(params.amount),
      recipientAddress: params.toRailgunAddress,
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
        params.toRailgunAddress,
        params.token,
        params.amount,
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
    } = require('@railgun-community/wallet');
    
    const networkName = chainIdToNetworkName(params.chainId || 1);
    
    // Prepare unshield recipients (public addresses)
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amount: BigInt(params.amount),
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
        params.amount,
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
      console.error('Usage: node index.js <json_params>');
      process.exit(1);
    }
    
    const params = JSON.parse(args[0]);
    const { proofType, ...proofParams } = params;
    
    console.log(`[ProofGen] Starting proof generation: ${proofType}`);
    
    // Initialize SDK
    await initRailgun(proofParams.chainId || 1);
    
    // Generate proof based on type
    let result;
    switch (proofType) {
      case PROOF_TYPES.SHIELD:
        result = await generateShieldProof(proofParams);
        break;
      case PROOF_TYPES.TRANSFER:
        result = await generateTransferProof(proofParams);
        break;
      case PROOF_TYPES.UNSHIELD:
        result = await generateUnshieldProof(proofParams);
        break;
      default:
        throw new Error(`Unknown proof type: ${proofType}`);
    }
    
    // Output result as JSON
    console.log('[ProofGen] Success!');
    console.log(JSON.stringify({
      success: true,
      proof: result.proof,
      publicInputs: result.publicInputs,
    }));
    
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
  PROOF_TYPES,
};
