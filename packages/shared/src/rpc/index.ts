/**
 * RPC Client - Bridge communication
 */

export interface BridgeMessage {
  id: string;
  message_type: 'connect_device' | 'disconnect_device' | 'get_public_key' | 'sign_transaction' | 'sign_message';
  payload: Record<string, unknown>;
}

export interface BridgeResponse {
  id: string;
  status: 'success' | 'error';
  result?: unknown;
  error?: string;
}

export class BridgeRPCClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageId: number = 0;
  private pendingRequests: Map<string, (response: BridgeResponse) => void> = new Map();

  constructor(url: string = 'ws://localhost:21325') {
    this.url = url;
  }

  /**
   * Connect to bridge
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('Connected to bridge');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data) as BridgeResponse;
            const handler = this.pendingRequests.get(response.id);
            if (handler) {
              handler(response);
              this.pendingRequests.delete(response.id);
            }
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          reject(new Error(`WebSocket error: ${error}`));
        };

        this.ws.onclose = () => {
          console.log('Disconnected from bridge');
          this.ws = null;
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Disconnect from bridge
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send RPC request
   */
  private async sendRequest<T>(
    messageType: BridgeMessage['message_type'],
    payload: Record<string, unknown>
  ): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Bridge not connected');
    }

    const id = String(++this.messageId);
    const message: BridgeMessage = {
      id,
      message_type: messageType,
      payload,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${id} timeout`));
      }, 30000); // 30 second timeout

      this.pendingRequests.set(id, (response) => {
        clearTimeout(timeout);
        if (response.status === 'error') {
          reject(new Error(response.error || 'Unknown error'));
        } else {
          resolve(response.result as T);
        }
      });

      this.ws?.send(JSON.stringify(message));
    });
  }

  /**
   * Connect device
   */
  async connectDevice(): Promise<{ connected: boolean; device_info?: unknown }> {
    return this.sendRequest('connect_device', {});
  }

  /**
   * Disconnect device
   */
  async disconnectDevice(): Promise<{ disconnected: boolean }> {
    return this.sendRequest('disconnect_device', {});
  }

  /**
   * Get public key for derivation path
   */
  async getPublicKey(path: string): Promise<{
    public_key: string;
    address: string;
    chain_code: string;
  }> {
    return this.sendRequest('get_public_key', { path });
  }

  /**
   * Sign transaction
   */
  async signTransaction(path: string, transaction: Record<string, unknown>): Promise<{
    signature: string;
    v: number;
    r: string;
    s: string;
    tx_hash: string;
  }> {
    return this.sendRequest('sign_transaction', {
      path,
      transaction,
    });
  }

  /**
   * Sign message
   */
  async signMessage(
    path: string,
    message: string,
    messageType: 'utf8' | 'hex' = 'utf8'
  ): Promise<{
    signature: string;
    address: string;
    message_hash: string;
  }> {
    return this.sendRequest('sign_message', {
      path,
      message,
      type: messageType,
    });
  }
}

export const rpcVersion = '0.1.0';

export default BridgeRPCClient;
