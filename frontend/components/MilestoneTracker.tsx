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
      onRaiseDispute(disputingIndex, disputeReason || "Deliverables require revision or do not match scope.");
      setDisputingIndex(null);
      setDisputeReason("");
    }
  };

  return (
    <div className="milestone-tracker-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
            Escrow <span className="gradient-gold-text">Milestone Schedule</span>
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Locked in Soroban smart contract with autonomous release upon client sign-off.
          </p>
        </div>
        <div className="network-pill">
          <span className="network-dot pulse-gold" />
          <span>Non-Custodial</span>
        </div>
      </div>

      <div className="milestones-list">
        {milestones.map((m, i) => (
          <div key={i} className={`milestone-item state-${m.state}`}>
            <div className="milestone-left">
              <div className="milestone-index">{i + 1}</div>
              <div className="milestone-info">
                <h4>{m.title || `Milestone ${i + 1}`}</h4>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "3px", fontSize: "0.8rem" }}>
                  <span className="milestone-amount">{m.amount.toLocaleString()} XLM</span>
                  
                  {m.state === "approved" && (
                    <span style={{ color: "var(--emerald-light)", fontWeight: 700 }}>
                      ✓ Released &amp; Settled
                    </span>
                  )}
                  {m.state === "submitted" && (
                    <span style={{ color: "var(--gold-light)", fontWeight: 700 }}>
                      Pending Client Review
                    </span>
                  )}
                  {m.state === "disputed" && (
                    <span style={{ color: "var(--dispute)", fontWeight: 700 }}>
                      In Arbitration Dispute
                    </span>
                  )}
                  {m.state === "pending" && (
                    <span style={{ color: "var(--text-muted)" }}>
                      Pending Delivery
                    </span>
                  )}

                  {m.deliverableHash && (
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                      Hash: {m.deliverableHash.slice(0, 18)}...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Freelancer Submit Action */}
              {isFreelancer && (m.state === "pending" || m.state === "submitted") && (
                <button
                  className="btn btn-outline-gold btn-sm"
                  onClick={() => {
                    setSubmittingIndex(i);
                    setDeliverableHash(m.deliverableHash || "");
                  }}
                >
                  Submit Proof
                </button>
              )}

              {/* Client Approve Action */}
              {isClient && (m.state === "pending" || m.state === "submitted") && (
                <button
                  className="btn btn-emerald btn-sm"
                  onClick={() => setApprovingIndex(i)}
                >
                  Approve &amp; Release
                </button>
              )}

              {/* Dispute Button */}
              {(isClient || isFreelancer) && (m.state === "pending" || m.state === "submitted") && (
                <button
                  className="btn btn-dispute btn-sm"
                  onClick={() => setDisputingIndex(i)}
                >
                  Dispute
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Work Submission Modal */}
      {submittingIndex !== null && (
        <div className="modal-backdrop" onClick={() => setSubmittingIndex(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>
              Submit Milestone {submittingIndex + 1} Deliverable
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "18px" }}>
              Provide the verifiable link, IPFS content hash, or repository commit for client verification.
            </p>

            <form onSubmit={handleWorkSubmit}>
              <div className="form-group">
                <label className="form-label">Deliverable URL / IPFS Hash / PR Link</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ipfs://bafybeic... or https://github.com/..."
                  value={deliverableHash}
                  onChange={(e) => setDeliverableHash(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSubmittingIndex(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Approval & Rating Modal */}
      {approvingIndex !== null && (
        <div className="modal-backdrop" onClick={() => setApprovingIndex(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>
              Approve &amp; Release <span className="gradient-emerald-text">Milestone {approvingIndex + 1}</span>
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "18px" }}>
              {milestones[approvingIndex].amount.toLocaleString()} XLM will transfer autonomously from the Soroban escrow contract to the developer.
            </p>

            <div className="form-group">
              <label className="form-label">Rate Quality &amp; Communication (1 to 5 Stars)</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarRating(star)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid",
                      borderColor: starRating >= star ? "var(--gold)" : "var(--border)",
                      background: starRating >= star ? "var(--gold-subtle)" : "var(--bg-tertiary)",
                      color: starRating >= star ? "var(--gold-light)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setApprovingIndex(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-emerald btn-sm" onClick={handleApproveConfirm}>
                Confirm Release &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputingIndex !== null && (
        <div className="modal-backdrop" onClick={() => setDisputingIndex(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "6px", color: "var(--dispute)" }}>
              Raise Milestone Dispute
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "18px" }}>
              This flags Milestone {disputingIndex + 1} on-chain and pauses payouts pending arbitration review.
            </p>

            <form onSubmit={handleDisputeSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for Dispute</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Specify discrepancy between delivered work and milestone specifications…"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDisputingIndex(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-dispute btn-sm">
                  Lock &amp; Raise Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
