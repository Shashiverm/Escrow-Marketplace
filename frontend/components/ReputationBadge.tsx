"use client";

import React from "react";

interface ReputationBadgeProps {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
  rating?: number;
  reviewCount?: number;
  tier?: string;
}

export function ReputationBadge({
  jobsCompleted,
  totalEarned,
  jobsFunded,
  totalSpent,
  rating = 4.95,
  reviewCount = 12,
  tier,
}: ReputationBadgeProps) {
  const totalJobs = jobsCompleted + jobsFunded;
  const score = totalJobs > 0 ? Math.min(jobsCompleted * 15 + jobsFunded * 10, 100) : 0;

  function getRank(s: number, explicitTier?: string) {
    if (explicitTier === "Elite Master" || s >= 80)
      return {
        title: "Soroban Elite Master",
        tier: "Elite Master",
        color: "#fbbf24",
        next: 100,
      };
    if (explicitTier === "Diamond" || s >= 50)
      return {
        title: "Diamond Escrow Specialist",
        tier: "Diamond",
        color: "#a78bfa",
        next: 80,
      };
    if (explicitTier === "Gold" || s >= 25)
      return {
        title: "Gold Verified Builder",
        tier: "Gold",
        color: "#f59e0b",
        next: 50,
      };
    return {
      title: "Rising Contributor",
      tier: "Bronze",
      color: "#ea580c",
      next: 25,
    };
  }

  const rank = getRank(score, tier);
  const nextTarget = rank.next;
  const progressToNext = Math.min(100, Math.round((score / nextTarget) * 100));

  return (
    <div className="card card-gold" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px", flexWrap: "wrap" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--bg-tertiary)",
            border: `2px solid ${rank.color}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: rank.color, fontFamily: "var(--font-mono)" }}>
            {score}
          </span>
          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase" }}>XP</span>
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div
            className={`tier-badge ${
              rank.tier === "Elite Master" ? "tier-elite" : rank.tier === "Diamond" ? "tier-diamond" : "tier-gold"
            }`}
            style={{ marginBottom: "4px" }}
          >
            {rank.tier} &middot; Verified
          </div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "2px" }}>{rank.title}</h3>
          <div style={{ fontSize: "0.82rem", color: "var(--gold-light)", fontWeight: 700 }}>
            {rating} ★ <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({reviewCount} reviews)</span>
          </div>

          <div style={{ marginTop: "8px", width: "100%" }}>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressToNext}%`,
                  height: "100%",
                  background: rank.color,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "3px" }}>
              <span>Tier Progression</span>
              <span>{score}/{nextTarget} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {jobsCompleted}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Completed</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
            {totalEarned.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>XLM Earned</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
            {jobsFunded}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Funded</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
            {totalSpent.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>XLM Spent</div>
        </div>
      </div>
    </div>
  );
}
