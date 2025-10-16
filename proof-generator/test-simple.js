/**
 * Simple test to verify RAILGUN SDK initialization
 * Tests basic functionality without requiring full wallet setup
 */

const {
  startRailgunEngine,
  createRailgunWallet,
  loadProvider,
} = require('@railgun-community/wallet');
const LevelDOWN = require('leveldown');
const { NetworkName, TXIDVersion } = require('@railgun-community/shared-models');
const fs = require('fs');
const path = require('path');

/**
 * Simple artifact store implementation
 */
class TestArtifactStore {
  async getArtifacts(path) {
    console.log(`[Test] Artifact store: getArtifacts called for ${path}`);
    // Return null to trigger download
    return null;
  }
  
  async storeArtifacts(path, artifacts) {
    console.log(`[Test] Artifact store: storeArtifacts called for ${path}`);
    // In real implementation, save to disk
    return true;
  }
}

/**
 * Clean test database
 */
function cleanTestDb() {
  const dbPath = path.join(__dirname, 'test_railgun_db');
  if (fs.existsSync(dbPath)) {
    console.log('[Test] Cleaning old test database...');
    fs.rmSync(dbPath, { recursive: true, force: true });
  }
}

/**
 * Test 1: Initialize RAILGUN Engine
 */
async function testInitialization() {
  console.log('\n=== Test 1: RAILGUN Engine Initialization ===\n');
  
  try {
    cleanTestDb();
    
    const db = new LevelDOWN('./test_railgun_db');
    const artifactStore = new TestArtifactStore();
    
    console.log('[Test] Starting RAILGUN engine...');
    console.log('[Test] Note: First run may take several minutes to download circuit artifacts (~2GB)');
    
    await startRailgunEngine(
      'CepWalletTest', // wallet source (no special characters allowed)
      db,
      true, // shouldDebug
      artifactStore,
      false, // useNativeArtifacts
      false, // skipMerkletreeScans - MUST be false for wallet creation
      [], // poiNodeURLs
      undefined, // customPOILists
      false // verboseLogging - reduced verbosity for test
    );
    
    console.log('[Test] ✓ RAILGUN Engine initialized successfully!');
    
    // Load provider for Sepolia testnet
    console.log('[Test] Loading provider for Sepolia testnet...');
    await loadProvider(
      {
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
        chainId: 11155111,
      },
      NetworkName.EthereumSepolia,
      10000 // pollingInterval
    );
    
    console.log('[Test] ✓ Provider loaded successfully!\n');
    return true;
    
  } catch (error) {
    console.error('[Test] ✗ Engine initialization failed:', error.message);
    console.error('[Test] Stack:', error.stack);
    return false;
  }
}

/**
 * Test 2: Create a test RAILGUN wallet
 */
async function testWalletCreation() {
  console.log('\n=== Test 2: RAILGUN Wallet Creation ===\n');
  
  try {
    // Test mnemonic (DO NOT USE IN PRODUCTION)
    const testMnemonic = 'test test test test test test test test test test test junk';
    // Encryption key must be exactly 32 bytes (64 hex characters)
    const encryptionKey = '0'.repeat(64); // 32 bytes of zeros for testing
    
    console.log('[Test] Creating RAILGUN wallet from mnemonic...');
    
    const walletInfo = await createRailgunWallet(
      encryptionKey,
      testMnemonic,
      undefined, // creationBlockNumbers
      0 // derivation index
    );
    
    console.log('[Test] ✓ Wallet created successfully!');
    console.log('[Test] Wallet ID:', walletInfo.id);
    console.log('[Test] RAILGUN Address:', walletInfo.railgunAddress);
    console.log();
    
    return walletInfo;
    
  } catch (error) {
    console.error('[Test] ✗ Wallet creation failed:', error.message);
    console.error('[Test] Stack:', error.stack);
    return null;
  }
}

/**
 * Test 3: Get shield private key signature message
 */
async function testShieldPrivateKey() {
  console.log('\n=== Test 3: Shield Private Key ===\n');
  
  try {
    const { getShieldPrivateKeySignatureMessage } = require('@railgun-community/wallet');
    
    const message = getShieldPrivateKeySignatureMessage();
    console.log('[Test] Shield signature message:', message);
    console.log('[Test] ✓ Shield private key message retrieved\n');
    
    return true;
    
  } catch (error) {
    console.error('[Test] ✗ Shield private key test failed:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   CepWallet RAILGUN SDK Integration Test         ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
  console.log('⚠️  WARNING: This test may take several minutes on first run');
  console.log('   Circuit artifacts (~2GB) need to be downloaded from IPFS/CDN\n');
  
  let allTestsPassed = true;
  
  // Test 1: Engine initialization
  const initSuccess = await testInitialization();
  allTestsPassed = allTestsPassed && initSuccess;
  
  if (!initSuccess) {
    console.error('\n❌ Engine initialization failed, stopping tests');
    process.exit(1);
  }
  
  // Test 2: Wallet creation
  const walletInfo = await testWalletCreation();
  allTestsPassed = allTestsPassed && (walletInfo !== null);
  
  // Test 3: Shield private key
  const shieldSuccess = await testShieldPrivateKey();
  allTestsPassed = allTestsPassed && shieldSuccess;
  
  // Summary
  console.log('\n╔═══════════════════════════════════════════════════╗');
  if (allTestsPassed) {
    console.log('║   ✅ ALL TESTS PASSED                             ║');
    console.log('║                                                   ║');
    console.log('║   Next steps:                                     ║');
    console.log('║   1. Test FFI bridge from Rust                    ║');
    console.log('║   2. Generate real proof on testnet               ║');
    console.log('║   3. Test shield/unshield flow                    ║');
  } else {
    console.log('║   ❌ SOME TESTS FAILED                            ║');
    console.log('║                                                   ║');
    console.log('║   Check error messages above                      ║');
  }
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
if (require.main === module) {
  main().catch(error => {
    console.error('\n[Test] Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  testInitialization,
  testWalletCreation,
  testShieldPrivateKey,
};
