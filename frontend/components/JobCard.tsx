"use client";

import React from "react";
import Link from "next/link";
import { truncateAddress } from "@/lib/stellar";

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
  open: { label: "Open for Bids", color: "var(--emerald-light)", bg: "var(--emerald-subtle)", border: "var(--border-emerald)" },
  progress: { label: "In Escrow", color: "var(--gold-light)", bg: "var(--gold-subtle)", border: "var(--border-gold)" },
  completed: { label: "Settled", color: "var(--violet-light)", bg: "var(--violet-subtle)", border: "rgba(139, 92, 246, 0.3)" },
  disputed: { label: "Disputed", color: "var(--dispute)", bg: "var(--dispute-bg)", border: "var(--dispute-border)" },
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

  return (
    <Link href={`/jobs/${id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="card job-card" id={`job-card-${id}`}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span className="category-pill">{category}</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: statusInfo.color,
                background: statusInfo.bg,
                border: `1px solid ${statusInfo.border}`,
              }}
            >
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusInfo.color }} />
              {statusInfo.label}
            </span>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", lineHeight: "1.35" }}>
            {title}
          </h3>

          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {description}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            <span>{milestones} Milestone{milestones > 1 ? "s" : ""}</span>
            <span>&middot;</span>
            <span>{bidCount} Bid{bidCount !== 1 ? "s" : ""}</span>
            {deadline && (
              <>
                <span>&middot;</span>
                <span>Due: {deadline}</span>
              </>
            )}
            <span>&middot;</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>Client: {truncateAddress(client, 4)}</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", letterSpacing: "0.04em", fontWeight: 700 }}>
              Escrow Value
            </span>
            <span className="job-budget-badge">
              {budget.toLocaleString()} <small style={{ fontSize: "0.8rem", color: "var(--gold)", fontWeight: 700 }}>XLM</small>
            </span>
          </div>

          <span className="btn btn-outline-gold btn-sm">
            Inspect Escrow &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
