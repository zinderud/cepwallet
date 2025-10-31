/**
 * Notification Utilities
 * 
 * Provides user-friendly notifications for wallet operations
 */

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // in milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show a notification to the user
 * 
 * This is a placeholder that should be integrated with your UI notification system
 */
export function showNotification(options: NotificationOptions): void {
  const { title, message, type, duration = 5000 } = options;
  
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  
  // TODO: Integrate with actual notification system (toast, snackbar, etc.)
  // For now, this is just a console log
}

/**
 * Show a success notification
 */
export function notifySuccess(title: string, message: string): void {
  showNotification({
    title,
    message,
    type: 'success',
  });
}

/**
 * Show an error notification
 */
export function notifyError(title: string, message: string): void {
  showNotification({
    title,
    message,
    type: 'error',
    duration: 10000, // Errors stay longer
  });
}

/**
 * Show a warning notification
 */
export function notifyWarning(title: string, message: string): void {
  showNotification({
    title,
    message,
    type: 'warning',
  });
}

/**
 * Show an info notification
 */
export function notifyInfo(title: string, message: string): void {
  showNotification({
    title,
    message,
    type: 'info',
  });
}

/**
 * Notify user about insufficient balance
 */
export function notifyInsufficientBalance(
  token: string,
  required: string,
  available: string
): void {
  notifyError(
    'Insufficient Balance',
    `You need ${required} ${token} but only have ${available} ${token}`
  );
}

/**
 * Notify user about WETH approval
 */
export function notifyWETHApprovalRequired(amount: string): void {
  notifyInfo(
    'WETH Approval Required',
    `Approving ${amount} WETH for RAILGUN contract...`
  );
}

/**
 * Notify user about WETH approval success
 */
export function notifyWETHApprovalSuccess(): void {
  notifySuccess(
    'WETH Approved',
    'Your WETH has been approved for shielding'
  );
}

/**
 * Notify user about transaction success
 */
export function notifyTransactionSuccess(txHash: string, chainId: number): void {
  const explorerUrl = getExplorerUrl(chainId, txHash);
  
  showNotification({
    title: 'Transaction Confirmed',
    message: `View on Explorer: ${explorerUrl}`,
    type: 'success',
    action: {
      label: 'View',
      onClick: () => window.open(explorerUrl, '_blank'),
    },
  });
}

/**
 * Notify user about merkletree scan progress
 */
export function notifyMerkletreeScan(percentage: number): void {
  if (percentage === 100) {
    notifySuccess(
      'Balance Updated',
      'Your shielded balance has been updated'
    );
  } else {
    notifyInfo(
      'Updating Balance',
      `Scanning merkletree: ${percentage}%`
    );
  }
}

/**
 * Get explorer URL for a transaction
 */
function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    56: 'https://bscscan.com',
    42161: 'https://arbiscan.io',
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}
