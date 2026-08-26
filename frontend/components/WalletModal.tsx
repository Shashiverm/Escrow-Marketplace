"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { WalletInfo, WalletType } from "@/lib/wallets";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableWallets: WalletInfo[];
  onSelectWallet: (type: WalletType) => void;
  isLoading: boolean;
  error: string | null;
}

export function WalletModal({
  isOpen,
  onClose,
  availableWallets,
  onSelectWallet,
  isLoading,
  error,
}: WalletModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div
        className="wallet-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="wallet-modal-close"
          aria-label="Close modal"
          id="close-wallet-modal-btn"
        >
          ✕
        </button>

        <div className="wallet-modal-header">
          <div className="wallet-modal-badge">Stellar Soroban Wallets</div>
          <h2 className="wallet-modal-title">Connect Wallet</h2>
          <p className="wallet-modal-desc">
            Authenticate and sign non-custodial escrow transactions directly on Stellar.
          </p>
        </div>

        {error && (
          <div className="wallet-modal-error">
            {error}
          </div>
        )}

        <div className="wallet-modal-list">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onSelectWallet(wallet.id)}
              disabled={isLoading}
              className="wallet-option-item"
              id={`select-wallet-${wallet.id}`}
            >
              <div className="wallet-option-left">
                <span className="wallet-option-icon">{wallet.icon}</span>
                <div className="wallet-option-meta">
                  <div className="wallet-option-name">{wallet.name}</div>
                  <div className="wallet-option-desc">{wallet.description}</div>
                </div>
              </div>

              <span
                className={`wallet-option-badge ${
                  wallet.isAvailable ? "available" : ""
                }`}
              >
                {wallet.isAvailable ? "Connect" : "Available"}
              </span>
            </button>
          ))}
        </div>

        <div className="wallet-modal-footer">
          Soroban Testnet &middot; Non-Custodial Smart Contracts
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
