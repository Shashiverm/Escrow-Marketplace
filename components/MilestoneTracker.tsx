"use client";

interface MilestoneTrackerProps {
  total: number;
  approved: number;
  released: number;
}

/**
 * Visual milestone progress indicator.
 * Shows a horizontal step tracker with colored dots and connecting lines.
 */
export function MilestoneTracker({
  total,
  approved,
  released,
}: MilestoneTrackerProps) {
  return (
    <div className="milestone-tracker">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = i < released;
        const isActive = i === released && i < approved;
        const status = isCompleted
          ? "completed"
          : isActive
          ? "active"
          : "pending";

        return (
          <div key={i} className={`milestone-step ${status}`}>
            {/* Connecting line (not on last step) */}
            {i < total - 1 && (
              <div
                className={`milestone-line ${isCompleted ? "filled" : ""}`}
              />
            )}

            <div className={`milestone-dot ${status}`}>
              {isCompleted ? "✓" : stepNum}
            </div>

            <span className="milestone-label">
              {isCompleted
                ? "Paid"
                : isActive
                ? "Approved"
                : `M${stepNum}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
