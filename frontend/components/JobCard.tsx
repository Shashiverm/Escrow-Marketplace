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
  category?: string;
  tags?: string[];
}

const STATUS_MAP = {
  open: { label: "Open for Bids", className: "badge-open" },
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
  category = "Soroban Smart Contract",
  tags = ["Stellar", "Escrow", "Rust"],
}: JobCardProps) {
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.open;

  function truncateAddress(addr: string) {
    if (!addr) return "G...";
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  return (
    <Link href={`/jobs/${id}`} style={{ textDecoration: "none" }}>
      <div className="card job-card hover-glow" id={`job-card-${id}`}>
        <div className="card-header">
          <div className="job-card-top-left">
            <span className="category-tag">{category}</span>
            <div className="card-title">{title}</div>
          </div>
          <span className={`badge ${statusInfo.className}`}>
            <span className="badge-dot" />
            {statusInfo.label}
          </span>
        </div>

        <div className="card-body">
          <p className="job-description">{description}</p>
          
          <div className="job-tags-list">
            {tags.map((t) => (
              <span key={t} className="job-tag-pill">
                #{t}
              </span>
            ))}
          </div>

          <div className="job-meta">
            <span className="meta-item">
              <span className="meta-icon">🎯</span> {milestones} Milestone{milestones > 1 ? "s" : ""}
            </span>
            <span className="meta-item">
              <span className="meta-icon">💬</span> {bidCount} Bid{bidCount !== 1 ? "s" : ""}
            </span>
            <span className="meta-item client-address" title={`Client: ${client}`}>
              <span className="meta-icon">👤</span> {truncateAddress(client)}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <div className="job-budget-wrapper">
            <span className="budget-label">Escrow Budget</span>
            <span className="job-budget">{budget.toLocaleString()} <span className="currency-unit">XLM</span></span>
          </div>
          <span className="btn btn-secondary btn-sm card-action-btn">
            View Contract &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
