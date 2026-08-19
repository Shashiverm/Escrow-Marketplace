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
    <div className="container" style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "28px", textAlign: "center" }}>
        <span className="category-pill" style={{ marginBottom: "8px" }}>
          Soroban Escrow Protocol
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", marginTop: "4px" }}>
          Initialize <span className="gradient-gold-text">Milestone Escrow Job</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Deploy a new job onto the Stellar Soroban Job Registry with custom milestone payouts.
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", gap: "8px", flexWrap: "wrap" }}>
        <div
          onClick={() => setCurrentStep(1)}
          style={{
            flex: 1,
            minWidth: "120px",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            background: currentStep >= 1 ? "var(--gold-subtle)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${currentStep >= 1 ? "var(--gold)" : "var(--border)"}`,
            textAlign: "center",
            cursor: "pointer",
            color: currentStep >= 1 ? "var(--gold-light)" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          1. Scope
        </div>

        <div
          onClick={() => setCurrentStep(2)}
          style={{
            flex: 1,
            minWidth: "120px",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            background: currentStep >= 2 ? "var(--gold-subtle)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${currentStep >= 2 ? "var(--gold)" : "var(--border)"}`,
            textAlign: "center",
            cursor: "pointer",
            color: currentStep >= 2 ? "var(--gold-light)" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          2. Milestones
        </div>

        <div
          onClick={() => setCurrentStep(3)}
          style={{
            flex: 1,
            minWidth: "120px",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            background: currentStep >= 3 ? "var(--gold-subtle)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${currentStep >= 3 ? "var(--gold)" : "var(--border)"}`,
            textAlign: "center",
            cursor: "pointer",
            color: currentStep >= 3 ? "var(--gold-light)" : "var(--text-muted)",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          3. Deploy
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: "clamp(20px, 4vw, 36px)" }}>
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-bg)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#f87171",
              marginBottom: "20px",
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
                <label className="form-label">Detailed Scope & Requirements</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Detail the technical specifications, requirements, expected deliverables, and repo links..."
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
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
                  <label className="form-label">Milestones</label>
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

              <h4 style={{ fontSize: "1rem", color: "var(--gold-light)", marginBottom: "12px" }}>
                Custom Milestone Allocation
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {customMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "8px",
                      background: "var(--bg-tertiary)",
                      padding: "12px",
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

              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                  &larr; Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  Next: Review &rarr;
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Contract Deployment Summary</h3>

              <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Title:</span>
                  <div style={{ fontWeight: 800 }}>{title}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Category:</span>
                  <div><span className="category-pill">{category}</span></div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Total Budget:</span>
                  <div style={{ fontWeight: 800, color: "var(--gold-light)", fontFamily: "var(--font-mono)" }}>
                    {parseInt(budget).toLocaleString()} XLM
                  </div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Milestones:</span>
                  <div style={{ fontSize: "0.9rem" }}>
                    {customMilestones.map((m, i) => (
                      <div key={i}>• {m.title}: <strong>{m.amount.toLocaleString()} XLM</strong></div>
                    ))}
                  </div>
                </div>
              </div>

              {!isConnected && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gold-subtle)",
                    border: "1px solid var(--border-gold)",
                    color: "var(--gold-light)",
                    fontSize: "0.85rem",
                    marginBottom: "20px",
                  }}
                >
                  ⚡ Please connect your Freighter wallet to sign and post to Soroban Testnet.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !isConnected}
                >
                  {isSubmitting ? "Deploying on Soroban..." : "🚀 Sign & Deploy Escrow Contract"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
