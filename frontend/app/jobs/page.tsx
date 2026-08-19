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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
        <div>
          <span className="category-pill" style={{ marginBottom: "8px" }}>
            Soroban Escrow Protocol
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", marginTop: "4px" }}>
            Browse Escrow <span className="gradient-gold-text">Jobs &amp; Projects</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Explore milestone-backed smart contract opportunities settled on Stellar.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/leaderboard" className="btn btn-secondary">
            🏆 View Top Talent
          </Link>
          <Link href="/jobs/new" className="btn btn-primary" id="post-job-cta">
            ➕ Post a Project
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: "20px", marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search jobs by title, keyword, or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="job-search-input"
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Sort:</span>
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">Newest First</option>
              <option value="budget-desc">Highest Budget</option>
              <option value="budget-asc">Lowest Budget</option>
              <option value="bids-desc">Most Bids</option>
            </select>
          </div>
        </div>

        {/* Category & Status Row */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? "var(--gold)" : "var(--border)",
                  background: selectedCategory === cat ? "var(--gold-subtle)" : "var(--bg-glass)",
                  color: selectedCategory === cat ? "var(--gold-light)" : "var(--text-secondary)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["all", "open", "progress", "completed", "disputed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: filter === f ? "var(--emerald)" : "var(--border)",
                  background: filter === f ? "var(--emerald-subtle)" : "transparent",
                  color: filter === f ? "var(--emerald-light)" : "var(--text-muted)",
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
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <h3>No Escrow Jobs Match Filters</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            Try searching with different keywords or post a new job.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
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
