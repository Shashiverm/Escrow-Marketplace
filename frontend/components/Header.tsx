"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "./WalletConnect";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <Logo size="md" clickable={true} />

          <div className="network-pill desktop-only">
            <span className="network-dot pulse-gold" />
            <span>Soroban Testnet</span>
          </div>
        </div>

        <nav className="nav desktop-nav">
          <Link
            href="/jobs"
            className={`nav-link ${isActive("/jobs") && !pathname.includes("/jobs/new") ? "active" : ""}`}
          >
            Browse Jobs
          </Link>
          <Link
            href="/leaderboard"
            className={`nav-link ${isActive("/leaderboard") ? "active" : ""}`}
          >
            Leaderboard
          </Link>
          <Link
            href="/jobs/new"
            className={`nav-link ${isActive("/jobs/new") ? "active" : ""}`}
          >
            Post Job
          </Link>
          <Link
            href="/profile"
            className={`nav-link ${isActive("/profile") ? "active" : ""}`}
          >
            Profile
          </Link>
          <WalletConnect />
        </nav>

        <button
          className="mobile-hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span className={`hamburger-bar ${isMobileMenuOpen ? "open" : ""}`} />
          <span className={`hamburger-bar ${isMobileMenuOpen ? "open" : ""}`} />
          <span className={`hamburger-bar ${isMobileMenuOpen ? "open" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/jobs"
              className={`mobile-nav-link ${isActive("/jobs") && !pathname.includes("/jobs/new") ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Escrows
            </Link>
            <Link
              href="/leaderboard"
              className={`mobile-nav-link ${isActive("/leaderboard") ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Talent Leaderboard
            </Link>
            <Link
              href="/jobs/new"
              className={`mobile-nav-link ${isActive("/jobs/new") ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Post Project
            </Link>
            <Link
              href="/profile"
              className={`mobile-nav-link ${isActive("/profile") ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Profile
            </Link>
            <div style={{ marginTop: "6px" }}>
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
