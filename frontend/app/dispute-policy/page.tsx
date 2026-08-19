import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dispute Resolution & Arbitration Policy",
  description: "Guidelines, smart contract arbitration procedures, and milestone dispute rules for StellarEscrow.",
};

export default function DisputePolicyPage() {
  return (
    <div className="container" style={{ maxWidth: "880px" }}>
      <div style={{ marginBottom: "36px" }}>
        <span className="category-pill" style={{ marginBottom: "8px" }}>
          Legal &amp; Compliance
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)", marginTop: "4px" }}>
          Dispute &amp; <span className="gradient-gold-text">Arbitration Policy</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Last Updated: August 2026 · Smart Contract Specification V3.2.0
        </p>
      </div>

      <div className="card" style={{ padding: "clamp(24px, 4vw, 40px)", display: "flex", flexDirection: "column", gap: "28px" }}>
        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            1. Purpose &amp; Overview
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            StellarEscrow employs non-custodial milestone logic to protect both clients and freelancers.
            In situations where deliverables fail to meet agreed technical specifications or a party becomes unresponsive,
            the on-chain dispute engine allows either party to lock the active milestone pending arbitration.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            2. Triggering an On-Chain Dispute
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            Either party can trigger `raise_dispute(job_id, milestone_index, reason)` via their wallet.
            When triggered:
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            <li>The milestone status transitions to `Disputed`.</li>
            <li>Automatic milestone payouts are temporarily frozen.</li>
            <li>A dispute event is logged on-chain and forwarded to registered Soroban arbitrators.</li>
            <li>Both parties are granted a 5-business-day window to submit supplementary cryptographic proofs and repository commits.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            3. Arbitrator Ruling &amp; Settlement
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            The assigned Arbitrator reviews submitted code repositories, milestone scopes, and communication logs.
            The Arbitrator executes `resolve_dispute(freelancer_payout, client_refund)`, which autonomously splits
            the escrowed milestone balance according to work completed.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            4. Impact on Reputation Scores
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            Unresolved or frivolous disputes penalize on-chain reputation scores in `soroban_reputation_contract`.
            Builders maintaining a 100% dispute-free record earn higher status badges and priority placement
            on the Top Talent Leaderboard.
          </p>
        </section>
      </div>
    </div>
  );
}
