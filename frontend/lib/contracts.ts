/**
 * Typed Soroban Contract Interaction Layer
 *
 * Provides typed TypeScript functions for posting jobs, submitting bids,
 * withdrawing bids, accepting bids, milestone deliverables submission & approval,
 * dispute arbitration, escrow refunds, and multi-factor reputation queries.
 */

import { CONTRACTS, executeContractTx, queryContractState } from "./stellar";
import { store, Job, Bid, EscrowRecord, MarketplaceEvent, Milestone, TalentProfile } from "./store";
import { WalletType } from "./wallets";

export type { Job, Bid, EscrowRecord, MarketplaceEvent, Milestone, TalentProfile };

export interface ReputationScore {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
  rating?: number;
  reviewCount?: number;
  tier?: string;
}

// ── Job Registry Contract Calls (contracts/job_registry/src/lib.rs) ───────────────

/**
 * Invokes `post_job` on Job Registry contract.
 */
export async function postJob(
  publicKey: string,
  walletType: WalletType,
  title: string,
  description: string,
  category: "Smart Contracts" | "Frontend UI" | "Security Audit" | "DeFi" | "Full-Stack" | "Design",
  budget: number,
  milestoneCount: number,
  deadlineStr?: string,
  customMilestones?: Milestone[]
): Promise<{ job: Job; txHash: string }> {
  const deadlineEpoch = deadlineStr ? Math.floor(new Date(deadlineStr).getTime() / 1000) : 0;

  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "post_job",
    [publicKey, title, description, category, budget, milestoneCount, deadlineEpoch],
    publicKey,
    walletType
  );

  const newJob = store.addJob(
    {
      client: publicKey,
      title,
      description,
      category,
      budget,
      milestoneCount,
      deadline: deadlineStr,
      milestones: customMilestones,
    },
    txResult.hash
  );

  return { job: newJob, txHash: txResult.hash };
}

/**
 * Invokes `place_bid` on Job Registry contract.
 */
export async function placeBid(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  amount: number,
  proposal: string,
  estimatedDays: number = 7
): Promise<{ bid: Bid; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "place_bid",
    [publicKey, jobId, amount, proposal, estimatedDays],
    publicKey,
    walletType
  );

  const newBid = store.addBid(jobId, publicKey, amount, proposal, estimatedDays, txResult.hash);
  return { bid: newBid, txHash: txResult.hash };
}

/**
 * Invokes `withdraw_bid` on Job Registry contract.
 */
export async function withdrawBid(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  bidId: string,
  bidIndex: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "withdraw_bid",
    [publicKey, jobId, bidIndex],
    publicKey,
    walletType
  );

  const success = store.withdrawBid(jobId, bidId, publicKey);
  return { success, txHash: txResult.hash };
}

/**
 * Invokes `accept_bid` on Job Registry contract.
 */
export async function acceptBid(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  bidIndex: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "accept_bid",
    [publicKey, jobId, bidIndex],
    publicKey,
    walletType
  );

  const success = store.acceptBid(jobId, bidIndex, publicKey, txResult.hash);
  return { success, txHash: txResult.hash };
}

/**
 * Invokes `update_status` on Job Registry contract.
 */
export async function updateJobStatus(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  newStatus: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "update_status",
    [publicKey, jobId, newStatus],
    publicKey,
    walletType
  );

  return { success: txResult.status === "success", txHash: txResult.hash };
}

export async function getJob(jobId: number): Promise<Job | null> {
  const state = await queryContractState(CONTRACTS.jobRegistry, "get_job", [jobId]);
  return state || store.getJob(jobId) || null;
}

export async function getBids(jobId: number): Promise<Bid[]> {
  const bids = await queryContractState(CONTRACTS.jobRegistry, "get_bids", [jobId]);
  return bids || store.getBids(jobId);
}

export async function getJobCount(): Promise<number> {
  const count = await queryContractState(CONTRACTS.jobRegistry, "job_count", []);
  return count !== null ? Number(count) : store.getJobs().length;
}

export async function listJobs(start = 0, limit = 20): Promise<Job[]> {
  const jobs = await queryContractState(CONTRACTS.jobRegistry, "list_jobs", [start, limit]);
  return jobs || store.getJobs();
}

// ── Escrow Contract Calls (contracts/escrow/src/lib.rs) ───────────────

/**
 * Invokes `fund_escrow` on Escrow contract.
 */
export async function fundEscrow(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  freelancer: string,
  arbitrator: string,
  amount: number,
  milestoneCount: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "fund_escrow",
    [publicKey, jobId, freelancer, arbitrator, amount, milestoneCount],
    publicKey,
    walletType
  );

  return { success: txResult.status === "success", txHash: txResult.hash };
}

/**
 * Freelancer submits milestone deliverable proof.
 */
export async function submitMilestone(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  milestoneIndex: number,
  deliverableHash: string
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "submit_milestone",
    [publicKey, jobId, milestoneIndex, deliverableHash],
    publicKey,
    walletType
  );

  const success = store.submitMilestone(jobId, milestoneIndex, publicKey, deliverableHash);
  return { success, txHash: txResult.hash };
}

/**
 * Client approves milestone with counter-party star rating (1 to 5).
 */
export async function approveMilestone(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  milestoneIndex: number = 0,
  rating: number = 5
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "approve_milestone",
    [publicKey, jobId, milestoneIndex, rating, rating],
    publicKey,
    walletType
  );

  const success = store.approveMilestone(jobId, milestoneIndex, publicKey, rating, txResult.hash);
  return { success, txHash: txResult.hash };
}

/**
 * Raise a dispute on a milestone.
 */
export async function raiseDispute(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  milestoneIndex: number,
  reason: string
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "raise_dispute",
    [publicKey, jobId, milestoneIndex],
    publicKey,
    walletType
  );

  const success = store.raiseDispute(jobId, milestoneIndex, publicKey, reason);
  return { success, txHash: txResult.hash };
}

/**
 * Arbitrator resolves a disputed milestone.
 */
export async function resolveDispute(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  milestoneIndex: number,
  freelancerPayout: number,
  clientRefund: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "resolve_dispute",
    [publicKey, jobId, milestoneIndex, freelancerPayout, clientRefund],
    publicKey,
    walletType
  );

  const success = store.resolveDispute(jobId, milestoneIndex, publicKey, freelancerPayout, clientRefund);
  return { success, txHash: txResult.hash };
}

/**
 * Invokes `refund` on Escrow contract.
 */
export async function refundEscrow(
  publicKey: string,
  walletType: WalletType,
  jobId: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "refund",
    [publicKey, jobId],
    publicKey,
    walletType
  );

  const success = store.refundEscrow(jobId, publicKey, txResult.hash);
  return { success, txHash: txResult.hash };
}

export async function getEscrow(jobId: number): Promise<EscrowRecord | null> {
  const data = await queryContractState(CONTRACTS.escrow, "get_escrow", [jobId]);
  return data || store.getEscrow(jobId) || null;
}

// ── Reputation Contract Calls (contracts/reputation/src/lib.rs) ───────────────

export async function getReputationScore(address: string): Promise<ReputationScore> {
  const score = await queryContractState(CONTRACTS.reputation, "get_score", [address]);
  if (score) {
    return {
      jobsCompleted: Number(score.jobs_completed || 0),
      totalEarned: Number(score.total_earned || 0),
      jobsFunded: Number(score.jobs_funded || 0),
      totalSpent: Number(score.total_spent || 0),
    };
  }
  return store.getReputation(address);
}

export async function getReputation(address: string): Promise<ReputationScore> {
  return getReputationScore(address);
}
