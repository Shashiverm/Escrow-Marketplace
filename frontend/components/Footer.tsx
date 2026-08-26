"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "48px 0 24px", marginTop: "60px" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "28px", marginBottom: "32px" }}>
        <div>
          <Logo size="md" clickable={true} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "12px", lineHeight: "1.55" }}>
            Decentralized freelance escrow marketplace powered by Stellar Soroban smart contracts. Milestone escrow, non-custodial custody, and sub-5-second settlements.
          </p>
          <div className="network-pill" style={{ marginTop: "12px" }}>
            <span className="network-dot pulse-gold" />
            <span>Soroban Testnet &middot; Active</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "var(--gold-light)", marginBottom: "12px", letterSpacing: "0.05em", fontWeight: 700 }}>
            Marketplace
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <li>
              <Link href="/jobs" style={{ color: "var(--text-secondary)" }}>Browse Escrows</Link>
            </li>
            <li>
              <Link href="/leaderboard" style={{ color: "var(--text-secondary)" }}>Talent Leaderboard</Link>
            </li>
            <li>
              <Link href="/jobs/new" style={{ color: "var(--text-secondary)" }}>Post a Project</Link>
            </li>
            <li>
              <Link href="/profile" style={{ color: "var(--text-secondary)" }}>Developer Profile</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "var(--gold-light)", marginBottom: "12px", letterSpacing: "0.05em", fontWeight: 700 }}>
            Governance &amp; Policy
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <li>
              <Link href="/dispute-policy" style={{ color: "var(--text-secondary)" }}>Arbitration Policy</Link>
            </li>
            <li>
              <Link href="/terms" style={{ color: "var(--text-secondary)" }}>Terms of Service</Link>
            </li>
            <li>
              <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "var(--gold-light)", marginBottom: "12px", letterSpacing: "0.05em", fontWeight: 700 }}>
            Stellar Ecosystem
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <li>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                Stellar Network ↗
              </a>
            </li>
            <li>
              <a href="https://developers.stellar.org/docs/build/smart-contracts/overview" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                Soroban Smart Contracts ↗
              </a>
            </li>
            <li>
              <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                Freighter Wallet ↗
              </a>
            </li>
            <li>
              <a href="https://stellar.expert" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
                StellarExpert Ledger ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <p>&copy; {new Date().getFullYear()} StellarEscrow Protocol. Open-Source &amp; Non-Custodial.</p>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <span>Sub-5s Ledger Settlement</span>
          <span>&middot;</span>
          <span>Immutable Reputation</span>
        </div>
      </div>
    </footer>
  );
}
