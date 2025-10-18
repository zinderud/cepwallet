/**
 * RAILGUN Wallet E2E Test
 * 
 * Tests wallet creation and shield key retrieval
 */

const {
  createWallet,
  getShieldPrivateKey,
  initRailgun,
} = require('./index.js');

async function testWalletCreation() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   RAILGUN Wallet E2E Test                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Test 0: Initialize RAILGUN
    console.log('🚀 Test 0: Initialize RAILGUN Engine');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('  Chain ID: 11155111 (Sepolia)');
    
    await initRailgun(11155111);
    
    console.log('  ✅ RAILGUN Engine initialized!');
    console.log();

    // Test 1: Create wallet
    console.log('📝 Test 1: Create RAILGUN Wallet');
    console.log('─────────────────────────────────────────────────────────────');
    
    const encryptionKey = '0x' + '0'.repeat(64); // 32 bytes
    console.log(`  Encryption Key: ${encryptionKey.substring(0, 20)}...`);
    
    const createResult = await createWallet({
      encryptionKey,
      // mnemonic: undefined (let it generate)
    });
    
    if (!createResult.success) {
      console.error('  ❌ Wallet creation failed:', createResult.error);
      process.exit(1);
    }
    
    console.log('  ✅ Wallet created successfully!');
    console.log(`  Wallet ID: ${createResult.railgunWalletId}`);
    console.log(`  RAILGUN Address: ${createResult.railgunAddress}`);
    console.log(`  Mnemonic: ${createResult.mnemonic}`);
    console.log();

    // Test 2: Get shield private key
    console.log('🔑 Test 2: Get Shield Private Key');
    console.log('─────────────────────────────────────────────────────────────');
    
    const keyResult = await getShieldPrivateKey({
      railgunWalletId: createResult.railgunWalletId,
    });
    
    if (!keyResult.success) {
      console.error('  ❌ Shield key retrieval failed:', keyResult.error);
      process.exit(1);
    }
    
    console.log('  ✅ Shield key retrieved successfully!');
    console.log(`  Shield Private Key: ${keyResult.shieldPrivateKey.substring(0, 20)}...`);
    console.log();

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ALL TESTS PASSED                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Test Summary:');
    console.log('  ✅ RAILGUN Initialization: PASS');
    console.log('  ✅ Wallet Creation: PASS');
    console.log('  ✅ Shield Key Retrieval: PASS');
    console.log();
    
    console.log('💾 Wallet Information:');
    console.log(`  ID: ${createResult.railgunWalletId}`);
    console.log(`  Address: ${createResult.railgunAddress}`);
    console.log(`  Mnemonic: ${createResult.mnemonic}`);
    console.log(`  Shield Key: ${keyResult.shieldPrivateKey.substring(0, 30)}...`);
    console.log();
    
    console.log('🎉 RAILGUN wallet is ready for transactions!');
    
    return {
      walletId: createResult.railgunWalletId,
      address: createResult.railgunAddress,
      mnemonic: createResult.mnemonic,
      shieldKey: keyResult.shieldPrivateKey,
    };
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testWalletCreation()
    .then((wallet) => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testWalletCreation };
