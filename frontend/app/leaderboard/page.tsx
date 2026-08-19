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
      <div style={{ marginBottom: "36px", textAlign: "center" }}>
        <div className="hero-badge">
          <span>🏆 Stellar Soroban Top Talent Leaderboard</span>
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", marginBottom: "12px" }}>
          The Elite <span className="gradient-gold-text">Talent Pool</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(0.95rem, 3vw, 1.1rem)", maxWidth: "680px", margin: "0 auto" }}>
          Discover and hire pre-vetted, top-tier engineers and auditors ranked by verifiable on-chain reputation,
          volume settled in Soroban escrows, and 100% dispute-free delivery.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <div className="card card-gold" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
            450K+
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            XLM Volume
          </div>
        </div>

        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
            99.4%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Success Rate
          </div>
        </div>

        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--violet-light)" }}>
            4.96 ★
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Avg Rating
          </div>
        </div>

        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            100%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            On-Chain
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "20px",
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <input
              type="text"
              placeholder="🔍 Search talent by name, handle, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%" }}
            />
          </div>

          {/* Post Job CTA */}
          <Link href="/jobs/new" className="btn btn-primary">
            ⚡ Post Job for Top Talent
          </Link>
        </div>

        {/* Category Pills & Tier Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? "var(--gold)" : "var(--border)",
                  background: selectedCategory === cat ? "var(--gold-subtle)" : "var(--bg-glass)",
                  color: selectedCategory === cat ? "var(--gold-light)" : "var(--text-secondary)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Tier:</span>
            {TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedTier === tier ? "var(--violet)" : "var(--border)",
                  background: selectedTier === tier ? "var(--violet-subtle)" : "transparent",
                  color: selectedTier === tier ? "var(--violet-light)" : "var(--text-secondary)",
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
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <h3>No Talent Found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
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
                    <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "var(--gold-light)", fontWeight: 700 }}>
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

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Rate</span>
                  <div style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                    {talent.hourlyRate} <small style={{ color: "var(--gold)" }}>XLM/hr</small>
                  </div>
                </div>

                <button
                  className="btn btn-outline-gold"
                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                  onClick={() => setInviteModalTalent(talent)}
                >
                  ✉️ Direct Hire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Hire / Invite Modal */}
      {inviteModalTalent && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
              Hire <span className="gradient-gold-text">{inviteModalTalent.name}</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              Send a direct job inquiry or invite this {inviteModalTalent.tier} builder to bid on your Soroban escrow contract.
            </p>

            {inviteSuccess ? (
              <div
                style={{
                  padding: "24px",
                  background: "var(--success-bg)",
                  border: "1px solid var(--border-emerald)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                  color: "var(--emerald-light)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✅</div>
                <h3>Invitation Dispatched!</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  The talent has been notified via on-chain event feed and Freighter connection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite}>
                <div className="form-group">
                  <label className="form-label">Job Title / Project Name</label>
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
                  <label className="form-label">Project Scope & Deliverables</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe the milestones, timeline, and deliverables..."
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setInviteModalTalent(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    🚀 Dispatch Escrow Invite
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
