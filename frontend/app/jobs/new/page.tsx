"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { postJob } from "@/lib/contracts";

export default function PostJobPage() {
  const router = useRouter();
  const { publicKey, walletType, isConnected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "10000",
    milestones: "3",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.budget) return;

    if (!isConnected || !publicKey || !walletType) {
      setError("Please connect your Stellar wallet before posting a job.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const budgetNum = parseInt(formData.budget, 10);
      const milestonesNum = parseInt(formData.milestones, 10);

      const result = await postJob(
        publicKey,
        walletType,
        formData.title,
        formData.description,
        budgetNum,
        milestonesNum
      );

      console.log("Job posted successfully:", result);
      router.push(`/jobs/${result.job.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post job";
      setError(msg);
      console.error("Job posting error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "720px" }}>
      <div className="page-header">
        <h1 className="page-title">Post a New Job</h1>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "var(--error-bg)",
              color: "var(--error)",
              fontSize: "0.88rem",
              marginBottom: "20px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {!isConnected && (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "var(--info-bg)",
              color: "var(--info)",
              fontSize: "0.9rem",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>🚀</span>
            <div>
              <strong>Wallet Connection Required</strong>
              <div>Connect your Stellar wallet (Freighter, xBull, Lobstr, Albedo) to sign job creation.</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} id="post-job-form">
          <div className="form-group">
            <label className="form-label" htmlFor="job-title">
              Job Title
            </label>
            <input
              id="job-title"
              type="text"
              className="form-input"
              placeholder="e.g., Soroban Smart Contract Audit & Frontend Integration"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job-description">
              Description
            </label>
            <textarea
              id="job-description"
              className="form-textarea"
              placeholder="Describe the project scope, required skills, deliverables, and acceptance criteria…"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              style={{ minHeight: "180px" }}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="job-budget">
                Total Budget (XLM)
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
                Number of Milestones
              </label>
              <select
                id="job-milestones"
                className="form-select"
                value={formData.milestones}
                onChange={(e) => updateField("milestones", e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} milestone{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.budget && formData.milestones && (
            <div
              className="card"
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Payment per milestone
                </span>
                <span style={{ fontWeight: 700 }} className="text-gradient">
                  {Math.floor(
                    parseInt(formData.budget || "0") /
                      parseInt(formData.milestones || "1")
                  ).toLocaleString()}{" "}
                  XLM
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting || !isConnected}
            style={{ width: "100%" }}
            id="submit-job-btn"
          >
            {isSubmitting ? "Signing & Deploying Job…" : "Post Job with Connected Wallet"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            Job listing is stored on Stellar Soroban Testnet RPC.
            <br />
            Requires signature from your connected wallet.
          </p>
        </form>
      </div>
    </div>
  );
}
