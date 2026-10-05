import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types/auction';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useMetaMask() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateWalletState = useCallback(async (account: string) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(account);
      const balanceETH = ethers.formatEther(balanceWei);
      const network = await provider.getNetwork();

      setWallet({
        isConnected: true,
        address: account,
        balance: parseFloat(balanceETH).toFixed(4),
        chainId: network.chainId.toString(),
      });
      setError(null);
    } catch (err: any) {
      console.error("Failed to update wallet state:", err);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to interact with this DApp.");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        await updateWalletState(accounts[0]);
      }
    } catch (err: any) {
      console.error("User rejected wallet connection:", err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
    });
  };

  useEffect(() => {
    if (!window.ethereum) return;

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        updateWalletState(accounts[0]);
      }
    }).catch(console.error);

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        updateWalletState(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [updateWalletState]);

  return {
    wallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
}
