/**
 * Contract interaction layer.
 *
 * Provides typed wrappers around each Soroban contract's public functions.
 * In production these call `buildContractTx` from `@/lib/stellar` and sign
 * via Freighter.  For the demo they return mock data.
 */

import { CONTRACTS, buildContractTx } from "./stellar";

// ── Types ────────────────────────────────────────

export interface Job {
  id: number;
  client: string;
  title: string;
  description: string;
  budget: number;
  milestoneCount: number;
  status: "open" | "progress" | "completed" | "cancelled";
  freelancer: string;
  bidCount: number;
}

export interface Bid {
  freelancer: string;
  amount: number;
  proposal: string;
}

export interface EscrowData {
  jobId: number;
  client: string;
  freelancer: string;
  totalAmount: number;
  milestoneCount: number;
  perMilestone: number;
  milestonesApproved: number;
  milestonesReleased: number;
  status: "active" | "completed" | "refunded";
}

export interface ReputationScore {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
}

// ── Job Registry ─────────────────────────────────

export async function postJob(
  publicKey: string,
  title: string,
  description: string,
  budget: number,
  milestoneCount: number
) {
  return buildContractTx(
    CONTRACTS.jobRegistry,
    "post_job",
    [publicKey, title, description, budget, milestoneCount],
    publicKey
  );
}

export async function placeBid(
  publicKey: string,
  jobId: number,
  amount: number,
  proposal: string
) {
  return buildContractTx(
    CONTRACTS.jobRegistry,
    "place_bid",
    [publicKey, jobId, amount, proposal],
    publicKey
  );
}

export async function acceptBid(
  publicKey: string,
  jobId: number,
  bidIndex: number
) {
  return buildContractTx(
    CONTRACTS.jobRegistry,
    "accept_bid",
    [publicKey, jobId, bidIndex],
    publicKey
  );
}

// ── Escrow ───────────────────────────────────────

export async function fundEscrow(
  publicKey: string,
  jobId: number,
  freelancer: string,
  amount: number,
  milestoneCount: number
) {
  return buildContractTx(
    CONTRACTS.escrow,
    "fund_escrow",
    [publicKey, jobId, freelancer, amount, milestoneCount],
    publicKey
  );
}

export async function approveMilestone(publicKey: string, jobId: number) {
  return buildContractTx(
    CONTRACTS.escrow,
    "approve_milestone",
    [publicKey, jobId],
    publicKey
  );
}

export async function refundEscrow(publicKey: string, jobId: number) {
  return buildContractTx(
    CONTRACTS.escrow,
    "refund",
    [publicKey, jobId],
    publicKey
  );
}

// ── Reputation ───────────────────────────────────

export async function getReputation(
  address: string
): Promise<ReputationScore> {
  // In production: read contract storage via RPC
  // For demo: return mock data
  return {
    jobsCompleted: 0,
    totalEarned: 0,
    jobsFunded: 0,
    totalSpent: 0,
  };
}
