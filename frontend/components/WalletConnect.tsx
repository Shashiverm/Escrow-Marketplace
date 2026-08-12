"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { WalletModal } from "./WalletModal";
import { WalletType } from "@/lib/wallets";

const WALLET_ICONS: Record<WalletType, string> = {
  freighter: "🚀",
  xbull: "🐂",
  lobstr: "🦞",
  albedo: "⚡",
  rabet: "🐰",
};

export function WalletConnect() {
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

  function truncateAddress(addr: string): string {
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  async function handleSelectWallet(type: WalletType) {
    const address = await connect(type);
    if (address) {
      setIsModalOpen(false);
    }
  }

  if (publicKey) {
    const icon = walletType ? WALLET_ICONS[walletType] : "⚡";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-full, 9999px)",
            background: "var(--bg-glass, rgba(255,255,255,0.05))",
            border: "1px solid var(--border-light, rgba(255,255,255,0.1))",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--cyan-light, #38bdf8)",
          }}
        >
          {balance.toLocaleString()} XLM
        </div>

        <button
          className="btn btn-secondary btn-sm wallet-btn connected"
          onClick={disconnect}
          title={`Connected via ${walletType || "Wallet"}: ${publicKey}\nClick to Disconnect`}
          id="wallet-disconnect-btn"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span>{icon}</span>
          <span className="wallet-address">{truncateAddress(publicKey)}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn-primary btn-sm wallet-btn"
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
