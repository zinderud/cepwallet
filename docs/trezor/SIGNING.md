# Transaction ve Mesaj İmzalama

## İçindekiler

1. [Bitcoin Transaction İmzalama](#bitcoin-transaction-imzalama)
2. [Ethereum Transaction İmzalama](#ethereum-transaction-imzalama)
3. [Mesaj İmzalama ve Doğrulama](#mesaj-imzalama-ve-doğrulama)
4. [Firmware İmzalama Mekanizması](#firmware-imzalama-mekanizması)
5. [Kriptografik Detaylar](#kriptografik-detaylar)
6. [Güvenlik Önlemleri](#güvenlik-önlemleri)

## Bitcoin Transaction İmzalama

### İmzalama Akışı

```
1. SignTx mesajı gönderimi
   ↓
2. Input/Output doğrulaması
   ↓
3. Kullanıcı onayı (cihazda)
   ↓
4. Private key ile ECDSA imzalama
   ↓
5. İmzalanmış transaction döndürme
```

### Legacy (P2PKH) Transaction

```typescript
interface BitcoinInput {
  address_n: number[];        // BIP-32 path
  prev_hash: string;          // Previous TX hash
  prev_index: number;         // Output index
  amount: string;             // Input amount (satoshi)
  script_type: 'SPENDADDRESS';
  sequence?: number;          // RBF için
}

interface BitcoinOutput {
  address?: string;           // Hedef adres
  address_n?: number[];       // Change adresi için path
  amount: string;             // Satoshi cinsinden
  script_type: 'PAYTOADDRESS';
  op_return_data?: string;    // OP_RETURN için
}

// P2PKH transaction imzalama
async function signP2PKHTransaction(
  inputs: BitcoinInput[],
  outputs: BitcoinOutput[]
) {
  const result = await TrezorConnect.signTransaction({
    inputs: inputs.map(input => ({
      ...input,
      script_type: 'SPENDADDRESS',
    })),
    outputs: outputs.map(output => ({
      ...output,
      script_type: output.address_n ? 'PAYTOADDRESS' : 'PAYTOADDRESS',
    })),
    coin: 'btc',
    locktime: 0,
    version: 1,
  });
  
  if (result.success) {
    return {
      serializedTx: result.payload.serializedTx,
      signatures: result.payload.signatures,
    };
  }
  
  throw new Error(result.payload.error);
}

// Örnek kullanım
const signed = await signP2PKHTransaction(
  [
    {
      address_n: [44 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 0, 0],
      prev_hash: 'b4dc0ffeee8292e614d5e1fb1c37b2efd64926ad71c1c8df8b5fba392eb2c2b9',
      prev_index: 0,
      amount: '100000000', // 1 BTC
      script_type: 'SPENDADDRESS',
    },
  ],
  [
    {
      address: '1BitcoinEaterAddressDontSendf59kuE',
      amount: '99950000', // 0.9995 BTC
      script_type: 'PAYTOADDRESS',
    },
    {
      address_n: [44 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 1, 0],
      amount: '50000', // Change: 0.0005 BTC
      script_type: 'PAYTOADDRESS',
    },
  ]
);
```

### SegWit (P2WPKH) Transaction

```typescript
// Native SegWit transaction
async function signSegWitTransaction(
  inputs: BitcoinInput[],
  outputs: BitcoinOutput[]
) {
  const result = await TrezorConnect.signTransaction({
    inputs: inputs.map(input => ({
      ...input,
      script_type: 'SPENDWITNESS', // SegWit
    })),
    outputs: outputs.map(output => ({
      ...output,
      script_type: output.address ? 'PAYTOWITNESS' : 'PAYTOWITNESS',
    })),
    coin: 'btc',
    locktime: 0,
    version: 2, // SegWit için version 2
  });
  
  return result.payload;
}

// P2SH-wrapped SegWit
async function signP2SHSegWitTransaction(
  inputs: BitcoinInput[],
  outputs: BitcoinOutput[]
) {
  const result = await TrezorConnect.signTransaction({
    inputs: inputs.map(input => ({
      ...input,
      script_type: 'SPENDP2SHWITNESS', // P2SH-wrapped
    })),
    outputs: outputs.map(output => ({
      ...output,
      script_type: output.address ? 'PAYTOP2SHWITNESS' : 'PAYTOP2SHWITNESS',
    })),
    coin: 'btc',
  });
  
  return result.payload;
}

// Örnek: Bech32 address'e gönderim
const segwitSigned = await signSegWitTransaction(
  [
    {
      address_n: [84 | 0x80000000, 0 | 0x80000000, 0 | 0x80000000, 0, 0],
      prev_hash: 'abc123...',
      prev_index: 0,
      amount: '50000000',
      script_type: 'SPENDWITNESS',
    },
  ],
  [
    {
      address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      amount: '49900000',
      script_type: 'PAYTOWITNESS',
    },
  ]
);
```

### RBF (Replace-By-Fee) Transaction

```typescript
// RBF enabled transaction
async function signRBFTransaction(
  originalTx: string,
  newFeeRate: number
) {
  // Orijinal transaction'ı parse et
  const tx = parseBitcoinTransaction(originalTx);
  
  // Yeni fee hesapla
  const newFee = calculateFee(tx, newFeeRate);
  
  // Yeni transaction oluştur (sequence < 0xffffffff - 1)
  const result = await TrezorConnect.signTransaction({
    inputs: tx.inputs.map(input => ({
      ...input,
      sequence: 0xfffffffd, // RBF için
    })),
    outputs: [
      tx.outputs[0], // Ana output aynı
      {
        // Change output - fee farkı buradan
        ...tx.outputs[1],
        amount: String(BigInt(tx.outputs[1].amount) - BigInt(newFee)),
      },
    ],
    coin: 'btc',
    locktime: tx.locktime,
  });
  
  return result.payload;
}
```

### UTXO Selection ve Fee Optimization

```typescript
interface UTXO {
  txid: string;
  vout: number;
  value: number;
  address: string;
  path: number[];
}

// Optimal UTXO seçimi
function selectUTXOs(
  utxos: UTXO[],
  targetAmount: number,
  feeRate: number
): UTXO[] {
  // Büyükten küçüğe sırala
  const sorted = [...utxos].sort((a, b) => b.value - a.value);
  
  const selected: UTXO[] = [];
  let total = 0;
  
  // Estimated transaction size
  const estimateTxSize = (inputs: number, outputs: number) => {
    // P2WPKH: 68 vbyte per input, 31 vbyte per output, 10.5 overhead
    return inputs * 68 + outputs * 31 + 10.5;
  };
  
  for (const utxo of sorted) {
    selected.push(utxo);
    total += utxo.value;
    
    const fee = Math.ceil(estimateTxSize(selected.length, 2) * feeRate);
    const needed = targetAmount + fee;
    
    if (total >= needed) {
      return selected;
    }
  }
  
  throw new Error('Insufficient funds');
}

// Transaction oluştur ve imzala
async function createAndSignTransaction(
  utxos: UTXO[],
  toAddress: string,
  amount: number,
  changeAddress: string,
  feeRate: number
) {
  // UTXO seç
  const selectedUTXOs = selectUTXOs(utxos, amount, feeRate);
  
  // Total input
  const totalInput = selectedUTXOs.reduce((sum, utxo) => sum + utxo.value, 0);
  
  // Fee hesapla
  const txSize = 68 * selectedUTXOs.length + 31 * 2 + 10.5;
  const fee = Math.ceil(txSize * feeRate);
  
  // Change hesapla
  const change = totalInput - amount - fee;
  
  // Inputs hazırla
  const inputs = selectedUTXOs.map(utxo => ({
    address_n: utxo.path,
    prev_hash: utxo.txid,
    prev_index: utxo.vout,
    amount: String(utxo.value),
    script_type: 'SPENDWITNESS' as const,
  }));
  
  // Outputs hazırla
  const outputs = [
    {
      address: toAddress,
      amount: String(amount),
      script_type: 'PAYTOWITNESS' as const,
    },
  ];
  
  // Change ekle (dust değilse)
  if (change > 546) { // Dust limit
    outputs.push({
      address: changeAddress,
      amount: String(change),
      script_type: 'PAYTOWITNESS' as const,
    });
  }
  
  // İmzala
  return TrezorConnect.signTransaction({
    inputs,
    outputs,
    coin: 'btc',
  });
}
```

## Ethereum Transaction İmzalama

### Legacy Transaction (Pre-EIP-1559)

```typescript
interface EthereumTransaction {
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: string;
  data?: string;
  chainId: number;
}

// Legacy Ethereum transaction
async function signEthereumLegacyTx(tx: EthereumTransaction) {
  const result = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: tx.to,
      value: tx.value,
      gasPrice: tx.gasPrice,
      gasLimit: tx.gasLimit,
      nonce: tx.nonce,
      chainId: tx.chainId,
      data: tx.data,
    },
  });
  
  if (result.success) {
    const { v, r, s } = result.payload;
    
    // RLP encoding
    const signature = {
      v: parseInt(v, 16),
      r: '0x' + r,
      s: '0x' + s,
    };
    
    return signature;
  }
  
  throw new Error(result.payload.error);
}

// Raw transaction oluşturma
function createRawTransaction(
  tx: EthereumTransaction,
  signature: { v: number; r: string; s: string }
) {
  const rlp = require('rlp');
  
  const rawTx = [
    tx.nonce,
    tx.gasPrice,
    tx.gasLimit,
    tx.to,
    tx.value,
    tx.data || '0x',
    signature.v,
    signature.r,
    signature.s,
  ];
  
  return '0x' + rlp.encode(rawTx).toString('hex');
}
```

### EIP-1559 Transaction

```typescript
interface EIP1559Transaction {
  to: string;
  value: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  gasLimit: string;
  nonce: string;
  data?: string;
  chainId: number;
  accessList?: Array<{
    address: string;
    storageKeys: string[];
  }>;
}

// EIP-1559 transaction imzalama
async function signEIP1559Transaction(tx: EIP1559Transaction) {
  const result = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: tx.to,
      value: tx.value,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasLimit: tx.gasLimit,
      nonce: tx.nonce,
      chainId: tx.chainId,
      data: tx.data,
      accessList: tx.accessList,
    },
  });
  
  return result.payload;
}

// Gas estimation
async function estimateEIP1559Fees(provider: any) {
  const block = await provider.getBlock('latest');
  const baseFee = block.baseFeePerGas;
  
  // Priority fee (tip)
  const priorityFee = await provider.send('eth_maxPriorityFeePerGas', []);
  
  // Max fee = 2 * base fee + priority fee
  const maxFeePerGas = baseFee.mul(2).add(priorityFee);
  
  return {
    maxFeePerGas: '0x' + maxFeePerGas.toHexString().slice(2),
    maxPriorityFeePerGas: '0x' + priorityFee.toString(16),
  };
}

// Kullanım örneği
const fees = await estimateEIP1559Fees(provider);
const signed = await signEIP1559Transaction({
  to: '0x...',
  value: '0x0',
  ...fees,
  gasLimit: '0x5208',
  nonce: '0x0',
  chainId: 1,
});
```

### Smart Contract Interaction

```typescript
// ERC-20 token transfer
async function signERC20Transfer(
  tokenAddress: string,
  to: string,
  amount: string,
  decimals: number
) {
  const Web3 = require('web3');
  const web3 = new Web3();
  
  // ERC-20 transfer function signature
  const transferData = web3.eth.abi.encodeFunctionCall(
    {
      name: 'transfer',
      type: 'function',
      inputs: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
      ],
    },
    [to, web3.utils.toWei(amount, decimals)]
  );
  
  const result = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: tokenAddress,
      value: '0x0', // No ETH sent
      data: transferData,
      maxFeePerGas: '0x...',
      maxPriorityFeePerGas: '0x...',
      gasLimit: '0x15f90', // ~90k gas for ERC-20 transfer
      nonce: '0x...',
      chainId: 1,
    },
  });
  
  return result.payload;
}

// Uniswap V2 swap
async function signUniswapSwap(
  routerAddress: string,
  path: string[],
  amountIn: string,
  amountOutMin: string,
  deadline: number
) {
  const Web3 = require('web3');
  const web3 = new Web3();
  
  // swapExactTokensForTokens function
  const swapData = web3.eth.abi.encodeFunctionCall(
    {
      name: 'swapExactTokensForTokens',
      type: 'function',
      inputs: [
        { type: 'uint256', name: 'amountIn' },
        { type: 'uint256', name: 'amountOutMin' },
        { type: 'address[]', name: 'path' },
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'deadline' },
      ],
    },
    [amountIn, amountOutMin, path, '<user_address>', deadline]
  );
  
  const result = await TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: routerAddress,
      value: '0x0',
      data: swapData,
      maxFeePerGas: '0x...',
      maxPriorityFeePerGas: '0x...',
      gasLimit: '0x...',
      nonce: '0x...',
      chainId: 1,
    },
  });
  
  return result.payload;
}
```

### Transaction Batching

```typescript
// Birden fazla işlemi batch halinde
async function batchEthereumTransactions(
  transactions: EIP1559Transaction[]
) {
  const results = [];
  
  for (const tx of transactions) {
    const result = await TrezorConnect.ethereumSignTransaction({
      path: "m/44'/60'/0'/0/0",
      transaction: tx,
    });
    
    if (result.success) {
      results.push(result.payload);
    } else {
      throw new Error(`Transaction failed: ${result.payload.error}`);
    }
  }
  
  return results;
}

// Multi-send contract kullanımı
async function signMultiSend(
  multiSendContract: string,
  recipients: Array<{ to: string; value: string }>
) {
  const Web3 = require('web3');
  const web3 = new Web3();
  
  // Encode recipients
  const encodedData = web3.eth.abi.encodeFunctionCall(
    {
      name: 'multiSend',
      type: 'function',
      inputs: [
        {
          type: 'tuple[]',
          name: 'recipients',
          components: [
            { type: 'address', name: 'to' },
            { type: 'uint256', name: 'value' },
          ],
        },
      ],
    },
    [recipients]
  );
  
  // Total value
  const totalValue = recipients.reduce(
    (sum, r) => sum + BigInt(r.value),
    BigInt(0)
  );
  
  return TrezorConnect.ethereumSignTransaction({
    path: "m/44'/60'/0'/0/0",
    transaction: {
      to: multiSendContract,
      value: '0x' + totalValue.toString(16),
      data: encodedData,
      maxFeePerGas: '0x...',
      maxPriorityFeePerGas: '0x...',
      gasLimit: '0x...',
      nonce: '0x...',
      chainId: 1,
    },
  });
}
```

## Mesaj İmzalama ve Doğrulama

### Bitcoin Mesaj İmzalama

```typescript
// Bitcoin mesaj imzalama
async function signBitcoinMessage(message: string, path: string) {
  const result = await TrezorConnect.signMessage({
    path,
    message,
    coin: 'btc',
    scriptType: 'p2wpkh', // SegWit
  });
  
  if (result.success) {
    return {
      address: result.payload.address,
      signature: result.payload.signature,
    };
  }
  
  throw new Error(result.payload.error);
}

// Bitcoin mesaj doğrulama
async function verifyBitcoinMessage(
  address: string,
  message: string,
  signature: string
) {
  const result = await TrezorConnect.verifyMessage({
    address,
    message,
    signature,
    coin: 'btc',
  });
  
  return result.success && result.payload.success;
}

// Örnek kullanım
const signed = await signBitcoinMessage(
  'Hello from CepWallet!',
  "m/84'/0'/0'/0/0"
);
console.log('Address:', signed.address);
console.log('Signature:', signed.signature);

const isValid = await verifyBitcoinMessage(
  signed.address,
  'Hello from CepWallet!',
  signed.signature
);
console.log('Valid:', isValid);
```

### Ethereum Mesaj İmzalama (Personal Sign)

```typescript
// Ethereum personal sign
async function signEthereumMessage(message: string, path: string) {
  const result = await TrezorConnect.ethereumSignMessage({
    path,
    message,
  });
  
  if (result.success) {
    return {
      address: result.payload.address,
      signature: result.payload.signature,
    };
  }
  
  throw new Error(result.payload.error);
}

// Mesaj hash'i (Ethereum Signed Message)
function hashEthereumMessage(message: string): string {
  const { keccak256, toUtf8Bytes } = require('ethers').utils;
  
  const messageBytes = toUtf8Bytes(message);
  const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
  const prefixBytes = toUtf8Bytes(prefix);
  
  return keccak256(Buffer.concat([prefixBytes, messageBytes]));
}

// Mesaj doğrulama
async function verifyEthereumMessage(
  address: string,
  message: string,
  signature: string
) {
  const result = await TrezorConnect.ethereumVerifyMessage({
    address,
    message,
    signature,
  });
  
  return result.success && result.payload.success;
}
```

### EIP-712 Typed Data İmzalama

```typescript
interface TypedData {
  types: {
    [key: string]: Array<{ name: string; type: string }>;
  };
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  message: any;
}

// EIP-712 imzalama
async function signTypedData(
  typedData: TypedData,
  path: string
) {
  const result = await TrezorConnect.ethereumSignTypedData({
    path,
    data: typedData,
    metamaskV4Compat: true,
  });
  
  if (result.success) {
    return {
      address: result.payload.address,
      signature: result.payload.signature,
    };
  }
  
  throw new Error(result.payload.error);
}

// Örnek: ERC-20 Permit
const permitTypedData: TypedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'Permit',
  domain: {
    name: 'USD Coin',
    version: '2',
    chainId: 1,
    verifyingContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  message: {
    owner: '0x...',
    spender: '0x...',
    value: '1000000', // 1 USDC
    nonce: 0,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  },
};

const permitSignature = await signTypedData(
  permitTypedData,
  "m/44'/60'/0'/0/0"
);
```

## Firmware İmzalama Mekanizması

### Firmware Signature Structure

```c
// Trezor firmware header yapısı
typedef struct {
    uint32_t magic;
    uint32_t hdrlen;
    uint32_t expiry;
    uint32_t codelen;
    uint32_t version;
    uint32_t fix_version;
    uint8_t  sig_index[3];
    uint8_t  signature[3][64];
    uint8_t  pubkey[3][33];
    // ... diğer alanlar
} image_header;
```

### Multi-Signature Verification

```python
# Python ile firmware imza doğrulama örneği
def verify_firmware_signatures(firmware_data: bytes, public_keys: list) -> bool:
    """
    Firmware'in multi-signature doğrulaması
    """
    import ecdsa
    from hashlib import sha256
    
    # Header parse et
    header = parse_firmware_header(firmware_data)
    
    # Hash hesapla (signatures sıfırlanmış)
    header_hash = sha256(get_header_without_signatures(header)).digest()
    
    # SignMessage format (Bitcoin style)
    prefix = b"\x18Bitcoin Signed Message:\n\x20"
    message = prefix + header_hash
    digest = sha256(sha256(message).digest()).digest()
    
    # Her imzayı doğrula
    valid_signatures = 0
    for i, signature in enumerate(header.signatures):
        if signature == b'\x00' * 64:
            continue
        
        pub_key_index = header.sig_index[i]
        pub_key = public_keys[pub_key_index]
        
        # ECDSA doğrulama
        vk = ecdsa.VerifyingKey.from_string(
            bytes.fromhex(pub_key)[1:],  # Skip 0x04 prefix
            curve=ecdsa.SECP256k1,
            hashfunc=sha256
        )
        
        try:
            vk.verify(signature, digest, hashfunc=sha256)
            valid_signatures += 1
        except ecdsa.BadSignatureError:
            pass
    
    # Minimum 2/3 imza gerekli
    return valid_signatures >= 2
```

### Bootloader Verification

```c
// Bootloader'da firmware doğrulama
bool check_firmware_hashes(const image_header *hdr) {
    uint8_t hash[32];
    
    // Firmware hash hesapla
    compute_firmware_fingerprint(hdr, hash);
    
    // Stored hash ile karşılaştır
    if (memcmp(hash, hdr->hashes, 32) != 0) {
        return false;
    }
    
    // Signature verification
    return verify_signatures(hdr);
}

bool verify_signatures(const image_header *hdr) {
    uint8_t hash[32];
    uint8_t sig[64];
    
    compute_firmware_fingerprint_for_verifymessage(hdr, hash);
    
    int valid_sigs = 0;
    
    for (int i = 0; i < SIG_COUNT; i++) {
        if (hdr->sigindex[i] == 0) continue;
        
        memcpy(sig, hdr->sig[i], 64);
        
        if (ecdsa_verify_digest(
            &secp256k1,
            pubkey[hdr->sigindex[i]],
            sig,
            hash
        ) == 0) {
            valid_sigs++;
        }
    }
    
    return valid_sigs >= REQUIRED_SIGS;
}
```

## Kriptografik Detaylar

### ECDSA İmzalama

```typescript
// ECDSA signature generation (secp256k1)
interface ECDSASignature {
  r: string; // 32 bytes
  s: string; // 32 bytes
  v: number; // Recovery id (0 or 1, +27 for Bitcoin)
}

// Low-level ECDSA (Trezor firmware)
function ecdsa_sign(
  private_key: Uint8Array,
  digest: Uint8Array
): ECDSASignature {
  // 1. k rastgele sayısı seç (nonce)
  // 2. (x, y) = k * G hesapla
  // 3. r = x mod n
  // 4. s = k^-1 * (digest + r * private_key) mod n
  // 5. s > n/2 ise, s = n - s (canonical form)
  
  return { r, s, v };
}

// Canonical signature check
function is_canonical(signature: ECDSASignature): boolean {
  const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  const s = BigInt('0x' + signature.s);
  
  return s <= n / BigInt(2);
}
```

### Deterministic Nonce (RFC 6979)

```python
def generate_deterministic_nonce(private_key: bytes, digest: bytes) -> int:
    """
    RFC 6979: Deterministic nonce generation
    """
    import hmac
    from hashlib import sha256
    
    # HMAC-DRBG initialization
    k = b'\x00' * 32
    v = b'\x01' * 32
    
    # Update k and v
    k = hmac.new(k, v + b'\x00' + private_key + digest, sha256).digest()
    v = hmac.new(k, v, sha256).digest()
    k = hmac.new(k, v + b'\x01' + private_key + digest, sha256).digest()
    v = hmac.new(k, v, sha256).digest()
    
    # Generate nonce
    while True:
        v = hmac.new(k, v, sha256).digest()
        nonce = int.from_bytes(v, 'big')
        
        # Check nonce validity
        n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
        if 1 <= nonce < n:
            return nonce
        
        k = hmac.new(k, v + b'\x00', sha256).digest()
        v = hmac.new(k, v, sha256).digest()
```

### BIP-340 Schnorr Signatures (Taproot)

```python
def schnorr_sign(private_key: bytes, message: bytes) -> bytes:
    """
    BIP-340 Schnorr signature
    """
    import hashlib
    
    # Public key
    P = private_key * G
    
    # Nonce
    rand = hashlib.sha256(private_key + message).digest()
    k = int.from_bytes(rand, 'big') % n
    
    # R = k * G
    R = k * G
    
    # Challenge
    e = int.from_bytes(
        hashlib.sha256(R.x.to_bytes(32, 'big') + P.x.to_bytes(32, 'big') + message).digest(),
        'big'
    ) % n
    
    # Signature
    s = (k + e * int.from_bytes(private_key, 'big')) % n
    
    return R.x.to_bytes(32, 'big') + s.to_bytes(32, 'big')
```

## Güvenlik Önlemleri

### 1. Private Key Güvenliği

```c
// Trezor firmware - private key handling
void signing_init(...) {
    // Private key'i RAM'e al
    hdnode_private_ckd(node, address_n[i]);
    
    // İmzalama işlemi
    ecdsa_sign(...);
    
    // Hemen temizle
    memzero(privkey, sizeof(privkey));
}
```

### 2. Canonical Signature Enforcement

```typescript
// Sadece canonical imzaları kabul et
function validateSignature(signature: ECDSASignature): boolean {
  const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  const s = BigInt('0x' + signature.s);
  
  // Low-S check (BIP-62)
  if (s > n / BigInt(2)) {
    return false;
  }
  
  // r ve s sıfır olmamalı
  const r = BigInt('0x' + signature.r);
  if (r === BigInt(0) || s === BigInt(0)) {
    return false;
  }
  
  // r ve s, n'den küçük olmalı
  if (r >= n || s >= n) {
    return false;
  }
  
  return true;
}
```

### 3. Transaction Tampering Protection

```typescript
// Transaction integrity check
function verifyTransactionIntegrity(
  originalTx: any,
  signedTx: any
): boolean {
  // Input/output count kontrolü
  if (originalTx.inputs.length !== signedTx.inputs.length) {
    return false;
  }
  
  if (originalTx.outputs.length !== signedTx.outputs.length) {
    return false;
  }
  
  // Amount kontrolü
  for (let i = 0; i < originalTx.outputs.length; i++) {
    if (originalTx.outputs[i].amount !== signedTx.outputs[i].amount) {
      return false;
    }
  }
  
  return true;
}
```

### 4. Anti-Fee-Manipulation

```typescript
// Fee limiti kontrolü
function validateTransactionFee(
  totalInput: bigint,
  totalOutput: bigint,
  maxFeeRate: number,
  txSize: number
): boolean {
  const fee = totalInput - totalOutput;
  const feeRate = Number(fee) / txSize;
  
  // Fee rate çok yüksek mi?
  if (feeRate > maxFeeRate * 10) {
    throw new Error('Fee rate too high');
  }
  
  // Fee negatif mi?
  if (fee < 0) {
    throw new Error('Negative fee');
  }
  
  return true;
}
```

### 5. Replay Attack Protection

```typescript
// EIP-155: Chain ID ile replay koruması
function addChainIdToSignature(
  signature: ECDSASignature,
  chainId: number
): ECDSASignature {
  // v = chain_id * 2 + 35 + recovery_id
  const v = chainId * 2 + 35 + signature.v;
  
  return {
    ...signature,
    v,
  };
}

// Chain ID doğrulama
function validateChainId(
  expectedChainId: number,
  transactionChainId: number
): boolean {
  if (expectedChainId !== transactionChainId) {
    throw new Error('Chain ID mismatch');
  }
  
  return true;
}
```

---

**Not**: Bu dokümantasyon kriptografik imzalama işlemlerinin teknik detaylarını içerir. Production kullanımında her zaman güvenlik best practice'lerini takip edin.
