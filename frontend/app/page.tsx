import Link from "next/link";

/** Mock stats — replace with on-chain data via getEvents in production */
const STATS = [
  { value: "142", label: "Jobs Posted" },
  { value: "$87K", label: "Locked in Escrow" },
  { value: "98%", label: "Completion Rate" },
  { value: "320+", label: "Freelancers" },
];

const FEATURES = [
  {
    icon: "🔒",
    title: "Milestone Escrow",
    description:
      "Funds are locked in a Soroban smart contract and released incrementally as milestones are approved — protecting both parties.",
  },
  {
    icon: "⚡",
    title: "Instant Settlement",
    description:
      "Payments settle in seconds on Stellar, with near-zero fees. No waiting days for wire transfers or PayPal holds.",
  },
  {
    icon: "🌐",
    title: "Borderless by Default",
    description:
      "Work with anyone, anywhere. No bank accounts, no currency restrictions — just a Stellar wallet.",
  },
  {
    icon: "⭐",
    title: "On-Chain Reputation",
    description:
      "Every completed job builds a verifiable, tamper-proof reputation score stored directly on-chain.",
  },
  {
    icon: "📡",
    title: "Real-Time Events",
    description:
      "Track job postings, bids, and milestone releases in real time through Soroban contract events.",
  },
  {
    icon: "🛡️",
    title: "Non-Custodial",
    description:
      "The escrow contract holds funds — not us. Release conditions are enforced by code, not trust.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            ✨ Built on Stellar Soroban &middot; Testnet Live
          </div>

          <h1>
            Freelance with
            <br />
            <span className="gradient-text">Trustless Escrow</span>
          </h1>

          <p>
            Post jobs, bid on projects, and get paid through milestone-based
            smart contract escrow. Every transaction is transparent,
            non-custodial, and settled on Stellar.
          </p>

          <div className="hero-actions">
            <Link href="/jobs" className="btn btn-primary btn-lg" id="hero-browse-btn">
              Browse Open Jobs
            </Link>
            <Link href="/jobs/new" className="btn btn-secondary btn-lg" id="hero-post-btn">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────── */}
      <section className="container" style={{ marginTop: "-24px" }}>
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="card stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────── */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            Why <span className="text-gradient">StellarEscrow</span>?
          </h2>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
