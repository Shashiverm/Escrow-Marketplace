"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ReputationBadge } from "@/components/ReputationBadge";
import { useWallet } from "@/hooks/useWallet";
import { store, Job, Bid } from "@/lib/store";
import { getReputation } from "@/lib/contracts";
import { truncateAddress } from "@/lib/stellar";

type ProfileTab = "posted" | "bids" | "history";

export default function ProfilePage() {
  const { publicKey, balance, isConnected, connect, availableWallets } = useWallet();
  const [reputation, setReputation] = useState({
    jobsCompleted: 0,
    totalEarned: 0,
    jobsFunded: 0,
    totalSpent: 0,
    rating: 4.95,
    reviewCount: 12,
    tier: "Gold",
  });
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [myBids, setMyBids] = useState<{ job: Job; bid: Bid }[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posted");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    getReputation(publicKey).then((rep) => {
      setReputation({
        jobsCompleted: rep.jobsCompleted,
        totalEarned: rep.totalEarned,
        jobsFunded: rep.jobsFunded,
        totalSpent: rep.totalSpent,
        rating: rep.rating || 4.95,
        reviewCount: rep.reviewCount || 12,
        tier: rep.tier || "Gold",
      });
    });

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
      <div className="container" style={{ maxWidth: "640px", textAlign: "center", padding: "60px 0" }}>
        <div className="card" style={{ padding: "48px 32px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👑</div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>
            Connect Wallet for <span className="gradient-gold-text">Developer Profile</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "0.95rem" }}>
            Connect your Stellar wallet to view on-chain reputation scores, active milestone escrows, posted jobs, and tier progression.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {availableWallets.map((w) => (
              <button
                key={w.id}
                onClick={() => connect(w.id)}
                className="btn btn-primary"
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
    <div className="container" style={{ maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
        <div>
          <span className="category-pill" style={{ marginBottom: "8px" }}>
            Soroban On-Chain Identity
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", marginTop: "4px" }}>
            Developer <span className="gradient-gold-text">Profile &amp; Reputation</span>
          </h1>
        </div>
        <Link href="/jobs/new" className="btn btn-primary">
          ➕ Post Job Contract
        </Link>
      </div>

      {/* Account Overview Box */}
      <div className="card" style={{ marginBottom: "28px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Connected Address
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--gold-light)", fontWeight: 700 }}>
                {truncateAddress(publicKey, 8)}
              </span>
              <button
                onClick={copyAddress}
                className="btn btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Wallet Balance
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
              {balance !== null ? balance.toLocaleString() : "..."} <small style={{ fontSize: "0.85rem" }}>XLM</small>
            </div>
          </div>
        </div>
      </div>

      {/* Reputation Badge */}
      <div style={{ marginBottom: "36px" }}>
        <ReputationBadge
          jobsCompleted={reputation.jobsCompleted}
          totalEarned={reputation.totalEarned}
          jobsFunded={reputation.jobsFunded}
          totalSpent={reputation.totalSpent}
          rating={reputation.rating}
          reviewCount={reputation.reviewCount}
          tier={reputation.tier}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("posted")}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            border: "1px solid",
            borderColor: activeTab === "posted" ? "var(--gold)" : "transparent",
            background: activeTab === "posted" ? "var(--gold-subtle)" : "transparent",
            color: activeTab === "posted" ? "var(--gold-light)" : "var(--text-secondary)",
          }}
        >
          My Posted Escrows ({myJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            border: "1px solid",
            borderColor: activeTab === "bids" ? "var(--gold)" : "transparent",
            background: activeTab === "bids" ? "var(--gold-subtle)" : "transparent",
            color: activeTab === "bids" ? "var(--gold-light)" : "var(--text-secondary)",
          }}
        >
          My Active Bids ({myBids.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "posted" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {myJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-secondary)" }}>You have not posted any escrow jobs yet.</p>
              <Link href="/jobs/new" className="btn btn-primary" style={{ marginTop: "16px" }}>
                ➕ Post Your First Escrow
              </Link>
            </div>
          ) : (
            myJobs.map((job) => (
              <div key={job.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span className="category-pill" style={{ marginBottom: "6px" }}>{job.category}</span>
                  <h3 style={{ fontSize: "1.1rem" }}>{job.title}</h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Budget: <strong>{job.budget.toLocaleString()} XLM</strong> · {job.milestoneCount} Milestones · Status: {job.status}
                  </div>
                </div>
                <Link href={`/jobs/${job.id}`} className="btn btn-outline-gold" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
                  Manage Escrow &rarr;
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "bids" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {myBids.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-secondary)" }}>You have not submitted any bids yet.</p>
              <Link href="/jobs" className="btn btn-primary" style={{ marginTop: "16px" }}>
                🔍 Browse Open Jobs
              </Link>
            </div>
          ) : (
            myBids.map(({ job, bid }) => (
              <div key={bid.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>{job.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{bid.proposal}</p>
                  <div style={{ fontSize: "0.82rem", color: "var(--gold-light)", fontWeight: 700, marginTop: "4px" }}>
                    Your Bid: {bid.amount.toLocaleString()} XLM ({bid.status})
                  </div>
                </div>
                <Link href={`/jobs/${job.id}`} className="btn btn-outline-gold" style={{ fontSize: "0.82rem", padding: "6px 14px" }}>
                  View Job &rarr;
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
