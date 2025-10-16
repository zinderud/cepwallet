/**
 * Test script for proof generator
 */

const { 
  generateShieldProof, 
  generateTransferProof, 
  generateUnshieldProof 
} = require('./index.js');

async function runTests() {
  console.log('🧪 Testing CepWallet Proof Generator\n');
  
  // Test 1: Shield Proof
  console.log('Test 1: Shield Proof');
  console.log('─'.repeat(50));
  const shieldResult = await generateShieldProof({
    token: '0x0000000000000000000000000000000000000000',
    amount: '1000000000000000000',
    commitment: '0xabcd1234...',
  });
  console.log('✓ Shield proof generated');
  console.log('  Proof length:', shieldResult.proof.length);
  console.log('  Public inputs:', shieldResult.publicInputs.length);
  console.log('');
  
  // Test 2: Transfer Proof
  console.log('Test 2: Private Transfer Proof');
  console.log('─'.repeat(50));
  const transferResult = await generateTransferProof({
    merkleRoot: '0xroot1234...',
    nullifier: '0xnull5678...',
    outputCommitment: '0xcommit9012...',
  });
  console.log('✓ Transfer proof generated');
  console.log('  Proof length:', transferResult.proof.length);
  console.log('  Public inputs:', transferResult.publicInputs.length);
  console.log('');
  
  // Test 3: Unshield Proof
  console.log('Test 3: Unshield Proof');
  console.log('─'.repeat(50));
  const unshieldResult = await generateUnshieldProof({
    nullifier: '0xnull9999...',
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: '500000000000000000',
  });
  console.log('✓ Unshield proof generated');
  console.log('  Proof length:', unshieldResult.proof.length);
  console.log('  Public inputs:', unshieldResult.publicInputs.length);
  console.log('');
  
  console.log('✅ All tests passed!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
