"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "60px 0 30px", marginTop: "80px" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "36px", marginBottom: "40px" }}>
        <div>
          <Logo size="md" clickable={true} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "16px", lineHeight: "1.6" }}>
            Next-generation decentralized freelance marketplace powered by Stellar Soroban smart contracts. Milestone escrow, non-custodial trust, and instant settlements.
          </p>
          <div className="network-pill" style={{ marginTop: "16px" }}>
            <span className="network-dot pulse-gold" />
            <span>Soroban Testnet · Live</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "0.92rem", textTransform: "uppercase", color: "var(--gold-light)", marginBottom: "16px", letterSpacing: "0.05em" }}>
            Platform
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <li>
              <Link href="/jobs">Browse Jobs</Link>
            </li>
            <li>
              <Link href="/leaderboard">🏆 Talent Leaderboard</Link>
            </li>
            <li>
              <Link href="/jobs/new">Post a Project</Link>
            </li>
            <li>
              <Link href="/profile">My Profile &amp; Reputation</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "0.92rem", textTransform: "uppercase", color: "var(--gold-light)", marginBottom: "16px", letterSpacing: "0.05em" }}>
            Legal &amp; Policies
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms &amp; Conditions</Link>
            </li>
            <li>
              <Link href="/dispute-policy">⚖️ Dispute &amp; Arbitration</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "0.92rem", textTransform: "uppercase", color: "var(--gold-light)", marginBottom: "16px", letterSpacing: "0.05em" }}>
            Ecosystem &amp; Docs
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <li>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
                Stellar Network ↗
              </a>
            </li>
            <li>
              <a href="https://developers.stellar.org/docs/build/smart-contracts/overview" target="_blank" rel="noopener noreferrer">
                Soroban Docs ↗
              </a>
            </li>
            <li>
              <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">
                Freighter Wallet ↗
              </a>
            </li>
            <li>
              <a href="https://stellar.expert" target="_blank" rel="noopener noreferrer">
                StellarExpert Explorer ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <p>&copy; {new Date().getFullYear()} StellarEscrow Protocol. Non-Custodial &amp; Open Source.</p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ color: "var(--gold-light)" }}>⚡ Sub-5s Settlement</span>
          <span style={{ color: "var(--emerald-light)" }}>🔒 Non-Custodial Smart Contracts</span>
        </div>
      </div>
    </footer>
  );
}
