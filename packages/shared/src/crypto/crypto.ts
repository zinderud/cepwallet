import { ethers } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers';

/**
 * Keccak-256 hash (Ethereum standard)
 */
export function hashKeccak256(data: string | Uint8Array): string {
  if (typeof data === 'string') {
    return keccak256(toUtf8Bytes(data));
  }
  return keccak256(data);
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  if (!hex.startsWith('0x')) {
    throw new Error('Hex string must start with 0x');
  }
  return ethers.getBytes(hex);
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return ethers.toBeHex(bytes);
}

/**
 * Derive Ethereum address from public key
 */
export function pubkeyToAddress(pubkey: string): string {
  if (!pubkey.startsWith('0x')) {
    throw new Error('Public key must be hex string starting with 0x');
  }

  // Remove leading 0x04 if present (uncompressed marker)
  let cleanKey = pubkey.startsWith('0x04') ? pubkey.slice(4) : pubkey.slice(2);

  // Hash the public key
  const hash = keccak256('0x' + cleanKey);

  // Take last 20 bytes (40 hex chars)
  const address = '0x' + hash.slice(-40);

  return address;
}

/**
 * Convert address to EIP-55 checksum format
 */
export function toChecksumAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Validate Ethereum address format
 */
export function validateAddress(address: string): boolean {
  if (!address.startsWith('0x')) {
    return false;
  }

  if (address.length !== 42) {
    return false;
  }

  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert Wei to ETH
 */
export function weiToEth(wei: string): string {
  return ethers.formatEther(wei);
}

/**
 * Convert ETH to Wei
 */
export function ethToWei(eth: string): string {
  return ethers.parseEther(eth).toString();
}

/**
 * Convert Gwei to Wei
 */
export function gweiToWei(gwei: string): string {
  return ethers.parseUnits(gwei, 'gwei').toString();
}

/**
 * Convert Wei to Gwei
 */
export function weiToGwei(wei: string): string {
  return ethers.formatUnits(wei, 'gwei');
}

/**
 * Get address from transaction hash
 */
export function getAddressFromHash(hash: string): string {
  return '0x' + hash.slice(-40);
}

/**
 * Validate private key format
 */
export function validatePrivateKey(pk: string): boolean {
  if (!pk.startsWith('0x')) {
    return false;
  }

  if (pk.length !== 66) {
    return false; // 0x + 64 hex chars
  }

  try {
    new ethers.Wallet(pk);
    return true;
  } catch {
    return false;
  }
}

export default {
  hashKeccak256,
  hexToBytes,
  bytesToHex,
  pubkeyToAddress,
  toChecksumAddress,
  validateAddress,
  weiToEth,
  ethToWei,
  gweiToWei,
  weiToGwei,
  getAddressFromHash,
  validatePrivateKey,
};
