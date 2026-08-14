"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { postJob } from "@/lib/contracts";

export default function PostJobPage() {
  const router = useRouter();
  const { publicKey, walletType, isConnected } = useWallet();
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Smart Contracts",
    description: "",
    budget: "10000",
    milestones: "3",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const budgetNum = parseInt(formData.budget || "0", 10);
  const milestonesNum = parseInt(formData.milestones || "1", 10);
  const perMilestone = Math.floor(budgetNum / milestonesNum);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
      return;
    }

    if (!formData.title || !formData.description || !formData.budget) return;

    if (!isConnected || !publicKey || !walletType) {
      setError("Please connect your Stellar wallet before initializing contract.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await postJob(
        publicKey,
        walletType,
        formData.title,
        `[${formData.category}] ${formData.description}`,
        budgetNum,
        milestonesNum
      );

      console.log("Job contract initialized:", result);
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
    <div className="container" style={{ maxWidth: "780px" }}>
      {/* ── Page Header ─────────────────── */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="category-tag">Soroban Contract Creator</span>
          <h1 className="page-title" style={{ marginTop: "4px" }}>Initialize Escrow Contract</h1>
        </div>
      </div>

      {/* ── Wizard Stepper Bar ──────────── */}
      <div className="wizard-stepper" style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", position: "relative" }}>
        <div className={`wizard-step-node ${currentStep >= 1 ? "active" : ""}`} onClick={() => setCurrentStep(1)}>
          <div className="step-circle">{currentStep > 1 ? "✓" : "1"}</div>
          <span className="step-title">Scope & Details</span>
        </div>
        <div className={`wizard-step-node ${currentStep >= 2 ? "active" : ""}`} onClick={() => setCurrentStep(2)}>
          <div className="step-circle">{currentStep > 2 ? "✓" : "2"}</div>
          <span className="step-title">Milestone Budgeting</span>
        </div>
        <div className={`wizard-step-node ${currentStep >= 3 ? "active" : ""}`} onClick={() => setCurrentStep(3)}>
          <div className="step-circle">3</div>
          <span className="step-title">Deploy Contract</span>
        </div>
      </div>

      {/* ── Form Card ───────────────────── */}
      <div className="card hover-glow" style={{ padding: "36px" }}>
        {error && (
          <div
            style={{
              padding: "14px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-bg)",
              color: "var(--error)",
              fontSize: "0.88rem",
              marginBottom: "24px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {!isConnected && (
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-md)",
              background: "var(--info-bg)",
              color: "var(--info)",
              fontSize: "0.9rem",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>⚡</span>
            <div>
              <strong>Stellar Wallet Signature Required</strong>
              <div>Connect Freighter, xBull, or Albedo to sign job deployment.</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} id="post-job-form">
          {/* STEP 1: SCOPE */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
                Step 1: Project Scope & Deliverables
              </h3>

              <div className="form-group">
                <label className="form-label" htmlFor="job-title">
                  Contract Job Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Soroban Smart Contract Audit & Next.js DApp Integration"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="job-category">
                  Project Category
                </label>
                <select
                  id="job-category"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="Smart Contracts">Soroban Smart Contracts</option>
                  <option value="Web3 Frontend">Web3 Frontend & UI/UX</option>
                  <option value="Security Audit">Smart Contract Security Audit</option>
                  <option value="Rust / SDK">Rust Core & SDK Tooling</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="job-description">
                  Project Description & Specifications
                </label>
                <textarea
                  id="job-description"
                  className="form-textarea"
                  placeholder="Outline deliverables, acceptance criteria, tech stack requirements..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  style={{ minHeight: "160px" }}
                  required
                />
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: "12px" }}
                onClick={() => {
                  if (formData.title && formData.description) setCurrentStep(2);
                  else setError("Please complete all required fields.");
                }}
              >
                Next: Configure Milestones &rarr;
              </button>
            </div>
          )}

          {/* STEP 2: MILESTONES */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
                Step 2: Milestone Budgeting & Allocation
              </h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="job-budget">
                    Total Contract Budget (XLM)
                  </label>
                  <input
                    id="job-budget"
                    type="number"
                    className="form-input"
                    placeholder="10000"
                    value={formData.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    min={1}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="job-milestones">
                    Milestone Breakdown Steps
                  </label>
                  <select
                    id="job-milestones"
                    className="form-select"
                    value={formData.milestones}
                    onChange={(e) => updateField("milestones", e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} Milestone{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="card"
                style={{
                  margin: "20px 0 24px 0",
                  padding: "20px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--purple-glow)",
                }}
              >
                <div className="detail-label" style={{ marginBottom: "10px" }}>
                  Milestone Disbursement Breakdown
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Array.from({ length: milestonesNum }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.88rem",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span>Milestone #{i + 1}: Deliverable Acceptance</span>
                      <strong style={{ color: "var(--cyan-light)" }}>
                        {perMilestone.toLocaleString()} XLM
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setCurrentStep(1)}
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={() => setCurrentStep(3)}
                >
                  Next: Review & Deploy &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & DEPLOY */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
                Step 3: Review & Sign Deployment
              </h3>

              <div className="card" style={{ padding: "20px", marginBottom: "24px", background: "var(--bg-glass)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Job Title</span>
                    <strong style={{ color: "var(--text-primary)" }}>{formData.title}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Category</span>
                    <span className="category-tag">{formData.category}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Budget</span>
                    <strong style={{ color: "var(--cyan-light)", fontSize: "1.1rem" }}>
                      {budgetNum.toLocaleString()} XLM
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Milestones</span>
                    <strong>{milestonesNum} Steps ({perMilestone.toLocaleString()} XLM each)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Creator Wallet</span>
                    <code style={{ fontSize: "0.82rem", color: "var(--purple-light)" }}>
                      {publicKey ? `${publicKey.slice(0, 8)}…${publicKey.slice(-8)}` : "Not connected"}
                    </code>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setCurrentStep(2)}
                >
                  &larr; Edit Milestones
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isSubmitting || !isConnected}
                  style={{ flex: 2 }}
                  id="submit-job-btn"
                >
                  {isSubmitting ? "Signing & Initializing..." : "⚡ Deploy Soroban Contract"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
