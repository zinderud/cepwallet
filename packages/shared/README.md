# @cepwallet/shared

Shared TypeScript utilities, types, and helpers for CepWallet application.

## Features

- **Type Definitions**: Wallet, Transaction, Bridge, Kohaku types
- **Utility Functions**: Ethereum utilities, formatting helpers, validation
- **Crypto Operations**: Key derivation, signing algorithms, ZK utilities
- **Error Handling**: Custom error classes for different scenarios

## Installation

```bash
pnpm add @cepwallet/shared
```

## Usage

```typescript
import { Account, Token, WalletState } from '@cepwallet/shared';

const account: Account = {
  id: '1',
  type: 'trezor',
  address: '0x...',
  publicKey: '0x...',
  name: 'Main Account',
  balance: {
    value: BigInt('1000000000000000000'),
    formatted: '1.0'
  },
  chainId: 1,
  createdAt: new Date()
};
```

## Modules

### Types
- `wallet.ts` - Wallet and account definitions
- `transaction.ts` - Transaction types and status
- `bridge.ts` - Bridge communication types
- `kohaku.ts` - Privacy layer types
- `ui.ts` - UI state types
- `errors.ts` - Custom error classes

### Utils
- `ethereum.ts` - Ethereum utilities (address validation, etc.)
- `formatting.ts` - Format helpers (amount, address, hash)
- `validation.ts` - Input validation functions
- `constants.ts` - Global constants

### Crypto
- `keys.ts` - BIP-32/39/44 key derivation
- `signing.ts` - Transaction signing prep
- `zk.ts` - ZK proof utilities

### Kohaku
- `railgun.ts` - RAILGUN protocol operations
- `privacy-pools.ts` - Privacy Pool utilities
- `humanizer.ts` - Transaction humanizer

### RPC
- `eip1193.ts` - EIP-1193 provider standard
- `web3.ts` - ethers.js provider wrapper

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Test
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
pnpm lint:fix
```

## Documentation

See [docs/TREZOR_KOHAKU_INTEGRATION.md](../../docs/TREZOR_KOHAKU_INTEGRATION.md) for integration details.

## License

GPL-3.0
