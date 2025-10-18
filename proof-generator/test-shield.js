/**
 * Test RAILGUN Shield Proof Generation
 * 
 * This test validates:
 * 1. RAILGUN initialization
 * 2. Wallet creation
 * 3. Shield proof generation for ERC20 tokens
 */

const { startRailgunEngine } = require('@railgun-community/wallet');
const {
  loadProvider,
  createRailgunWallet,
  fullWalletForID,
  gasEstimateForShield,
  generateShieldProof,
  getShieldPrivateKeySignatureMessage,
} = require('@railgun-community/wallet');
const { NetworkName, EVMGasType } = require('@railgun-community/shared-models');
const { generateMnemonic } = require('bip39');
const LevelDOWN = require('leveldown');

// Test configuration
const CHAIN_ID = 11155111; // Sepolia
const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars

// ERC20 token addresses on Sepolia
const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Example USDC on Sepolia
const WETH_SEPOLIA = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'; // WETH on Sepolia

async function initRailgun(chainId) {
  console.log('\n🚀 Initializing RAILGUN Engine...');
  
  const walletSource = 'cepwallettest'; // No hyphens allowed
  const db = new LevelDOWN('./test_railgun_db');
  
  try {
    await startRailgunEngine(
      walletSource,
      db, // Use LevelDOWN instance
      true, // shouldDebug
      undefined, // artifactStore
      false, // useNativeArtifacts
      false, // skipMerkletreeScans
      [], // poiNodeURLs
      undefined, // customPOILists
      false // verboseScanLogging
    );
    
    console.log('   Engine started, loading provider...');
    
    // Load network provider
    const providerConfig = {
      chainId: CHAIN_ID,
      providers: [
        {
          provider: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          priority: 1,
          weight: 1,
        },
      ],
    };
    
    const response = await loadProvider(
      providerConfig,
      NetworkName.EthereumSepolia,
      15000 // pollingInterval in ms
    );
    
    console.log('✅ RAILGUN Engine Initialized');
    console.log('   Provider loaded:', response ? 'SUCCESS' : 'FAILED');
    return true;
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    return false;
  }
}

async function createWallet(encryptionKey, mnemonic) {
  console.log('\n📝 Creating RAILGUN Wallet...');
  
  try {
    const result = await createRailgunWallet(
      encryptionKey,
      mnemonic,
      undefined // creationBlockNumbers
    );
    
    if (!result) {
      throw new Error('Wallet creation returned null');
    }
    
    console.log('✅ Wallet Created');
    console.log('   ID:', result.id);
    console.log('   Address:', result.railgunAddress);
    
    return result;
  } catch (error) {
    console.error('❌ Wallet creation failed:', error.message);
    throw error;
  }
}

async function testShieldProof(walletId, encryptionKey) {
  console.log('\n🔒 Testing Shield Proof Generation...');
  
  try {
    // Get wallet instance
    const wallet = fullWalletForID(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    console.log('   Wallet instance retrieved:', wallet.id);
    
    // Define shield inputs - shielding 1 USDC (6 decimals)
    const shieldInputs = [
      {
        tokenAddress: USDC_SEPOLIA,
        amount: '1000000', // 1 USDC (6 decimals)
      },
    ];
    
    console.log('   Shield inputs:');
    console.log('     Token:', shieldInputs[0].tokenAddress);
    console.log('     Amount:', shieldInputs[0].amount, '(1 USDC)');
    
    // Generate shield proof
    console.log('\n   Generating proof...');
    const { proofData, error } = await generateShieldProof(
      NetworkName.EthereumSepolia,
      walletId,
      encryptionKey,
      shieldInputs
    );
    
    if (error) {
      throw new Error(`Proof generation error: ${error}`);
    }
    
    if (!proofData) {
      throw new Error('Proof data is null');
    }
    
    console.log('✅ Shield Proof Generated Successfully!');
    console.log('   Proof length:', JSON.stringify(proofData).length, 'bytes');
    console.log('   Proof structure:', Object.keys(proofData));
    
    return proofData;
  } catch (error) {
    console.error('❌ Shield proof generation failed:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
}

async function getShieldKey(walletId) {
  console.log('\n🔑 Getting Shield Private Key...');
  
  try {
    const shieldKey = getShieldPrivateKeySignatureMessage();
    
    console.log('✅ Shield Key Retrieved');
    console.log('   Message:', shieldKey);
    
    return shieldKey;
  } catch (error) {
    console.error('❌ Shield key retrieval failed:', error.message);
    throw error;
  }
}

async function runTest() {
  console.log('═══════════════════════════════════════');
  console.log('  RAILGUN Shield Proof Generation Test');
  console.log('═══════════════════════════════════════');
  
  try {
    // Step 1: Initialize RAILGUN
    const initSuccess = await initRailgun(CHAIN_ID);
    if (!initSuccess) {
      console.error('\n❌ TEST FAILED: Initialization');
      process.exit(1);
    }
    console.log('✅ RAILGUN Initialization: PASS');
    
    // Step 2: Create wallet
    const mnemonic = generateMnemonic();
    const wallet = await createWallet(ENCRYPTION_KEY, mnemonic);
    console.log('✅ Wallet Creation: PASS');
    
    // Step 3: Get shield key
    const shieldKey = await getShieldKey(wallet.id);
    console.log('✅ Shield Key Retrieval: PASS');
    
    // Step 4: Generate shield proof
    const proof = await testShieldProof(wallet.id, ENCRYPTION_KEY);
    console.log('✅ Shield Proof Generation: PASS');
    
    // Final summary
    console.log('\n═══════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED');
    console.log('═══════════════════════════════════════');
    console.log('\nWallet Details:');
    console.log('  ID:', wallet.id);
    console.log('  Address:', wallet.railgunAddress);
    console.log('  Mnemonic:', mnemonic);
    console.log('\nProof Details:');
    console.log('  Size:', JSON.stringify(proof).length, 'bytes');
    console.log('  Structure:', Object.keys(proof));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest();
