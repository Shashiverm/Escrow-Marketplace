"use client";

import { useState, useEffect } from "react";
import { ReputationBadge } from "@/components/ReputationBadge";
import { useWallet } from "@/hooks/useWallet";
import { store, Job, Bid } from "@/lib/store";
import { getReputation } from "@/lib/contracts";
import { truncateAddress } from "@/lib/stellar";
import Link from "next/link";

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

  if (!isConnected || !publicKey) {
    return (
      <div className="container" style={{ maxWidth: "600px", padding: "64px 0", textAlign: "center" }}>
        <div className="card" style={{ padding: "48px 32px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚡</div>
          <h2 style={{ marginBottom: "12px" }}>Wallet Connection Required</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            Connect your Stellar wallet (Freighter, xBull, LOBSTR, Albedo, Rabet) to view your on-chain profile, reputation metrics, active escrows, and bid history.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {availableWallets.map((w) => (
              <button
                key={w.id}
                onClick={() => connect(w.id)}
                className="btn btn-secondary btn-sm"
                id={`profile-connect-${w.id}`}
              >
                {w.icon} Connect {w.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "920px" }}>
      <div className="page-header">
        <h1 className="page-title">On-Chain Stellar Profile</h1>
      </div>

      {/* ── Wallet Card ────────────────────── */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="detail-label">Connected Wallet Account</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1rem",
                wordBreak: "break-all",
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              {publicKey}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Connected via <strong style={{ color: "var(--cyan-light)" }}>{walletType}</strong> &middot; Stellar Testnet
            </div>
          </div>

          <div
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "var(--bg-glass)",
              border: "1px solid var(--border-light)",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Available Balance</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--cyan-light)" }}>
              {balance.toLocaleString()} XLM
            </div>
          </div>
        </div>
      </div>

      {/* ── Reputation Score ───────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <div className="detail-label" style={{ marginBottom: "12px" }}>
          On-Chain Reputation Score
        </div>
        <ReputationBadge {...reputation} />
      </div>

      {/* ── My Jobs & Activity ─────────────── */}
      <div className="grid-2" style={{ gap: "24px" }}>
        {/* Posted Jobs */}
        <div className="card">
          <div className="detail-label">Jobs Posted by You ({myJobs.length})</div>
          {myJobs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "12px 0" }}>
              You have not posted any jobs yet.
            </p>
          ) : (
            <div className="bid-list" style={{ marginTop: "12px" }}>
              {myJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                  <div className="bid-item" style={{ cursor: "pointer" }}>
                    <div className="bid-info">
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{job.title}</span>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Status: <strong style={{ color: "var(--cyan-light)" }}>{job.status}</strong> · {job.bidCount} bids
                      </div>
                    </div>
                    <span className="bid-amount">{job.budget.toLocaleString()} XLM</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Bids */}
        <div className="card">
          <div className="detail-label">Proposals Submitted ({myBids.length})</div>
          {myBids.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "12px 0" }}>
              You have not submitted any proposals yet.
            </p>
          ) : (
            <div className="bid-list" style={{ marginTop: "12px" }}>
              {myBids.map(({ job, bid }) => (
                <Link key={bid.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                  <div className="bid-item" style={{ cursor: "pointer" }}>
                    <div className="bid-info">
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{job.title}</span>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Bid Status: <strong style={{ color: bid.status === "accepted" ? "var(--success)" : "var(--text-secondary)" }}>{bid.status}</strong>
                      </div>
                    </div>
                    <span className="bid-amount">{bid.amount.toLocaleString()} XLM</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
