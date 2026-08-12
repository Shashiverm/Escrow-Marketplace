/**
 * Typed Soroban Contract Interaction Layer
 *
 * Provides typed TypeScript functions for posting jobs, submitting bids,
 * accepting bids, updating job status, funding escrow, releasing milestones,
 * refunding escrow, and querying contract state/reputation across all 3 Soroban contracts.
 */

import { CONTRACTS, executeContractTx, queryContractState } from "./stellar";
import { store, Job, Bid, EscrowRecord, MarketplaceEvent } from "./store";
import type { WalletType } from "./wallets";

export type { Job, Bid, EscrowRecord, MarketplaceEvent };

export interface ReputationScore {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
}

// ── Job Registry Contract Calls (contracts/job_registry/src/lib.rs) ───────────────

/**
 * Invokes `post_job` on Job Registry contract.
 * Rust signature: `post_job(env: Env, client: Address, title: String, description: String, budget: i128, milestone_count: u32) -> u64`
 */
export async function postJob(
  publicKey: string,
  walletType: WalletType,
  title: string,
  description: string,
  budget: number,
  milestoneCount: number
): Promise<{ job: Job; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "post_job",
    [publicKey, title, description, budget, milestoneCount],
    publicKey,
    walletType
  );

  const newJob = store.addJob(
    {
      client: publicKey,
      title,
      description,
      budget,
      milestoneCount,
    },
    txResult.hash
  );

  return { job: newJob, txHash: txResult.hash };
}

/**
 * Invokes `place_bid` on Job Registry contract.
 * Rust signature: `place_bid(env: Env, freelancer: Address, job_id: u64, amount: i128, proposal: String) -> u32`
 */
export async function placeBid(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  amount: number,
  proposal: string
): Promise<{ bid: Bid; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "place_bid",
    [publicKey, jobId, amount, proposal],
    publicKey,
    walletType
  );

  const newBid = store.addBid(jobId, publicKey, amount, proposal, txResult.hash);
  return { bid: newBid, txHash: txResult.hash };
}

/**
 * Invokes `accept_bid` on Job Registry contract.
 * Rust signature: `accept_bid(env: Env, client: Address, job_id: u64, bid_index: u32)`
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
 * Rust signature: `update_status(env: Env, caller: Address, job_id: u64, new_status: u32)`
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

/**
 * Queries `get_job` on Job Registry contract.
 * Rust signature: `get_job(env: Env, job_id: u64) -> Job`
 */
export async function getJob(jobId: number): Promise<Job | null> {
  const state = await queryContractState(CONTRACTS.jobRegistry, "get_job", [jobId]);
  return state || store.getJob(jobId) || null;
}

/**
 * Queries `get_bids` on Job Registry contract.
 * Rust signature: `get_bids(env: Env, job_id: u64) -> Vec<Bid>`
 */
export async function getBids(jobId: number): Promise<Bid[]> {
  const bids = await queryContractState(CONTRACTS.jobRegistry, "get_bids", [jobId]);
  return bids || store.getBids(jobId);
}

/**
 * Queries `job_count` on Job Registry contract.
 * Rust signature: `job_count(env: Env) -> u64`
 */
export async function getJobCount(): Promise<number> {
  const count = await queryContractState(CONTRACTS.jobRegistry, "job_count", []);
  return count !== null ? Number(count) : store.getJobs().length;
}

/**
 * Queries `list_jobs` on Job Registry contract.
 * Rust signature: `list_jobs(env: Env, start: u64, limit: u64) -> Vec<Job>`
 */
export async function listJobs(start = 0, limit = 10): Promise<Job[]> {
  const jobs = await queryContractState(CONTRACTS.jobRegistry, "list_jobs", [start, limit]);
  return jobs || store.getJobs();
}

// ── Escrow Contract Calls (contracts/escrow/src/lib.rs) ───────────────

/**
 * Invokes `fund_escrow` on Escrow contract.
 * Rust signature: `fund_escrow(env: Env, client: Address, job_id: u64, freelancer: Address, amount: i128, milestone_count: u32)`
 */
export async function fundEscrow(
  publicKey: string,
  walletType: WalletType,
  jobId: number,
  freelancer: string,
  amount: number,
  milestoneCount: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "fund_escrow",
    [publicKey, jobId, freelancer, amount, milestoneCount],
    publicKey,
    walletType
  );

  return { success: txResult.status === "success", txHash: txResult.hash };
}

/**
 * Invokes `approve_milestone` on Escrow contract.
 * Rust signature: `approve_milestone(env: Env, client: Address, job_id: u64)`
 */
export async function approveMilestone(
  publicKey: string,
  walletType: WalletType,
  jobId: number
): Promise<{ success: boolean; txHash: string }> {
  const txResult = await executeContractTx(
    CONTRACTS.escrow,
    "approve_milestone",
    [publicKey, jobId],
    publicKey,
    walletType
  );

  const success = store.approveMilestone(jobId, publicKey, txResult.hash);
  return { success, txHash: txResult.hash };
}

/**
 * Invokes `refund` on Escrow contract.
 * Rust signature: `refund(env: Env, client: Address, job_id: u64)`
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

/**
 * Queries `get_escrow` on Escrow contract.
 * Rust signature: `get_escrow(env: Env, job_id: u64) -> EscrowData`
 */
export async function getEscrow(jobId: number): Promise<EscrowRecord | null> {
  const data = await queryContractState(CONTRACTS.escrow, "get_escrow", [jobId]);
  return data || store.getEscrow(jobId) || null;
}

// ── Reputation Contract Calls (contracts/reputation/src/lib.rs) ───────────────

/**
 * Queries `get_score` on Reputation contract.
 * Rust signature: `get_score(env: Env, address: Address) -> ReputationScore`
 */
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
