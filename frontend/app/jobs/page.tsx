"use client";

import { useState } from "react";
import { JobCard } from "@/components/JobCard";

/** Mock job data — replace with contract reads in production */
const MOCK_JOBS = [
  {
    id: 0,
    title: "Smart Contract Security Audit",
    description:
      "Need a thorough security audit of three Soroban smart contracts (escrow, registry, reputation). Must identify vulnerabilities, suggest fixes, and provide a detailed report.",
    budget: 5000,
    milestones: 2,
    status: "open" as const,
    bidCount: 3,
    client: "GBCDEF1234567890ABCDEF1234567890ABCDEF123456",
  },
  {
    id: 1,
    title: "DeFi Dashboard Frontend",
    description:
      "Build a responsive Next.js dashboard for monitoring DeFi positions on Stellar. Includes real-time charts, portfolio tracking, and wallet integration with Freighter.",
    budget: 12000,
    milestones: 4,
    status: "progress" as const,
    bidCount: 7,
    client: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
  },
  {
    id: 2,
    title: "Cross-Chain Bridge Protocol",
    description:
      "Design and implement a bridge protocol between Stellar and Ethereum for transferring wrapped assets. Requires deep knowledge of both ecosystems.",
    budget: 25000,
    milestones: 6,
    status: "open" as const,
    bidCount: 2,
    client: "GHIJ890ABCDEF1234567890ABCDEF1234567890ABCD",
  },
  {
    id: 3,
    title: "NFT Marketplace on Soroban",
    description:
      "Create a full-featured NFT marketplace with minting, listing, bidding, and royalty distribution using Soroban smart contracts.",
    budget: 18000,
    milestones: 5,
    status: "open" as const,
    bidCount: 5,
    client: "GKLM234567890ABCDEF1234567890ABCDEF12345678",
  },
  {
    id: 4,
    title: "Payment Gateway Integration",
    description:
      "Integrate Stellar payments into an existing e-commerce platform. Support XLM and USDC with automatic conversion and settlement.",
    budget: 8000,
    milestones: 3,
    status: "completed" as const,
    bidCount: 4,
    client: "GNOP567890ABCDEF1234567890ABCDEF1234567890AB",
  },
  {
    id: 5,
    title: "Mobile Wallet App (React Native)",
    description:
      "Develop a mobile wallet application using React Native with support for Stellar accounts, token management, and QR code payments.",
    budget: 15000,
    milestones: 4,
    status: "progress" as const,
    bidCount: 6,
    client: "GQRS890ABCDEF1234567890ABCDEF1234567890ABCD",
  },
];

type Filter = "all" | "open" | "progress" | "completed";

export default function JobsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? MOCK_JOBS
      : MOCK_JOBS.filter((j) => j.status === filter);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Browse Jobs</h1>
        <div className="filter-bar">
          {(["all", "open", "progress", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
              id={`filter-${f}`}
            >
              {f === "all"
                ? "All"
                : f === "progress"
                ? "In Progress"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No jobs found</h3>
          <p>Try a different filter or post a new job.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      )}
    </div>
  );
}
