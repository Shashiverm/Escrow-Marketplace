"use client";

import { useState, useEffect } from "react";
import { ReputationBadge } from "@/components/ReputationBadge";
import { useWallet } from "@/hooks/useWallet";
import { store, Job, Bid } from "@/lib/store";
import { getReputation } from "@/lib/contracts";
import { Logo } from "@/components/Logo";
import Link from "next/link";

type ProfileTab = "posted" | "bids" | "history";

export default function ProfilePage() {
  const { publicKey, balance, walletType, isConnected, connect, availableWallets } = useWallet();
  const [reputation, setReputation] = useState({
    jobsCompleted: 0,
    totalEarned: 0,
    jobsFunded: 0,
    totalSpent: 0,
  });
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [myBids, setMyBids] = useState<{ job: Job; bid: Bid }[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posted");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    // Load reputation
    getReputation(publicKey).then(setReputation);

    // Load user's posted jobs & bids
    const allJobs = store.getJobs();
    const posted = allJobs.filter((j) => j.client.toLowerCase() === publicKey.toLowerCase());
    setMyJobs(posted);

    const userBids: { job: Job; bid: Bid }[] = [];
    allJobs.forEach((job) => {
      const bids = store.getBids(job.id);
      bids.forEach((bid) => {
        if (bid.freelancer.toLowerCase() === publicKey.toLowerCase()) {
          userBids.push({ job, bid });
        }
      });
    });
    setMyBids(userBids);
  }, [publicKey]);

  function copyAddress() {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isConnected || !publicKey) {
    return (
      <div className="container" style={{ maxWidth: "640px", padding: "64px 0", textAlign: "center" }}>
        <div className="card hover-glow" style={{ padding: "48px 32px" }}>
          <Logo size="lg" clickable={false} />
          <h2 style={{ margin: "24px 0 12px 0", fontSize: "1.6rem", color: "var(--text-primary)" }}>
            Connect Wallet for Profile Dashboard
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.6, fontSize: "0.95rem" }}>
            Connect your Stellar wallet to view on-chain reputation scores, active milestone escrows, posted jobs, and earnings.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {availableWallets.map((w) => (
              <button
                key={w.id}
                onClick={() => connect(w.id)}
                className="btn btn-secondary"
                id={`profile-connect-${w.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>{w.icon}</span> Connect {w.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "960px" }}>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="category-tag">Soroban Identity</span>
          <h1 className="page-title" style={{ marginTop: "4px" }}>On-Chain Developer Profile</h1>
        </div>
        <Link href="/jobs/new" className="btn btn-primary" id="profile-post-job-btn">
          ➕ Post Job Contract
        </Link>
      </div>

      {/* ── Wallet Overview Card ────────────────── */}
      <div className="card hover-glow" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="detail-label" style={{ marginBottom: "6px" }}>Connected Stellar Account</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.05rem",
                  wordBreak: "break-all",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                }}
              >
                {publicKey}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={copyAddress}
                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                title="Copy full public key address"
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Wallet Provider: <strong style={{ color: "var(--cyan-light)" }}>{walletType?.toUpperCase()}</strong> &middot; Network: <span className="network-pill" style={{ fontSize: "0.72rem" }}>Stellar Testnet</span>
            </div>
          </div>

          <div
            style={{
              padding: "14px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-glass)",
              border: "1px solid var(--border-light)",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Available Wallet XLM</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--cyan-light)" }}>
              {balance.toLocaleString()} <span style={{ fontSize: "0.85rem" }}>XLM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reputation Badge ───────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        <div className="detail-label" style={{ marginBottom: "12px" }}>
          Verified On-Chain Reputation Tier
        </div>
        <ReputationBadge {...reputation} />
      </div>

      {/* ── Activity Tabs ──────────────────────── */}
      <div className="card hover-glow">
        <div className="filter-tabs" style={{ marginBottom: "20px", width: "fit-content" }}>
          <button
            className={`filter-tab ${activeTab === "posted" ? "active" : ""}`}
            onClick={() => setActiveTab("posted")}
          >
            Posted Projects ({myJobs.length})
          </button>
          <button
            className={`filter-tab ${activeTab === "bids" ? "active" : ""}`}
            onClick={() => setActiveTab("bids")}
          >
            Proposals Submitted ({myBids.length})
          </button>
        </div>

        {activeTab === "posted" && (
          <div>
            {myJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "16px" }}>
                  You have not created any escrow job contracts yet.
                </p>
                <Link href="/jobs/new" className="btn btn-secondary btn-sm">
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="bid-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                    <div className="bid-item" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.98rem" }}>{job.title}</span>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Status: <strong style={{ color: "var(--cyan-light)" }}>{job.status.toUpperCase()}</strong> &middot; {job.bidCount} Bids &middot; {job.milestoneCount} Milestones
                        </div>
                      </div>
                      <span className="job-budget" style={{ fontSize: "1.1rem" }}>
                        {job.budget.toLocaleString()} XLM
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bids" && (
          <div>
            {myBids.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "16px" }}>
                  You have not submitted any job proposals yet.
                </p>
                <Link href="/jobs" className="btn btn-secondary btn-sm">
                  Browse Open Opportunities
                </Link>
              </div>
            ) : (
              <div className="bid-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myBids.map(({ job, bid }) => (
                  <Link key={bid.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                    <div className="bid-item" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.98rem" }}>{job.title}</span>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                          "{bid.proposal}"
                        </p>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Bid Status: <strong style={{ color: bid.status === "accepted" ? "var(--success)" : "var(--cyan-light)" }}>{bid.status.toUpperCase()}</strong>
                        </div>
                      </div>
                      <span className="bid-amount" style={{ fontSize: "1.1rem", color: "var(--cyan-light)", fontWeight: 800 }}>
                        {bid.amount.toLocaleString()} XLM
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
