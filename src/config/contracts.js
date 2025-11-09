/**
 * Chain-specific contract addresses and configurations
 */
export const CHAIN_CONTRACTS = {
    // Ethereum Mainnet
    1: {
        railgun: '0xFA7093CDD9EE6932B4eb2c9e1cde21625Cb940291', // RAILGUN v3.0
        weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        usdc: '0xA0b86a33E6441e88C5F2712C3E9b74F5b8E4E5b8',
        usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    // Sepolia Testnet
    11155111: {
        railgun: '0xeCFCf3b4eC647c4Ca6D49108b311b7a7C9543fea', // RAILGUN v3.0 Sepolia
        weth: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH9 Sepolia
        usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC Sepolia (fake)
        usdt: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT Sepolia (fake)
        dai: '0x68194a729C2450ad26072b3D33ADaCbcef39D5741', // DAI Sepolia (fake)
    },
    // Polygon Mainnet
    137: {
        railgun: '0xFA7093CDD9EE6932B4eb2c9e1cde21625Cb940291', // RAILGUN v3.0
        weth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // Wrapped MATIC
        usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F6',
        dai: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063D',
    },
    // BSC Mainnet
    56: {
        railgun: '0xFA7093CDD9EE6932B4eb2c9e1cde21625Cb940291', // RAILGUN v3.0
        weth: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        usdt: '0x55d398326f99059fF775485246999027B3197955',
        dai: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    },
    // Arbitrum One
    42161: {
        railgun: '0xFA7093CDD9EE6932B4eb2c9e1cde21625Cb940291', // RAILGUN v3.0
        weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
        usdc: '0xFF970A61A04b1cA14834A43f5de4533eBDDB5CC8',
        usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
};
/**
 * Get contracts for a specific chain
 */
export function getChainContracts(chainId) {
    const contracts = CHAIN_CONTRACTS[chainId];
    if (!contracts) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return contracts;
}
/**
 * Check if a token is native ETH (represented as 0x0...0)
 */
export function isNativeToken(tokenAddress) {
    return tokenAddress === '0x0000000000000000000000000000000000000000' ||
        tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; // Some representations
}
/**
 * Get wrapped token address for native token on a chain
 */
export function getWrappedNativeToken(chainId) {
    const contracts = getChainContracts(chainId);
    return contracts.weth;
}
/**
 * Check if a token requires approval (not native token)
 */
export function requiresApproval(tokenAddress) {
    return !isNativeToken(tokenAddress);
}
/**
 * Validate chain configuration
 */
export function validateChainConfig(chainId) {
    try {
        const contracts = getChainContracts(chainId);
        // Check required fields
        if (!contracts.railgun || !contracts.weth) {
            console.error(`Chain ${chainId} missing required contracts`);
            return false;
        }
        // Validate address format
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(contracts.railgun)) {
            console.error(`Invalid RAILGUN address for chain ${chainId}`);
            return false;
        }
        if (!addressRegex.test(contracts.weth)) {
            console.error(`Invalid WETH address for chain ${chainId}`);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error(`Chain ${chainId} validation failed:`, error);
        return false;
    }
}
/**
 * Get supported chain IDs
 */
export function getSupportedChains() {
    return Object.keys(CHAIN_CONTRACTS).map(Number);
}
/**
 * Check if a chain is supported
 */
export function isChainSupported(chainId) {
    return chainId in CHAIN_CONTRACTS;
}
