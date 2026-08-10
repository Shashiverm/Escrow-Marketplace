"use client";

import Link from "next/link";

interface JobCardProps {
  id: number;
  title: string;
  description: string;
  budget: number;
  milestones: number;
  status: "open" | "progress" | "completed" | "cancelled";
  bidCount: number;
  client: string;
}

const STATUS_MAP = {
  open: { label: "Open", className: "badge-open" },
  progress: { label: "In Progress", className: "badge-progress" },
  completed: { label: "Completed", className: "badge-completed" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

export function JobCard({
  id,
  title,
  description,
  budget,
  milestones,
  status,
  bidCount,
  client,
}: JobCardProps) {
  const statusInfo = STATUS_MAP[status];

  return (
    <Link href={`/jobs/${id}`} style={{ textDecoration: "none" }}>
      <div className="card job-card" id={`job-card-${id}`}>
        <div className="card-header">
          <div className="card-title">{title}</div>
          <span className={`badge ${statusInfo.className}`}>
            <span className="badge-dot" />
            {statusInfo.label}
          </span>
        </div>

        <div className="card-body">
          <p className="job-description">{description}</p>
          <div className="job-meta">
            <span>🎯 {milestones} milestones</span>
            <span>💬 {bidCount} bids</span>
            <span title={client}>
              👤 {client.slice(0, 4)}…{client.slice(-4)}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <span className="job-budget">{budget.toLocaleString()} XLM</span>
          <span className="btn btn-secondary btn-sm">View Details →</span>
        </div>
      </div>
    </Link>
  );
}
