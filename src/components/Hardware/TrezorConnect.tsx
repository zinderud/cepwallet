import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const TrezorConnect = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectToTrezor = async () => {
    try {
      const response = await invoke<boolean>('connect_trezor');
      setConnected(response);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    connectToTrezor();
  }, []);

  return (
    <div>
      <h2>Trezor Connect</h2>
      {connected ? (
        <p>Connected to Trezor successfully!</p>
      ) : (
        <p>Connecting to Trezor...</p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};