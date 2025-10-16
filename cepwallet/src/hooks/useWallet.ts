import { useState, useEffect } from 'react';
import { getWalletData, connectWallet } from '../store/walletStore';

const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const data = await getWalletData();
        setWallet(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const connectedWallet = await connectWallet();
      setWallet(connectedWallet);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { wallet, loading, error, handleConnect };
};

export default useWallet;