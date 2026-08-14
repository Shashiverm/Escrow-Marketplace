"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { store, Job } from "@/lib/store";
import Link from "next/link";

type Filter = "all" | "open" | "progress" | "completed";
type SortOption = "newest" | "budget-desc" | "budget-asc" | "bids-desc";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    function load() {
      setJobs(store.getJobs());
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "Smart Contracts", label: "Soroban Smart Contracts" },
    { value: "Frontend", label: "Web3 Frontend & DApps" },
    { value: "Security Audit", label: "Contract Security & Auditing" },
    { value: "Rust / Soroban", label: "Rust & Soroban SDK" },
  ];

  const filtered = jobs
    .filter((job) => {
      const matchesFilter = filter === "all" ? true : job.status === filter;
      const matchesSearch =
        searchTerm === "" ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "all" ||
        (job.title + " " + job.description).toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesFilter && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "budget-desc") return b.budget - a.budget;
      if (sortBy === "budget-asc") return a.budget - b.budget;
      if (sortBy === "bids-desc") return b.bidCount - a.bidCount;
      return b.id - a.id; // Newest first
    });

  return (
    <div className="container">
      <div className="page-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="category-tag">Escrow Protocol</span>
            <h1 className="page-title" style={{ marginTop: "4px" }}>Browse Escrow Jobs</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "2px" }}>
              Explore milestone-backed smart contract opportunities settled on Stellar.
            </p>
          </div>
          <Link href="/jobs/new" className="btn btn-primary btn-lg" id="post-job-cta">
            ➕ Post New Project
          </Link>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="filter-bar" style={{ width: "100%" }}>
          <div className="search-input-wrapper">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs by title, keyword, or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="job-search-input"
            />
          </div>

          <div className="filter-tabs">
            {(["all", "open", "progress", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
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

          <select
            className="category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="category-filter-select"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            className="category-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            id="sort-by-select"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="budget-desc">Sort: Budget (High to Low)</option>
            <option value="budget-asc">Sort: Budget (Low to High)</option>
            <option value="bids-desc">Sort: Most Bids</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of {jobs.length} total escrow contracts
        </span>
        <span className="network-pill" style={{ fontSize: "0.75rem" }}>
          ⚡ 5-Second Settlement
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card hover-glow" style={{ padding: "60px 24px", textAlign: "center" }}>
          <div className="empty-state-icon" style={{ fontSize: "3rem", marginBottom: "16px" }}>
            🔍
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>No matching escrow jobs found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", marginBottom: "24px", maxWidth: "450px", margin: "8px auto 24px auto" }}>
            We couldn't find any projects matching your current filters. Try clearing your search term or select a different status.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
                setSelectedCategory("all");
              }}
            >
              Reset Filters
            </button>
            <Link href="/jobs/new" className="btn btn-primary" id="empty-state-post-btn">
              Post a New Project
            </Link>
          </div>
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
