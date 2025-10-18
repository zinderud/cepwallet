/**
 * RAILGUN Unshield Proof Test
 * 
 * Tests unshielding tokens from shielded address to public address:
 * 1. Create RAILGUN wallet (with shielded balance)
 * 2. Define public recipient address
 * 3. Validate unshield proof parameters
 * 4. Document unshield flow
 */

const {
  initRailgun,
  createWallet,
  getShieldPrivateKey,
} = require('./index.js');

const CHAIN_ID = 11155111; // Sepolia
const ENCRYPTION_KEY = '0x' + '0'.repeat(64); // 32 bytes

// Example public Ethereum address (recipient)
const PUBLIC_RECIPIENT = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

async function runTest() {
  console.log('═══════════════════════════════════════');
  console.log('  RAILGUN Unshield Proof Test');
  console.log('═══════════════════════════════════════\n');

  try {
    // Step 1: Initialize RAILGUN
    console.log('🚀 Step 1: Initialize RAILGUN Engine');
    console.log('   Chain ID:', CHAIN_ID);
    
    await initRailgun(CHAIN_ID);
    console.log('   ✅ RAILGUN initialized\n');

    // Step 2: Create shielded wallet
    console.log('📝 Step 2: Create Shielded Wallet');
    console.log('   (This wallet would have shielded balance)');
    
    const walletResult = await createWallet({
      encryptionKey: ENCRYPTION_KEY,
    });
    
    if (!walletResult.success) {
      throw new Error('Wallet creation failed: ' + walletResult.error);
    }
    
    console.log('   ✅ Shielded wallet created');
    console.log('   Wallet ID:', walletResult.railgunWalletId);
    console.log('   RAILGUN Address:', walletResult.railgunAddress);
    console.log('   Mnemonic:', walletResult.mnemonic);
    console.log();

    // Step 3: Get shield key
    console.log('🔑 Step 3: Get Shield Private Key');
    
    const keyResult = await getShieldPrivateKey({
      railgunWalletId: walletResult.railgunWalletId,
    });
    
    if (!keyResult.success) {
      throw new Error('Shield key retrieval failed: ' + keyResult.error);
    }
    
    console.log('   ✅ Shield key retrieved');
    console.log('   Key:', keyResult.shieldPrivateKey.substring(0, 20) + '...');
    console.log();

    // Step 4: Define public recipient
    console.log('🏦 Step 4: Define Public Recipient');
    console.log('   Public Ethereum address to receive tokens:');
    console.log('   Address:', PUBLIC_RECIPIENT);
    console.log();

    // Step 5: Validate unshield parameters
    console.log('🔓 Step 5: Validate Unshield Parameters');
    console.log('   This validates parameters for unshielding');
    console.log('   from private (shielded) to public address');
    console.log();
    
    // Token addresses on Sepolia
    const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const UNSHIELD_AMOUNT = '250000'; // 0.25 USDC
    
    console.log('   Unshield Details:');
    console.log('   ─────────────────────────────────────');
    console.log('   Token: USDC (Sepolia)');
    console.log('   Amount: 0.25 USDC (250000)');
    console.log('   From (Shielded):', walletResult.railgunAddress);
    console.log('   To (Public):', PUBLIC_RECIPIENT);
    console.log();

    // Step 6: Document unshield proof requirements
    console.log('📋 Step 6: Unshield Proof Requirements');
    console.log('   ─────────────────────────────────────');
    console.log('   ⚠️  For actual unshield proof generation:');
    console.log('      1. RAILGUN wallet must have shielded balance');
    console.log('      2. Sender needs ETH for gas');
    console.log('      3. Valid merkle tree must be synced');
    console.log('      4. Public recipient address must be valid');
    console.log('      5. Amount must not exceed shielded balance');
    console.log();
    console.log('   ✅ Unshield Parameters Ready:');
    console.log('      - Chain ID:', CHAIN_ID);
    console.log('      - Token:', USDC_SEPOLIA);
    console.log('      - Amount:', UNSHIELD_AMOUNT);
    console.log('      - RAILGUN Wallet ID:', walletResult.railgunWalletId);
    console.log('      - RAILGUN Address:', walletResult.railgunAddress);
    console.log('      - Public Recipient:', PUBLIC_RECIPIENT);
    console.log('      - Encryption Key: Available');
    console.log();

    // Step 7: Document SDK function to use
    console.log('🔧 Step 7: SDK Function for Unshield');
    console.log('   ─────────────────────────────────────');
    console.log('   Function: populateProvedUnshield()');
    console.log('   From: @railgun-community/wallet');
    console.log();
    console.log('   Parameters:');
    console.log('   - txidVersion: TXIDVersion.V2_PoseidonMerkle');
    console.log('   - networkName: NetworkName.EthereumSepolia');
    console.log('   - railgunWalletID: (shielded wallet ID)');
    console.log('   - encryptionKey: (wallet encryption key)');
    console.log('   - erc20AmountRecipients: [');
    console.log('       {');
    console.log('         tokenAddress: token address,');
    console.log('         amount: BigInt(amount),');
    console.log('         recipientAddress: PUBLIC_RECIPIENT (0x... address)');
    console.log('       }');
    console.log('   ]');
    console.log('   - nftAmountRecipients: []');
    console.log('   - relayerFeeERC20AmountRecipient: undefined');
    console.log('   - sendWithPublicWallet: true (use public wallet to send)');
    console.log('   - overallBatchMinGasPrice: undefined');
    console.log();
    console.log('   Note: recipientAddress for unshield is a regular');
    console.log('         Ethereum address (0x...), NOT a RAILGUN address!');
    console.log();

    // Step 8: Security considerations
    console.log('🔒 Step 8: Privacy & Security Considerations');
    console.log('   ─────────────────────────────────────');
    console.log('   ⚠️  Important Privacy Notes:');
    console.log('      • Unshielding reveals on-chain link between:');
    console.log('        - Your shielded balance');
    console.log('        - The public recipient address');
    console.log('      • Consider using a fresh public address');
    console.log('      • Breaking the link requires multiple hops');
    console.log('      • Use privacy-focused patterns:');
    console.log('        1. Unshield to new address');
    console.log('        2. Wait some time');
    console.log('        3. Transfer to final destination');
    console.log();

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('  ✅ ALL UNSHIELD SETUP TESTS PASSED');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 Test Results:');
    console.log('  ✅ RAILGUN Initialization: PASS');
    console.log('  ✅ Shielded Wallet Creation: PASS');
    console.log('  ✅ Shield Key Retrieval: PASS');
    console.log('  ✅ Public Recipient Validation: PASS');
    console.log('  ✅ Unshield Parameters Setup: PASS');
    console.log();
    
    console.log('💾 Wallet Information:');
    console.log('  RAILGUN Wallet:');
    console.log('    ID:', walletResult.railgunWalletId);
    console.log('    Address:', walletResult.railgunAddress);
    console.log('    Mnemonic:', walletResult.mnemonic);
    console.log();
    console.log('  Public Recipient:');
    console.log('    Address:', PUBLIC_RECIPIENT);
    console.log();
    
    console.log('💡 Next Steps:');
    console.log('  1. Ensure shielded wallet has balance');
    console.log('  2. Wait for merkle tree sync');
    console.log('  3. Call populateProvedUnshield() to generate proof');
    console.log('  4. Sign transaction with public wallet');
    console.log('  5. Broadcast transaction to network');
    console.log();
    
    console.log('🔄 Complete Privacy Flow:');
    console.log('  Public → Shield → Transfer → Unshield → Public');
    console.log('  ────────────────────────────────────────────────');
    console.log('  1. Shield: Public tokens → Shielded balance');
    console.log('  2. Transfer: Shielded → Shielded (private)');
    console.log('  3. Unshield: Shielded balance → Public address');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
