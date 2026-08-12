"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { placeBid } from "@/lib/contracts";

interface BidFormProps {
  jobId: number;
  jobBudget: number;
  onBidSubmitted?: () => void;
}

export function BidForm({ jobId, jobBudget, onBidSubmitted }: BidFormProps) {
  const { publicKey, walletType, isConnected } = useWallet();
  const [amount, setAmount] = useState("");
  const [proposal, setProposal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !proposal) return;
    if (!isConnected || !publicKey || !walletType) {
      setError("Please connect your wallet first to place a bid");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await placeBid(
        publicKey,
        walletType,
        jobId,
        parseInt(amount),
        proposal
      );
      setTxHash(res.txHash);
      setSubmitted(true);
      onBidSubmitted?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bid placement failed";
      setError(msg);
      console.error("Bid submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "24px" }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
        <h3 style={{ marginBottom: "4px" }}>Bid Submitted!</h3>
        <p style={{ color: "var(--text-secondary, #94a3b8)", fontSize: "0.9rem", marginBottom: "12px" }}>
          Your bid of {parseInt(amount).toLocaleString()} XLM for job #{jobId} has been placed.
        </p>
        {txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.82rem", color: "var(--cyan-light, #38bdf8)", wordBreak: "break-all" }}
          >
            View on Stellar Expert →
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} id={`bid-form-${jobId}`}>
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#f87171",
            fontSize: "0.85rem",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {!isConnected && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "rgba(56, 189, 248, 0.1)",
            color: "#38bdf8",
            fontSize: "0.85rem",
            marginBottom: "16px",
          }}
        >
          ℹ️ Connect your Stellar wallet to submit a bid on-chain.
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor={`bid-amount-${jobId}`}>
          Bid Amount (XLM)
        </label>
        <input
          id={`bid-amount-${jobId}`}
          type="number"
          className="form-input"
          placeholder={`Suggested budget: ${jobBudget.toLocaleString()} XLM`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`bid-proposal-${jobId}`}>
          Proposal
        </label>
        <textarea
          id={`bid-proposal-${jobId}`}
          className="form-textarea"
          placeholder="Describe your qualifications, approach, and timeline…"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting || !isConnected}
        style={{ width: "100%" }}
        id={`bid-submit-${jobId}`}
      >
        {isSubmitting ? "Signing & Submitting…" : "Submit Bid with Connected Wallet"}
      </button>
    </form>
  );
}
