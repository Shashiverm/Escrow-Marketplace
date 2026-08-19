/**
 * Central State & Storage Manager for Stellar Escrow Marketplace
 *
 * Provides persistent storage for Jobs, Bids, Escrows, Reputation, and Events
 * backed by localStorage and synchronized with Soroban smart contract interactions.
 */

export interface Milestone {
  index: number;
  title: string;
  amount: number;
  state: "pending" | "submitted" | "approved" | "disputed" | "refunded";
  deliverableHash?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Job {
  id: number;
  client: string;
  title: string;
  description: string;
  category: "Smart Contracts" | "Frontend UI" | "Security Audit" | "DeFi" | "Full-Stack" | "Design";
  budget: number;
  milestoneCount: number;
  milestonesApproved: number;
  milestonesReleased: number;
  milestones?: Milestone[];
  status: "open" | "progress" | "completed" | "cancelled" | "disputed";
  freelancer?: string;
  arbitrator?: string;
  bidCount: number;
  deadline?: string;
  createdAt: string;
  txHash?: string;
}

export interface Bid {
  id: string;
  jobId: number;
  freelancer: string;
  freelancerName?: string;
  amount: number;
  proposal: string;
  estimatedDays: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  txHash?: string;
}

export interface EscrowRecord {
  jobId: number;
  client: string;
  freelancer: string;
  arbitrator: string;
  totalAmount: number;
  milestoneCount: number;
  milestones: Milestone[];
  milestonesApproved: number;
  protocolFeeBps: number;
  status: "active" | "completed" | "refunded" | "disputed";
  fundedAt: string;
  txHash?: string;
}

export interface MarketplaceEvent {
  id: string;
  type:
    | "job_posted"
    | "bid_placed"
    | "bid_withdrawn"
    | "bid_accepted"
    | "escrow_funded"
    | "milestone_submitted"
    | "milestone_approved"
    | "dispute_raised"
    | "dispute_resolved"
    | "escrow_completed"
    | "escrow_refunded";
  jobId: number;
  actor: string;
  amount?: number;
  meta?: string;
  timestamp: number;
  txHash: string;
}

export interface TalentProfile {
  address: string;
  name: string;
  handle: string;
  avatar: string;
  category: string;
  bio: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  totalEarned: number;
  successRate: number;
  tier: "Elite Master" | "Diamond" | "Gold" | "Silver" | "Bronze";
  badges: string[];
  skills: string[];
  hourlyRate: number;
}

const INITIAL_JOBS: Job[] = [
  {
    id: 0,
    title: "Smart Contract Security Audit & Formal Verification",
    description:
      "Comprehensive security audit for 3 production Soroban smart contracts. Deliverables include vulnerability scan, gas optimization suggestions, and signed verification report.",
    category: "Security Audit",
    budget: 8500,
    milestoneCount: 2,
    milestonesApproved: 0,
    milestonesReleased: 0,
    status: "open",
    bidCount: 4,
    deadline: "2026-09-15",
    client: "GBCDEF1234567890ABCDEF1234567890ABCDEF123456",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    milestones: [
      { index: 0, title: "Initial Threat Model & Static Code Analysis", amount: 3500, state: "pending" },
      { index: 1, title: "Formal Verification & Final Audit Report", amount: 5000, state: "pending" },
    ],
  },
  {
    id: 1,
    title: "High-Yield DeFi Dashboard & Freighter SDK Integration",
    description:
      "Build a luxury-grade Next.js dashboard for monitoring liquidity pools and real-time Soroban yields with instant Freighter wallet transaction signing.",
    category: "Frontend UI",
    budget: 14000,
    milestoneCount: 3,
    milestonesApproved: 1,
    milestonesReleased: 1,
    status: "progress",
    freelancer: "GAX7890ABCDEF1234567890ABCDEF1234567890ELITE",
    arbitrator: "GARB1234567890ABCDEF1234567890ABCDEF12345678",
    bidCount: 5,
    deadline: "2026-09-30",
    client: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    milestones: [
      {
        index: 0,
        title: "Figma UI System & Component Foundation",
        amount: 4000,
        state: "approved",
        deliverableHash: "ipfs://bafybeic7v2systemfnd",
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        index: 1,
        title: "Live Horizon / Soroban RPC Data Feeds",
        amount: 5000,
        state: "submitted",
        deliverableHash: "ipfs://bafybeih6livefeedssoroban",
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      { index: 2, title: "Production Deployment & Test Suite", amount: 5000, state: "pending" },
    ],
  },
  {
    id: 2,
    title: "Decentralized Escrow Cross-Chain Bridge Connector",
    description:
      "Implement trust-minimized relayer bridge connecting Stellar Soroban states with EVM networks using cryptographic state proofs.",
    category: "Smart Contracts",
    budget: 32000,
    milestoneCount: 4,
    milestonesApproved: 0,
    milestonesReleased: 0,
    status: "open",
    bidCount: 3,
    deadline: "2026-10-15",
    client: "GHIJ890ABCDEF1234567890ABCDEF1234567890ABCD",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    milestones: [
      { index: 0, title: "Soroban State Verifier Contract", amount: 8000, state: "pending" },
      { index: 1, title: "Relayer Service & Cryptographic Prover", amount: 10000, state: "pending" },
      { index: 2, title: "EVM Receiver & Settlement Logic", amount: 8000, state: "pending" },
      { index: 3, title: "Testnet E2E & Gas Optimizations", amount: 6000, state: "pending" },
    ],
  },
  {
    id: 3,
    title: "Soroban Automated Market Maker (AMM) Protocol",
    description:
      "Design and deploy constant-product AMM contract with flash loan safety, dynamic fee tiers, and liquidity provider token distribution.",
    category: "DeFi",
    budget: 22000,
    milestoneCount: 3,
    milestonesApproved: 0,
    milestonesReleased: 0,
    status: "open",
    bidCount: 6,
    deadline: "2026-09-25",
    client: "GKLM234567890ABCDEF1234567890ABCDEF12345678",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    milestones: [
      { index: 0, title: "Core Math & Swapping Engine", amount: 8000, state: "pending" },
      { index: 1, title: "LP Pool Share Token & Flash-Loan Guards", amount: 7000, state: "pending" },
      { index: 2, title: "SDK Integration & Router Contracts", amount: 7000, state: "pending" },
    ],
  },
  {
    id: 4,
    title: "Enterprise Multi-Sig Treasury & Payroll System",
    description:
      "Architect a multi-party governance contract for automated payroll streaming and threshold approvals on Stellar.",
    category: "Smart Contracts",
    budget: 18000,
    milestoneCount: 3,
    milestonesApproved: 3,
    milestonesReleased: 3,
    status: "completed",
    freelancer: "GAX7890ABCDEF1234567890ABCDEF1234567890ELITE",
    client: "GNOP567890ABCDEF1234567890ABCDEF1234567890AB",
    bidCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    milestones: [
      { index: 0, title: "Threshold Signature Engine", amount: 6000, state: "approved" },
      { index: 1, title: "Automated XLM/USDC Streaming Schedule", amount: 6000, state: "approved" },
      { index: 2, title: "Audit & Mainnet Pilot Settlement", amount: 6000, state: "approved" },
    ],
  },
];

const INITIAL_TALENT: TalentProfile[] = [
  {
    address: "GAX7890ABCDEF1234567890ABCDEF1234567890ELITE",
    name: "Aurelius Vance",
    handle: "@aurelius_soroban",
    avatar: "👑",
    category: "Smart Contracts",
    bio: "Lead Soroban protocol engineer with 7+ audited dApps. Specializes in escrow mechanisms, AMMs, and zero-knowledge relayer verification.",
    rating: 4.98,
    reviewCount: 42,
    jobsCompleted: 38,
    totalEarned: 184500,
    successRate: 100,
    tier: "Elite Master",
    badges: ["Top 1% Earner", "Security Auditor", "Soroban Pioneer", "Flawless Record"],
    skills: ["Rust", "Soroban", "DeFi Architecture", "Formal Verification", "TypeScript"],
    hourlyRate: 180,
  },
  {
    address: "GBY567890ABCDEF1234567890ABCDEF1234567890SOLAR",
    name: "Elena Rostova",
    handle: "@elena_ux_stellar",
    avatar: "💎",
    category: "Frontend UI",
    bio: "Award-winning Web3 frontend architect. Creator of luxury dark-mode fintech dashboards with seamless Freighter & Albedo integration.",
    rating: 4.95,
    reviewCount: 31,
    jobsCompleted: 29,
    totalEarned: 126000,
    successRate: 99,
    tier: "Diamond",
    badges: ["UI/UX Master", "Fast Turnaround", "Freighter Pro"],
    skills: ["Next.js", "TailwindCSS", "Ethers/Stellar SDK", "Micro-Animations", "WebSockets"],
    hourlyRate: 140,
  },
  {
    address: "GCZ34567890ABCDEF1234567890ABCDEF1234567890EMER",
    name: "Marcus Thorne",
    handle: "@thorne_security",
    avatar: "🛡️",
    category: "Security Audit",
    bio: "Ex-ConsenSys auditor now dedicated to Stellar & Soroban ecosystem security. Found 60+ critical bugs before mainnet launches.",
    rating: 4.92,
    reviewCount: 26,
    jobsCompleted: 24,
    totalEarned: 148000,
    successRate: 100,
    tier: "Diamond",
    badges: ["White-Hat Auditor", "Bug Bounty Hunter", "Verified Expert"],
    skills: ["Security Audits", "Fuzz Testing", "Bytecode Decompilation", "Rust", "Soroban SDK"],
    hourlyRate: 200,
  },
  {
    address: "GDW1234567890ABCDEF1234567890ABCDEF1234567890GOLD",
    name: "Daria Solokov",
    handle: "@daria_defi",
    avatar: "⚡",
    category: "DeFi",
    bio: "Full-stack DeFi builder specializing in algorithmic yield routing, DEX liquidity curves, and automated Soroban vaults.",
    rating: 4.88,
    reviewCount: 19,
    jobsCompleted: 18,
    totalEarned: 89000,
    successRate: 98,
    tier: "Gold",
    badges: ["DeFi Specialist", "High Velocity"],
    skills: ["AMM Math", "Yield Aggregation", "Rust", "Python", "GraphQL"],
    hourlyRate: 125,
  },
  {
    address: "GEV9876543210ABCDEF1234567890ABCDEF1234567890PRO",
    name: "Kenji Sato",
    handle: "@kenji_fullstack",
    avatar: "🚀",
    category: "Full-Stack",
    bio: "Full-stack developer building enterprise blockchain backends, indexers, and mobile-friendly Stellar wallets.",
    rating: 4.85,
    reviewCount: 15,
    jobsCompleted: 14,
    totalEarned: 64000,
    successRate: 96,
    tier: "Gold",
    badges: ["Indexer Builder", "Reliable Partner"],
    skills: ["Node.js", "PostgreSQL", "Soroban RPC", "React Native", "Docker"],
    hourlyRate: 110,
  },
];

const INITIAL_BIDS: Record<number, Bid[]> = {
  1: [
    {
      id: "bid-101",
      jobId: 1,
      freelancer: "GAX7890ABCDEF1234567890ABCDEF1234567890ELITE",
      freelancerName: "Aurelius Vance",
      amount: 14000,
      estimatedDays: 14,
      proposal:
        "Senior Soroban & Next.js engineer. I have implemented 4 similar dashboards with sub-second RPC feeds and full Freighter support.",
      status: "accepted",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "bid-102",
      jobId: 1,
      freelancer: "GBY567890ABCDEF1234567890ABCDEF1234567890SOLAR",
      freelancerName: "Elena Rostova",
      amount: 13500,
      estimatedDays: 12,
      proposal:
        "Luxury dark-mode design expert. Will provide a bespoke, responsive UI matching the highest fintech tier with smooth micro-animations.",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
};

const INITIAL_EVENTS: MarketplaceEvent[] = [
  {
    id: "evt-1",
    type: "job_posted",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 14000,
    timestamp: Date.now() - 86400000 * 5,
    txHash: "a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "evt-2",
    type: "bid_placed",
    jobId: 1,
    actor: "GAX7890ABCDEF1234567890ABCDEF1234567890ELITE",
    amount: 14000,
    timestamp: Date.now() - 86400000 * 4,
    txHash: "b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdefa1",
  },
  {
    id: "evt-3",
    type: "bid_accepted",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 14000,
    timestamp: Date.now() - 86400000 * 4,
    txHash: "c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdefb2",
  },
  {
    id: "evt-4",
    type: "milestone_approved",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 4000,
    meta: "Milestone 1 Approved · 5.0 ★ Rating",
    timestamp: Date.now() - 86400000 * 2,
    txHash: "d4e5f678901234567890abcdef1234567890abcdef1234567890abcdefc3",
  },
  {
    id: "evt-5",
    type: "milestone_submitted",
    jobId: 1,
    actor: "GAX7890ABCDEF1234567890ABCDEF1234567890ELITE",
    amount: 5000,
    meta: "Milestone 2 Work Proof Delivered",
    timestamp: Date.now() - 86400000 * 1,
    txHash: "e5f678901234567890abcdef1234567890abcdef1234567890defd4",
  },
];

class StoreManager {
  private isBrowser = typeof window !== "undefined";

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    try {
      const stored = localStorage.getItem(`stellar_escrow_v2_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(`stellar_escrow_v2_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  getJobs(): Job[] {
    return this.getItem<Job[]>("jobs", INITIAL_JOBS);
  }

  getJobById(id: number): Job | undefined {
    const jobs = this.getJobs();
    return jobs.find((j) => j.id === id);
  }

  getJob(id: number): Job | undefined {
    return this.getJobById(id);
  }

  getEscrow(jobId: number): EscrowRecord | undefined {
    const job = this.getJobById(jobId);
    if (!job || job.status === "open") return undefined;

    const milestones = job.milestones || this.generateDefaultMilestones(job.budget, job.milestoneCount);
    return {
      jobId: job.id,
      client: job.client,
      freelancer: job.freelancer || "",
      arbitrator: job.arbitrator || "GARB1234567890ABCDEF1234567890ABCDEF12345678",
      totalAmount: job.budget,
      milestoneCount: job.milestoneCount,
      milestones,
      milestonesApproved: job.milestonesApproved,
      protocolFeeBps: 150, // 1.5%
      status: job.status === "completed" ? "completed" : job.status === "cancelled" ? "refunded" : job.status === "disputed" ? "disputed" : "active",
      fundedAt: job.createdAt,
    };
  }

  private generateDefaultMilestones(budget: number, count: number): Milestone[] {
    const per = Math.floor(budget / count);
    const ms: Milestone[] = [];
    for (let i = 0; i < count; i++) {
      ms.push({
        index: i,
        title: `Milestone ${i + 1}`,
        amount: i === count - 1 ? budget - per * (count - 1) : per,
        state: "pending",
      });
    }
    return ms;
  }

  addJob(
    job: Omit<Job, "id" | "bidCount" | "status" | "milestonesApproved" | "milestonesReleased" | "createdAt">,
    txHash?: string
  ): Job {
    const jobs = this.getJobs();
    const newId = jobs.length > 0 ? Math.max(...jobs.map((j) => j.id)) + 1 : 0;

    const milestones =
      job.milestones && job.milestones.length > 0
        ? job.milestones
        : this.generateDefaultMilestones(job.budget, job.milestoneCount);

    const newJob: Job = {
      ...job,
      id: newId,
      bidCount: 0,
      milestonesApproved: 0,
      milestonesReleased: 0,
      milestones,
      status: "open",
      createdAt: new Date().toISOString(),
      txHash,
    };

    jobs.unshift(newJob);
    this.setItem("jobs", jobs);

    this.addEvent({
      type: "job_posted",
      jobId: newId,
      actor: job.client,
      amount: job.budget,
      meta: `${job.category} · ${job.milestoneCount} Milestones`,
      txHash: txHash || this.generateMockTxHash(),
    });

    return newJob;
  }

  getBids(jobId: number): Bid[] {
    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    return bidsMap[jobId] || [];
  }

  addBid(
    jobId: number,
    freelancer: string,
    amount: number,
    proposal: string,
    estimatedDays: number = 7,
    txHash?: string
  ): Bid {
    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    const jobBids = bidsMap[jobId] || [];

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      jobId,
      freelancer,
      freelancerName: freelancer.slice(0, 4) + "..." + freelancer.slice(-4),
      amount,
      proposal,
      estimatedDays,
      status: "pending",
      createdAt: new Date().toISOString(),
      txHash,
    };

    jobBids.push(newBid);
    bidsMap[jobId] = jobBids;
    this.setItem("bids", bidsMap);

    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      job.bidCount = jobBids.filter((b) => b.status !== "withdrawn").length;
      this.setItem("jobs", jobs);
    }

    this.addEvent({
      type: "bid_placed",
      jobId,
      actor: freelancer,
      amount,
      meta: `${estimatedDays} Days Estimated`,
      txHash: txHash || this.generateMockTxHash(),
    });

    return newBid;
  }

  withdrawBid(jobId: number, bidId: string, freelancer: string): boolean {
    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    const jobBids = bidsMap[jobId] || [];
    const bid = jobBids.find((b) => b.id === bidId && b.freelancer === freelancer);
    if (!bid || bid.status !== "pending") return false;

    bid.status = "withdrawn";
    bidsMap[jobId] = jobBids;
    this.setItem("bids", bidsMap);

    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      job.bidCount = jobBids.filter((b) => b.status !== "withdrawn").length;
      this.setItem("jobs", jobs);
    }

    this.addEvent({
      type: "bid_withdrawn",
      jobId,
      actor: freelancer,
      txHash: this.generateMockTxHash(),
    });

    return true;
  }

  acceptBid(jobId: number, bidIndex: number, client: string, txHash?: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return false;

    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    const jobBids = bidsMap[jobId] || [];
    if (bidIndex < 0 || bidIndex >= jobBids.length) return false;

    const acceptedBid = jobBids[bidIndex];
    if (acceptedBid.status === "withdrawn") return false;

    jobBids.forEach((b, i) => {
      if (b.status !== "withdrawn") {
        b.status = i === bidIndex ? "accepted" : "rejected";
      }
    });
    bidsMap[jobId] = jobBids;
    this.setItem("bids", bidsMap);

    job.status = "progress";
    job.freelancer = acceptedBid.freelancer;
    job.budget = acceptedBid.amount; // update to accepted bid amount
    if (!job.milestones || job.milestones.length === 0) {
      job.milestones = this.generateDefaultMilestones(job.budget, job.milestoneCount);
    }
    this.setItem("jobs", jobs);

    this.addEvent({
      type: "bid_accepted",
      jobId,
      actor: client,
      amount: acceptedBid.amount,
      txHash: txHash || this.generateMockTxHash(),
    });

    this.addEvent({
      type: "escrow_funded",
      jobId,
      actor: client,
      amount: acceptedBid.amount,
      meta: "Locked in Soroban Escrow Contract",
      txHash: txHash || this.generateMockTxHash(),
    });

    return true;
  }

  submitMilestone(jobId: number, milestoneIndex: number, freelancer: string, deliverableHash: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "progress" || job.freelancer !== freelancer) return false;

    if (!job.milestones || !job.milestones[milestoneIndex]) return false;
    const ms = job.milestones[milestoneIndex];
    if (ms.state !== "pending" && ms.state !== "submitted") return false;

    ms.state = "submitted";
    ms.deliverableHash = deliverableHash;
    ms.submittedAt = new Date().toISOString();
    this.setItem("jobs", jobs);

    this.addEvent({
      type: "milestone_submitted",
      jobId,
      actor: freelancer,
      amount: ms.amount,
      meta: `Milestone ${milestoneIndex + 1}: ${ms.title}`,
      txHash: this.generateMockTxHash(),
    });

    return true;
  }

  approveMilestone(
    jobId: number,
    milestoneIndex: number,
    client: string,
    rating: number = 5,
    txHash?: string
  ): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || (job.status !== "progress" && job.status !== "disputed") || job.client !== client) return false;

    if (!job.milestones || !job.milestones[milestoneIndex]) return false;
    const ms = job.milestones[milestoneIndex];
    if (ms.state === "approved" || ms.state === "refunded") return false;

    ms.state = "approved";
    ms.approvedAt = new Date().toISOString();
    job.milestonesApproved += 1;
    job.milestonesReleased += 1;

    const allApproved = job.milestones.every((m) => m.state === "approved");
    if (allApproved || job.milestonesApproved >= job.milestoneCount) {
      job.status = "completed";
      this.addEvent({
        type: "escrow_completed",
        jobId,
        actor: client,
        amount: job.budget,
        meta: `All Milestones Approved · ${rating} ★ Final Rating`,
        txHash: txHash || this.generateMockTxHash(),
      });
    } else {
      this.addEvent({
        type: "milestone_approved",
        jobId,
        actor: client,
        amount: ms.amount,
        meta: `Milestone ${milestoneIndex + 1} Released · ${rating} ★ Rating`,
        txHash: txHash || this.generateMockTxHash(),
      });
    }

    this.setItem("jobs", jobs);
    return true;
  }

  raiseDispute(jobId: number, milestoneIndex: number, caller: string, reason: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "progress") return false;

    if (!job.milestones || !job.milestones[milestoneIndex]) return false;
    const ms = job.milestones[milestoneIndex];
    if (ms.state === "approved" || ms.state === "refunded") return false;

    ms.state = "disputed";
    job.status = "disputed";
    this.setItem("jobs", jobs);

    this.addEvent({
      type: "dispute_raised",
      jobId,
      actor: caller,
      meta: `Dispute on Milestone ${milestoneIndex + 1}: ${reason}`,
      txHash: this.generateMockTxHash(),
    });

    return true;
  }

  resolveDispute(
    jobId: number,
    milestoneIndex: number,
    arbitrator: string,
    freelancerPayout: number,
    clientRefund: number
  ): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "disputed") return false;

    if (!job.milestones || !job.milestones[milestoneIndex]) return false;
    const ms = job.milestones[milestoneIndex];

    ms.state = "approved"; // finalized
    job.milestonesApproved += 1;
    if (job.milestonesApproved >= job.milestoneCount) {
      job.status = "completed";
    } else {
      job.status = "progress";
    }

    this.setItem("jobs", jobs);

    this.addEvent({
      type: "dispute_resolved",
      jobId,
      actor: arbitrator,
      meta: `Arbitration: ${freelancerPayout} XLM Freelancer / ${clientRefund} XLM Client`,
      txHash: this.generateMockTxHash(),
    });

    return true;
  }

  refundEscrow(jobId: number, client: string, txHash?: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || (job.status !== "progress" && job.status !== "disputed") || job.client !== client) return false;

    job.status = "cancelled";
    if (job.milestones) {
      job.milestones.forEach((m) => {
        if (m.state !== "approved") {
          m.state = "refunded";
        }
      });
    }
    this.setItem("jobs", jobs);

    const released = job.milestones
      ? job.milestones.filter((m) => m.state === "approved").reduce((a, b) => a + b.amount, 0)
      : 0;
    const refundedAmount = job.budget - released;

    this.addEvent({
      type: "escrow_refunded",
      jobId,
      actor: client,
      amount: refundedAmount,
      meta: "Remaining Escrow Funds Returned to Client",
      txHash: txHash || this.generateMockTxHash(),
    });

    return true;
  }

  getEvents(jobId?: number): MarketplaceEvent[] {
    const events = this.getItem<MarketplaceEvent[]>("events", INITIAL_EVENTS);
    if (jobId !== undefined) {
      return events.filter((e) => e.jobId === jobId);
    }
    return events;
  }

  addEvent(event: Omit<MarketplaceEvent, "id" | "timestamp">): MarketplaceEvent {
    const events = this.getEvents();
    const newEvent: MarketplaceEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    events.unshift(newEvent);
    this.setItem("events", events.slice(0, 100));
    return newEvent;
  }

  getTalentLeaderboard(): TalentProfile[] {
    return this.getItem<TalentProfile[]>("talent", INITIAL_TALENT);
  }

  getReputation(address: string) {
    const talentList = this.getTalentLeaderboard();
    const matched = talentList.find((t) => t.address.toLowerCase() === address.toLowerCase());
    if (matched) {
      return {
        jobsCompleted: matched.jobsCompleted,
        totalEarned: matched.totalEarned,
        jobsFunded: 4,
        totalSpent: 35000,
        rating: matched.rating,
        reviewCount: matched.reviewCount,
        tier: matched.tier,
      };
    }

    const jobs = this.getJobs();
    const asFreelancer = jobs.filter((j) => j.freelancer === address && j.status === "completed");
    const asClient = jobs.filter(
      (j) => j.client === address && (j.status === "progress" || j.status === "completed")
    );

    const jobsCompleted = asFreelancer.length;
    const totalEarned = asFreelancer.reduce((acc, j) => acc + j.budget, 0);
    const jobsFunded = asClient.length;
    const totalSpent = asClient.reduce((acc, j) => acc + j.budget, 0);

    const isHigh = address.slice(-1) > "5";

    return {
      jobsCompleted: jobsCompleted || (isHigh ? 6 : 1),
      totalEarned: totalEarned || (isHigh ? 38000 : 8000),
      jobsFunded: jobsFunded || (isHigh ? 3 : 0),
      totalSpent: totalSpent || (isHigh ? 24000 : 0),
      rating: isHigh ? 4.9 : 4.7,
      reviewCount: isHigh ? 8 : 2,
      tier: isHigh ? ("Gold" as const) : ("Bronze" as const),
    };
  }

  private generateMockTxHash(): string {
    const chars = "abcdef0123456789";
    let hash = "";
    for (let i = 0; i < 64; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }
}

export const store = new StoreManager();
