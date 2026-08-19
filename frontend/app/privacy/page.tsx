import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and on-chain data collection disclosures for StellarEscrow Marketplace.",
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ maxWidth: "880px" }}>
      <div style={{ marginBottom: "36px" }}>
        <span className="category-pill" style={{ marginBottom: "8px" }}>
          Legal &amp; Compliance
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)", marginTop: "4px" }}>
          Privacy <span className="gradient-gold-text">Policy</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Last Updated: August 2026 · Protocol Version 3.2.0
        </p>
      </div>

      <div className="card" style={{ padding: "clamp(24px, 4vw, 40px)", display: "flex", flexDirection: "column", gap: "28px" }}>
        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            1. Non-Custodial Decentralized Architecture
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            StellarEscrow is a decentralized, non-custodial smart contract protocol deployed on the Stellar network.
            We do not operate custodial bank accounts, centralized user registries, or private key databases.
            Interaction with our smart contracts occurs directly from your client-side browser wallet (such as Freighter, xBull, or Albedo).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            2. On-Chain Public Ledger Data
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            Please be aware that by utilizing the Stellar public ledger and Soroban smart contracts, certain transaction information
            is broadcast and permanently recorded on-chain. This includes:
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            <li>Your public Ed25519 Stellar wallet address (`G...`).</li>
            <li>Smart contract method invocations (`post_job`, `place_bid`, `fund_escrow`, `approve_milestone`).</li>
            <li>Escrow token amounts, milestone completion hashes, and ratings.</li>
            <li>Timestamped ledger event records.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            3. Local Storage &amp; Cookies
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            We utilize browser `localStorage` solely to maintain your preferred UI theme settings, disconnected session cache,
            and cached RPC node endpoints. We do not track cross-site tracking cookies, third-party analytics trackers, or sell
            telemetry to third-party data brokers.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            4. User Rights &amp; Regulatory Disclosures
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            In accordance with GDPR, CCPA, and global non-custodial privacy best practices, users retain complete sovereignty
            over their cryptographic keys. Since on-chain state is immutable on the decentralized Stellar ledger, transactions
            cannot be modified or expunged once signed and sealed into a Stellar ledger close.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "10px" }}>
            5. Contact &amp; Security Audits
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.7" }}>
            For privacy inquiries, smart contract audit reports, or vulnerability disclosures, please review our open-source
            repositories and developer community governance channels on Stellar.
          </p>
        </section>
      </div>
    </div>
  );
}
