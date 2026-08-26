"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { postJob } from "@/lib/contracts";
import { Milestone } from "@/lib/store";

const CATEGORIES = ["Smart Contracts", "Frontend UI", "Security Audit", "DeFi", "Full-Stack", "Design"] as const;

export default function PostJobPage() {
  const router = useRouter();
  const { publicKey, walletType, isConnected } = useWallet();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Smart Contracts");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("12000");
  const [milestoneCount, setMilestoneCount] = useState(3);
  const [deadline, setDeadline] = useState("2026-10-01");

  const [customMilestones, setCustomMilestones] = useState<Milestone[]>([
    { index: 0, title: "Milestone 1: Architectural Design & Spec", amount: 4000, state: "pending" },
    { index: 1, title: "Milestone 2: Core Implementation & Tests", amount: 4000, state: "pending" },
    { index: 2, title: "Milestone 3: Final Deployment & Review", amount: 4000, state: "pending" },
  ]);

  const handleMilestoneCountChange = (count: number) => {
    const safeCount = Math.max(1, Math.min(10, count));
    setMilestoneCount(safeCount);
    const b = parseInt(budget) || 12000;
    const per = Math.floor(b / safeCount);
    const ms: Milestone[] = [];
    for (let i = 0; i < safeCount; i++) {
      ms.push({
        index: i,
        title: `Milestone ${i + 1}`,
        amount: i === safeCount - 1 ? b - per * (safeCount - 1) : per,
        state: "pending",
      });
    }
    setCustomMilestones(ms);
  };

  const handleMilestoneAmountChange = (index: number, newAmount: number) => {
    const updated = [...customMilestones];
    updated[index].amount = newAmount;
    setCustomMilestones(updated);
  };

  const handleMilestoneTitleChange = (index: number, newTitle: string) => {
    const updated = [...customMilestones];
    updated[index].title = newTitle;
    setCustomMilestones(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
      return;
    }

    if (!title || !description || !budget) return;

    if (!isConnected || !publicKey || !walletType) {
      setError("Please connect your Stellar wallet before deploying the contract.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const budgetNum = parseInt(budget);
      const result = await postJob(
        publicKey,
        walletType,
        title,
        description,
        category,
        budgetNum,
        milestoneCount,
        deadline,
        customMilestones
      );

      router.push(`/jobs/${result.job.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to initialize contract";
      setError(msg);
      console.error("Contract creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "760px" }}>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <span className="category-pill" style={{ marginBottom: "6px" }}>
          Soroban Escrow Protocol
        </span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.3rem)", marginTop: "4px" }}>
          Initialize <span className="gradient-gold-text">Milestone Escrow</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Deploy a project onto the Stellar Soroban Job Registry with custom milestone payouts.
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", gap: "8px", flexWrap: "wrap" }}>
        <div
          onClick={() => setCurrentStep(1)}
          style={{
            flex: 1,
            minWidth: "100px",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            background: currentStep >= 1 ? "var(--gold-subtle)" : "var(--bg-tertiary)",
            border: `1px solid ${currentStep >= 1 ? "var(--gold)" : "var(--border)"}`,
            textAlign: "center",
            cursor: "pointer",
            color: currentStep >= 1 ? "var(--gold-light)" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          1. Scope
        </div>

        <div
          onClick={() => setCurrentStep(2)}
          style={{
            flex: 1,
            minWidth: "100px",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            background: currentStep >= 2 ? "var(--gold-subtle)" : "var(--bg-tertiary)",
            border: `1px solid ${currentStep >= 2 ? "var(--gold)" : "var(--border)"}`,
            textAlign: "center",
            cursor: "pointer",
            color: currentStep >= 2 ? "var(--gold-light)" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          2. Milestones
        </div>

        <div
          onClick={() => setCurrentStep(3)}
          style={{
            flex: 1,
            minWidth: "100px",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            background: currentStep >= 3 ? "var(--gold-subtle)" : "var(--bg-tertiary)",
            border: `1px solid ${currentStep >= 3 ? "var(--gold)" : "var(--border)"}`,
            textAlign: "center",
            cursor: "pointer",
            color: currentStep >= 3 ? "var(--gold-light)" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          3. Deploy
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: "clamp(18px, 4vw, 32px)" }}>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-bg)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              marginBottom: "18px",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Soroban Smart Contract Security Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Scope &amp; Requirements</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Detail technical specifications, expected deliverables, and repo links…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => setCurrentStep(2)}>
                Next: Configure Milestones &rarr;
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Budget (XLM)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={budget}
                    onChange={(e) => {
                      setBudget(e.target.value);
                      handleMilestoneCountChange(milestoneCount);
                    }}
                    min={100}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Milestone Count</label>
                  <input
                    type="number"
                    className="form-input"
                    value={milestoneCount}
                    onChange={(e) => handleMilestoneCountChange(parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                    required
                  />
                </div>
              </div>

              <h4 style={{ fontSize: "0.95rem", color: "var(--gold-light)", marginBottom: "10px", fontWeight: 700 }}>
                Milestone Allocation
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {customMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "8px",
                      background: "var(--bg-tertiary)",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      value={m.title}
                      onChange={(e) => handleMilestoneTitleChange(idx, e.target.value)}
                      placeholder={`Milestone ${idx + 1} Title`}
                    />
                    <input
                      type="number"
                      className="form-input"
                      value={m.amount}
                      onChange={(e) => handleMilestoneAmountChange(idx, parseInt(e.target.value) || 0)}
                      placeholder="Amount"
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCurrentStep(1)}>
                  &larr; Back
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setCurrentStep(3)}>
                  Next: Review &rarr;
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "14px" }}>Contract Deployment Summary</h3>

              <div style={{ background: "var(--bg-tertiary)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Title</span>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{title}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Category</span>
                  <div><span className="category-pill">{category}</span></div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Total Escrow Budget</span>
                  <div style={{ fontWeight: 800, color: "var(--gold-light)", fontFamily: "var(--font-mono)", fontSize: "1.05rem" }}>
                    {parseInt(budget).toLocaleString()} XLM
                  </div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>Milestone Schedule</span>
                  <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>
                    {customMilestones.map((m, i) => (
                      <div key={i}>&bull; {m.title}: <strong>{m.amount.toLocaleString()} XLM</strong></div>
                    ))}
                  </div>
                </div>
              </div>

              {!isConnected && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gold-subtle)",
                    border: "1px solid var(--border-gold)",
                    color: "var(--gold-light)",
                    fontSize: "0.82rem",
                    marginBottom: "16px",
                  }}
                >
                  Please connect your Stellar wallet to sign and post to Soroban Testnet.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCurrentStep(2)}>
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !isConnected}
                >
                  {isSubmitting ? "Deploying on Soroban…" : "Sign & Deploy Escrow"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
