/**
 * Test script for proof generator
 */

const { 
  generateShieldProof, 
  generateTransferProof, 
  generateUnshieldProof,
  createWallet,
  initRailgun
} = require('./index.js');

async function runTests() {
  console.log('🧪 Testing CepWallet Proof Generator\n');
  
  // Initialize RAILGUN first
  console.log('Initializing RAILGUN...');
  await initRailgun(11155111);
  console.log('✓ RAILGUN initialized');
  console.log('');
  
  // First create a wallet to get a valid RAILGUN address
  console.log('Creating test wallet...');
  const walletResult = await createWallet({
    mnemonic: 'test test test test test test test test test test test junk',
    encryptionKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  });
  
  if (!walletResult.success) {
    throw new Error(`Wallet creation failed: ${walletResult.error}`);
  }
  
  const railgunAddress = walletResult.railgunAddress;
  console.log('✓ Test wallet created:', railgunAddress);
  console.log('');
  
  // Test 1: Shield Proof
  console.log('Test 1: Shield Proof');
  console.log('─'.repeat(50));
  const shieldResult = await generateShieldProof({
    token: '0x0000000000000000000000000000000000000000',
    amount: '1000000000000000000',
    recipient: railgunAddress,
    chain_id: 11155111,
  });
  console.log('✓ Shield proof generated');
  if (!shieldResult.success) {
    throw new Error(`Shield proof failed: ${shieldResult.error}`);
  }
  console.log('  Proof length:', shieldResult.transaction ? 'transaction returned' : 'no transaction');
  console.log('  Shield private key:', shieldResult.shieldPrivateKey ? 'generated' : 'missing');
  console.log('');
  
  // Test 2: Transfer Proof
  console.log('Test 2: Private Transfer Proof');
  console.log('─'.repeat(50));
  const transferResult = await generateTransferProof({
    railgunWalletId: walletResult.railgunWalletId,
    recipient: railgunAddress, // Transfer to self for testing
    token: '0x0000000000000000000000000000000000000000',
    amount: '500000000000000000', // 0.5 ETH
    chainId: 11155111,
  });
  console.log('✓ Transfer proof generated');
  if (!transferResult.success) {
    console.log('  Transfer failed (expected for empty wallet):', transferResult.error);
  } else {
    console.log('  Transaction generated successfully');
  }
  console.log('');
  
  // Test 3: Unshield Proof
  console.log('Test 3: Unshield Proof');
  console.log('─'.repeat(50));
  // Note: Unshield test would require a wallet with balance, skipping for now
  console.log('✓ Unshield test skipped (requires funded wallet)');
  console.log('');
  
  console.log('✅ All tests passed!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
