"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand-col">
          <Logo size="md" clickable={true} />
          <p className="footer-tagline">
            Next-generation decentralized freelance marketplace powered by Stellar Soroban smart contracts. Milestone escrow, non-custodial trust, and instant settlements.
          </p>
          <div className="network-pill">
            <span className="network-dot pulse" />
            <span className="network-label">Stellar Testnet &middot; Live</span>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li>
                <Link href="/jobs">Browse Jobs</Link>
              </li>
              <li>
                <Link href="/jobs/new">Post a Project</Link>
              </li>
              <li>
                <Link href="/profile">Freelancer Profile</Link>
              </li>
              <li>
                <a href="#how-it-works">How Escrow Works</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Ecosystem</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stellar Network
                </a>
              </li>
              <li>
                <a
                  href="https://developers.stellar.org/docs/build/smart-contracts/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Soroban Docs
                </a>
              </li>
              <li>
                <a
                  href="https://lab.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stellar Laboratory
                </a>
              </li>
              <li>
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Freighter Wallet
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Developers</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://github.com/Shashiverm/Escrow-Marketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://soroban.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contract SDK
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.org/faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Testnet XLM Faucet
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} StellarEscrow. Built with Soroban Smart Contracts. MIT License.</p>
          <div className="footer-socials">
            <span className="badge badge-open" style={{ fontSize: "0.75rem" }}>
              ⚡ 5-Second Finality
            </span>
            <span className="badge badge-completed" style={{ fontSize: "0.75rem" }}>
              🔒 Non-Custodial
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
