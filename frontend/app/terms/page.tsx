import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of Service, Smart Contract Protocol Disclaimers, and Non-Custodial User Agreement for StellarEscrow.",
};

export default function TermsPage() {
  return (
    <div className="container" style={{ maxWidth: "880px" }}>
      <div style={{ marginBottom: "36px" }}>
        <span className="category-pill" style={{ marginBottom: "8px" }}>
          Legal &amp; Compliance
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)", marginTop: "4px" }}>
          Terms &amp; <span className="gradient-gold-text">Conditions</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Last Updated: August 2026 · Protocol Version 3.2.0
        </p>
      </div>

      <div className="card" style={{ padding: "clamp(24px, 4vw, 40px)", display: "flex", flexDirection: "column", gap: "28px" }}>
        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            By connecting a cryptographic wallet (e.g., Freighter) or invoking smart contracts on the StellarEscrow platform,
            you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
            If you do not agree, you must cease use of the interface immediately.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            2. Nature of the Protocol &amp; Non-Custodial Operation
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            StellarEscrow is an open-source decentralized interface that facilitates peer-to-peer milestone escrow agreements.
            All escrow funds (XLM and Stellar assets) are held directly inside autonomous Soroban smart contracts.
            The developers, maintainers, and interface hosts do not act as financial intermediaries, brokers, or custodians of user funds.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            3. Smart Contract Risks &amp; User Responsibility
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            You acknowledge that interacting with blockchain smart contracts involves inherent risks, including cryptographic vulnerabilities,
            network forks, RPC latency, and ledger gas fees. You are solely responsible for securing your private keys, seed phrases,
            and evaluating project milestones before signing release transactions.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            4. Milestone Approvals &amp; Finality
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            When a client signs an `approve_milestone` transaction, the smart contract immediately transfers the specified milestone balance
            to the freelancer’s Stellar address. Once confirmed by the Stellar consensus mechanism, milestone payouts are final,
            irreversible, and cannot be revoked by the interface.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            5. Limitation of Liability
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            In no event shall StellarEscrow, its creators, or contributors be liable for any indirect, incidental, punitive, or consequential
            damages arising out of or related to your use of the smart contracts, lost private keys, or counterparty disputes.
          </p>
        </section>
      </div>
    </div>
  );
}
