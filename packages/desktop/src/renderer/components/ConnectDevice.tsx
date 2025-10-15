import React, { useState } from 'react';

interface ConnectDeviceProps {
  onConnect: () => void;
}

export const ConnectDevice: React.FC<ConnectDeviceProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const cepwallet = (window as any).cepwallet;
      if (!cepwallet?.bridge?.connectDevice) {
        throw new Error('Bridge API not available');
      }

      const result = await cepwallet.bridge.connectDevice();
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect device');
      }

      setConnected(true);
      setTimeout(() => {
        onConnect();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnecting(false);
    }
  };

  return (
    <div className="connect-device-container">
      <div className="connect-device-card">
        <div className="connect-device-header">
          <h1>🔐 CepWallet</h1>
          <p className="subtitle">Trezor Hardware Wallet</p>
        </div>

        <div className="connect-device-content">
          {connected ? (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2>Device Connected!</h2>
              <p>Your Trezor device is ready to use.</p>
            </div>
          ) : (
            <>
              <div className="device-illustration">
                <div className="trezor-icon">📱</div>
              </div>

              <h2>Connect Your Device</h2>
              <p className="description">
                Plug in your Trezor hardware wallet and unlock it to continue.
              </p>

              <div className="instructions">
                <ol>
                  <li>Connect your Trezor device via USB</li>
                  <li>Enter your PIN on the device</li>
                  <li>Approve the connection request</li>
                  <li>Click the button below to connect</li>
                </ol>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                className="connect-button"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <span className="spinner"></span>
                    Connecting...
                  </>
                ) : (
                  'Connect Device'
                )}
              </button>

              <p className="helper-text">
                Need help? Make sure your Trezor is in bootloader mode or connected properly.
              </p>
            </>
          )}
        </div>

        <div className="connect-device-footer">
          <p>CepWallet v0.1.0 • Privacy-First Ethereum Wallet</p>
        </div>
      </div>
    </div>
  );
};
