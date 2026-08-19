"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { BidForm } from "@/components/BidForm";
import { EventFeed } from "@/components/EventFeed";
import { ContractInspectorModal } from "@/components/ContractInspectorModal";
import { useWallet } from "@/hooks/useWallet";
import { store, Job, Bid } from "@/lib/store";
import { acceptBid, withdrawBid, approveMilestone, refundEscrow } from "@/lib/contracts";
import { truncateAddress } from "@/lib/stellar";

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
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto", padding: "40px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
          <h3>Job Escrow Not Found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", marginBottom: "20px" }}>
            The requested escrow contract #{jobId} could not be located on the Stellar ledger.
          </p>
          <Link href="/jobs" className="btn btn-primary">
            &larr; Back to Open Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isClient = Boolean(publicKey && publicKey.toLowerCase() === job.client.toLowerCase());
  const isFreelancer = Boolean(publicKey && job.freelancer && publicKey.toLowerCase() === job.freelancer.toLowerCase());

  const milestonesList =
    job.milestones ||
    Array.from({ length: job.milestoneCount }, (_, i) => ({
      index: i,
      title: `Milestone ${i + 1}`,
      amount: Math.floor(job.budget / job.milestoneCount),
      state: (i < job.milestonesApproved ? "approved" : "pending") as
        | "pending"
        | "submitted"
        | "approved"
        | "disputed"
        | "refunded",
    }));

  async function handleAcceptBid(bidIndex: number) {
    if (!isConnected || !publicKey || !walletType || !job) {
      setActionError("Please connect your Stellar wallet to accept this bid.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await acceptBid(publicKey, walletType, jobId, bidIndex);
      if (res.success) {
        setActionSuccess("Bid accepted! Smart contract escrow is now funded and locked on Soroban.");
        loadJobData();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to accept bid");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleWithdrawBid(bidId: string, bidIndex: number) {
    if (!isConnected || !publicKey || !walletType) return;
    setIsProcessing(true);
    try {
      await withdrawBid(publicKey, walletType, jobId, bidId, bidIndex);
      setActionSuccess("Bid withdrawn successfully.");
      loadJobData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to withdraw bid");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleApproveMilestone(index: number, rating: number) {
    if (!isConnected || !publicKey || !walletType) return;
    setIsProcessing(true);
    try {
      await approveMilestone(publicKey, walletType, jobId, index, rating);
      setActionSuccess(`Milestone ${index + 1} approved! Tokens released to freelancer.`);
      loadJobData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve milestone");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSubmitWork(index: number, deliverableHash: string) {
    if (!publicKey) return;
    store.submitMilestone(jobId, index, publicKey, deliverableHash);
    setActionSuccess(`Milestone ${index + 1} deliverable submitted for client review!`);
    loadJobData();
  }

  function handleRaiseDispute(index: number, reason: string) {
    if (!publicKey) return;
    store.raiseDispute(jobId, index, publicKey, reason);
    setActionSuccess(`Dispute raised on Milestone ${index + 1}. Contract state set to Disputed.`);
    loadJobData();
  }

  async function handleRefund() {
    if (!isConnected || !publicKey || !walletType) return;
    setIsProcessing(true);
    try {
      await refundEscrow(publicKey, walletType, jobId);
      setActionSuccess("Escrow remaining funds refunded to client wallet.");
      loadJobData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to refund escrow");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container">
      {/* Alerts */}
      {actionSuccess && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--success-bg)",
            border: "1px solid var(--border-emerald)",
            color: "var(--emerald-light)",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>✓ {actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--error-bg)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#f87171",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Grid */}
      <div className="grid-responsive-cols" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
            <span className="category-pill">{job.category}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Contract #{job.id}
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.2rem)", lineHeight: "1.2", marginBottom: "14px" }}>
            {job.title}
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "20px" }}>
            {job.description}
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <span>🎯 {job.milestoneCount} Milestones</span>
            <span>💬 {job.bidCount} Bids</span>
            {job.deadline && <span>⏱️ Target: {job.deadline}</span>}
            <span>👤 Client: {truncateAddress(job.client, 6)}</span>
            {job.freelancer && <span>🚀 Assigned: {truncateAddress(job.freelancer, 6)}</span>}
          </div>
        </div>

        {/* Budget & Action Box */}
        <div className="card card-gold" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Escrow Value
            </span>
            <div style={{ fontSize: "clamp(1.8rem, 5vw, 2.2rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--gold-light)", margin: "4px 0 10px" }}>
              {job.budget.toLocaleString()} <small style={{ fontSize: "0.9rem", color: "var(--gold)" }}>XLM</small>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Status: <strong style={{ color: "var(--text-primary)", textTransform: "uppercase" }}>{job.status}</strong>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setIsInspectorOpen(true)}>
              🔍 Inspect Contract State
            </button>

            {isClient && (job.status === "progress" || job.status === "disputed") && (
              <button
                className="btn btn-dispute"
                style={{ width: "100%" }}
                disabled={isProcessing}
                onClick={handleRefund}
              >
                🔄 Refund Remaining Funds
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Tracker Section */}
      <div style={{ marginBottom: "40px" }}>
        <MilestoneTracker
          milestones={milestonesList}
          isClient={isClient}
          isFreelancer={isFreelancer}
          onApprove={handleApproveMilestone}
          onSubmitWork={handleSubmitWork}
          onRaiseDispute={handleRaiseDispute}
        />
      </div>

      {/* Bids & Bidding / Events Grid */}
      <div className="grid-responsive-cols" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px", alignItems: "flex-start" }}>
        {/* Bids Column */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <h2 style={{ fontSize: "1.4rem" }}>
              Proposals &amp; <span className="gradient-gold-text">Bids ({bids.length})</span>
            </h2>
            {job.status === "open" && !isClient && (
              <span style={{ fontSize: "0.85rem", color: "var(--emerald-light)", fontWeight: 700 }}>
                ● Accepting Bids
              </span>
            )}
          </div>

          {/* Bid Form (if open & not client) */}
          {job.status === "open" && !isClient && (
            <div className="card" style={{ padding: "20px", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "14px" }}>
                Submit Your Proposal for this Escrow
              </h3>
              <BidForm jobId={job.id} jobBudget={job.budget} onBidSubmitted={loadJobData} />
            </div>
          )}

          {/* Bids List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {bids.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💬</div>
                <h4>No Bids Placed Yet</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
                  Be the first freelancer to place a bid on this smart contract.
                </p>
              </div>
            ) : (
              bids.map((bid, index) => {
                const isMyBid = publicKey && bid.freelancer.toLowerCase() === publicKey.toLowerCase();
                return (
                  <div
                    key={bid.id}
                    className="card"
                    style={{
                      padding: "16px",
                      borderColor: bid.status === "accepted" ? "var(--border-emerald)" : "var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                          {bid.freelancerName || truncateAddress(bid.freelancer, 6)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {truncateAddress(bid.freelancer, 8)}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: "var(--gold-light)" }}>
                          {bid.amount.toLocaleString()} XLM
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {bid.estimatedDays || 7} Days Est.
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.5" }}>
                      {bid.proposal}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "10px", flexWrap: "wrap", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color:
                            bid.status === "accepted"
                              ? "var(--emerald-light)"
                              : bid.status === "withdrawn"
                              ? "var(--text-muted)"
                              : "var(--gold-light)",
                          textTransform: "uppercase",
                        }}
                      >
                        {bid.status === "accepted" ? "✓ Accepted" : bid.status === "withdrawn" ? "Withdrawn" : "Pending"}
                      </span>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {isClient && job.status === "open" && bid.status === "pending" && (
                          <button
                            className="btn btn-emerald"
                            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                            disabled={isProcessing}
                            onClick={() => handleAcceptBid(index)}
                          >
                            🤝 Accept &amp; Fund
                          </button>
                        )}

                        {isMyBid && job.status === "open" && bid.status === "pending" && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                            disabled={isProcessing}
                            onClick={() => handleWithdrawBid(bid.id, index)}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Event Feed Column */}
        <div>
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
