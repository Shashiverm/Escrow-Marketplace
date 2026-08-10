# ⚡ StellarEscrow — Freelance Escrow Marketplace

A **decentralized freelance marketplace** built on [Stellar](https://stellar.org) using [Soroban](https://soroban.stellar.org) smart contracts. Clients post jobs, freelancers bid, and payments are locked in **milestone-based escrow** — releasing funds only when work is approved. Every completed job builds a tamper-proof, on-chain **reputation score**.

**Why milestone escrow?** Freelance platforms suffer from trust problems: clients fear paying upfront, freelancers fear not getting paid. StellarEscrow solves this by splitting payments into milestones locked in a smart contract. Neither party can cheat — the code enforces fair release.

---

## 🏗️ Architecture

Three Soroban smart contracts work together, connected by cross-contract calls:

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│  Job Registry   │◄──────│     Escrow       │──────►│    Reputation       │
│                 │       │                  │       │                     │
│ • post_job      │       │ • fund_escrow    │       │ • record_completion │
│ • place_bid     │       │ • approve_       │       │ • get_score         │
│ • accept_bid    │       │   milestone      │       │                     │
│ • update_status │       │ • refund         │       │ Access: escrow-only │
│ • list_jobs     │       │                  │       │                     │
└─────────────────┘       └──────────────────┘       └─────────────────────┘
        ▲                         │                           ▲
        │         update_status   │   record_completion       │
        └─────────────────────────┴───────────────────────────┘
```

### Event Flow

| Contract | Events | Listeners |
|---|---|---|
| **Job Registry** | `job_posted`, `bid_placed`, `bid_accepted`, `status_updated` | Frontend (polling) |
| **Escrow** | `escrow_funded`, `milestone_approved`, `escrow_completed`, `escrow_refunded` | Frontend (polling) |
| **Reputation** | `reputation_updated` | Frontend (polling) |

The frontend polls events via Stellar RPC's `getEvents` endpoint using React Query for caching.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contracts** | Rust + Soroban SDK 22.0.0 |
| **Build Target** | `wasm32-unknown-unknown` |
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Wallet** | Freighter via `@stellar/freighter-api` |
| **Blockchain SDK** | `@stellar/stellar-sdk` |
| **State/Caching** | TanStack React Query |
| **Styling** | Vanilla CSS (dark theme, glassmorphism) |
| **CI/CD** | GitHub Actions |
| **Network** | Stellar Testnet |

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Frontend Live App** | [freelance-escrow-marketplace.vercel.app](https://freelance-escrow-marketplace.vercel.app/) |

---

## 📜 Smart Contract Deployment

**Network:** Stellar Testnet

| Contract | Address |
|---|---|
| **Job Registry** | `CDSMOWCTJUEFVJWLRTAFNKX3OR6I7YFJWVBV6LNUXDMNEZ3WA33PCHT4` |
| **Escrow** | `CC65MYRPOKJEF32XJ5IWZBTIOTI7LM2CQAQJSV6L57SZFR5XNEC72YIJ` |
| **Reputation** | `CCRHDIOUAO4HM4DPYF3LZYJYDMEILMXYIDZMXAX534FHG4JODIGP4PSP` |
| **Native Token (XLM)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

**Sample Deployment & Contract Initializations:**
```
Network: Stellar Testnet
Action:  initialize — Escrow & Reputation initialized with cross-contract security
Explorer: https://stellar.expert/explorer/testnet/contract/CC65MYRPOKJEF32XJ5IWZBTIOTI7LM2CQAQJSV6L57SZFR5XNEC72YIJ
```

---

## ✨ Features

- **Job Posting & Bidding** — Create listings with budgets and milestone counts; freelancers submit competitive bids
- **Milestone-Based Escrow** — Funds locked in a Soroban contract, released incrementally as milestones are approved
- **Cross-Contract Calls** — Escrow contract updates Job Registry status and Reputation scores automatically
- **On-Chain Reputation** — Tamper-proof scoring for both freelancers and clients, based on completed escrows
- **Real-Time Events** — Frontend polls Soroban contract events for live updates on job activity
- **Wallet Integration** — Connect with Freighter browser extension for transaction signing
- **Mobile Responsive** — Fully responsive dark-mode UI with glassmorphism design
- **Refund Protection** — Clients can reclaim unreleased funds; freelancers keep already-released milestone payments

---

## 📸 Screenshots & Proof of Work

### 🏠 Landing Page
![Landing Page](ui_images/landing_page.png)

### 📋 Job Listings & Filters
![Job Listings](ui_images/job_listing.png)

### 📊 Job Details & Milestone Tracker
![Job Details with Milestone Tracker](ui_images/job_details_with_milestone.png)

### ✍️ Post New Job Form
![Post Job Form](ui_images/job_form.png)

### 👤 Profile & Reputation Score
![Profile & Reputation](ui_images/profile.png)

### ✅ Test Suite Verification (100% Passing)
![Test Cases Passed](ui_images/test_cases_passed.png)

### 🚀 Smart Contract Deployment
![Deployment Success](ui_images/deployment_success.png)

---

## 🧪 Testing

### Smart Contracts

```bash
# Run all contract tests (21 tests across 3 contracts)
cargo test --workspace

# Run tests for a specific contract
cargo test -p soroban-job-registry-contract   # 8 tests
cargo test -p soroban-escrow-contract         # 7 tests (includes integration)
cargo test -p soroban-reputation-contract     # 6 tests
```

**Test coverage includes:**
- Job posting, bidding, acceptance, listing, pagination
- Escrow funding, milestone release, partial/full refunds
- Cross-contract integration (escrow → job registry + reputation)
- Access control (unauthorized caller rejection)
- Edge cases (double init, bid on closed job)

### Frontend

```bash
cd frontend
npm run lint    # ESLint checks
npm run build   # Type-checking + production build
```

---

## ⚙️ CI/CD

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push to `main` and on pull requests:

| Step | Command | Purpose |
|---|---|---|
| Format check | `cargo fmt --check` | Enforce consistent Rust style |
| Clippy lint | `cargo clippy -- -D warnings` | Catch common mistakes |
| WASM build | `cargo build --release --target wasm32-unknown-unknown` | Compile contracts |
| Contract tests | `cargo test --workspace` | Run all 21 unit + integration tests |
| Frontend lint | `npm run lint` | ESLint checks |
| Frontend build | `npm run build` | Verify production build |

---

## 💻 Local Setup

### Prerequisites

- [Rust](https://rustup.rs/) (1.75+)
- [Node.js](https://nodejs.org/) (20+)
- [Stellar CLI](https://developers.stellar.org/) (optional, for deployment)

### 1. Clone & Install

```bash
git clone https://github.com/Shashiverm/Escrow-Marketplace.git
cd Escrow-Marketplace

# Install Rust WASM target
rustup target add wasm32-unknown-unknown

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Build Contracts

```bash
cargo build --release --target wasm32-unknown-unknown
```

### 3. Run Tests

```bash
cargo test --workspace
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Testnet (optional)

```bash
# Generate a funded identity
stellar keys generate deployer --network testnet

# Deploy all contracts (Linux / macOS)
./scripts/deploy.sh

# Deploy all contracts (Windows PowerShell)
.\scripts\deploy.ps1

# Copy the output addresses to frontend/.env.local
```

### 🌐 Active Testnet Contract Addresses

| Contract | Network | Contract Address ID |
|---|---|---|
| **Job Registry** | Testnet | `CDSMOWCTJUEFVJWLRTAFNKX3OR6I7YFJWVBV6LNUXDMNEZ3WA33PCHT4` |
| **Escrow** | Testnet | `CC65MYRPOKJEF32XJ5IWZBTIOTI7LM2CQAQJSV6L57SZFR5XNEC72YIJ` |
| **Reputation** | Testnet | `CCRHDIOUAO4HM4DPYF3LZYJYDMEILMXYIDZMXAX534FHG4JODIGP4PSP` |
| **Native Token (XLM)** | Testnet | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

---

## 📁 Project Structure

```
stellar-escrow-marketplace/
├── Cargo.toml                              # Workspace root config
├── .gitignore
├── README.md
│
├── contracts/
│   ├── job_registry/                       # Job lifecycle management
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                      # Contract: post, bid, accept, list
│   │       └── test.rs                     # 8 unit tests
│   │
│   ├── escrow/                             # Milestone-based fund locking
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                      # Contract: fund, approve, release, refund
│   │       └── test.rs                     # 7 tests (incl. cross-contract integration)
│   │
│   └── reputation/                         # On-chain scoring
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs                      # Contract: record_completion, get_score
│           └── test.rs                     # 6 tests (incl. access control)
│
├── frontend/                               # Next.js 14 application
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── app/
│   │   ├── globals.css                     # Design system (dark theme, glassmorphism)
│   │   ├── layout.tsx                      # Root layout with header/footer
│   │   ├── page.tsx                        # Landing page (hero, features, stats)
│   │   ├── jobs/
│   │   │   ├── page.tsx                    # Job listing with filters
│   │   │   ├── [id]/page.tsx               # Job detail + milestone tracker
│   │   │   └── new/page.tsx                # Post new job form
│   │   └── profile/page.tsx                # User profile + reputation
│   ├── components/
│   │   ├── Header.tsx                      # Navigation bar
│   │   ├── WalletConnect.tsx               # Freighter wallet button
│   │   ├── JobCard.tsx                     # Job listing card
│   │   ├── MilestoneTracker.tsx            # Visual milestone progress
│   │   ├── BidForm.tsx                     # Bid submission form
│   │   ├── ReputationBadge.tsx             # Reputation score display
│   │   └── EventFeed.tsx                   # Real-time event sidebar
│   ├── lib/
│   │   ├── stellar.ts                      # Stellar SDK config & helpers
│   │   └── contracts.ts                    # Typed contract interaction layer
│   └── hooks/
│       ├── useWallet.ts                    # Wallet connection hook
│       ├── useEvents.ts                    # Event polling hook
│       └── useContract.ts                  # Contract invocation hook
│
├── scripts/
│   └── deploy.sh                           # Testnet deployment script
│
└── .github/
    └── workflows/
        └── ci.yml                          # Build → Test → Lint pipeline
```

---

## 🔮 Future Improvements

- **Dispute Resolution** — Arbiter role with multi-sig milestone approval
- **USDC Escrow** — Support Stellar Asset Contract (SAC) stablecoins alongside native XLM
- **Indexer Service** — Backend event indexer for historical data beyond RPC's 7-day window
- **Notification System** — Email/push notifications for bid acceptance and milestone events
- **File Attachments** — IPFS-backed deliverable uploads per milestone
- **Rating System** — Mutual 1-5 star reviews after job completion
- **Multi-Chain Support** — Bridge to Ethereum for cross-chain escrow

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
