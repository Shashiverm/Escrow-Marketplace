"use client";

import { useState, useEffect, useCallback } from "react";

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Hook for managing Freighter wallet connection state.
 *
 * Usage:
 * ```tsx
 * const { publicKey, isConnected, connect, disconnect } = useWallet();
 * ```
 */
export function useWallet(): WalletState {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check existing connection on mount
  useEffect(() => {
    async function check() {
      try {
        if (typeof window === "undefined") return;
        const { isConnected, getAddress } = await import(
          "@stellar/freighter-api"
        );
        const connected = await isConnected();
        if (connected) {
          const result = await getAddress();
          if (result.address) setPublicKey(result.address);
        }
      } catch {
        // Freighter not installed
      }
    }
    check();
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { requestAccess } = await import("@stellar/freighter-api");
      const result = await requestAccess();
      if (result.address) {
        setPublicKey(result.address);
      } else {
        setError("Connection was rejected");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
  }, []);

  return {
    publicKey,
    isConnected: !!publicKey,
    isLoading,
    error,
    connect,
    disconnect,
  };
}
