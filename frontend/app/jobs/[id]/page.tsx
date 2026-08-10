"use client";

import { MilestoneTracker } from "@/components/MilestoneTracker";
import { BidForm } from "@/components/BidForm";
import { EventFeed } from "@/components/EventFeed";

/** Mock job detail — replace with contract read in production */
const MOCK_JOB = {
  id: 1,
  title: "DeFi Dashboard Frontend",
  description:
    "Build a responsive Next.js dashboard for monitoring DeFi positions on Stellar. The dashboard should include real-time charts showing token balances, liquidity pool positions, and transaction history. Must integrate Freighter wallet for authentication and transaction signing. The UI should be premium quality with dark mode, glassmorphism design, and smooth animations.",
  budget: 12000,
  milestoneCount: 4,
  milestonesApproved: 2,
  milestonesReleased: 2,
  status: "progress" as "open" | "progress" | "completed" | "cancelled",
  client: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
  freelancer: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
  bids: [
    {
      freelancer: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
      amount: 11500,
      proposal:
        "Senior frontend developer with 6 years of React/Next.js experience. Built 3 DeFi dashboards previously. Can deliver in 4 weeks.",
    },
    {
      freelancer: "GHIJKL567890ABCDEF1234567890ABCDEF12345678",
      amount: 12000,
      proposal:
        "Full-stack dev specializing in blockchain dashboards. Strong Stellar ecosystem knowledge.",
    },
    {
      freelancer: "GMNOPQ890ABCDEF1234567890ABCDEF1234567890AB",
      amount: 10800,
      proposal:
        "UI/UX designer and React developer. Portfolio includes award-winning crypto interfaces.",
    },
  ],
};

const STATUS_MAP = {
  open: { label: "Open", className: "badge-open" },
  progress: { label: "In Progress", className: "badge-progress" },
  completed: { label: "Completed", className: "badge-completed" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

export default function JobDetailPage() {
  const job = MOCK_JOB;
  const statusInfo = STATUS_MAP[job.status];
  const perMilestone = Math.floor(job.budget / job.milestoneCount);

  return (
    <div className="container">
      {/* ── Page Header ──────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{job.title}</h1>
          <div
            className="job-meta"
            style={{ marginTop: "8px", fontSize: "0.9rem" }}
          >
            <span className={`badge ${statusInfo.className}`}>
              <span className="badge-dot" />
              {statusInfo.label}
            </span>
            <span style={{ color: "var(--text-muted)" }}>
              Client: {truncate(job.client)}
            </span>
          </div>
        </div>
        <div className="job-budget" style={{ fontSize: "1.8rem" }}>
          {job.budget.toLocaleString()} XLM
        </div>
      </div>

      {/* ── Detail Grid ──────────────────── */}
      <div className="detail-grid">
        {/* ── Main Column ─────────────────── */}
        <div className="detail-main">
          {/* Description */}
          <div className="card">
            <div className="detail-label">Description</div>
            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                position: "relative",
              }}
            >
              {job.description}
            </p>
          </div>

          {/* Milestone Tracker */}
          <div className="card">
            <div className="detail-label">Milestone Progress</div>
            <MilestoneTracker
              total={job.milestoneCount}
              approved={job.milestonesApproved}
              released={job.milestonesReleased}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>
                {job.milestonesReleased}/{job.milestoneCount} milestones released
              </span>
              <span>{perMilestone.toLocaleString()} XLM per milestone</span>
            </div>

            {job.status === "progress" && (
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "16px" }}
                id="approve-milestone-btn"
              >
                Approve Next Milestone
              </button>
            )}
          </div>

          {/* Bids */}
          <div className="card">
            <div className="detail-label">
              Bids ({job.bids.length})
            </div>
            <div className="bid-list">
              {job.bids.map((bid, i) => (
                <div key={i} className="bid-item">
                  <div className="bid-info">
                    <span className="bid-address">
                      {truncate(bid.freelancer)}
                      {bid.freelancer === job.freelancer && (
                        <span
                          className="badge badge-completed"
                          style={{ marginLeft: "8px" }}
                        >
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="bid-proposal">{bid.proposal}</span>
                  </div>
                  <span className="bid-amount">
                    {bid.amount.toLocaleString()} XLM
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bid Form (only for open jobs) */}
          {job.status === "open" && (
            <div className="card">
              <div className="detail-label">Place Your Bid</div>
              <BidForm jobId={job.id} jobBudget={job.budget} />
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────── */}
        <div className="detail-sidebar">
          {/* Job Info */}
          <div className="card">
            <div className="detail-label">Job Details</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Budget</span>
                <span style={{ fontWeight: 600 }}>
                  {job.budget.toLocaleString()} XLM
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Milestones</span>
                <span style={{ fontWeight: 600 }}>{job.milestoneCount}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Per Milestone</span>
                <span style={{ fontWeight: 600 }}>
                  {perMilestone.toLocaleString()} XLM
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Bids</span>
                <span style={{ fontWeight: 600 }}>{job.bids.length}</span>
              </div>
              {job.freelancer && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>Freelancer</span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.82rem",
                    }}
                  >
                    {truncate(job.freelancer)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Event Feed */}
          <EventFeed />
        </div>
      </div>
    </div>
  );
}
