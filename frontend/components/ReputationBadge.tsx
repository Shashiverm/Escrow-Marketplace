"use client";

interface ReputationBadgeProps {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
}

/**
 * Display reputation score and stats for a user.
 */
export function ReputationBadge({
  jobsCompleted,
  totalEarned,
  jobsFunded,
  totalSpent,
}: ReputationBadgeProps) {
  // Composite score: completed jobs weighted more heavily
  const totalJobs = jobsCompleted + jobsFunded;
  const score = totalJobs > 0 ? Math.min(totalJobs * 10, 100) : 0;

  return (
    <div className="reputation-badge card">
      <div>
        <div className="reputation-score">{score}</div>
        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginTop: "4px",
          }}
        >
          Reputation Score
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
