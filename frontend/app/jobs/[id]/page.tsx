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
      <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
        <div className="card" style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 24px" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "6px" }}>Escrow Contract Not Found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px", marginBottom: "18px", fontSize: "0.88rem" }}>
            The requested escrow contract #{jobId} could not be located on the Stellar ledger.
          </p>
          <Link href="/jobs" className="btn btn-primary btn-sm">
            &larr; Back to Open Escrows
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
        setActionSuccess("Bid accepted. Escrow smart contract funded and locked on Soroban.");
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
      setActionSuccess(`Milestone ${index + 1} approved. Tokens released to developer.`);
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
    setActionSuccess(`Milestone ${index + 1} deliverable submitted for review.`);
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
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--emerald-subtle)",
            border: "1px solid var(--border-emerald)",
            color: "var(--emerald-light)",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.88rem",
          }}
        >
          <span>✓ {actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--error-bg)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.88rem",
          }}
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Grid */}
      <div className="grid-responsive-cols" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", marginBottom: "28px" }}>
        <div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
            <span className="category-pill">{job.category}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Contract #{job.id}
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)", lineHeight: "1.25", marginBottom: "12px" }}>
            {job.title}
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6", marginBottom: "18px" }}>
            {job.description}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span>{job.milestoneCount} Milestones</span>
            <span>&middot;</span>
            <span>{job.bidCount} Bids</span>
            {job.deadline && (
              <>
                <span>&middot;</span>
                <span>Deadline: {job.deadline}</span>
              </>
            )}
            <span>&middot;</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>Client: {truncateAddress(job.client, 4)}</span>
            {job.freelancer && (
              <>
                <span>&middot;</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
                  Dev: {truncateAddress(job.freelancer, 4)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Budget & Action Box */}
        <div className="card card-gold" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
              Total Escrow Value
            </span>
            <div style={{ fontSize: "clamp(1.6rem, 4.5vw, 2rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--gold-light)", margin: "2px 0 8px" }}>
              {job.budget.toLocaleString()} <small style={{ fontSize: "0.85rem", color: "var(--gold)", fontWeight: 700 }}>XLM</small>
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Status: <strong style={{ color: "var(--text-primary)", textTransform: "uppercase" }}>{job.status}</strong>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={() => setIsInspectorOpen(true)}>
              Inspect Smart Contract
            </button>

            {isClient && (job.status === "progress" || job.status === "disputed") && (
              <button
                className="btn btn-dispute btn-sm"
                style={{ width: "100%" }}
                disabled={isProcessing}
                onClick={handleRefund}
              >
                Refund Remaining Funds
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Tracker Section */}
      <div style={{ marginBottom: "32px" }}>
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
      <div className="grid-responsive-cols" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "flex-start" }}>
        {/* Bids Column */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h2 style={{ fontSize: "1.25rem" }}>
              Proposals &amp; <span className="gradient-gold-text">Bids ({bids.length})</span>
            </h2>
            {job.status === "open" && !isClient && (
              <span style={{ fontSize: "0.78rem", color: "var(--emerald-light)", fontWeight: 700 }}>
                Accepting Proposals
              </span>
            )}
          </div>

          {/* Bid Form (if open & not client) */}
          {job.status === "open" && !isClient && (
            <div className="card" style={{ padding: "18px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "12px" }}>
                Submit Proposal for this Escrow
              </h3>
              <BidForm jobId={job.id} jobBudget={job.budget} onBidSubmitted={loadJobData} />
            </div>
          )}

          {/* Bids List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bids.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>No Proposals Placed Yet</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                  Connect your wallet to place the first bid on this escrow.
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem" }}>
                          {bid.freelancerName || truncateAddress(bid.freelancer, 6)}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {truncateAddress(bid.freelancer, 6)}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: "var(--gold-light)" }}>
                          {bid.amount.toLocaleString()} XLM
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {bid.estimatedDays || 7} Days Est.
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: "1.45" }}>
                      {bid.proposal}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "8px", flexWrap: "wrap", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
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

                      <div style={{ display: "flex", gap: "6px" }}>
                        {isClient && job.status === "open" && bid.status === "pending" && (
                          <button
                            className="btn btn-emerald btn-sm"
                            disabled={isProcessing}
                            onClick={() => handleAcceptBid(index)}
                          >
                            Accept &amp; Lock Funds
                          </button>
                        )}

                        {isMyBid && job.status === "open" && bid.status === "pending" && (
                          <button
                            className="btn btn-secondary btn-sm"
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
