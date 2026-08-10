"use client";

import { ReputationBadge } from "@/components/ReputationBadge";

/** Mock profile data — replace with wallet + contract reads */
const MOCK_PROFILE = {
  address: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
  reputation: {
    jobsCompleted: 7,
    totalEarned: 42500,
    jobsFunded: 3,
    totalSpent: 25000,
  },
  recentJobs: [
    {
      id: 1,
      title: "DeFi Dashboard Frontend",
      role: "Freelancer",
      amount: 12000,
      status: "progress",
    },
    {
      id: 4,
      title: "Payment Gateway Integration",
      role: "Freelancer",
      amount: 8000,
      status: "completed",
    },
    {
      id: 2,
      title: "Cross-Chain Bridge Protocol",
      role: "Client",
      amount: 25000,
      status: "open",
    },
  ],
};

const STATUS_CLASS: Record<string, string> = {
  open: "badge-open",
  progress: "badge-progress",
  completed: "badge-completed",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  progress: "In Progress",
  completed: "Completed",
};

export default function ProfilePage() {
  const profile = MOCK_PROFILE;

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      {/* ── Wallet Info ────────────────────── */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="detail-label">Connected Wallet</div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.95rem",
            wordBreak: "break-all",
            color: "var(--text-secondary)",
            position: "relative",
          }}
        >
          {profile.address}
        </div>
      </div>

      {/* ── Reputation ─────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <div className="detail-label" style={{ marginBottom: "12px" }}>
          Reputation
        </div>
        <ReputationBadge {...profile.reputation} />
      </div>

      {/* ── Recent Activity ────────────────── */}
      <div className="card">
        <div className="detail-label">Recent Activity</div>
        <div className="bid-list" style={{ marginTop: "12px" }}>
          {profile.recentJobs.map((job) => (
            <div key={job.id} className="bid-item">
              <div className="bid-info">
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {job.title}
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  <span
                    className={`badge ${STATUS_CLASS[job.status]}`}
                  >
                    <span className="badge-dot" />
                    {STATUS_LABEL[job.status]}
                  </span>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.82rem",
                    }}
                  >
                    as {job.role}
                  </span>
                </div>
              </div>
              <span className="bid-amount">
                {job.amount.toLocaleString()} XLM
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
