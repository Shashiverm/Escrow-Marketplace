"use client";

import Link from "next/link";

interface JobCardProps {
  id: number;
  title: string;
  description: string;
  budget: number;
  milestones: number;
  status: "open" | "progress" | "completed" | "cancelled" | "disputed";
  bidCount: number;
  client: string;
  category?: string;
  deadline?: string;
}

const STATUS_MAP = {
  open: { label: "Open for Bids", color: "var(--emerald-light)", bg: "var(--success-bg)", border: "var(--border-emerald)" },
  progress: { label: "In Escrow", color: "var(--gold-light)", bg: "var(--gold-subtle)", border: "var(--border-gold)" },
  completed: { label: "Settled & Verified", color: "var(--violet-light)", bg: "var(--violet-subtle)", border: "rgba(168, 85, 247, 0.3)" },
  disputed: { label: "In Arbitration", color: "var(--dispute)", bg: "var(--dispute-bg)", border: "rgba(244, 63, 94, 0.4)" },
  cancelled: { label: "Refunded", color: "var(--text-muted)", bg: "rgba(255, 255, 255, 0.05)", border: "var(--border)" },
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
  category = "Smart Contracts",
  deadline,
}: JobCardProps) {
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.open;

  function truncateAddress(addr: string) {
    if (!addr) return "G...";
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  return (
    <Link href={`/jobs/${id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="card job-card" id={`job-card-${id}`}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
            <span className="category-pill">{category}</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: statusInfo.color,
                background: statusInfo.bg,
                border: `1px solid ${statusInfo.border}`,
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusInfo.color }} />
              {statusInfo.label}
            </span>
          </div>

          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", lineHeight: "1.3" }}>
            {title}
          </h3>

          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {description}
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "18px" }}>
            <span>🎯 {milestones} Milestone{milestones > 1 ? "s" : ""}</span>
            <span>💬 {bidCount} Bid{bidCount !== 1 ? "s" : ""}</span>
            {deadline && <span>⏱️ Deadline: {deadline}</span>}
            <span title={client}>👤 {truncateAddress(client)}</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
              Escrow Payout
            </span>
            <span className="job-budget-badge">
              {budget.toLocaleString()} <small style={{ fontSize: "0.85rem", color: "var(--gold)" }}>XLM</small>
            </span>
          </div>

          <span className="btn btn-outline-gold" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
            View Escrow &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
