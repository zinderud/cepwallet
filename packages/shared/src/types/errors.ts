/** Custom error types */

export class CepWalletError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'CepWalletError';
  }
}

export class BridgeError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('BRIDGE_ERROR', message, details);
    this.name = 'BridgeError';
  }
}

export class DeviceError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DEVICE_ERROR', message, details);
    this.name = 'DeviceError';
  }
}

export class TransactionError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('TRANSACTION_ERROR', message, details);
    this.name = 'TransactionError';
  }
}

export class ValidationError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class KohakuError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('KOHAKU_ERROR', message, details);
    this.name = 'KohakuError';
  }
}

export class NetworkError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('NETWORK_ERROR', message, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends CepWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('TIMEOUT_ERROR', message, details);
    this.name = 'TimeoutError';
  }
}
