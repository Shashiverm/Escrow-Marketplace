"use client";

import React, { useState } from "react";
import { Milestone } from "@/lib/store";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  isClient: boolean;
  isFreelancer: boolean;
  onApprove: (index: number, rating: number) => void;
  onSubmitWork?: (index: number, deliverableHash: string) => void;
  onRaiseDispute?: (index: number, reason: string) => void;
}

export function MilestoneTracker({
  milestones,
  isClient,
  isFreelancer,
  onApprove,
  onSubmitWork,
  onRaiseDispute,
}: MilestoneTrackerProps) {
  const [submittingIndex, setSubmittingIndex] = useState<number | null>(null);
  const [deliverableHash, setDeliverableHash] = useState("");
  const [approvingIndex, setApprovingIndex] = useState<number | null>(null);
  const [starRating, setStarRating] = useState(5);
  const [disputingIndex, setDisputingIndex] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const handleWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingIndex !== null && onSubmitWork) {
      onSubmitWork(submittingIndex, deliverableHash || `ipfs://proof-milestone-${submittingIndex + 1}`);
      setSubmittingIndex(null);
      setDeliverableHash("");
    }
  };

  const handleApproveConfirm = () => {
    if (approvingIndex !== null) {
      onApprove(approvingIndex, starRating);
      setApprovingIndex(null);
    }
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disputingIndex !== null && onRaiseDispute) {
      onRaiseDispute(disputingIndex, disputeReason || "Milestone deliverables not meeting specifications.");
      setDisputingIndex(null);
      setDisputeReason("");
    }
  };

  return (
    <div className="milestone-tracker-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
            🔒 Escrow <span className="gradient-gold-text">Milestone Schedule</span>
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Locked in Soroban Smart Contract with automated release upon verification.
          </p>
        </div>
        <div className="network-pill">
          <span className="network-dot pulse-gold" />
          <span>Multi-Milestone Escrow</span>
        </div>
      </div>

      <div className="milestones-list">
        {milestones.map((m, i) => (
          <div key={i} className={`milestone-item state-${m.state}`}>
            <div className="milestone-left">
              <div className="milestone-index">{i + 1}</div>
              <div className="milestone-info">
                <h4>{m.title || `Milestone ${i + 1}`}</h4>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px", fontSize: "0.82rem" }}>
                  <span className="milestone-amount">{m.amount.toLocaleString()} XLM</span>
                  
                  {m.state === "approved" && (
                    <span style={{ color: "var(--emerald-light)", fontWeight: 700 }}>
                      ✓ Released & Settled
                    </span>
                  )}
                  {m.state === "submitted" && (
                    <span style={{ color: "var(--gold-light)", fontWeight: 700 }}>
                      ⏳ Work Submitted for Review
                    </span>
                  )}
                  {m.state === "disputed" && (
                    <span style={{ color: "var(--dispute)", fontWeight: 700 }}>
                      ⚠️ In Arbitration Dispute
                    </span>
                  )}
                  {m.state === "pending" && (
                    <span style={{ color: "var(--text-muted)" }}>
                      Pending Delivery
                    </span>
                  )}

                  {m.deliverableHash && (
                    <span style={{ color: "var(--violet-light)", fontFamily: "var(--font-mono)" }}>
                      Hash: {m.deliverableHash.slice(0, 16)}...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Freelancer Submit Action */}
              {isFreelancer && (m.state === "pending" || m.state === "submitted") && (
                <button
                  className="btn btn-outline-gold"
                  style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                  onClick={() => {
                    setSubmittingIndex(i);
                    setDeliverableHash(m.deliverableHash || "");
                  }}
                >
                  📤 Submit Deliverable
                </button>
              )}

              {/* Client Approve Action */}
              {isClient && (m.state === "pending" || m.state === "submitted") && (
                <button
                  className="btn btn-emerald"
                  style={{ padding: "6px 16px", fontSize: "0.82rem" }}
                  onClick={() => setApprovingIndex(i)}
                >
                  ✓ Approve & Release
                </button>
              )}

              {/* Dispute Button */}
              {(isClient || isFreelancer) && (m.state === "pending" || m.state === "submitted") && (
                <button
                  className="btn btn-dispute"
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  onClick={() => setDisputingIndex(i)}
                >
                  ⚖️ Dispute
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Work Submission Modal */}
      {submittingIndex !== null && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
              Submit Deliverable for <span className="gradient-gold-text">Milestone {submittingIndex + 1}</span>
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              Provide the verifiable link, IPFS hash, GitHub PR, or artifact summary for the client to review.
            </p>

            <form onSubmit={handleWorkSubmit}>
              <div className="form-group">
                <label className="form-label">Deliverable URL / IPFS Hash / GitHub PR</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ipfs://bafybeic... or https://github.com/..."
                  value={deliverableHash}
                  onChange={(e) => setDeliverableHash(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSubmittingIndex(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  🚀 Submit for Client Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Approval & Rating Modal */}
      {approvingIndex !== null && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
              Approve & Release <span className="gradient-emerald-text">Milestone {approvingIndex + 1}</span>
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              Tokens ({milestones[approvingIndex].amount.toLocaleString()} XLM) will transfer immediately from the Soroban Escrow contract to the freelancer.
            </p>

            <div className="form-group">
              <label className="form-label">Rate Freelancer Performance</label>
              <div style={{ display: "flex", gap: "12px", fontSize: "1.8rem", cursor: "pointer", margin: "8px 0" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setStarRating(star)}
                    style={{ color: star <= starRating ? "#fbbf24" : "rgba(255,255,255,0.2)", transition: "all 0.2s" }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ fontSize: "1rem", alignSelf: "center", color: "var(--gold-light)", fontWeight: 700 }}>
                  {starRating}.0 Stars
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setApprovingIndex(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-emerald" onClick={handleApproveConfirm}>
                💰 Sign & Release {milestones[approvingIndex].amount.toLocaleString()} XLM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputingIndex !== null && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", color: "var(--dispute)" }}>
              ⚖️ Raise Arbitration Dispute on Milestone {disputingIndex + 1}
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              The escrow will be frozen in the Soroban contract and transferred to the registered arbitrator for impartial review.
            </p>

            <form onSubmit={handleDisputeSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for Dispute</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Detail the issue with milestone deliverables or responsiveness..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setDisputingIndex(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-dispute">
                  ⚠️ Freeze & Escalate to Arbitrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
