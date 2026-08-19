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
            <span>✨ Powered by Stellar Soroban Smart Contracts</span>
          </div>

          <h1 className="hero-title">
            The Trustless <span className="gradient-gold-text">Escrow Marketplace</span> for Elite Builders
          </h1>

          <p className="hero-subtitle">
            Lock funds in verifiable milestone escrows, hire pre-vetted top talent, and settle payments instantly
            with zero middlemen and sub-5-second finality.
          </p>

          <div className="hero-cta-group">
            <Link href="/jobs" className="btn btn-primary" style={{ padding: "14px 24px", fontSize: "1rem" }}>
              🔍 Explore Active Jobs
            </Link>
            <Link href="/leaderboard" className="btn btn-secondary" style={{ padding: "14px 24px", fontSize: "1rem" }}>
              🏆 Top Talent Leaderboard
            </Link>
            <Link href="/jobs/new" className="btn btn-outline-gold" style={{ padding: "14px 24px", fontSize: "1rem" }}>
              ⚡ Post a Project
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-grid">
            <div className="hero-stat-card card-gold">
              <div className="hero-stat-value">520,000+</div>
              <div className="hero-stat-label">XLM in Escrow</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value" style={{ color: "var(--emerald-light)" }}>
                &lt; 5s
              </div>
              <div className="hero-stat-label">Finality Time</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value" style={{ color: "var(--violet-light)" }}>
                4.96 ★
              </div>
              <div className="hero-stat-label">Talent Rating</div>
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
      <section style={{ padding: "40px 0 60px" }}>
        <div className="container">
          <div className="leaderboard-header">
            <div>
              <span className="category-pill" style={{ marginBottom: "8px" }}>
                Pre-Vetted Soroban Talent
              </span>
              <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>
                Top <span className="gradient-gold-text">Ranked Freelancers</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Compete with the ecosystem&apos;s best developers, security auditors, and DeFi architects.
              </p>
            </div>
            <Link href="/leaderboard" className="btn btn-secondary">
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
                      <div style={{ marginTop: "4px", fontSize: "0.82rem", color: "var(--gold-light)", fontWeight: 700 }}>
                        {talent.rating} ★ <span style={{ color: "var(--text-muted)" }}>({talent.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5" }}>
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

                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "14px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {talent.hourlyRate} <small style={{ color: "var(--gold)" }}>XLM/hr</small>
                  </span>
                  <Link href="/leaderboard" className="btn btn-outline-gold" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                    Hire Profile &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs & Live Event Feed ─────────────── */}
      <section style={{ padding: "20px 0 80px" }}>
        <div className="container">
          <div className="grid-responsive-cols" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px", alignItems: "flex-start" }}>
            {/* Featured Jobs Column */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)" }}>
                    Featured <span className="gradient-gold-text">Open Escrows</span>
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Verified jobs ready for bidding and milestone locking.
                  </p>
                </div>
                <Link href="/jobs" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                  All Jobs &rarr;
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

      {/* ── How Escrow Works & Interactive Demo ─────────── */}
      <section style={{ padding: "60px 0", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="category-pill" style={{ marginBottom: "8px" }}>
              Non-Custodial Security Model
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.4rem)", marginBottom: "12px" }}>
              How Soroban <span className="gradient-emerald-text">Milestone Escrow Works</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto" }}>
              Never risk client upfront funds or unpaid freelancer labor. Stellar smart contracts automate security.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "48px" }}>
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📝</div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>1. Post & Custom Milestones</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                Client publishes job specs with custom milestone budgets and deadlines onto the Soroban Job Registry.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔒</div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>2. Non-Custodial Lock</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                On bid acceptance, 100% of the funds transfer into the autonomous Escrow Contract. No admin can access tokens.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚡</div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>3. Deliver & Verify</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                Freelancer delivers work with cryptographic hashes. Client approves each milestone to trigger instant release.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⭐</div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>4. Rate & Level Up</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                Completion updates both parties&apos; on-chain reputation scores, unlocking Diamond and Elite Master tiers.
              </p>
            </div>
          </div>

          {/* Interactive Escrow Simulator Card */}
          <div className="card card-gold" style={{ maxWidth: "780px", margin: "0 auto", padding: "clamp(18px, 4vw, 28px)", textAlign: "center" }}>
            <h3 style={{ fontSize: "clamp(1.15rem, 3.5vw, 1.35rem)", marginBottom: "8px" }}>
              🎮 Interactive Soroban Escrow Simulator
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              Simulate how milestone releases trigger on-chain state updates and reputation increases:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "24px" }}>
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: simStep >= step ? "var(--gold-subtle)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${simStep >= step ? "var(--gold)" : "var(--border)"}`,
                    color: simStep >= step ? "var(--gold-light)" : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  <div>Milestone {step} ({step * 33}%)</div>
                  <div style={{ fontSize: "0.75rem", marginTop: "4px", fontWeight: 600 }}>
                    {simStep >= step ? "✓ Released" : "🔒 Locked"}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                maxWidth: "100%",
                padding: "14px 18px",
                fontSize: "clamp(0.85rem, 3.2vw, 1rem)",
                lineHeight: 1.35,
              }}
              onClick={() => setSimStep((prev) => (prev >= 3 ? 1 : prev + 1))}
            >
              🔄 Trigger Milestone Release Simulation (State: {simStep}/3)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
