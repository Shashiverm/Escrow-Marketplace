"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { Logo } from "@/components/Logo";

/** Mock stats */
const STATS = [
  { value: "142", label: "Jobs Posted", icon: "📋" },
  { value: "$87K", label: "Locked in Escrow", icon: "🔒" },
  { value: "98%", label: "Completion Rate", icon: "🎯" },
  { value: "320+", label: "Verified Freelancers", icon: "🌟" },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Post Job & Define Milestones",
    description: "Specify project deliverables, budget, and milestone splits. Soroban smart contract is initialized instantly.",
    icon: "📝",
    badge: "Client Action",
  },
  {
    step: "02",
    title: "Freelancers Bid & Stake Rep",
    description: "Qualified freelancers submit bids with timelines. Bidders showcase their verified on-chain reputation.",
    icon: "🤝",
    badge: "Bidding Phase",
  },
  {
    step: "03",
    title: "Escrow Auto-Funded",
    description: "Client accepts a bid and deposits XLM into the non-custodial smart contract. Funds are locked safely.",
    icon: "🔐",
    badge: "Smart Contract Lock",
  },
  {
    step: "04",
    title: "Deliver & Approve",
    description: "Freelancer completes milestone work. Client reviews the work and signs the approval on Stellar.",
    icon: "⚡",
    badge: "Instant Release",
  },
];

const FEATURES = [
  {
    icon: "🔒",
    title: "Milestone Escrow",
    description:
      "Funds are locked in a Soroban smart contract and released incrementally as milestones are approved — protecting both parties.",
  },
  {
    icon: "⚡",
    title: "Instant Settlement",
    description:
      "Payments settle in seconds on Stellar, with near-zero fees. No waiting days for wire transfers or exchange delays.",
  },
  {
    icon: "🌐",
    title: "Borderless by Default",
    description:
      "Work with anyone, anywhere. No traditional bank accounts required — just your preferred Stellar wallet.",
  },
  {
    icon: "⭐",
    title: "On-Chain Reputation",
    description:
      "Every completed job builds a verifiable, tamper-proof reputation score stored directly on the Stellar ledger.",
  },
  {
    icon: "📡",
    title: "Real-Time Event Logs",
    description:
      "Track job postings, bids, and milestone releases in real time through Soroban contract events.",
  },
  {
    icon: "🛡️",
    title: "Non-Custodial Escrow",
    description:
      "The smart contract holds funds — never a centralized middleman. Release conditions are strictly enforced by code.",
  },
];

export default function HomePage() {
  const [simStep, setSimStep] = useState(2); // 2 out of 3 milestones released
  const [activeStepTab, setActiveStepTab] = useState(0);

  const totalMilestones = 3;

  function advanceSim() {
    setSimStep((prev) => (prev >= totalMilestones ? 1 : prev + 1));
  }

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-layout-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="network-dot pulse" />
                Built on Stellar Soroban &middot; Testnet Live
              </div>

              <h1>
                Freelance with
                <br />
                <span className="gradient-text">Trustless Escrow</span>
              </h1>

              <p>
                Post jobs, submit bids, and execute contracts through milestone-based
                Soroban smart escrow. Guaranteed non-custodial protection, instant XLM payouts, and on-chain reputation.
              </p>

              <div className="hero-actions">
                <Link
                  href="/jobs"
                  className="btn btn-primary btn-lg"
                  id="hero-browse-btn"
                >
                  Browse Open Jobs &rarr;
                </Link>
                <Link
                  href="/jobs/new"
                  className="btn btn-secondary btn-lg"
                  id="hero-post-btn"
                >
                  ➕ Post a Job
                </Link>
              </div>

              <div className="hero-trust-bar" style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Supported Wallets:
                </span>
                <div style={{ display: "flex", gap: "10px", fontSize: "1.1rem" }}>
                  <span title="Freighter Wallet">🚀 Freighter</span>
                  <span title="xBull Wallet">🐂 xBull</span>
                  <span title="Albedo">⚡ Albedo</span>
                </div>
              </div>
            </div>

            {/* Interactive Live Escrow Simulation Card */}
            <div className="hero-preview-card">
              <div className="hero-preview-badge">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge badge-open">
                    <span className="badge-dot" /> Live Escrow Contract
                  </span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Contract #SB82…9F2A
                </span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Soroban Smart Contract Audit
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  Client: <code style={{ color: "var(--cyan-light)" }}>GDF7…K89L</code> &middot; Freelancer: <code style={{ color: "var(--purple-light)" }}>GA3M…W22P</code>
                </p>
              </div>

              <MilestoneTracker
                total={3}
                approved={simStep}
                released={simStep}
                amounts={[1500, 1500, 1500]}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border-light)",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Contract Escrow</span>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    4,500 <span style={{ fontSize: "0.85rem", color: "var(--cyan-light)" }}>XLM</span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={advanceSim}
                  title="Click to simulate approving and releasing next milestone"
                >
                  ⚡ {simStep >= 3 ? "Reset Demo Escrow" : `Release Milestone ${simStep + 1}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <section className="container" style={{ marginTop: "-20px", position: "relative", zIndex: 10 }}>
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="card stat-card hover-glow">
              <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interactive How It Works Workflow ─────────────── */}
      <section className="container" style={{ padding: "80px 0 40px 0" }} id="how-it-works">
        <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 48px auto" }}>
          <span className="category-tag" style={{ marginBottom: "12px" }}>
            Transparent Protocol
          </span>
          <h2 className="section-title">
            How <span className="text-gradient">StellarEscrow</span> Works
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            An automated, non-custodial milestone lifecycle designed to protect freelancers and clients alike.
          </p>
        </div>

        <div className="workflow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {WORKFLOW_STEPS.map((w, idx) => (
            <div
              key={w.step}
              className="card hover-glow"
              style={{
                padding: "28px 24px",
                position: "relative",
                border: activeStepTab === idx ? "1px solid var(--purple-light)" : undefined,
                background: activeStepTab === idx ? "var(--gradient-card)" : undefined,
                cursor: "pointer",
              }}
              onClick={() => setActiveStepTab(idx)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: "1.4rem",
                    color: "var(--purple-light)",
                  }}
                >
                  {w.step}
                </span>
                <span className="badge badge-open" style={{ fontSize: "0.72rem" }}>
                  {w.badge}
                </span>
              </div>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{w.icon}</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {w.title}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {w.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Platform Features ───────────────────────── */}
      <section className="features-section">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px auto" }}>
            <h2 className="section-title">
              Why Choose <span className="text-gradient">StellarEscrow</span>?
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Built from the ground up for speed, security, and global accessibility on the Stellar blockchain.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card feature-card hover-glow">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action Banner ────────────────────────── */}
      <section className="container" style={{ padding: "60px 0 80px 0" }}>
        <div
          className="card"
          style={{
            background: "var(--gradient-card)",
            border: "1px solid var(--purple-glow)",
            padding: "48px 32px",
            textAlign: "center",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.2)",
          }}
        >
          <Logo size="lg" clickable={false} />
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "20px 0 12px 0", color: "var(--text-primary)" }}>
            Ready to Start Freelancing on Stellar?
          </h2>
          <p style={{ maxWidth: "600px", margin: "0 auto 28px auto", color: "var(--text-secondary)", fontSize: "1.05rem" }}>
            Join hundreds of developers and clients using decentralized smart escrow with instant XLM finality.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link href="/jobs" className="btn btn-primary btn-lg">
              Explore Available Jobs
            </Link>
            <Link href="/jobs/new" className="btn btn-secondary btn-lg">
              Post a New Project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
