"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    milestones: "3",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In production: invoke JobRegistry.post_job via Stellar SDK
      // const tx = await contracts.postJob(
      //   formData.title,
      //   formData.description,
      //   parseInt(formData.budget),
      //   parseInt(formData.milestones)
      // );

      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/jobs");
    } catch (err) {
      console.error("Job posting failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <div className="page-header">
        <h1 className="page-title">Post a New Job</h1>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit} id="post-job-form">
          <div className="form-group">
            <label className="form-label" htmlFor="job-title">
              Job Title
            </label>
            <input
              id="job-title"
              type="text"
              className="form-input"
              placeholder="e.g., Smart Contract Security Audit"
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
              placeholder="Describe the project scope, deliverables, and any technical requirements…"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              style={{ minHeight: "180px" }}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="job-budget">
                Budget (XLM)
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
            disabled={isSubmitting}
            style={{ width: "100%" }}
            id="submit-job-btn"
          >
            {isSubmitting ? "Posting Job…" : "Post Job & Lock Budget"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            Your budget will be locked in escrow upon job creation.
            <br />
            Requires Freighter wallet to sign the transaction.
          </p>
        </form>
      </div>
    </div>
  );
}
