/** Bridge message types */
export type BridgeMessageType =
  | 'ping'
  | 'initialize'
  | 'get-public-key'
  | 'sign-transaction'
  | 'sign-message'
  | 'get-address'
  | 'response'
  | 'error';

/** Bridge message */
export interface BridgeMessage {
  id: string;
  type: BridgeMessageType;
  payload: unknown;
  timestamp?: number;
}

/** Bridge response */
export interface BridgeResponse<T = unknown> {
  id: string;
  result?: T;
  error?: string;
  timestamp?: number;
}

/** Bridge connection state */
export type BridgeConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Bridge configuration */
export interface BridgeConfig {
  host: string;
  port: number;
  protocol: 'ws' | 'wss';
  timeout?: number;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

/** Device info */
export interface DeviceInfo {
  model: string;
  firmware: string;
  serialNumber?: string;
  connected: boolean;
}

/** Session info */
export interface SessionInfo {
  id: string;
  deviceId?: string;
  startedAt: Date;
  lastActivity: Date;
}

/** Get public key request */
export interface GetPublicKeyRequest {
  bip44Path: string;
  showDisplay?: boolean;
}

/** Get public key response */
export interface GetPublicKeyResponse {
  publicKey: string;
  address: string;
  xpub?: string;
}

/** Sign transaction request */
export interface SignTransactionRequest {
  tx: {
    to: string;
    from?: string;
    value: string;
    data: string;
    nonce?: number;
    gasPrice?: string;
    gasLimit: string;
    chainId: number;
  };
  bip44Path: string;
}

/** Sign transaction response */
export interface SignTransactionResponse {
  v: string;
  r: string;
  s: string;
}

/** Sign message request */
export interface SignMessageRequest {
  message: string;
  bip44Path: string;
}

/** Sign message response */
export interface SignMessageResponse {
  signature: string;
  recovery: number;
}
