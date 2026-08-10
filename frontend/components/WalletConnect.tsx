"use client";

import { useState, useEffect } from "react";

/**
 * Wallet connection button using Freighter API.
 *
 * Checks for the Freighter browser extension and allows
 * the user to connect/disconnect their Stellar wallet.
 */
export function WalletConnect() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      if (typeof window === "undefined") return;
      const freighterApi = await import("@stellar/freighter-api");
      const { isConnected } = freighterApi;
      const connected = await isConnected();
      if (connected) {
        const { getAddress } = freighterApi;
        const addressObj = await getAddress();
        if (addressObj.address) {
          setPublicKey(addressObj.address);
        }
      }
    } catch {
      // Freighter not installed — fail silently
    }
  }

  async function handleConnect() {
    setIsLoading(true);
    try {
      const freighterApi = await import("@stellar/freighter-api");
      const { requestAccess } = freighterApi;
      const accessObj = await requestAccess();
      if (accessObj.address) {
        setPublicKey(accessObj.address);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDisconnect() {
    setPublicKey(null);
  }

  function truncateAddress(addr: string): string {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  }

  if (publicKey) {
    return (
      <button
        className="btn btn-secondary btn-sm wallet-btn connected"
        onClick={handleDisconnect}
        title={publicKey}
        id="wallet-disconnect-btn"
      >
        <span className="wallet-address">{truncateAddress(publicKey)}</span>
      </button>
    );
  }

  return (
    <button
      className="btn btn-primary btn-sm wallet-btn"
      onClick={handleConnect}
      disabled={isLoading}
      id="wallet-connect-btn"
    >
      {isLoading ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
