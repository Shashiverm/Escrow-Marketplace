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
        emoji: "👑",
        color: "#fbbf24",
        bgGlow: "rgba(245, 158, 11, 0.25)",
        next: 100,
      };
    if (explicitTier === "Diamond" || s >= 50)
      return {
        title: "Diamond Escrow Specialist",
        tier: "Diamond",
        emoji: "💎",
        color: "#c084fc",
        bgGlow: "rgba(168, 85, 247, 0.2)",
        next: 80,
      };
    if (explicitTier === "Gold" || s >= 25)
      return {
        title: "Gold Verified Builder",
        tier: "Gold",
        emoji: "🥇",
        color: "#f59e0b",
        bgGlow: "rgba(245, 158, 11, 0.15)",
        next: 50,
      };
    return {
      title: "Rising Contributor",
      tier: "Bronze",
      emoji: "🥉",
      color: "#ea580c",
      bgGlow: "rgba(234, 88, 12, 0.15)",
      next: 25,
    };
  }

  const rank = getRank(score, tier);
  const nextTarget = rank.next;
  const progressToNext = Math.min(100, Math.round((score / nextTarget) * 100));

  return (
    <div className="card card-gold" style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "var(--bg-tertiary)",
            border: `2px solid ${rank.color}`,
            boxShadow: `0 0 24px ${rank.bgGlow}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: "1.4rem" }}>{rank.emoji}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: rank.color, fontFamily: "var(--font-mono)" }}>
            {score}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div
            className={`tier-badge ${
              rank.tier === "Elite Master" ? "tier-elite" : rank.tier === "Diamond" ? "tier-diamond" : "tier-gold"
            }`}
            style={{ marginBottom: "6px" }}
          >
            {rank.tier} Tier · On-Chain Verified
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "4px" }}>{rank.title}</h3>
          <div style={{ fontSize: "0.85rem", color: "var(--gold-light)", fontWeight: 700 }}>
            {rating} ★ <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({reviewCount} reviews)</span>
          </div>

          <div style={{ marginTop: "10px", width: "100%" }}>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressToNext}%`,
                  height: "100%",
                  background: rank.color,
                  boxShadow: `0 0 10px ${rank.color}`,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>Level Progress</span>
              <span>{score}/{nextTarget} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", background: "var(--bg-tertiary)", padding: "14px", borderRadius: "var(--radius-md)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {jobsCompleted}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Completed</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--gold-light)" }}>
            {totalEarned.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>XLM Earned</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>
            {jobsFunded}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Funded</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--violet-light)" }}>
            {totalSpent.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>XLM Spent</div>
        </div>
      </div>
    </div>
  );
}
