"use client";

import { useState } from "react";

interface BidFormProps {
  jobId: number;
  jobBudget: number;
  onSubmit?: (amount: number, proposal: string) => void;
}

/**
 * Bid submission form for freelancers.
 * Validates amount and proposal before submitting.
 */
export function BidForm({ jobId, jobBudget, onSubmit }: BidFormProps) {
  const [amount, setAmount] = useState("");
  const [proposal, setProposal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !proposal) return;

    setIsSubmitting(true);

    try {
      // In production: invoke the contract via Stellar SDK
      // const tx = await contracts.placeBid(jobId, parseInt(amount), proposal);
      onSubmit?.(parseInt(amount), proposal);
      setSubmitted(true);
    } catch (err) {
      console.error("Bid submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "32px" }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
        <h3 style={{ marginBottom: "4px" }}>Bid Submitted!</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Your bid of {parseInt(amount).toLocaleString()} XLM for job #{jobId}{" "}
          has been submitted.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} id={`bid-form-${jobId}`}>
      <div className="form-group">
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

      <div className="form-group">
        <label className="form-label" htmlFor={`bid-proposal-${jobId}`}>
          Proposal
        </label>
        <textarea
          id={`bid-proposal-${jobId}`}
          className="form-textarea"
          placeholder="Describe your approach, experience, and timeline…"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ width: "100%" }}
        id={`bid-submit-${jobId}`}
      >
        {isSubmitting ? "Submitting…" : "Submit Bid"}
      </button>
    </form>
  );
}
