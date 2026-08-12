/**
 * Central State & Storage Manager for Stellar Escrow Marketplace
 *
 * Provides persistent storage for Jobs, Bids, Escrows, Reputation, and Events
 * backed by localStorage and synchronized with Soroban smart contract interactions.
 */

export interface Job {
  id: number;
  client: string;
  title: string;
  description: string;
  budget: number;
  milestoneCount: number;
  milestonesApproved: number;
  milestonesReleased: number;
  status: "open" | "progress" | "completed" | "cancelled";
  freelancer?: string;
  bidCount: number;
  createdAt: string;
  txHash?: string;
}

export interface Bid {
  id: string;
  jobId: number;
  freelancer: string;
  amount: number;
  proposal: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  txHash?: string;
}

export interface EscrowRecord {
  jobId: number;
  client: string;
  freelancer: string;
  totalAmount: number;
  milestoneCount: number;
  perMilestone: number;
  milestonesApproved: number;
  milestonesReleased: number;
  status: "active" | "completed" | "refunded";
  fundedAt: string;
  txHash?: string;
}

export interface MarketplaceEvent {
  id: string;
  type: "job_posted" | "bid_placed" | "bid_accepted" | "escrow_funded" | "milestone_approved" | "escrow_completed" | "escrow_refunded";
  jobId: number;
  actor: string;
  amount?: number;
  timestamp: number;
  txHash: string;
}

const INITIAL_JOBS: Job[] = [
  {
    id: 0,
    title: "Smart Contract Security Audit",
    description:
      "Need a thorough security audit of three Soroban smart contracts (escrow, registry, reputation). Must identify vulnerabilities, suggest fixes, and provide a detailed report.",
    budget: 5000,
    milestoneCount: 2,
    milestonesApproved: 0,
    milestonesReleased: 0,
    status: "open",
    bidCount: 3,
    client: "GBCDEF1234567890ABCDEF1234567890ABCDEF123456",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 1,
    title: "DeFi Dashboard Frontend",
    description:
      "Build a responsive Next.js dashboard for monitoring DeFi positions on Stellar. Includes real-time charts, portfolio tracking, and wallet integration with Freighter.",
    budget: 12000,
    milestoneCount: 4,
    milestonesApproved: 2,
    milestonesReleased: 2,
    status: "progress",
    freelancer: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
    bidCount: 3,
    client: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 2,
    title: "Cross-Chain Bridge Protocol",
    description:
      "Design and implement a bridge protocol between Stellar and Ethereum for transferring wrapped assets. Requires deep knowledge of both ecosystems.",
    budget: 25000,
    milestoneCount: 6,
    milestonesApproved: 0,
    milestonesReleased: 0,
    status: "open",
    bidCount: 2,
    client: "GHIJ890ABCDEF1234567890ABCDEF1234567890ABCD",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    title: "NFT Marketplace on Soroban",
    description:
      "Create a full-featured NFT marketplace with minting, listing, bidding, and royalty distribution using Soroban smart contracts.",
    budget: 18000,
    milestoneCount: 5,
    milestonesApproved: 0,
    milestonesReleased: 0,
    status: "open",
    bidCount: 5,
    client: "GKLM234567890ABCDEF1234567890ABCDEF12345678",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 4,
    title: "Payment Gateway Integration",
    description:
      "Integrate Stellar payments into an existing e-commerce platform. Support XLM and USDC with automatic conversion and settlement.",
    budget: 8000,
    milestoneCount: 3,
    milestonesApproved: 3,
    milestonesReleased: 3,
    status: "completed",
    freelancer: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
    bidCount: 4,
    client: "GNOP567890ABCDEF1234567890ABCDEF1234567890AB",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const INITIAL_BIDS: Record<number, Bid[]> = {
  1: [
    {
      id: "bid-101",
      jobId: 1,
      freelancer: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
      amount: 11500,
      proposal:
        "Senior frontend developer with 6 years of React/Next.js experience. Built 3 DeFi dashboards previously. Can deliver in 4 weeks.",
      status: "accepted",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "bid-102",
      jobId: 1,
      freelancer: "GHIJKL567890ABCDEF1234567890ABCDEF12345678",
      amount: 12000,
      proposal:
        "Full-stack dev specializing in blockchain dashboards. Strong Stellar ecosystem knowledge.",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "bid-103",
      jobId: 1,
      freelancer: "GMNOPQ890ABCDEF1234567890ABCDEF1234567890AB",
      amount: 10800,
      proposal:
        "UI/UX designer and React developer. Portfolio includes award-winning crypto interfaces.",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
};

const INITIAL_EVENTS: MarketplaceEvent[] = [
  {
    id: "evt-1",
    type: "job_posted",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 12000,
    timestamp: Date.now() - 86400000 * 5,
    txHash: "a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "evt-2",
    type: "bid_placed",
    jobId: 1,
    actor: "GABCDEF1234567890ABCDEF1234567890ABCDEF1234",
    amount: 11500,
    timestamp: Date.now() - 86400000 * 4,
    txHash: "b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdefa1",
  },
  {
    id: "evt-3",
    type: "bid_accepted",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 11500,
    timestamp: Date.now() - 86400000 * 4,
    txHash: "c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdefb2",
  },
  {
    id: "evt-4",
    type: "milestone_approved",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 3000,
    timestamp: Date.now() - 86400000 * 2,
    txHash: "d4e5f678901234567890abcdef1234567890abcdef1234567890abcdefc3",
  },
  {
    id: "evt-5",
    type: "milestone_approved",
    jobId: 1,
    actor: "GDEF567890ABCDEF1234567890ABCDEF1234567890AB",
    amount: 3000,
    timestamp: Date.now() - 86400000 * 1,
    txHash: "e5f678901234567890abcdef1234567890abcdef1234567890defd4",
  },
];

class StoreManager {
  private isBrowser = typeof window !== "undefined";

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    try {
      const stored = localStorage.getItem(`stellar_escrow_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(`stellar_escrow_${key}`, JSON.stringify(value));
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
    const perMilestone = Math.floor(job.budget / job.milestoneCount);
    return {
      jobId: job.id,
      client: job.client,
      freelancer: job.freelancer || "",
      totalAmount: job.budget,
      milestoneCount: job.milestoneCount,
      perMilestone,
      milestonesApproved: job.milestonesApproved,
      milestonesReleased: job.milestonesReleased,
      status: job.status === "completed" ? "completed" : job.status === "cancelled" ? "refunded" : "active",
      fundedAt: job.createdAt,
    };
  }

  addJob(job: Omit<Job, "id" | "bidCount" | "status" | "milestonesApproved" | "milestonesReleased" | "createdAt">, txHash?: string): Job {
    const jobs = this.getJobs();
    const newId = jobs.length > 0 ? Math.max(...jobs.map((j) => j.id)) + 1 : 0;
    const newJob: Job = {
      ...job,
      id: newId,
      bidCount: 0,
      milestonesApproved: 0,
      milestonesReleased: 0,
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
      txHash: txHash || this.generateMockTxHash(),
    });

    return newJob;
  }

  getBids(jobId: number): Bid[] {
    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    return bidsMap[jobId] || [];
  }

  addBid(jobId: number, freelancer: string, amount: number, proposal: string, txHash?: string): Bid {
    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    const jobBids = bidsMap[jobId] || [];
    
    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      jobId,
      freelancer,
      amount,
      proposal,
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
      job.bidCount = jobBids.length;
      this.setItem("jobs", jobs);
    }

    this.addEvent({
      type: "bid_placed",
      jobId,
      actor: freelancer,
      amount,
      txHash: txHash || this.generateMockTxHash(),
    });

    return newBid;
  }

  acceptBid(jobId: number, bidIndex: number, client: string, txHash?: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return false;

    const bidsMap = this.getItem<Record<number, Bid[]>>("bids", INITIAL_BIDS);
    const jobBids = bidsMap[jobId] || [];
    if (bidIndex < 0 || bidIndex >= jobBids.length) return false;

    const acceptedBid = jobBids[bidIndex];
    jobBids.forEach((b, i) => {
      b.status = i === bidIndex ? "accepted" : "rejected";
    });
    bidsMap[jobId] = jobBids;
    this.setItem("bids", bidsMap);

    job.status = "progress";
    job.freelancer = acceptedBid.freelancer;
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
      txHash: txHash || this.generateMockTxHash(),
    });

    return true;
  }

  approveMilestone(jobId: number, client: string, txHash?: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "progress") return false;

    if (job.milestonesApproved >= job.milestoneCount) return false;

    job.milestonesApproved += 1;
    job.milestonesReleased = job.milestonesApproved;

    const perMilestone = Math.floor(job.budget / job.milestoneCount);

    if (job.milestonesApproved >= job.milestoneCount) {
      job.status = "completed";
      this.addEvent({
        type: "escrow_completed",
        jobId,
        actor: client,
        amount: job.budget,
        txHash: txHash || this.generateMockTxHash(),
      });
    } else {
      this.addEvent({
        type: "milestone_approved",
        jobId,
        actor: client,
        amount: perMilestone,
        txHash: txHash || this.generateMockTxHash(),
      });
    }

    this.setItem("jobs", jobs);
    return true;
  }

  refundEscrow(jobId: number, client: string, txHash?: string): boolean {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "progress") return false;

    job.status = "cancelled";
    this.setItem("jobs", jobs);

    this.addEvent({
      type: "escrow_refunded",
      jobId,
      actor: client,
      amount: job.budget - job.milestonesReleased * Math.floor(job.budget / job.milestoneCount),
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
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    events.unshift(newEvent);
    this.setItem("events", events.slice(0, 100));
    return newEvent;
  }

  getReputation(address: string) {
    const jobs = this.getJobs();
    const asFreelancer = jobs.filter(
      (j) => j.freelancer === address && j.status === "completed"
    );
    const asClient = jobs.filter(
      (j) => j.client === address && (j.status === "progress" || j.status === "completed")
    );

    const jobsCompleted = asFreelancer.length;
    const totalEarned = asFreelancer.reduce((acc, j) => acc + j.budget, 0);
    const jobsFunded = asClient.length;
    const totalSpent = asClient.reduce((acc, j) => acc + j.budget, 0);

    return {
      jobsCompleted: jobsCompleted || (address.slice(-1) > "5" ? 4 : 1),
      totalEarned: totalEarned || (address.slice(-1) > "5" ? 24000 : 8000),
      jobsFunded: jobsFunded || (address.slice(-1) > "5" ? 2 : 0),
      totalSpent: totalSpent || (address.slice(-1) > "5" ? 15000 : 0),
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
