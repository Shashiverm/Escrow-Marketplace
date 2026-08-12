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
    if (s >= 80) return { title: "Diamond Master", emoji: "💎", color: "#22d3ee" };
    if (s >= 50) return { title: "Gold Specialist", emoji: "🥇", color: "#f59e0b" };
    if (s >= 25) return { title: "Silver Freelancer", emoji: "🥈", color: "#94a3b8" };
    return { title: "Bronze Contributor", emoji: "🥉", color: "#cd7f32" };
  }

  const rank = getRank(score);

  return (
    <div className="reputation-badge card">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="reputation-score">{score}</div>
          <span style={{ fontSize: "1.5rem" }}>{rank.emoji}</span>
        </div>
        <div
          style={{
            fontSize: "0.85rem",
            color: rank.color,
            fontWeight: 600,
            marginTop: "4px",
          }}
        >
          {rank.title}
        </div>
      </div>

      <div className="reputation-details">
        <div className="reputation-stat">
          <span className="reputation-stat-value">{jobsCompleted}</span>
          <span className="reputation-stat-label">Jobs Completed</span>
        </div>
        <div className="reputation-stat">
          <span className="reputation-stat-value">
            {totalEarned.toLocaleString()} XLM
          </span>
          <span className="reputation-stat-label">Total Earned</span>
        </div>
        <div className="reputation-stat">
          <span className="reputation-stat-value">{jobsFunded}</span>
          <span className="reputation-stat-label">Jobs Funded</span>
        </div>
        <div className="reputation-stat">
          <span className="reputation-stat-value">
            {totalSpent.toLocaleString()} XLM
          </span>
          <span className="reputation-stat-label">Total Spent</span>
        </div>
      </div>
    </div>
  );
}
