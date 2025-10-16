import { useState, useEffect } from 'react';
import { getWalletData, connectWallet as connectWalletAPI } from '../store/walletStore';

export const useWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const data = await getWalletData();
        setWallet(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const connectedWallet = await connectWalletAPI();
      setWallet(connectedWallet);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    wallet, 
    loading, 
    error, 
    connectWallet,
    walletAddress: wallet?.address || null,
  };
};