"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { BidForm } from "@/components/BidForm";
import { EventFeed } from "@/components/EventFeed";
import { ContractInspectorModal } from "@/components/ContractInspectorModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { useWallet } from "@/hooks/useWallet";
import { store, Job, Bid } from "@/lib/store";
import { acceptBid, approveMilestone, refundEscrow } from "@/lib/contracts";
import { truncateAddress } from "@/lib/stellar";
import Link from "next/link";

const STATUS_MAP = {
  open: { label: "Open for Bids", className: "badge-open" },
  progress: { label: "In Progress", className: "badge-progress" },
  completed: { label: "Completed", className: "badge-completed" },
  cancelled: { label: "Cancelled / Refunded", className: "badge-cancelled" },
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
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Proof of Work form state
  const [powLink, setPowLink] = useState("");
  const [powNotes, setPowNotes] = useState("");
  const [powSubmitted, setPowSubmitted] = useState(false);

  function addToast(type: ToastMessage["type"], title: string, message?: string, txHash?: string) {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title, message, txHash }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

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
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <div className="empty-state card" style={{ maxWidth: "500px", margin: "0 auto", padding: "40px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
          <h3>Job Contract Not Found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", marginBottom: "20px" }}>
            The requested contract ID #{jobId} could not be located on the Stellar ledger store.
          </p>
          <Link href="/jobs" className="btn btn-primary">
            &larr; Back to Open Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isClient = publicKey && publicKey.toLowerCase() === job.client.toLowerCase();
  const isFreelancer = publicKey && job.freelancer && publicKey.toLowerCase() === job.freelancer.toLowerCase();
  const statusInfo = STATUS_MAP[job.status] || STATUS_MAP.open;
  const perMilestone = Math.floor(job.budget / job.milestoneCount);

  const milestoneAmounts = Array.from({ length: job.milestoneCount }, () => perMilestone);

  async function handleAcceptBid(bidIndex: number) {
    if (!isConnected || !publicKey || !walletType || !job) {
      setActionError("Please connect your Stellar wallet to accept this proposal.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await acceptBid(publicKey, walletType, jobId, bidIndex);
      if (res.success) {
        setActionSuccess("Bid accepted! Smart contract escrow has been funded and locked on Stellar.");
        addToast("success", "Escrow Contract Funded", `Locked ${job.budget} XLM on Soroban Testnet`, res.txHash);
        loadJobData();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to accept bid";
      setActionError(msg);
      addToast("error", "Transaction Failed", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleApproveMilestone() {
    if (!isConnected || !publicKey || !walletType) {
      setActionError("Please connect your Stellar wallet to release funds.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await approveMilestone(publicKey, walletType, jobId);
      if (res.success) {
        setActionSuccess("Milestone approved! Funds successfully disbursed to freelancer on Stellar.");
        addToast("success", "Milestone Funds Disbursed", `Released ${perMilestone} XLM to freelancer`, res.txHash);
        setPowSubmitted(false);
        loadJobData();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to approve milestone";
      setActionError(msg);
      addToast("error", "Approval Error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRefundEscrow() {
    if (!isConnected || !publicKey || !walletType) {
      setActionError("Please connect your Stellar wallet.");
      return;
    }
    if (!confirm("Are you sure you want to refund the remaining unreleased escrow back to your wallet?")) return;

    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await refundEscrow(publicKey, walletType, jobId);
      if (res.success) {
        setActionSuccess("Escrow successfully refunded back to client wallet!");
        addToast("info", "Escrow Refunded", "Remaining XLM returned to client balance", res.txHash);
        loadJobData();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refund failed";
      setActionError(msg);
      addToast("error", "Refund Error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSubmitPow(e: React.FormEvent) {
    e.preventDefault();
    if (!powLink) return;
    setPowSubmitted(true);
    addToast("info", "Proof of Work Submitted", "Client notified to review deliverable link");
  }

  return (
    <div className="container">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Breadcrumb & Inspector Button ─ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <Link href="/jobs" style={{ fontSize: "0.88rem", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          &larr; Back to Job Explorer
        </Link>
        
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setIsInspectorOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          🔍 Inspect Soroban Contract State
        </button>
      </div>

      {/* ── Header Card ──────────────────── */}
      <div className="page-header" style={{ alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
            <span className="category-tag">Contract #{job.id}</span>
            <span className={`badge ${statusInfo.className}`}>
              <span className="badge-dot" />
              {statusInfo.label}
            </span>
          </div>

          <h1 className="page-title">{job.title}</h1>
          
          <div className="job-meta" style={{ marginTop: "10px", fontSize: "0.9rem", display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Client: <strong style={{ color: "var(--cyan-light)" }}>{truncateAddress(job.client, 6)}</strong>
            </span>
            {job.freelancer && (
              <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Freelancer: <strong style={{ color: "var(--purple-light)" }}>{truncateAddress(job.freelancer, 6)}</strong>
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="budget-label" style={{ fontSize: "0.78rem" }}>Escrow Contract Value</div>
          <div className="job-budget" style={{ fontSize: "2rem", color: "var(--text-primary)" }}>
            {job.budget.toLocaleString()} <span className="currency-unit" style={{ fontSize: "1.1rem" }}>XLM</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="card" style={{ background: "var(--error-bg)", color: "var(--error)", padding: "16px", marginBottom: "20px", borderRadius: "var(--radius-md)" }}>
          ⚠️ <strong>Action Error:</strong> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="card" style={{ background: "var(--success-bg)", color: "var(--success)", padding: "16px", marginBottom: "20px", borderRadius: "var(--radius-md)" }}>
          ✅ <strong>Success:</strong> {actionSuccess}
        </div>
      )}

      {/* ── Main Layout ──────────────────── */}
      <div className="detail-grid">
        {/* ── Left / Main Column ──────────── */}
        <div className="detail-main">
          {/* Overview */}
          <div className="card hover-glow">
            <div className="detail-label" style={{ marginBottom: "12px" }}>Project Scope & Specifications</div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.98rem" }}>
              {job.description}
            </p>

            <div className="job-tags-list" style={{ marginTop: "16px" }}>
              <span className="job-tag-pill">#StellarSoroban</span>
              <span className="job-tag-pill">#SmartEscrow</span>
              <span className="job-tag-pill">#RustContract</span>
            </div>
          </div>

          {/* Interactive Milestone Tracker */}
          <MilestoneTracker
            total={job.milestoneCount}
            approved={job.milestonesApproved}
            released={job.milestonesReleased}
            amounts={milestoneAmounts}
          />

          {/* Freelancer Proof of Work Submission Box */}
          {job.status === "progress" && isFreelancer && (
            <div className="card hover-glow" style={{ border: "1px solid var(--cyan-glow)" }}>
              <div className="detail-label">Submit Proof of Work (Milestone #{job.milestonesApproved + 1})</div>
              {powSubmitted ? (
                <div style={{ background: "rgba(6, 182, 212, 0.1)", padding: "16px", borderRadius: "var(--radius-md)", color: "var(--cyan-light)" }}>
                  ✅ <strong>Deliverable Submitted!</strong>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px", color: "var(--text-primary)" }}>
                    PR Link: <code className="font-mono">{powLink}</code>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    The client has been notified to review and release your milestone disbursement ({perMilestone.toLocaleString()} XLM).
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPow} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.85rem" }}>Deliverable URL (GitHub PR / IPFS Hash / Deployment)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://github.com/org/repo/pull/42"
                      value={powLink}
                      onChange={(e) => setPowLink(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.85rem" }}>Release Notes / Deliverable Summary</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Summary of completed tasks, test coverage, and documentation..."
                      value={powNotes}
                      onChange={(e) => setPowNotes(e.target.value)}
                      style={{ minHeight: "80px" }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: "fit-content" }}>
                    📤 Submit Deliverable for Review
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Client Action Trigger Card */}
          {job.status === "progress" && isClient && (
            <div className="card" style={{ border: "1px solid var(--purple-glow)", background: "var(--gradient-card)" }}>
              <div className="detail-label">Client Escrow Control Center</div>
              
              {powSubmitted && (
                <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: 700 }}>📩 Freelancer Submitted Deliverable:</span>
                  <div style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--cyan-light)", marginTop: "2px" }}>
                    {powLink}
                  </div>
                </div>
              )}

              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                As the contract client, you can approve completed deliverable work to instantly disburse XLM to the freelancer, or request an escrow refund.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                {job.milestonesApproved < job.milestoneCount && (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1 }}
                    onClick={handleApproveMilestone}
                    disabled={isProcessing}
                    id="approve-milestone-btn"
                  >
                    {isProcessing ? "Processing Release..." : `⚡ Approve & Disburse Milestone #${job.milestonesApproved + 1} (${perMilestone.toLocaleString()} XLM)`}
                  </button>
                )}

                <button
                  className="btn btn-secondary btn-lg"
                  onClick={handleRefundEscrow}
                  disabled={isProcessing}
                  id="refund-escrow-btn"
                >
                  Refund Escrow
                </button>
              </div>
            </div>
          )}

          {job.status === "completed" && (
            <div
              className="card"
              style={{
                background: "var(--success-bg)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "var(--success)",
                textAlign: "center",
                padding: "24px",
              }}
            >
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.3rem" }}>🎉 Contract Fully Settled & Completed</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                All {job.milestoneCount} milestones have been approved and released. On-chain reputation metrics updated.
              </p>
            </div>
          )}

          {/* Proposals / Bids List */}
          <div className="card hover-glow">
            <div className="detail-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Freelancer Proposals ({bids.length})</span>
              {isClient && job.status === "open" && (
                <span className="badge badge-open" style={{ fontSize: "0.78rem" }}>
                  Select Proposal to Lock Escrow
                </span>
              )}
            </div>

            {bids.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", margin: 0 }}>
                  No bids submitted yet for this position.
                </p>
              </div>
            ) : (
              <div className="bid-list" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {bids.map((bid, i) => (
                  <div
                    key={bid.id || i}
                    className="bid-item"
                    style={{
                      padding: "16px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-glass)",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <div className="bid-address" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                          👤 {truncateAddress(bid.freelancer, 6)}
                        </span>
                        {job.freelancer && bid.freelancer.toLowerCase() === job.freelancer.toLowerCase() && (
                          <span className="badge badge-completed">Hired Freelancer</span>
                        )}
                      </div>
                      <span className="bid-amount" style={{ fontWeight: 800, color: "var(--cyan-light)", fontSize: "1.1rem" }}>
                        {bid.amount.toLocaleString()} XLM
                      </span>
                    </div>

                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      "{bid.proposal}"
                    </p>

                    {/* Client Action */}
                    {job.status === "open" && isClient && (
                      <div style={{ marginTop: "4px" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptBid(i)}
                          disabled={isProcessing}
                          id={`accept-bid-btn-${i}`}
                        >
                          {isProcessing ? "Fund Escrow..." : "🤝 Accept Proposal & Deposit Escrow"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal Submission Form */}
          {job.status === "open" && !isClient && (
            <div className="card hover-glow">
              <div className="detail-label">Submit Your Bid Proposal</div>
              <BidForm jobId={job.id} jobBudget={job.budget} onBidSubmitted={loadJobData} />
            </div>
          )}
        </div>

        {/* ── Right Sidebar ───────────────── */}
        <div className="detail-sidebar" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Smart Contract Specs */}
          <div className="card hover-glow">
            <div className="detail-label">Escrow Parameters</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Total Budget</span>
                <strong style={{ color: "var(--text-primary)" }}>{job.budget.toLocaleString()} XLM</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Milestone Count</span>
                <strong style={{ color: "var(--text-primary)" }}>{job.milestoneCount} Steps</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Per Milestone</span>
                <strong style={{ color: "var(--cyan-light)" }}>{perMilestone.toLocaleString()} XLM</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Disbursed</span>
                <strong style={{ color: "var(--success)" }}>
                  {(job.milestonesReleased * perMilestone).toLocaleString()} XLM
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Network</span>
                <span className="network-pill" style={{ fontSize: "0.72rem" }}>Stellar Testnet</span>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", marginTop: "16px" }}
              onClick={() => setIsInspectorOpen(true)}
            >
              🔍 Inspect Soroban State
            </button>
          </div>

          {/* Event Stream Log */}
          <EventFeed jobId={job.id} />
        </div>
      </div>

      {/* Contract Inspector Modal */}
      <ContractInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        jobId={job.id}
        client={job.client}
        freelancer={job.freelancer}
        budget={job.budget}
        status={job.status}
        milestoneCount={job.milestoneCount}
      />
    </div>
  );
}
