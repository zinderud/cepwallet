# CepWallet Development Guide

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

Tests are located in `__tests__` directories next to the code they test:

```
src/
  services/
    TransactionService.ts
    __tests__/
      TransactionService.test.ts
```

## Common Issues and Solutions

### 1. RAILGUN Database Corruption

**Error:**
```
Error [OpenError]: IO error: ./railgun_db/MANIFEST-XXXXXX: No such file or directory
```

**Solution:**
```bash
cd proof-generator
rm -rf railgun_db
# Restart the application
```

The database will be recreated automatically.

### 2. Insufficient WETH Balance

**Error:**
```
Insufficient WETH balance. Have 0.0 WETH, need 0.001 WETH
```

**Solution:**
- Shield transactions require WETH instead of native ETH
- Wrap your ETH to WETH before shielding
- On Sepolia, use a faucet to get test WETH

### 3. Gas Estimation Failed

**Error:**
```
Gas estimation failed: execution reverted
```

**Possible causes:**
- Insufficient token balance
- Missing token approval
- Invalid transaction parameters
- Contract is paused

**Solution:**
- Check token balance
- Ensure token approval exists
- Verify contract addresses
- Check gas price isn't too low

### 4. Transaction Timeout

**Error:**
```
Transaction timed out after 300000ms
```

**Solution:**
- Increase gas price
- Wait for network congestion to clear
- Check if transaction is stuck in mempool
- Try again with higher gas

## Best Practices

### 1. Error Handling

Always wrap async operations in try-catch:

```typescript
try {
  const result = await wallet.shield({ amount: '0.001', token: '0x0' });
  notifySuccess('Shield Successful', `Transaction: ${result.txHash}`);
} catch (error) {
  console.error('Shield failed:', error);
  notifyError('Shield Failed', error.message);
  // Don't rethrow unless necessary
}
```

### 2. Loading States

Always track loading states for user feedback:

```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleAction() {
  setIsLoading(true);
  try {
    await performAction();
  } finally {
    setIsLoading(false); // Always cleanup in finally
  }
}
```

### 3. User Notifications

Provide clear feedback for all operations:

```typescript
// Before action
notifyInfo('Approving WETH', 'Please confirm in your wallet...');

// During action
notifyInfo('Processing', 'Transaction submitted...');

// After success
notifySuccess('Success', 'Operation completed!');

// After error
notifyError('Failed', 'Please try again');
```

### 4. Retry Logic

Use retry utilities for network operations:

```typescript
import { retryWithBackoff, isNetworkError } from '../utils/retry';

const result = await retryWithBackoff(
  () => provider.getBalance(address),
  {
    maxAttempts: 3,
    delayMs: 1000,
    onRetry: (attempt, error) => {
      console.log(`Attempt ${attempt} failed:`, error);
    },
  }
);
```

## Environment Variables

Required environment variables:

```env
# Sepolia RPC (for development)
VITE_SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com

# Mainnet RPC (for production)
VITE_MAINNET_RPC=https://eth.llamarpc.com

# Optional: Custom RAILGUN DB path
RAILGUN_DB_PATH=./railgun_db
```

## Debugging

### Enable Debug Logs

Add to your `.env`:

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Check Transaction Status

```typescript
const txService = createSepoliaTransactionService();
const status = await txService.getTransactionStatus(txHash);

console.log('Status:', status.status);
console.log('Confirmations:', status.confirmations);
```

### Inspect RAILGUN Database

```bash
# View database contents (requires leveldb tools)
cd proof-generator
leveldb-cli --db ./railgun_db
```

## Performance Optimization

### 1. Proof Generation

Proof generation is CPU-intensive. Consider:

- Running in a Web Worker
- Showing progress indicators
- Allowing cancellation
- Caching proofs when possible

### 2. Merkletree Scanning

Scanning can take time on slow networks:

- Scan incrementally (batches of blocks)
- Show scan progress
- Allow background scanning
- Cache scan results

### 3. Gas Estimation

Gas estimation can fail or be slow:

- Use fallback gas limits
- Cache successful estimations
- Add buffer to estimates (20%)
- Retry on failure

## Security Considerations

### 1. Private Key Management

- Never log private keys
- Never send private keys over network
- Store encrypted in localStorage
- Use hardware wallet when possible

### 2. Token Approvals

- Use MaxUint256 for unlimited approvals (careful!)
- Or approve exact amounts for each transaction
- Revoke approvals when not needed
- Monitor approval events

### 3. Transaction Validation

- Always validate addresses
- Check token balances before transactions
- Verify contract addresses
- Validate amounts and decimals

## Contributing

When adding new features:

1. Add TypeScript types
2. Write tests
3. Add error handling
4. Update documentation
5. Add user notifications
6. Test on testnet first
