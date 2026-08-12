"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WalletType,
  connectWallet,
  getLiveBalance,
  getAvailableWallets,
  WalletInfo,
  isFreighterConnected,
} from "@/lib/wallets";

interface WalletState {
  publicKey: string | null;
  balance: number;
  walletType: WalletType | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  availableWallets: WalletInfo[];
  connect: (type: WalletType) => Promise<string | null>;
  disconnect: () => void;
  refetchBalance: () => Promise<void>;
}

export function useWallet(): WalletState {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    setAvailableWallets(getAvailableWallets());

    const savedType = localStorage.getItem("stellar_wallet_type") as WalletType | null;
    const savedKey = localStorage.getItem("stellar_wallet_key");

    if (savedType && savedKey) {
      setWalletType(savedType);
      setPublicKey(savedKey);
      getLiveBalance(savedKey).then(setBalance);
    }
  }, []);

  const refetchBalance = useCallback(async () => {
    if (publicKey) {
      const bal = await getLiveBalance(publicKey);
      setBalance(bal);
    }
  }, [publicKey]);

  const connect = useCallback(async (type: WalletType): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const address = await connectWallet(type);
      if (address) {
        setPublicKey(address);
        setWalletType(type);
        localStorage.setItem("stellar_wallet_type", type);
        localStorage.setItem("stellar_wallet_key", address);

        const bal = await getLiveBalance(address);
        setBalance(bal);
        return address;
      } else {
        setError("Connection rejected");
        return null;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Wallet connection failed";
      setError(msg);
      console.error("Wallet connection error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setWalletType(null);
    setBalance(0);
    setError(null);
    localStorage.removeItem("stellar_wallet_type");
    localStorage.removeItem("stellar_wallet_key");
  }, []);

  return {
    publicKey,
    balance,
    walletType,
    isConnected: !!publicKey,
    isLoading,
    error,
    availableWallets,
    connect,
    disconnect,
    refetchBalance,
  };
}
