"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WalletType,
  connectWallet,
  getLiveBalance,
  getAvailableWallets,
  WalletInfo,
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

// Module-level global state for cross-component instant synchronization
let globalPublicKey: string | null = null;
let globalBalance: number = 0;
let globalWalletType: WalletType | null = null;
let isInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("stellar_wallet_change"));
  }
}

function initFromStorage() {
  if (typeof window === "undefined" || isInitialized) return;
  isInitialized = true;
  const savedType = localStorage.getItem("stellar_wallet_type") as WalletType | null;
  const savedKey = localStorage.getItem("stellar_wallet_key");

  if (savedType && savedKey) {
    globalWalletType = savedType;
    globalPublicKey = savedKey;
    getLiveBalance(savedKey).then((bal) => {
      globalBalance = bal;
      notifyListeners();
    });
  }
}

export function useWallet(): WalletState {
  const [publicKey, setPublicKey] = useState<string | null>(globalPublicKey);
  const [balance, setBalance] = useState<number>(globalBalance);
  const [walletType, setWalletType] = useState<WalletType | null>(globalWalletType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    setAvailableWallets(getAvailableWallets());

    if (!isInitialized) {
      initFromStorage();
    }

    const syncState = () => {
      setPublicKey(globalPublicKey);
      setBalance(globalBalance);
      setWalletType(globalWalletType);
    };

    // Sync immediately on mount
    syncState();

    listeners.add(syncState);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "stellar_wallet_key" || e.key === "stellar_wallet_type") {
        const savedType = localStorage.getItem("stellar_wallet_type") as WalletType | null;
        const savedKey = localStorage.getItem("stellar_wallet_key");
        globalPublicKey = savedKey;
        globalWalletType = savedType;
        if (savedKey) {
          getLiveBalance(savedKey).then((bal) => {
            globalBalance = bal;
            notifyListeners();
          });
        } else {
          globalBalance = 0;
          notifyListeners();
        }
      }
    };

    const handleCustomChange = () => {
      syncState();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("stellar_wallet_change", handleCustomChange);

    return () => {
      listeners.delete(syncState);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("stellar_wallet_change", handleCustomChange);
    };
  }, []);

  const refetchBalance = useCallback(async () => {
    if (globalPublicKey) {
      const bal = await getLiveBalance(globalPublicKey);
      globalBalance = bal;
      setBalance(bal);
      notifyListeners();
    }
  }, []);

  const connect = useCallback(async (type: WalletType): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const address = await connectWallet(type);
      if (address) {
        globalPublicKey = address;
        globalWalletType = type;
        setPublicKey(address);
        setWalletType(type);

        localStorage.setItem("stellar_wallet_type", type);
        localStorage.setItem("stellar_wallet_key", address);

        const bal = await getLiveBalance(address);
        globalBalance = bal;
        setBalance(bal);
        notifyListeners();
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
    globalPublicKey = null;
    globalWalletType = null;
    globalBalance = 0;

    setPublicKey(null);
    setWalletType(null);
    setBalance(0);
    setError(null);

    localStorage.removeItem("stellar_wallet_type");
    localStorage.removeItem("stellar_wallet_key");

    notifyListeners();
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
