"use client";

interface MilestoneTrackerProps {
  total: number;
  approved: number;
  released: number;
  amounts?: number[];
}

export function MilestoneTracker({
  total,
  approved,
  released,
  amounts = [],
}: MilestoneTrackerProps) {
  const percentComplete = Math.round((released / (total || 1)) * 100);

  return (
    <div className="milestone-tracker-card">
      <div className="milestone-header-row">
        <div>
          <h4 className="tracker-title">Milestone Progress</h4>
          <p className="tracker-subtitle">
            {released} of {total} Milestones Released &middot; {percentComplete}% Escrow Disbursed
          </p>
        </div>
        <div className="progress-percentage-badge">
          {percentComplete}%
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="milestone-progress-bar-container">
        <div
          className="milestone-progress-bar-fill"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Interactive Step Nodes */}
      <div className="milestone-tracker">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = i < released;
          const isActive = i === released && i < approved;
          const isPending = !isCompleted && !isActive;

          const statusClass = isCompleted
            ? "completed"
            : isActive
            ? "active"
            : "pending";

          const amountText = amounts[i] ? `${amounts[i].toLocaleString()} XLM` : "";

          return (
            <div key={i} className={`milestone-step ${statusClass}`}>
              {/* Connecting line (not on last step) */}
              {i < total - 1 && (
                <div
                  className={`milestone-line ${isCompleted ? "filled" : ""}`}
                />
              )}

              <div className={`milestone-dot ${statusClass}`}>
                {isCompleted ? "✓" : stepNum}
              </div>

              <div className="milestone-info">
                <span className="milestone-label">
                  {isCompleted
                    ? "Released"
                    : isActive
                    ? "Under Review"
                    : `Milestone ${stepNum}`}
                </span>
                {amountText && <span className="milestone-amount">{amountText}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
