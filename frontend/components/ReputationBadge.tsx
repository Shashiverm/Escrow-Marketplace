"use client";

interface ReputationBadgeProps {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
}

export function ReputationBadge({
  jobsCompleted,
  totalEarned,
  jobsFunded,
  totalSpent,
}: ReputationBadgeProps) {
  const totalJobs = jobsCompleted + jobsFunded;
  const score = totalJobs > 0 ? Math.min(jobsCompleted * 15 + jobsFunded * 10, 100) : 0;

  function getRank(s: number) {
    if (s >= 80) return { title: "Soroban Master", tier: "Diamond", emoji: "💎", color: "#22d3ee", bgGlow: "rgba(34, 211, 238, 0.15)", next: 100 };
    if (s >= 50) return { title: "Escrow Specialist", tier: "Gold", emoji: "🥇", color: "#f59e0b", bgGlow: "rgba(245, 158, 11, 0.15)", next: 80 };
    if (s >= 25) return { title: "Verified Contributor", tier: "Silver", emoji: "🥈", color: "#94a3b8", bgGlow: "rgba(148, 163, 184, 0.15)", next: 50 };
    return { title: "Rising Developer", tier: "Bronze", emoji: "🥉", color: "#cd7f32", bgGlow: "rgba(205, 127, 50, 0.15)", next: 25 };
  }

  const rank = getRank(score);
  const nextTarget = rank.next;
  const progressToNext = Math.min(100, Math.round((score / nextTarget) * 100));

  return (
    <div className="reputation-badge-card card hover-glow">
      <div className="reputation-badge-header">
        <div
          className="rank-shield"
          style={{
            borderColor: rank.color,
            boxShadow: `0 0 20px ${rank.bgGlow}`,
          }}
        >
          <span className="rank-emoji">{rank.emoji}</span>
          <span className="reputation-score-badge" style={{ color: rank.color }}>
            {score}
          </span>
        </div>

        <div className="rank-meta">
          <div className="tier-tag" style={{ color: rank.color, background: rank.bgGlow }}>
            {rank.tier} Tier &middot; On-Chain Verified
          </div>
          <h3 className="rank-title">{rank.title}</h3>
          
          <div className="rank-progress-wrapper">
            <div className="rank-progress-bar">
              <div
                className="rank-progress-fill"
                style={{ width: `${progressToNext}%`, background: rank.color }}
              />
            </div>
            <span className="rank-progress-text">
              {score}/{nextTarget} Rep Score
            </span>
          </div>
        </div>
      </div>

      <div className="reputation-details-grid">
        <div className="rep-stat-box">
          <span className="rep-stat-value">{jobsCompleted}</span>
          <span className="rep-stat-label">Jobs Completed</span>
        </div>
        <div className="rep-stat-box">
          <span className="rep-stat-value highlight-cyan">
            {totalEarned.toLocaleString()} <small>XLM</small>
          </span>
          <span className="rep-stat-label">Total Earned</span>
        </div>
        <div className="rep-stat-box">
          <span className="rep-stat-value">{jobsFunded}</span>
          <span className="rep-stat-label">Jobs Funded</span>
        </div>
        <div className="rep-stat-box">
          <span className="rep-stat-value highlight-purple">
            {totalSpent.toLocaleString()} <small>XLM</small>
          </span>
          <span className="rep-stat-label">Total Escrow Spent</span>
        </div>
      </div>
    </div>
  );
}
