import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';

const TrezorConnect = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const connectToTrezor = async () => {
    try {
      const response = await invoke('connect_trezor');
      setConnected(response);
    } catch (err) {
      setError(err.message);
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

export default TrezorConnect;