/**
 * CepWallet ZK-SNARK Proof Generator - NEW VERSION WITH BALANCE CALLBACKS
 * 
 * This Node.js script generates zero-knowledge proofs for RAILGUN privacy transactions.
 * Implements proper balance callback system according to RAILGUN documentation.
 */

const {
  startRailgunEngine,
  createRailgunWallet,
  loadWalletByID,
  loadProvider,
  setOnBalanceUpdateCallback,
  setOnUTXOMerkletreeScanCallback,
  setOnTXIDMerkletreeScanCallback,
  refreshBalances,
  balanceForERC20Token,
  populateShield,
  gasEstimateForShield,
  gasEstimateForShieldBaseToken,
  populateShieldBaseToken,
  gasEstimateForUnprovenTransfer,
  populateProvedTransfer,
  generateTransferProof: railgunGenerateTransferProof,
  getShieldPrivateKeySignatureMessage,
} = require('@railgun-community/wallet');
const LevelDOWN = require('leveldown');
const {
  NetworkName,
  TXIDVersion,
  NETWORK_CONFIG,
  RailgunWalletBalanceBucket,
  calculateGasPrice,
} = require('@railgun-community/shared-models');
const { parseUnits, randomBytes, hexlify, keccak256 } = require('ethers');

// Chain-specific contract addresses
const CHAIN_CONTRACTS = {
  1: { // Ethereum Mainnet
    railgun: '0xFA7093CDD9EE6932B4eb2c9e1cde21625Cb940291',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  11155111: { // Sepolia Testnet
    railgun: '0xeCFCf3b4eC647c4Ca6D49108b311b7a7C9543fea',
    weth: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  },
};

// Global state
let railgunInitialized = false;
const balanceCache = new Map();
let balanceUpdatePromise = null;
let currentNetworkName = null;

/**
 * Balance callback system - according to RAILGUN docs
 */
const onUTXOMerkletreeScanCallback = (eventData) => {
  console.log('📊 UTXO scan:', eventData.progress, eventData.scanStatus);
};

const onTXIDMerkletreeScanCallback = (eventData) => {
  console.log('📊 TXID scan:', eventData.progress, eventData.scanStatus);
};

const onBalanceUpdateCallback = (balancesFormatted) => {
  console.log('💰 Balance updated:', balancesFormatted.balanceBucket);
  if (balancesFormatted.erc20Amounts.length > 0) {
    console.log('💰 ERC20 Balances:', balancesFormatted.erc20Amounts.map(amt => ({
      token: amt.tokenAddress,
      amount: amt.amountString
    })));
  }
  
  // Store in cache
  balanceCache.set(balancesFormatted.balanceBucket, balancesFormatted);
  
  // Resolve promise if waiting for spendable balance
  if (balanceUpdatePromise && balancesFormatted.balanceBucket === RailgunWalletBalanceBucket.Spendable) {
    balanceUpdatePromise();
    balanceUpdatePromise = null;
  }
};

const waitForBalanceUpdate = () => {
  return new Promise((resolve) => {
    balanceUpdatePromise = resolve;
    // 30 second timeout
    setTimeout(() => {
      if (balanceUpdatePromise) {
        console.log('⚠️  Balance update timeout (30s) - continuing anyway');
        balanceUpdatePromise = null;
        resolve();
      }
    }, 30000);
  });
};

const getSpendableBalances = () => {
  return balanceCache.get(RailgunWalletBalanceBucket.Spendable);
};

/**
 * Simple artifact store
 */
class SimpleArtifactStore {
  async getArtifacts(path) {
    return null;
  }
  
  async storeArtifacts(path, artifacts) {
    return true;
  }
}

/**
 * Initialize RAILGUN SDK with balance callbacks
 */
async function initRailgun(chainId = 11155111) {
  if (railgunInitialized) {
    return true;
  }

  console.log(`[ProofGen] Initializing RAILGUN SDK for chain ${chainId}...`);
  
  try {
    const networkName = chainIdToNetworkName(chainId);
    currentNetworkName = networkName;
    
    const db = new LevelDOWN('./railgun_db');
    const artifactStore = new SimpleArtifactStore();
    
    // Start RAILGUN engine
    await startRailgunEngine(
      'CepWallet',
      db,
      true, // shouldDebug
      artifactStore,
      false, // useNativeArtifacts
      false, // skipMerkletreeScans
      [], // poiNodeURLs
      undefined, // customPOILists
      false // verboseLogging
    );
    
    console.log('[ProofGen] RAILGUN Engine started');
    
    // Setup balance callbacks - CRITICAL FOR BALANCE TRACKING
    console.log('[ProofGen] Setting up balance callbacks...');
    setOnUTXOMerkletreeScanCallback(onUTXOMerkletreeScanCallback);
    setOnTXIDMerkletreeScanCallback(onTXIDMerkletreeScanCallback);
    setOnBalanceUpdateCallback(onBalanceUpdateCallback);
    console.log('[ProofGen] Balance callbacks configured ✅');
    
    // Load provider
    let rpcUrl;
    if (networkName === NetworkName.EthereumSepolia) {
      rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
    } else if (networkName === NetworkName.Ethereum) {
      rpcUrl = 'https://eth.llamarpc.com';
    } else {
      rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
    }
    
    const fallbackProviderJsonConfig = {
      chainId: chainId,
      providers: [{
        provider: rpcUrl,
        priority: 1,
        weight: 2,
      }],
    };
    
    await loadProvider(fallbackProviderJsonConfig, networkName, 10000);
    console.log(`[ProofGen] Provider loaded for ${networkName}`);
    
    railgunInitialized = true;
    return true;
    
  } catch (error) {
    console.error('[ProofGen] Failed to initialize RAILGUN:', error.message);
    throw error;
  }
}

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
      console.warn(`[ProofGen] Unknown chain ID ${chainId}, defaulting to Sepolia`);
      return NetworkName.EthereumSepolia;
  }
}

/**
 * Normalize user-facing token amount into base units expected by RAILGUN.
 */
function normalizeAmount(amountInput, decimals = 18) {
  if (amountInput == null) {
    throw new Error('Amount is required');
  }

  if (typeof amountInput !== 'string') {
    amountInput = String(amountInput);
  }

  const trimmed = amountInput.trim();

  if (trimmed.startsWith('0x')) {
    return BigInt(trimmed).toString();
  }

  if (trimmed.includes('.') || trimmed.includes(',')) {
    const normalized = trimmed.replace(',', '.');
    return parseUnits(normalized, decimals).toString();
  }

  return trimmed;
}

/**
 * Generate Shield Proof
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

    const networkName = chainIdToNetworkName(params.chain_id || params.chainId || 11155111);

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

    // IMPORTANT: RAILGUN doesn't support native ETH directly
    // For native ETH (0x0), we use WETH instead
    const chainId = params.chain_id || params.chainId || 11155111;
    const contracts = CHAIN_CONTRACTS[chainId] || CHAIN_CONTRACTS[11155111]; // Fallback to Sepolia
    const isNativeETH = params.token.toLowerCase() === '0x0000000000000000000000000000000000000000';
    const tokenAddress = isNativeETH ? contracts.weth : params.token;

    // Prepare ERC20 amount recipient
    const erc20AmountRecipients = [{
      tokenAddress: tokenAddress,
      amount: amountWei,
      recipientAddress: params.recipient, // Use 'recipient' field
    }];

    // Prepare gas details (Sepolia uses EIP-1559)
    const gasDetails = {
      evmGasType: 2, // Type 2 = EIP-1559 (required for Sepolia)
      gasEstimate: BigInt(500000), // 500k gas limit as BigInt
      maxFeePerGas: undefined, // Let SDK determine
      maxPriorityFeePerGas: undefined, // Let SDK determine
    };

    // Generate shield transaction with proof
    const shieldTx = await populateShield(
      TXIDVersion.V2_PoseidonMerkle, // Use V2 for RAILGUN v3
      networkName,
      shieldPrivateKey, // Use the generated/provided shield private key
      erc20AmountRecipients,
      [], // nftAmountRecipients (empty for now)
      gasDetails // Provide gas details
    );

    console.log('[ProofGen] Shield proof generated ✓');
    console.log('[ProofGen] SDK transaction keys:', Object.keys(shieldTx.transaction));
    console.log('[ProofGen] SDK transaction.to:', shieldTx.transaction.to);
    console.log('[ProofGen] SDK transaction.data length:', shieldTx.transaction.data?.length);
    console.log('[ProofGen] SDK transaction.value:', shieldTx.transaction.value);

    const transaction = {
      to: shieldTx.transaction.to,
      data: shieldTx.transaction.data,
      // For WETH (which we're using for native ETH), value should be 0
      // SDK handles the token transfer
      value: '0',
    };

    console.log('[ProofGen] Final transaction:', JSON.stringify(transaction, null, 2));

    return {
      success: true,
      transaction: transaction, // Include transaction with value field
      shieldPrivateKey,
    };

  } catch (error) {
    console.error('[ProofGen] Shield proof generation failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate ERC-20 Shield Proof
 */
async function generateERC20ShieldProof(params, networkName, txidVersion, amountString) {
  console.log('[ProofGen] Generating ERC-20 shield proof...');

  // Generate random shield private key if not provided
  let shieldPrivateKey = params.shield_private_key || params.shieldPrivateKey;
  if (!shieldPrivateKey || shieldPrivateKey === 'RAILGUN_SHIELD' || shieldPrivateKey.length < 64) {
    shieldPrivateKey = hexlify(randomBytes(32));
    console.log('  Generated random shield private key');
  }

  // Prepare erc20AmountRecipients
  const erc20AmountRecipients = [{
    tokenAddress: params.token,
    amountString,
    recipientAddress: params.recipient,
  }];

  // For now, skip gas estimation and use basic populateShield
  console.log('[ProofGen] Generating shield transaction...');
  const shieldTxResponse = await populateShield(
    txidVersion,
    networkName,
    shieldPrivateKey,
    erc20AmountRecipients,
    [],
    undefined // gasDetails
  );

  const { transaction } = shieldTxResponse;
  console.log('[ProofGen] ERC-20 Shield transaction generated successfully');

  return {
    success: true,
    transaction: {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || '0',
    },
    shieldPrivateKey,
  };
}

/**
 * Generate Base Token (ETH) Shield Proof
 */
async function generateBaseTokenShieldProof(params, networkName, txidVersion, amountString) {
  console.log('[ProofGen] Generating base token shield proof...');

  // For base token shields, we need a wallet to sign the shield signature
  if (!params.wallet) {
    throw new Error('Wallet required for base token shield');
  }

  const shieldPrivateKey = getShieldSignature(params.wallet);
  const railgunWalletAddress = params.recipient;

  // Get wrapped token address for this chain
  const wrappedTokenAddress = CHAIN_CONTRACTS[params.chain_id || params.chainId || 11155111]?.weth;
  if (!wrappedTokenAddress) {
    throw new Error('Wrapped token address not found for chain');
  }

  // Create wrapped ERC20 amount
  const wrappedERC20Amount = {
    tokenAddress: wrappedTokenAddress,
    amount: BigInt(amountString),
  };

  // Get gas estimate for base token shield
  console.log('[ProofGen] Estimating gas for base token shield...');
  const { gasEstimate } = await gasEstimateForShieldBaseToken(
    txidVersion,
    networkName,
    params.fromWalletAddress, // public wallet address
    shieldPrivateKey,
    wrappedERC20Amount,
    params.fromWalletAddress // from wallet address
  );
  console.log('[ProofGen] Base token gas estimate:', gasEstimate);

  // Get gas details
  const originalGasDetails = await getOriginalGasDetailsForTransaction(networkName, true);
  const gasDetails = { ...originalGasDetails, gasEstimate };

  const { transaction, nullifiers } = await populateShieldBaseToken(
    txidVersion,
    networkName,
    railgunWalletAddress,
    shieldPrivateKey,
    wrappedERC20Amount,
    gasDetails
  );

  console.log('[ProofGen] Base token shield transaction generated successfully');

  return {
    success: true,
    transaction: {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || '0',
    },
    shieldPrivateKey,
    gasEstimate,
    nullifiers,
  };
}

/**
 * Generate Transfer Proof - WITH BALANCE CALLBACK SYSTEM
 */
async function generateTransferProof(params) {
  console.log('[ProofGen] Generating transfer proof...');
  console.log('  From Wallet ID:', params.railgunWalletId || params.from_wallet_id);
  console.log('  To RAILGUN Address:', params.recipient || params.to);
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);

  try {
    const {
      populateProvedTransfer,
      gasEstimateForUnprovenTransfer,
      loadWalletByID,
    } = require('@railgun-community/wallet');
    const { parseEther, parseUnits, randomBytes, hexlify } = require('ethers');

    const networkName = chainIdToNetworkName(params.chainId || params.chain_id || 11155111);

    // Load wallet to get RAILGUN address
    let encryptionKey = params.encryptionKey || params.encryption_key || hexlify(randomBytes(32));
    if (encryptionKey.startsWith('0x')) {
      encryptionKey = encryptionKey.slice(2);
    }

    const walletId = params.railgunWalletId || params.railgun_wallet_id;
    if (!walletId) {
      throw new Error('Wallet ID required for transfer');
    }

    const railgunWallet = await loadWalletByID(
      encryptionKey,
      walletId,
      false
    );

    if (!railgunWallet) {
      throw new Error('Failed to load wallet');
    }

    const fromRailgunAddress = railgunWallet.railgunAddress;
    const toRailgunAddress = params.recipient || params.to;

    console.log('  From RAILGUN Address:', fromRailgunAddress);
    console.log('  To RAILGUN Address:', toRailgunAddress);

    // Check if this is a self-transfer (same address)
    if (fromRailgunAddress === toRailgunAddress) {
      throw new Error('Cannot transfer to the same RAILGUN address');
    }

    // Convert amount to wei (BigInt)
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

    // Check balance before attempting transfer
    console.log('[ProofGen] Checking RAILGUN wallet balance...');
    const balance = await getBalance(railgunWallet, params.token, networkName);
    console.log('[ProofGen] Available balance:', balance);

    if (BigInt(balance) < amountWei) {
      throw new Error(`Insufficient RAILGUN balance. Required: ${amountWei.toString()} wei, Available: ${balance} wei. Please shield funds first before transferring.`);
    }

    // IMPORTANT: RAILGUN doesn't support native ETH directly
    // For native ETH (0x0), we use WETH instead
    const chainId = params.chainId || params.chain_id || 11155111;
    const contracts = CHAIN_CONTRACTS[chainId] || CHAIN_CONTRACTS[11155111]; // Fallback to Sepolia
    const isNativeETH = params.token.toLowerCase() === '0x0000000000000000000000000000000000000000';
    const tokenAddress = isNativeETH ? contracts.weth : params.token;

    // Prepare erc20AmountRecipients
    const erc20AmountRecipients = [{
      tokenAddress: tokenAddress,
      amount: amountWei,
      recipientAddress: toRailgunAddress,
    }];

    // Calculate broadcaster fee (typically 0.001 ETH or equivalent)
    const broadcasterFeeERC20Amount = {
      tokenAddress: '0x0000000000000000000000000000000000000000', // ETH
      amount: parseEther('0.001'), // 0.001 ETH in wei
    };

    // Prepare gas details (Sepolia uses EIP-1559)
    const gasDetails = {
      evmGasType: 2, // Type 2 = EIP-1559 (required for Sepolia)
      gasEstimate: BigInt(500000), // 500k gas limit as BigInt
      maxFeePerGas: undefined, // Let SDK determine
      maxPriorityFeePerGas: undefined, // Let SDK determine
    };

    const transferTxResponse = await populateProvedTransfer(
      TXIDVersion.V2_PoseidonMerkle,
      networkName,
      fromRailgunAddress,
      erc20AmountRecipients,
      [],
      broadcasterFeeERC20Amount,
      gasDetails
    );

    const { transaction } = transferTxResponse;
    console.log('[ProofGen] Transfer transaction generated successfully');

    return {
      success: true,
      transaction: {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0',
      },
    };

  } catch (error) {
    console.error('[ProofGen] Transfer proof generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create RAILGUN Wallet
 */
async function createWallet(params) {
  console.log('[ProofGen] Creating new RAILGUN wallet...');
  
  try {
    // Use provided encryption key or generate random one
    let encryptionKey = params.encryptionKey || params.encryption_key || hexlify(randomBytes(32));
    
    // Remove 0x prefix if present - RAILGUN expects 32 bytes without prefix
    if (encryptionKey.startsWith('0x')) {
      encryptionKey = encryptionKey.slice(2);
    }
    
    const mnemonic = params.mnemonic;
    
    if (!mnemonic) {
      throw new Error('Mnemonic required');
    }
    
    const creationBlockNumbers = params.creationBlockNumbers || params.creation_block_numbers || undefined;
    
    const walletInfo = await createRailgunWallet(
      encryptionKey,
      mnemonic,
      creationBlockNumbers
    );
    
    if (!walletInfo) {
      throw new Error('Failed to create wallet');
    }
    
    console.log('[ProofGen] Wallet created successfully');
    console.log('  ID:', walletInfo.id);
    console.log('  Address:', walletInfo.railgunAddress);
    console.log('  Raw wallet info:', walletInfo);
    
    return {
      success: true,
      railgunWalletId: walletInfo.id,
      railgunAddress: walletInfo.railgunAddress,
      mnemonic,
    };
    
  } catch (error) {
    console.error('[ProofGen] Wallet creation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get Shield Private Key
 */
async function getShieldKey(params) {
  console.log('[ProofGen] Getting shield private key...');
  
  try {
    // Accept both camelCase and snake_case
    const walletId = params.railgunWalletId || params.railgun_wallet_id;
    
    if (!walletId) {
      console.log('[ProofGen] Params received:', JSON.stringify(params, null, 2));
      throw new Error('Wallet ID required');
    }
    
    // For RAILGUN, shield private key is randomly generated per shield operation
    // We'll generate a new one here
    const shieldPrivateKey = hexlify(randomBytes(32));
    
    // Remove 0x prefix
    const key = shieldPrivateKey.startsWith('0x') 
      ? shieldPrivateKey.slice(2) 
      : shieldPrivateKey;
    
    console.log('[ProofGen] Shield private key generated ✅');
    
    return {
      success: true,
      shieldPrivateKey: key,
    };
    
  } catch (error) {
    console.error('[ProofGen] Shield key generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate a shield private key signature by signing a predefined message with the provided wallet
 * and then hashing the signature with keccak256.
 *
 * @param wallet - The wallet used to sign the shield signature message
 * @returns A Promise that resolves to the shield private key signature as a hex string
 */
function getShieldSignature(wallet) {
  const shieldSignatureMessage = getShieldPrivateKeySignatureMessage();
  const shieldPrivateKey = keccak256(wallet.signMessage(shieldSignatureMessage));
  return shieldPrivateKey;
}

/**
 * Serializes token address and amount into a RailgunERC20AmountRecipient format.
 *
 * @param tokenAddress - The address of the ERC20 token contract
 * @param amount - The amount of tokens as a bigint
 * @param recipient - The address of the transfer recipient
 * @returns A RailgunERC20AmountRecipient object containing the transfer details
 */
function serializeERC20Transfer(tokenAddress, amount, recipient) {
  return {
    tokenAddress,
    amount,
    recipientAddress: recipient,
  };
}

/**
 * Get original gas details for transaction (mock implementation)
 */
async function getOriginalGasDetailsForTransaction(networkName, sendWithPublicWallet) {
  // Mock gas details - in production, this would get real gas prices
  return {
    evmGasType: sendWithPublicWallet ? 2 : 1, // Type2 for public wallet, Type1 for private
    gasEstimate: 0n,
    gasPrice: 50000000000n, // 50 gwei
    maxFeePerGas: 50000000000n,
    maxPriorityFeePerGas: 2000000000n, // 2 gwei
  };
}

/**
 * Calculate gas price from transaction gas details
 */
function calculateGasPriceFromDetails(gasDetails) {
  if (gasDetails.evmGasType === 2) {
    // EIP-1559
    return gasDetails.maxFeePerGas || 50000000000n;
  } else {
    // Legacy
    return gasDetails.gasPrice || 50000000000n;
  }
}

/**
 * Get balance for a specific token from RAILGUN wallet
 */
async function getBalance(wallet, tokenAddress, networkName) {
  try {
    console.log(`[ProofGen] Getting balance for ${tokenAddress} in wallet ${wallet.id}`);

    // Use the RAILGUN SDK balanceForERC20Token function
    // This requires a loaded wallet object
    const balance = await balanceForERC20Token(
      wallet,
      tokenAddress,
      networkName
    );

    console.log(`[ProofGen] Balance retrieved: ${balance} wei`);
    return balance.toString(); // Convert BigInt to string

  } catch (error) {
    console.error('[ProofGen] Failed to get balance:', error);
    // If balance query fails (e.g., wallet not scanned), return 0
    return '0';
  }
}

/**
 * Main command handler
 */
async function handleCommand(command, params) {
  try {
    // Initialize RAILGUN for commands that require the engine
    const chainId = params.chain_id || params.chainId || 11155111;
    const commandsRequiringInit = new Set([
      'create_wallet',
      'generate_shield_proof',
      'generate_transfer_proof',
    ]);

    if (commandsRequiringInit.has(command)) {
      await initRailgun(chainId);
    }
    
    switch (command) {
      case 'create_wallet':
        return await createWallet(params);
        
      case 'get_shield_key':
        return await getShieldKey(params);
        
      case 'generate_shield_proof':
        return await generateShieldProof(params);
        
      case 'generate_transfer_proof':
        // Map frontend parameters to expected format
        const transferParams = {
          ...params,
          from_wallet_id: params.railgunWalletId || params.from_wallet_id,
          to_address: params.recipient || params.to,
          token: params.token,
          amount: params.amount,
          chain_id: params.chainId || params.chain_id,
        };
        return await generateTransferProof(transferParams);
        
      default:
        return {
          success: false,
          error: `Unknown command: ${command}`,
        };
    }
  } catch (error) {
    console.error('[ProofGen] Command failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node index.js <command> <params_json>');
    process.exit(1);
  }
  
  const command = args[0];
  const params = JSON.parse(args[1]);
  
  handleCommand(command, params)
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  initRailgun,
  createWallet,
  getShieldKey,
  generateShieldProof,
  generateTransferProof,
  handleCommand,
  getShieldSignature,
  serializeERC20Transfer,
  getOriginalGasDetailsForTransaction,
  calculateGasPriceFromDetails,
};
