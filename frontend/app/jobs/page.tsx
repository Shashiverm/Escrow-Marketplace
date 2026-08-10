"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { store, Job } from "@/lib/store";
import Link from "next/link";

type Filter = "all" | "open" | "progress" | "completed";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    function load() {
      setJobs(store.getJobs());
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = jobs.filter((job) => {
    const matchesFilter = filter === "all" ? true : job.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container">
      <div className="page-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Browse Escrow Jobs</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "4px" }}>
              Milestone-funded smart contract positions on Stellar Soroban
            </p>
          </div>
          <Link href="/jobs/new" className="btn btn-primary" id="post-job-cta">
            + Post New Job
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div className="filter-bar">
            {(["all", "open", "progress", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                id={`filter-${f}`}
              >
                {f === "all"
                  ? "All Jobs"
                  : f === "progress"
                  ? "In Progress"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search jobs by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px", padding: "8px 14px", fontSize: "0.88rem" }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div className="empty-state-icon" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
            🔍
          </div>
          <h3>No matching jobs found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px", marginBottom: "20px" }}>
            Try adjusting your search query or status filter.
          </p>
          <Link href="/jobs/new" className="btn btn-secondary" id="empty-state-post-btn">
            Post a New Job
          </Link>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              description={job.description}
              budget={job.budget}
              milestones={job.milestoneCount}
              status={job.status}
              bidCount={job.bidCount}
              client={job.client}
            />
          ))}
        </div>
      )}
    </div>
  );
}
