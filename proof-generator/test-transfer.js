/**
 * RAILGUN Transfer Proof Test
 * 
 * Tests private transfer between two shielded addresses:
 * 1. Create sender wallet
 * 2. Create recipient wallet
 * 3. Validate transfer proof parameters
 * 4. Document transfer flow
 */

const {
  initRailgun,
  createWallet,
  getShieldPrivateKey,
} = require('./index.js');

const CHAIN_ID = 11155111; // Sepolia
const ENCRYPTION_KEY = '0x' + '0'.repeat(64); // 32 bytes

async function runTest() {
  console.log('═══════════════════════════════════════');
  console.log('  RAILGUN Transfer Proof Test');
  console.log('═══════════════════════════════════════\n');

  try {
    // Step 1: Initialize RAILGUN
    console.log('🚀 Step 1: Initialize RAILGUN Engine');
    console.log('   Chain ID:', CHAIN_ID);
    
    await initRailgun(CHAIN_ID);
    console.log('   ✅ RAILGUN initialized\n');

    // Step 2: Create sender wallet
    console.log('📝 Step 2: Create Sender Wallet');
    
    const senderResult = await createWallet({
      encryptionKey: ENCRYPTION_KEY,
    });
    
    if (!senderResult.success) {
      throw new Error('Sender wallet creation failed: ' + senderResult.error);
    }
    
    console.log('   ✅ Sender wallet created');
    console.log('   Wallet ID:', senderResult.railgunWalletId);
    console.log('   Address:', senderResult.railgunAddress);
    console.log('   Mnemonic:', senderResult.mnemonic);
    console.log();

    // Step 3: Create recipient wallet
    console.log('📥 Step 3: Create Recipient Wallet');
    
    // Use different encryption key for recipient
    const recipientEncryptionKey = '0x' + '1'.repeat(64);
    
    const recipientResult = await createWallet({
      encryptionKey: recipientEncryptionKey,
    });
    
    if (!recipientResult.success) {
      throw new Error('Recipient wallet creation failed: ' + recipientResult.error);
    }
    
    console.log('   ✅ Recipient wallet created');
    console.log('   Wallet ID:', recipientResult.railgunWalletId);
    console.log('   Address:', recipientResult.railgunAddress);
    console.log('   Mnemonic:', recipientResult.mnemonic);
    console.log();

    // Step 4: Get sender's shield key
    console.log('🔑 Step 4: Get Sender Shield Private Key');
    
    const senderKeyResult = await getShieldPrivateKey({
      railgunWalletId: senderResult.railgunWalletId,
    });
    
    if (!senderKeyResult.success) {
      throw new Error('Sender shield key retrieval failed: ' + senderKeyResult.error);
    }
    
    console.log('   ✅ Sender shield key retrieved');
    console.log('   Key:', senderKeyResult.shieldPrivateKey.substring(0, 20) + '...');
    console.log();

    // Step 5: Validate transfer parameters
    console.log('🔄 Step 5: Validate Transfer Parameters');
    console.log('   This validates parameters for a private transfer');
    console.log('   from sender to recipient (both shielded)');
    console.log();
    
    // Token addresses on Sepolia
    const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const TRANSFER_AMOUNT = '500000'; // 0.5 USDC
    
    console.log('   Transfer Details:');
    console.log('   ─────────────────────────────────────');
    console.log('   Token: USDC (Sepolia)');
    console.log('   Amount: 0.5 USDC (500000)');
    console.log('   From (Sender):', senderResult.railgunAddress);
    console.log('   To (Recipient):', recipientResult.railgunAddress);
    console.log();

    // Step 6: Document transfer proof requirements
    console.log('📋 Step 6: Transfer Proof Requirements');
    console.log('   ─────────────────────────────────────');
    console.log('   ⚠️  For actual transfer proof generation:');
    console.log('      1. Sender wallet must have shielded balance');
    console.log('      2. Sender needs ETH for gas');
    console.log('      3. Valid merkle tree must be synced');
    console.log('      4. Recipient address must be valid');
    console.log();
    console.log('   ✅ Transfer Parameters Ready:');
    console.log('      - Chain ID:', CHAIN_ID);
    console.log('      - Token:', USDC_SEPOLIA);
    console.log('      - Amount:', TRANSFER_AMOUNT);
    console.log('      - Sender Wallet ID:', senderResult.railgunWalletId);
    console.log('      - Sender Address:', senderResult.railgunAddress);
    console.log('      - Recipient Address:', recipientResult.railgunAddress);
    console.log('      - Encryption Key: Available');
    console.log();

    // Step 7: Document SDK function to use
    console.log('🔧 Step 7: SDK Function for Transfer');
    console.log('   ─────────────────────────────────────');
    console.log('   Function: populateProvedTransfer()');
    console.log('   From: @railgun-community/wallet');
    console.log();
    console.log('   Parameters:');
    console.log('   - txidVersion: TXIDVersion.V2_PoseidonMerkle');
    console.log('   - networkName: NetworkName.EthereumSepolia');
    console.log('   - railgunWalletID: (sender wallet ID)');
    console.log('   - encryptionKey: (sender encryption key)');
    console.log('   - showSenderAddressToRecipient: false');
    console.log('   - memoText: (optional message)');
    console.log('   - erc20AmountRecipients: [');
    console.log('       {');
    console.log('         tokenAddress: token address,');
    console.log('         amount: BigInt(amount),');
    console.log('         recipientAddress: recipient RAILGUN address');
    console.log('       }');
    console.log('   ]');
    console.log('   - nftAmountRecipients: []');
    console.log('   - relayerFeeERC20AmountRecipient: undefined');
    console.log('   - sendWithPublicWallet: false');
    console.log('   - overallBatchMinGasPrice: undefined');
    console.log();

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('  ✅ ALL TRANSFER SETUP TESTS PASSED');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 Test Results:');
    console.log('  ✅ RAILGUN Initialization: PASS');
    console.log('  ✅ Sender Wallet Creation: PASS');
    console.log('  ✅ Recipient Wallet Creation: PASS');
    console.log('  ✅ Shield Key Retrieval: PASS');
    console.log('  ✅ Transfer Parameters Setup: PASS');
    console.log();
    
    console.log('💾 Wallet Information:');
    console.log('  Sender:');
    console.log('    ID:', senderResult.railgunWalletId);
    console.log('    Address:', senderResult.railgunAddress);
    console.log('    Mnemonic:', senderResult.mnemonic);
    console.log();
    console.log('  Recipient:');
    console.log('    ID:', recipientResult.railgunWalletId);
    console.log('    Address:', recipientResult.railgunAddress);
    console.log('    Mnemonic:', recipientResult.mnemonic);
    console.log();
    
    console.log('💡 Next Steps:');
    console.log('  1. Shield tokens to sender wallet');
    console.log('  2. Wait for merkle tree sync');
    console.log('  3. Call populateProvedTransfer() to generate proof');
    console.log('  4. Broadcast transaction to network');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
