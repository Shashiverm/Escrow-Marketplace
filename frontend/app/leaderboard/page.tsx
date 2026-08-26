"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { store, TalentProfile } from "@/lib/store";
import { useWallet } from "@/hooks/useWallet";

const CATEGORIES = ["All", "Smart Contracts", "Frontend UI", "Security Audit", "DeFi", "Full-Stack"];
const TIERS = ["All", "Elite Master", "Diamond", "Gold", "Silver"];

export default function LeaderboardPage() {
  const { isConnected } = useWallet();
  const [talentList, setTalentList] = useState<TalentProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalTalent, setInviteModalTalent] = useState<TalentProfile | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    setTalentList(store.getTalentLeaderboard());
  }, []);

  const filteredTalent = talentList.filter((t) => {
    const matchCat = selectedCategory === "All" || t.category === selectedCategory;
    const matchTier = selectedTier === "All" || t.tier === selectedTier;
    const matchSearch =
      searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchTier && matchSearch;
  });

  const getTierClass = (tier: string) => {
    switch (tier) {
      case "Elite Master":
        return "tier-elite";
      case "Diamond":
        return "tier-diamond";
      case "Gold":
        return "tier-gold";
      case "Silver":
        return "tier-silver";
      default:
        return "tier-bronze";
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteModalTalent(null);
    }, 2000);
  };

  return (
    <div className="container">
      {/* Header Title Section */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div className="hero-badge">
          <span>Stellar Soroban Talent Leaderboard</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.5rem)", marginBottom: "8px" }}>
          Verified <span className="gradient-gold-text">Developer Pool</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)", maxWidth: "640px", margin: "0 auto" }}>
          Discover and hire engineers ranked by verifiable on-chain reputation,
          volume settled in Soroban escrows, and 100% dispute-free milestone delivery.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
          marginBottom: "32px",
        }}
      >
        <div className="card card-gold" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
            450K+
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            XLM Volume
          </div>
        </div>

        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
            99.4%
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Success Rate
          </div>
        </div>

        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
            4.96 ★
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Avg Rating
          </div>
        </div>

        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            100%
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            On-Chain
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "16px",
          marginBottom: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <input
              type="text"
              placeholder="Search talent by name, handle, or skills…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          <Link href="/jobs/new" className="btn btn-primary btn-sm">
            Post Escrow Job &rarr;
          </Link>
        </div>

        {/* Category & Tier Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <div className="chips-scroll-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? "var(--gold)" : "var(--border)",
                  background: selectedCategory === cat ? "var(--gold-subtle)" : "var(--bg-tertiary)",
                  color: selectedCategory === cat ? "var(--gold-light)" : "var(--text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="chips-scroll-row" style={{ alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>Tier:</span>
            {TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedTier === tier ? "var(--gold)" : "var(--border)",
                  background: selectedTier === tier ? "var(--gold-subtle)" : "transparent",
                  color: selectedTier === tier ? "var(--gold-light)" : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Talent Grid */}
      {filteredTalent.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>No Talent Matches Criteria</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Try adjusting your category or tier filters to see more verified builders.
          </p>
        </div>
      ) : (
        <div className="talent-grid">
          {filteredTalent.map((talent) => (
            <div key={talent.address} className="talent-card">
              <div>
                <div className="talent-top">
                  <div className="talent-avatar">{talent.avatar}</div>
                  <div className="talent-meta">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                      <h3 className="talent-name">{talent.name}</h3>
                      <span className={`tier-badge ${getTierClass(talent.tier)}`}>
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
                    <div className="talent-stat-lbl">Jobs Done</div>
                  </div>
                  <div>
                    <div className="talent-stat-val">{talent.successRate}%</div>
                    <div className="talent-stat-lbl">Success</div>
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

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Rate</span>
                  <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontSize: "0.92rem" }}>
                    {talent.hourlyRate} <small style={{ color: "var(--gold)", fontWeight: 700 }}>XLM/hr</small>
                  </div>
                </div>

                <button
                  className="btn btn-outline-gold btn-sm"
                  onClick={() => setInviteModalTalent(talent)}
                >
                  Direct Hire &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Hire / Invite Modal */}
      {inviteModalTalent && (
        <div className="modal-backdrop" onClick={() => setInviteModalTalent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setInviteModalTalent(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 style={{ fontSize: "1.35rem", marginBottom: "6px" }}>
              Invite <span className="gradient-gold-text">{inviteModalTalent.name}</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "18px" }}>
              Send an escrow project inquiry to this {inviteModalTalent.tier} developer.
            </p>

            {inviteSuccess ? (
              <div
                style={{
                  padding: "20px",
                  background: "var(--emerald-subtle)",
                  border: "1px solid var(--border-emerald)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                  color: "var(--emerald-light)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>Invitation Dispatched</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  The developer has been notified on Stellar testnet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite}>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Audit Soroban AMM Escrow Contract"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Escrow Budget (XLM)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 10000"
                    min="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Scope &amp; Milestones</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe milestones, timeline, and delivery specifications…"
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setInviteModalTalent(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Dispatch Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
