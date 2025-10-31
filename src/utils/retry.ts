/**
 * Retry Utilities
 * 
 * Provides retry logic for network operations and blockchain transactions
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    maxDelayMs = 30000,
    onRetry,
  } = options;

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        break;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      console.warn(`Attempt ${attempt}/${maxAttempts} failed, retrying in ${currentDelay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Exponential backoff with max delay cap
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Retry only on specific error types
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(async () => {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (!shouldRetry(err)) {
        throw err;
      }
      
      throw err;
    }
  }, options);
}

/**
 * Check if error is a network error that should be retried
 */
export function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('etimedout') ||
    message.includes('fetch failed') ||
    message.includes('could not detect network')
  );
}

/**
 * Check if error is a gas estimation error that should be retried
 */
export function isGasEstimationError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  return (
    message.includes('gas') ||
    message.includes('out of gas') ||
    message.includes('intrinsic gas too low')
  );
}

/**
 * Check if error is a nonce error that should be retried
 */
export function isNonceError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  return (
    message.includes('nonce') ||
    message.includes('replacement transaction underpriced')
  );
}
