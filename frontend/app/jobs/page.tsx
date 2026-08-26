"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { store, Job } from "@/lib/store";

type Filter = "all" | "open" | "progress" | "completed" | "disputed";
type SortOption = "newest" | "budget-desc" | "budget-asc" | "bids-desc";

const CATEGORIES = ["All", "Smart Contracts", "Frontend UI", "Security Audit", "DeFi", "Full-Stack"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    function load() {
      setJobs(store.getJobs());
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = jobs
    .filter((job) => {
      const matchesFilter = filter === "all" ? true : job.status === filter;
      const matchesSearch =
        searchTerm === "" ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || job.category === selectedCategory;

      return matchesFilter && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "budget-desc") return b.budget - a.budget;
      if (sortBy === "budget-asc") return a.budget - b.budget;
      if (sortBy === "bids-desc") return b.bidCount - a.bidCount;
      return b.id - a.id;
    });

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <span className="category-pill" style={{ marginBottom: "6px" }}>
            Soroban Escrow Protocol
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.3rem)", marginTop: "4px" }}>
            Browse Escrow <span className="gradient-gold-text">Jobs &amp; Projects</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Explore milestone-backed smart contract opportunities settled on Stellar.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/leaderboard" className="btn btn-secondary btn-sm">
            Talent Leaderboard
          </Link>
          <Link href="/jobs/new" className="btn btn-primary btn-sm" id="post-job-cta">
            Post Project
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: "16px", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, keyword, or client address…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="job-search-input"
            />
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Sort:</span>
            <select
              className="form-select"
              style={{ width: "auto", padding: "9px 12px", fontSize: "0.85rem" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">Newest First</option>
              <option value="budget-desc">Highest Budget</option>
              <option value="budget-asc">Lowest Budget</option>
              <option value="bids-desc">Most Proposals</option>
            </select>
          </div>
        </div>

        {/* Category & Status Row */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <div className="chips-scroll-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? "var(--gold)" : "var(--border)",
                  background: selectedCategory === cat ? "var(--gold-subtle)" : "var(--bg-tertiary)",
                  color: selectedCategory === cat ? "var(--gold-light)" : "var(--text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="chips-scroll-row">
            {(["all", "open", "progress", "completed", "disputed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: filter === f ? "var(--emerald)" : "var(--border)",
                  background: filter === f ? "var(--emerald-subtle)" : "transparent",
                  color: filter === f ? "var(--emerald-light)" : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {f === "all"
                  ? "All"
                  : f === "progress"
                  ? "In Escrow"
                  : f === "disputed"
                  ? "Disputed"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>No Escrow Jobs Match Filters</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "16px" }}>
            Try searching with different keywords or post a new project escrow.
          </p>
          <Link href="/jobs/new" className="btn btn-primary btn-sm">
            Post New Escrow
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
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
              category={job.category}
              deadline={job.deadline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
