"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { EventFeed } from "@/components/EventFeed";
import { store, Job, TalentProfile } from "@/lib/store";

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [topTalent, setTopTalent] = useState<TalentProfile[]>([]);
  const [simStep, setSimStep] = useState(2);

  useEffect(() => {
    setFeaturedJobs(store.getJobs().slice(0, 3));
    setTopTalent(store.getTalentLeaderboard().slice(0, 3));
  }, []);

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span>Stellar Soroban Escrow Protocol</span>
          </div>

          <h1 className="hero-title">
            The Trustless <span className="gradient-gold-text">Milestone Escrow</span> for Elite Builders
          </h1>

          <p className="hero-subtitle">
            Lock funds in verifiable smart contract escrows, hire pre-vetted top talent, and settle payments instantly
            with zero intermediaries and sub-5-second ledger finality.
          </p>

          <div className="hero-cta-group">
            <Link href="/jobs" className="btn btn-primary" style={{ padding: "12px 22px" }}>
              Explore Active Escrows
            </Link>
            <Link href="/leaderboard" className="btn btn-secondary" style={{ padding: "12px 22px" }}>
              Talent Leaderboard
            </Link>
            <Link href="/jobs/new" className="btn btn-outline-gold" style={{ padding: "12px 22px" }}>
              Post Project &rarr;
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-grid">
            <div className="hero-stat-card card-gold">
              <div className="hero-stat-value">520K+</div>
              <div className="hero-stat-label">XLM in Escrow</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value" style={{ color: "var(--emerald-light)" }}>
                &lt; 5s
              </div>
              <div className="hero-stat-label">Settlement Finality</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value" style={{ color: "var(--gold-light)" }}>
                4.96 ★
              </div>
              <div className="hero-stat-label">Average Rating</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value" style={{ color: "var(--text-primary)" }}>
                100%
              </div>
              <div className="hero-stat-label">Non-Custodial</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Talent Leaderboard Teaser ────────────────── */}
      <section style={{ padding: "36px 0 48px" }}>
        <div className="container">
          <div className="leaderboard-header">
            <div>
              <span className="category-pill" style={{ marginBottom: "6px" }}>
                Pre-Vetted Soroban Talent
              </span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", marginTop: "4px" }}>
                Top-Ranked <span className="gradient-gold-text">Developers &amp; Auditors</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Work with the ecosystem&apos;s proven Rust engineers, security researchers, and DeFi architects.
              </p>
            </div>
            <Link href="/leaderboard" className="btn btn-secondary btn-sm">
              View Full Leaderboard &rarr;
            </Link>
          </div>

          <div className="talent-grid">
            {topTalent.map((talent) => (
              <div key={talent.address} className="talent-card">
                <div>
                  <div className="talent-top">
                    <div className="talent-avatar">{talent.avatar}</div>
                    <div className="talent-meta">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                        <h3 className="talent-name">{talent.name}</h3>
                        <span
                          className={`tier-badge ${
                            talent.tier === "Elite Master" ? "tier-elite" : "tier-diamond"
                          }`}
                        >
                          {talent.tier}
                        </span>
                      </div>
                      <div className="talent-handle">{talent.handle}</div>
                      <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--gold-light)", fontWeight: 700 }}>
                        {talent.rating} ★ <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({talent.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.45" }}>
                    {talent.bio}
                  </p>

                  <div className="talent-stats">
                    <div>
                      <div className="talent-stat-val" style={{ color: "var(--gold-light)" }}>
                        {talent.totalEarned.toLocaleString()}
                      </div>
                      <div className="talent-stat-lbl">XLM Earned</div>
                    </div>
                    <div>
                      <div className="talent-stat-val" style={{ color: "var(--emerald-light)" }}>
                        {talent.jobsCompleted}
                      </div>
                      <div className="talent-stat-lbl">Completed</div>
                    </div>
                    <div>
                      <div className="talent-stat-val">{talent.successRate}%</div>
                      <div className="talent-stat-lbl">Success Rate</div>
                    </div>
                  </div>

                  <div className="skills-pill-group">
                    {talent.skills.map((skill) => (
                      <span key={skill} className="skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "0.92rem" }}>
                    {talent.hourlyRate} <small style={{ color: "var(--gold)", fontWeight: 700 }}>XLM/hr</small>
                  </span>
                  <Link href="/leaderboard" className="btn btn-outline-gold btn-sm">
                    Hire Profile &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Escrows & Live Feed ─────────────────── */}
      <section style={{ padding: "20px 0 60px" }}>
        <div className="container">
          <div className="grid-responsive-cols" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "flex-start" }}>
            {/* Featured Jobs Column */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <h2 style={{ fontSize: "clamp(1.35rem, 3vw, 1.7rem)" }}>
                    Featured <span className="gradient-gold-text">Open Escrows</span>
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Verified jobs ready for proposal bidding and milestone locking.
                  </p>
                </div>
                <Link href="/jobs" className="btn btn-secondary btn-sm">
                  All Escrows &rarr;
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {featuredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    description={job.description}
                    budget={job.budget}
                    milestones={job.milestoneCount}
                    status={job.status}
                    bidCount={job.bidCount}
                    client={job.client}
                    category={job.category}
                    deadline={job.deadline}
                  />
                ))}
              </div>
            </div>

            {/* Event Feed Column */}
            <div>
              <EventFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── How Escrow Works & Interactive Lifecycle ──────── */}
      <section style={{ padding: "48px 0", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="category-pill" style={{ marginBottom: "6px" }}>
              Non-Custodial Architecture
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", marginBottom: "8px" }}>
              How Soroban <span className="gradient-emerald-text">Milestone Escrows Work</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "620px", margin: "0 auto" }}>
              Eliminate counterparty risk. Stellar smart contracts autonomously lock funds and release payouts upon milestone verification.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "36px" }}>
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.04em" }}>
                Phase 01
              </div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>Scope &amp; Milestones</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: "1.5" }}>
                Client defines custom milestone budgets and delivery targets on the Soroban Job Registry.
              </p>
            </div>

            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.04em" }}>
                Phase 02
              </div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>Non-Custodial Lock</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: "1.5" }}>
                Upon bid acceptance, 100% of the funds deposit into the autonomous escrow contract. No admin custody.
              </p>
            </div>

            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.04em" }}>
                Phase 03
              </div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>Verify &amp; Release</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: "1.5" }}>
                Freelancer submits cryptographic proof. Client approval triggers instantaneous sub-5s token transfer.
              </p>
            </div>

            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.04em" }}>
                Phase 04
              </div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>On-Chain Reputation</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: "1.5" }}>
                Settlement increments immutable reputation scores, unlocking Diamond and Elite Master tier privileges.
              </p>
            </div>
          </div>

          {/* Interactive Escrow Simulator Card */}
          <div className="card card-gold" style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(18px, 3vw, 24px)", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "6px" }}>
              Interactive Milestone Settlement Lifecycle
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", marginBottom: "18px" }}>
              Simulate how milestone approvals trigger autonomous smart contract releases:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "20px" }}>
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--radius-md)",
                    background: simStep >= step ? "var(--gold-subtle)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${simStep >= step ? "var(--gold)" : "var(--border)"}`,
                    color: simStep >= step ? "var(--gold-light)" : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textAlign: "center",
                  }}
                >
                  <div>Milestone {step} ({step * 33}%)</div>
                  <div style={{ fontSize: "0.72rem", marginTop: "3px", fontWeight: 600 }}>
                    {simStep >= step ? "✓ Released" : "Locked"}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "0.9rem",
              }}
              onClick={() => setSimStep((prev) => (prev >= 3 ? 1 : prev + 1))}
            >
              Simulate Next Milestone Approval (Step {simStep}/3)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
