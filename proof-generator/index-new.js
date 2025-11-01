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
  gasEstimateForUnprovenTransfer,
  populateProvedTransfer,
  generateTransferProof: railgunGenerateTransferProof,
} = require('@railgun-community/wallet');
const LevelDOWN = require('leveldown');
const { NetworkName, TXIDVersion, NETWORK_CONFIG, RailgunWalletBalanceBucket } = require('@railgun-community/shared-models');
const { parseEther, parseUnits, randomBytes, hexlify } = require('ethers');

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
 * Generate Shield Proof
 */
async function generateShieldProof(params) {
  console.log('[ProofGen] Generating shield proof...');
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);
  console.log('  RAILGUN Address:', params.recipient);
  
  try {
    const networkName = chainIdToNetworkName(params.chain_id || params.chainId || 11155111);
    
    // Generate random shield private key if not provided
    let shieldPrivateKey = params.shield_private_key || params.shieldPrivateKey;
    if (!shieldPrivateKey || shieldPrivateKey === 'RAILGUN_SHIELD' || shieldPrivateKey.length < 64) {
      shieldPrivateKey = hexlify(randomBytes(32));
      console.log('  Generated random shield private key');
    }
    
    // Prepare erc20AmountRecipients
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amountString: params.amount,
      recipientAddress: params.recipient,
    }];
    
    // Generate transaction
    const shieldTxResponse = await populateShield(
      networkName,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      undefined // transactionBatch
    );
    
    console.log('[ProofGen] Shield transaction generated successfully');
    
    return {
      success: true,
      transaction: {
        to: shieldTxResponse.to,
        data: shieldTxResponse.data,
        value: shieldTxResponse.value || '0',
      },
      shieldPrivateKey: shieldPrivateKey,
    };
    
  } catch (error) {
    console.error('[ProofGen] Shield proof generation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate Transfer Proof - WITH BALANCE CALLBACK SYSTEM
 */
async function generateTransferProof(params) {
  console.log('[ProofGen] Generating transfer proof...');
  console.log('  From Wallet:', params.from_wallet_id);
  console.log('  To Address:', params.to_address);
  console.log('  Token:', params.token);
  console.log('  Amount:', params.amount);
  
  try {
    const networkName = chainIdToNetworkName(params.chain_id || params.chainId || 11155111);
    const chain = NETWORK_CONFIG[networkName].chain;
    
    // Load wallet
    const encryptionKey = hexlify(randomBytes(32));
    const railgunWallet = await loadWalletByID(
      encryptionKey,
      params.from_wallet_id,
      false
    );
    
    if (!railgunWallet) {
      throw new Error('Failed to load wallet');
    }
    
    console.log('[ProofGen] Wallet loaded ✅');
    
    // CRITICAL: Refresh balances and wait for callback
    console.log('[ProofGen] 🔄 Refreshing balances from blockchain...');
    const updatePromise = waitForBalanceUpdate();
    await refreshBalances(chain, [params.from_wallet_id]);
    
    console.log('[ProofGen] ⏳ Waiting for balance update callback (max 30s)...');
    await updatePromise;
    console.log('[ProofGen] ✅ Balance refresh completed');
    
    // Check balance from cache
    console.log('[ProofGen] 💰 Checking spendable balance from cache...');
    const spendableBalances = getSpendableBalances();
    
    if (!spendableBalances || !spendableBalances.erc20Amounts || spendableBalances.erc20Amounts.length === 0) {
      console.log('[ProofGen] ⚠️  No cached balances found, checking directly...');
      const balanceInfo = await balanceForERC20Token(
        params.from_wallet_id,
        chain,
        params.token
      );
      console.log('[ProofGen] Direct balance check:', balanceInfo?.balance || '0');
      
      if (!balanceInfo || BigInt(balanceInfo.balance) < BigInt(params.amount)) {
        throw new Error(`Insufficient balance. Balance: ${balanceInfo?.balance || '0'}, Required: ${params.amount}`);
      }
    } else {
      // Check in cache
      const tokenBalance = spendableBalances.erc20Amounts.find(
        amt => amt.tokenAddress.toLowerCase() === params.token.toLowerCase()
      );
      
      if (!tokenBalance) {
        console.log('[ProofGen] Available tokens in cache:', spendableBalances.erc20Amounts.map(a => a.tokenAddress));
        throw new Error(`Token ${params.token} not found in spendable balances`);
      }
      
      console.log('[ProofGen] ✅ Balance from cache:', tokenBalance.amountString);
      
      if (BigInt(tokenBalance.amountString) < BigInt(params.amount)) {
        throw new Error(`Insufficient balance. Balance: ${tokenBalance.amountString}, Required: ${params.amount}`);
      }
    }
    
    // Prepare transfer
    const erc20AmountRecipients = [{
      tokenAddress: params.token,
      amountString: params.amount,
      recipientAddress: params.to_address,
    }];
    
    // Generate proof
    console.log('[ProofGen] 🔐 Generating ZK proof...');
    const showSenderAddressToRecipient = false;
    const memoText = undefined;
    
    await railgunGenerateTransferProof(
      networkName,
      params.from_wallet_id,
      encryptionKey,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      undefined, // relayerFeeERC20AmountRecipient
      false, // sendWithPublicWallet
      undefined, // overallBatchMinGasPrice
      () => {} // progressCallback
    );
    
    console.log('[ProofGen] ✅ Proof generated');
    
    // Populate transaction
    const transferTxResponse = await populateProvedTransfer(
      networkName,
      params.from_wallet_id,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      undefined, // relayerFeeERC20AmountRecipient
      false, // sendWithPublicWallet
      undefined, // overallBatchMinGasPrice
      undefined // transactionGasDetails
    );
    
    return {
      success: true,
      transaction: {
        to: transferTxResponse.to,
        data: transferTxResponse.data,
        value: '0',
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
    const encryptionKey = hexlify(randomBytes(32));
    const mnemonic = params.mnemonic;
    
    if (!mnemonic) {
      throw new Error('Mnemonic required');
    }
    
    const creationBlockNumbers = params.creation_block_numbers || undefined;
    
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
    
    return {
      success: true,
      wallet_id: walletInfo.id,
      railgun_address: walletInfo.railgunAddress,
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
 * Main command handler
 */
async function handleCommand(command, params) {
  try {
    // Initialize RAILGUN if not already done
    const chainId = params.chain_id || params.chainId || 11155111;
    await initRailgun(chainId);
    
    switch (command) {
      case 'create_wallet':
        return await createWallet(params);
        
      case 'generate_shield_proof':
        return await generateShieldProof(params);
        
      case 'generate_transfer_proof':
        return await generateTransferProof(params);
        
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
    console.error('Usage: node index-new.js <command> <params_json>');
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
  generateShieldProof,
  generateTransferProof,
  handleCommand,
};
