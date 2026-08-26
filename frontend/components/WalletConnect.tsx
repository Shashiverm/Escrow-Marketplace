"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { WalletModal } from "./WalletModal";
import { WalletType } from "@/lib/wallets";

const WALLET_NAMES: Record<WalletType, string> = {
  freighter: "Freighter",
  xbull: "xBull",
  lobstr: "Lobstr",
  albedo: "Albedo",
  rabet: "Rabet",
};

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const {
    publicKey,
    balance,
    walletType,
    isLoading,
    error,
    availableWallets,
    connect,
    disconnect,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function truncateAddress(addr: string): string {
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  async function handleSelectWallet(type: WalletType) {
    const address = await connect(type);
    if (address) {
      setIsModalOpen(false);
    }
  }

  if (!mounted) {
    return (
      <button
        className="btn btn-primary btn-sm"
        id="wallet-connect-btn"
      >
        Connect Wallet
      </button>
    );
  }

  if (publicKey) {
    const walletLabel = walletType ? WALLET_NAMES[walletType] : "Wallet";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div
          style={{
            padding: "5px 10px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--gold-light)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {balance.toLocaleString()} XLM
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={disconnect}
          title={`Connected via ${walletLabel}: ${publicKey}\nClick to Disconnect`}
          id="wallet-disconnect-btn"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span className="network-dot" style={{ width: "6px", height: "6px" }} />
          <span style={{ fontFamily: "var(--font-mono)" }}>{truncateAddress(publicKey)}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        id="wallet-connect-btn"
      >
        {isLoading ? "Connecting…" : "Connect Wallet"}
      </button>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableWallets={availableWallets}
        onSelectWallet={handleSelectWallet}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
