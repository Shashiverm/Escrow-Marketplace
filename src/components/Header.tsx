"use client";

import Link from "next/link";
import { WalletConnect } from "./WalletConnect";

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-icon">⚡</span>
          <span>
            Stellar<span className="text-gradient">Escrow</span>
          </span>
        </Link>

        <nav className="nav">
          <Link href="/jobs" className="nav-link">
            Browse Jobs
          </Link>
          <Link href="/jobs/new" className="nav-link">
            Post Job
          </Link>
          <Link href="/profile" className="nav-link">
            Profile
          </Link>
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
