# 🚀 CI/CD Pipeline ve Testing Setup

**Versiyon:** 1.0  
**Durum:** Complete  
**Son Güncelleme:** 15 Ekim 2025  

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Local Development Setup](#local-development-setup)
4. [Testing Strategy](#testing-strategy)
5. [Build ve Distribution](#build-ve-distribution)
6. [Monitoring ve Alerting](#monitoring-ve-alerting)

---

## 🎯 Genel Bakış

CepWallet, pnpm workspaces monorepo yapısı ile aşağıdaki CI/CD pipeline'ını kullanır:

```
Code Push
    ↓
[Lint & Format Check]
    ↓
[Unit Tests - Jest]
    ↓
[E2E Tests - Playwright + Emulator]
    ↓
[Build - Electron Builder]
    ↓
[Distribution - macOS/Windows/Linux]
    ↓
[Release & Deployment]
```

---

## 🔄 GitHub Actions Workflows

### 1. Lint & Format Check

**Dosya:** `.github/workflows/lint.yml`

```yaml
name: Lint & Format

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm run lint

      - name: Check formatting with Prettier
        run: pnpm run format:check

      - name: TypeScript type check
        run: pnpm run type-check

      - name: Cargo fmt (Bridge)
        run: |
          cd packages/bridge
          cargo fmt -- --check
        
      - name: Cargo clippy (Bridge)
        run: |
          cd packages/bridge
          cargo clippy -- -D warnings

      - name: Upload linting results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: lint-results
          path: |
            **/eslint-report.json
            **/prettier-report.json
```

**Local Çalıştırma:**

```bash
# Lint check
pnpm run lint

# Format check
pnpm run format:check

# Auto-fix
pnpm run format:fix

# Type check
pnpm run type-check

# Pre-commit hook (Husky)
git commit -m "message"  # Otomatik lint çalışır
```

---

### 2. Unit Tests

**Dosya:** `.github/workflows/test.yml`

```yaml
name: Unit Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Jest tests
        run: pnpm run test -- --coverage
        env:
          NODE_ENV: test
          TREZOR_MOCK: true  # Mock Trezor device

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: true

      - name: Test Report
        uses: dorny/test-reporter@v1
        if: success() || failure()
        with:
          name: Jest Results
          path: 'coverage/junit.xml'
          reporter: 'java-junit'

  test-bridge:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true

      - name: Cache cargo registry
        uses: actions/cache@v3
        with:
          path: ~/.cargo/registry
          key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo index
        uses: actions/cache@v3
        with:
          path: ~/.cargo/git
          key: ${{ runner.os }}-cargo-git-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo build
        uses: actions/cache@v3
        with:
          path: packages/bridge/target
          key: ${{ runner.os }}-cargo-build-target-${{ hashFiles('**/Cargo.lock') }}

      - name: Run cargo tests
        run: |
          cd packages/bridge
          cargo test
```

**Local Çalıştırma:**

```bash
# Desktop tests
pnpm run test

# Watch mode
pnpm run test:watch

# With coverage
pnpm run test:coverage

# Specific test file
pnpm run test -- src/components/Wallet.test.tsx

# Bridge tests (Rust)
cd packages/bridge
cargo test
```

**Jest Configuration Example:**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

---

### 3. E2E Tests (Emulator Tabanlı)

**Dosya:** `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Günlük

jobs:
  e2e:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18.x, 20.x]
    
    services:
      trezor-emulator:
        image: trezor/trezor-user-env:latest
        ports:
          - 21324:21324
        options: |
          --health-cmd="curl -f http://localhost:21324 || exit 1"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Wait for Trezor Emulator
        run: |
          npx wait-on http://localhost:21324 --timeout 30000

      - name: Run Playwright tests
        run: pnpm run test:e2e
        env:
          TREZOR_BRIDGE_URL: http://localhost:21324
          CI: true

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.os }}-${{ matrix.node-version }}
          path: playwright-report/
          retention-days: 30

      - name: Publish Playwright HTML report
        uses: daun/playwright-report-comment@v3
        if: always()
        with:
          report-path: playwright-report
```

**Local Çalıştırma:**

```bash
# Emulator'ı başlat
docker run -it -p 21324:21324 trezor/trezor-user-env

# E2E tests (ayrı terminal'de)
pnpm run test:e2e

# UI mode
pnpm run test:e2e -- --ui

# Belirli test
pnpm run test:e2e -- tests/trezor-connection.spec.ts

# Debug mode
pnpm run test:e2e -- --debug
```

**Playwright Configuration Example:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

**E2E Test Example:**

```typescript
// tests/e2e/trezor-connection.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Trezor Connection', () => {
  test('should connect to Trezor device', async ({ page }) => {
    // Navigate to app
    await page.goto('/')
    
    // Click Connect Device button
    await page.click('button:has-text("Connect Device")')
    
    // Wait for Trezor connection
    await page.waitForSelector('[data-testid="trezor-connected"]', {
      timeout: 10000
    })
    
    // Verify address is displayed
    const address = await page.textContent('[data-testid="wallet-address"]')
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  test('should sign transaction', async ({ page }) => {
    // Connect first
    await page.goto('/')
    await page.click('button:has-text("Connect Device")')
    await page.waitForSelector('[data-testid="trezor-connected"]')
    
    // Create transaction
    await page.fill('input[name="amount"]', '0.1')
    await page.fill('input[name="recipient"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
    
    // Send
    await page.click('button:has-text("Send")')
    
    // Wait for TX confirmation
    await page.waitForSelector('[data-testid="tx-confirmed"]', {
      timeout: 30000
    })
    
    // Verify TX hash
    const txHash = await page.textContent('[data-testid="tx-hash"]')
    expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/)
  })
})
```

---

### 4. Build ve Distribution

**Dosya:** `.github/workflows/build.yml`

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Release type (alpha, beta, stable)'
        required: true
        default: 'beta'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            artifact: cepwallet-linux-x64.AppImage
            
          - os: macos-latest
            artifact: cepwallet-mac-x64.dmg
            
          - os: windows-latest
            artifact: cepwallet-windows-x64.exe

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build app
        run: pnpm run build:desktop
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.artifact }}
          path: packages/desktop/dist/${{ matrix.artifact }}

      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: packages/desktop/dist/${{ matrix.artifact }}
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') }}
```

**Local Build:**

```bash
# Development build (unsigned)
pnpm run build:desktop:dev

# Production build (signed & notarized)
pnpm run build:desktop

# Platform specific
pnpm run build:desktop:mac
pnpm run build:desktop:win
pnpm run build:desktop:linux

# Watch mode
pnpm run build:desktop:watch
```

---

## 💻 Local Development Setup

### 1. Environment Setup

```bash
# Gerekli araçları kur
Node.js 18+ kurulu olmalı
pnpm 8+ kurulu olmalı
Rust 1.70+ kurulu olmalı (bridge için)
Git kurulu olmalı

# Trezor Bridge (macOS)
brew install trezor-bridge

# Docker (emulator için)
docker --version
```

### 2. Repository Setup

```bash
# Clone repo
git clone https://github.com/zinderud/cepwallet.git
cd cepwallet

# Install dependencies
pnpm install

# Build shared packages
pnpm run build:shared

# Setup pre-commit hooks
pnpm exec husky install
```

### 3. Start Development Server

```bash
# Terminal 1: Desktop app
cd packages/desktop
pnpm run dev

# Terminal 2: Bridge daemon
cd packages/bridge
cargo run

# Terminal 3: Emulator (opsiyonel)
docker run -it -p 21324:21324 trezor/trezor-user-env

# App: http://localhost:3000
# Emulator: http://localhost:21324
```

### 4. Debug Mode

```bash
# Desktop app debug
DEBUG=* pnpm run dev

# Chrome DevTools
# Press Ctrl+Shift+I (Linux/Windows) veya Cmd+Option+I (macOS)

# VS Code Debugger
# .vscode/launch.json konfigürasyonu:
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Electron Main",
      "port": 5858,
      "protocol": "inspector"
    }
  ]
}

# Terminal'de başlat:
electron --inspect-brk=5858 .
```

---

## 🧪 Testing Strategy

### Test Piramidi

```
              /\
             /  \
            /UI  \        10 tests (E2E - Playwright)
           /      \
          /--------\
         /          \
        /Integration\  30 tests (Mock dependencies)
       /            \
      /    ------    \
     /  Service   \
    /     Tests    \   50 tests
   /               \
  /  -----Unit-----  \  200+ tests
 /    Component Tests   \
/                        \
```

### Unit Tests (Jest)

**Coverage Targets:**
- Components: 80%+
- Services: 90%+
- Utilities: 100%

**Örnek:**

```typescript
// src/services/wallet.test.ts
import { WalletService } from './wallet'
import { TrezorMock } from '../__mocks__/trezor'

describe('WalletService', () => {
  let wallet: WalletService

  beforeEach(() => {
    wallet = new WalletService(new TrezorMock())
  })

  test('should get address from Trezor', async () => {
    const address = await wallet.getAddress()
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  test('should handle connection errors', async () => {
    const trezorError = new TrezorMock({ error: true })
    const wallet = new WalletService(trezorError)
    
    await expect(wallet.getAddress()).rejects.toThrow('Device not found')
  })
})
```

### Integration Tests

```typescript
// tests/integration/trezor-wallet.test.ts
describe('Trezor + Wallet Integration', () => {
  test('should transfer tokens via Trezor', async () => {
    const wallet = new CepWallet(emulator)
    
    // Connect
    await wallet.connect()
    
    // Send
    const txHash = await wallet.send({
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: parseEther('0.1'),
      token: ETH_ADDRESS
    })
    
    // Verify
    const receipt = await wallet.provider.getTransactionReceipt(txHash)
    expect(receipt?.status).toBe(1) // Success
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/full-workflow.spec.ts
test.describe('Full Privacy Workflow', () => {
  test('should shield, transfer, and unshield', async ({ page }) => {
    // 1. Connect Trezor
    await page.goto('/')
    await page.click('[data-testid="connect-device"]')
    await page.waitForSelector('[data-testid="connected"]')

    // 2. Shield ETH
    await page.click('[data-testid="shield-button"]')
    await page.fill('input[name="amount"]', '1')
    await page.selectOption('select[name="level"]', 'railgun')
    await page.click('button:has-text("Confirm")')
    
    // Wait for confirmation
    await page.waitForSelector('[data-testid="shielded-success"]')
    const shieldTx = await page.textContent('[data-testid="shield-tx"]')
    expect(shieldTx).toBeTruthy()

    // 3. Private Transfer
    await page.click('[data-testid="send-button"]')
    await page.fill('input[name="recipient"]', RECIPIENT_ADDRESS)
    await page.fill('input[name="amount"]', '0.5')
    await page.click('button:has-text("Send Private")')
    
    // Wait for privacy transfer
    await page.waitForSelector('[data-testid="transfer-success"]')

    // 4. Unshield
    await page.click('[data-testid="unshield-button"]')
    await page.fill('input[name="amount"]', '0.25')
    await page.click('button:has-text("Confirm")')
    
    // Verify unshield completed
    await page.waitForSelector('[data-testid="unshield-success"]')
    const unshieldTx = await page.textContent('[data-testid="unshield-tx"]')
    expect(unshieldTx).toBeTruthy()
  })
})
```

---

## 🔨 Monitoring ve Alerting

### Sentry Integration

```typescript
// src/main.ts
import * as Sentry from '@sentry/electron'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    })
  ]
})

// Error tracking
try {
  await wallet.send(tx)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'wallet',
      action: 'send'
    }
  })
}
```

### OpenTelemetry Tracing

```typescript
// src/observability/tracing.ts
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('cepwallet')

export async function traceTransaction(tx: Transaction) {
  const span = tracer.startSpan('transaction.sign')
  
  try {
    const result = await trezor.sign(tx)
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message
    })
    throw error
  } finally {
    span.end()
  }
}
```

---

## 📋 Checklist

- [ ] `.github/workflows/` klasörü oluştur
- [ ] 4 workflow dosyasını ekle (lint, test, e2e, build)
- [ ] pnpm scripts'i ekle (`package.json`)
- [ ] Husky pre-commit hooks'u kur
- [ ] Jest config ayarla
- [ ] Playwright config ayarla
- [ ] Local dev setup test et
- [ ] CI pipeline test et (dummy commit)
- [ ] Code signing secrets'ini ekle
- [ ] Release workflow'ını test et

---

**Versiyon Tarihi:** 15 Ekim 2025  
**Sonraki Güncelleme:** Q1 2026 (Mobile CI/CD)

