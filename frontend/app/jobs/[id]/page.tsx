"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { BidForm } from "@/components/BidForm";
import { EventFeed } from "@/components/EventFeed";
import { useWallet } from "@/hooks/useWallet";
import { store, Job, Bid } from "@/lib/store";
import { acceptBid, approveMilestone, refundEscrow } from "@/lib/contracts";
import { truncateAddress } from "@/lib/stellar";

const STATUS_MAP = {
  open: { label: "Open", className: "badge-open" },
  progress: { label: "In Progress", className: "badge-progress" },
  completed: { label: "Completed", className: "badge-completed" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id as string, 10);

  const { publicKey, walletType, isConnected } = useWallet();
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadJobData = useCallback(() => {
    if (isNaN(jobId)) return;
    const foundJob = store.getJobById(jobId);
    if (foundJob) {
      setJob({ ...foundJob });
      setBids(store.getBids(jobId));
    }
  }, [jobId]);

  useEffect(() => {
    loadJobData();
    const interval = setInterval(loadJobData, 3000);
    return () => clearInterval(interval);
  }, [loadJobData]);

  if (!job) {
    return (
      <div className="container" style={{ padding: "64px 0", textAlign: "center" }}>
        <h2>Loading Job details…</h2>
      </div>
    );
  }

  const isClient = publicKey && publicKey.toLowerCase() === job.client.toLowerCase();
  const isFreelancer = publicKey && job.freelancer && publicKey.toLowerCase() === job.freelancer.toLowerCase();
  const statusInfo = STATUS_MAP[job.status] || STATUS_MAP.open;
  const perMilestone = Math.floor(job.budget / job.milestoneCount);

  async function handleAcceptBid(bidIndex: number) {
    if (!isConnected || !publicKey || !walletType) {
      setActionError("Please connect your Stellar wallet first.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await acceptBid(publicKey, walletType, jobId, bidIndex);
      if (res.success) {
        setActionSuccess("Bid accepted & escrow budget funded successfully!");
        loadJobData();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to accept bid");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleApproveMilestone() {
    if (!isConnected || !publicKey || !walletType) {
      setActionError("Please connect your Stellar wallet first.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await approveMilestone(publicKey, walletType, jobId);
      if (res.success) {
        setActionSuccess("Milestone approved & payment released on Stellar!");
        loadJobData();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve milestone");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRefundEscrow() {
    if (!isConnected || !publicKey || !walletType) {
      setActionError("Please connect your Stellar wallet first.");
      return;
    }
    if (!confirm("Are you sure you want to refund the remaining unreleased escrow back to your wallet?")) return;

    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await refundEscrow(publicKey, walletType, jobId);
      if (res.success) {
        setActionSuccess("Escrow refunded back to client!");
        loadJobData();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container">
      {/* ── Header ──────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{job.title}</h1>
          <div className="job-meta" style={{ marginTop: "8px", fontSize: "0.9rem", display: "flex", gap: "12px", alignItems: "center" }}>
            <span className={`badge ${statusInfo.className}`}>
              <span className="badge-dot" />
              {statusInfo.label}
            </span>
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Client: {truncateAddress(job.client, 6)}
            </span>
          </div>
        </div>
        <div className="job-budget" style={{ fontSize: "1.8rem" }}>
          {job.budget.toLocaleString()} XLM
        </div>
      </div>

      {actionError && (
        <div className="card" style={{ background: "var(--error-bg)", color: "var(--error)", padding: "14px", marginBottom: "20px" }}>
          ⚠️ {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="card" style={{ background: "var(--success-bg)", color: "var(--success)", padding: "14px", marginBottom: "20px" }}>
          ✅ {actionSuccess}
        </div>
      )}

      {/* ── Detail Grid ──────────────────── */}
      <div className="detail-grid">
        {/* ── Main Column ─────────────────── */}
        <div className="detail-main">
          {/* Description */}
          <div className="card">
            <div className="detail-label">Project Overview</div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {job.description}
            </p>
          </div>

          {/* Milestone Tracker */}
          <div className="card">
            <div className="detail-label">Milestone Progress</div>
            <MilestoneTracker
              total={job.milestoneCount}
              approved={job.milestonesApproved}
              released={job.milestonesReleased}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>
                {job.milestonesReleased}/{job.milestoneCount} milestones released
              </span>
              <span>{perMilestone.toLocaleString()} XLM per milestone</span>
            </div>

            {/* Client Controls */}
            {job.status === "progress" && isClient && (
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                {job.milestonesApproved < job.milestoneCount && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={handleApproveMilestone}
                    disabled={isProcessing}
                    id="approve-milestone-btn"
                  >
                    {isProcessing ? "Signing Release..." : `Approve & Release Milestone #${job.milestonesApproved + 1}`}
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={handleRefundEscrow}
                  disabled={isProcessing}
                  id="refund-escrow-btn"
                >
                  Refund Escrow
                </button>
              </div>
            )}

            {job.status === "completed" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "var(--success-bg)",
                  color: "var(--success)",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                🎉 Job completed! All milestones released and on-chain reputation scores updated.
              </div>
            )}
          </div>

          {/* Bids List */}
          <div className="card">
            <div className="detail-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Proposals ({bids.length})</span>
              {isClient && job.status === "open" && (
                <span style={{ color: "var(--cyan-light)", fontSize: "0.82rem" }}>
                  Select a proposal to lock escrow & start job
                </span>
              )}
            </div>

            {bids.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "16px 0" }}>
                No bids submitted yet. Freelancers can submit proposals below.
              </p>
            ) : (
              <div className="bid-list" style={{ marginTop: "12px" }}>
                {bids.map((bid, i) => (
                  <div key={bid.id || i} className="bid-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <div className="bid-address" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{truncateAddress(bid.freelancer, 6)}</span>
                        {job.freelancer && bid.freelancer.toLowerCase() === job.freelancer.toLowerCase() && (
                          <span className="badge badge-completed">Hired Freelancer</span>
                        )}
                        {bid.status === "rejected" && (
                          <span className="badge badge-cancelled">Declined</span>
                        )}
                      </div>
                      <span className="bid-amount">{bid.amount.toLocaleString()} XLM</span>
                    </div>

                    <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "4px 0" }}>
                      {bid.proposal}
                    </p>

                    {/* Accept Bid Button for Client */}
                    {job.status === "open" && isClient && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: "4px" }}
                        onClick={() => handleAcceptBid(i)}
                        disabled={isProcessing}
                        id={`accept-bid-btn-${i}`}
                      >
                        {isProcessing ? "Processing Escrow..." : "Accept Bid & Lock Escrow"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bid Form for Open Jobs */}
          {job.status === "open" && !isClient && (
            <div className="card">
              <div className="detail-label">Submit Your Proposal</div>
              <BidForm jobId={job.id} jobBudget={job.budget} onBidSubmitted={loadJobData} />
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────── */}
        <div className="detail-sidebar">
          {/* Job Details Card */}
          <div className="card">
            <div className="detail-label">Contract Parameters</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Total Budget</span>
                <span style={{ fontWeight: 600 }}>{job.budget.toLocaleString()} XLM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Milestones</span>
                <span style={{ fontWeight: 600 }}>{job.milestoneCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Per Milestone</span>
                <span style={{ fontWeight: 600 }}>{perMilestone.toLocaleString()} XLM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Bids Placed</span>
                <span style={{ fontWeight: 600 }}>{bids.length}</span>
              </div>
              {job.freelancer && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Freelancer</span>
                  <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                    {truncateAddress(job.freelancer, 6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Event Feed */}
          <EventFeed jobId={job.id} />
        </div>
      </div>
    </div>
  );
}
