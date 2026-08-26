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
  const [estimatedDays, setEstimatedDays] = useState("7");
  const [proposal, setProposal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !proposal) return;
    if (!isConnected || !publicKey || !walletType) {
      setError("Please connect your wallet first to place a bid on-chain.");
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
        proposal,
        parseInt(estimatedDays) || 7
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
      <div className="card card-emerald" style={{ textAlign: "center", padding: "20px" }}>
        <h3 style={{ marginBottom: "4px", color: "var(--emerald-light)", fontSize: "1.15rem" }}>
          Bid Submitted to Soroban Registry
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
          Your proposal for {parseInt(amount).toLocaleString()} XLM ({estimatedDays} days) has been recorded on the Stellar ledger.
        </p>
        {txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.8rem", color: "var(--gold-light)", wordBreak: "break-all" }}
          >
            View Transaction on StellarExpert ↗
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
            borderRadius: "var(--radius-md)",
            background: "var(--error-bg)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            fontSize: "0.82rem",
            marginBottom: "14px",
          }}
        >
          {error}
        </div>
      )}

      {!isConnected && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--gold-subtle)",
            border: "1px solid var(--border-gold)",
            color: "var(--gold-light)",
            fontSize: "0.82rem",
            marginBottom: "14px",
          }}
        >
          Connect your Stellar wallet to submit a cryptographic bid.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor={`bid-amount-${jobId}`}>
            Bid Amount (XLM)
          </label>
          <input
            id={`bid-amount-${jobId}`}
            type="number"
            className="form-input"
            placeholder={`Budget: ${jobBudget.toLocaleString()} XLM`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor={`bid-days-${jobId}`}>
            Delivery (Days)
          </label>
          <input
            id={`bid-days-${jobId}`}
            type="number"
            className="form-input"
            placeholder="e.g. 7"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            min={1}
            max={365}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`bid-proposal-${jobId}`}>
          Proposal &amp; Technical Approach
        </label>
        <textarea
          id={`bid-proposal-${jobId}`}
          className="form-textarea"
          rows={3}
          placeholder="Outline your architectural plan, deliverable milestones, and Soroban contract experience…"
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
        {isSubmitting ? "Signing & Submitting on Soroban…" : "Submit Proposal"}
      </button>
    </form>
  );
}
