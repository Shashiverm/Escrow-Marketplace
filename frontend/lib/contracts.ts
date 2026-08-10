/**
 * Typed Soroban Contract Interaction Layer
 *
 * Provides functions for posting jobs, submitting bids, accepting bids,
 * releasing escrow milestones, refunding escrows, and fetching reputation.
 */

import { CONTRACTS, executeContractTx } from "./stellar";
import { store, Job, Bid, EscrowRecord, MarketplaceEvent } from "./store";
import { WalletType } from "./wallets";

export type { Job, Bid, EscrowRecord, MarketplaceEvent };

export interface ReputationScore {
  jobsCompleted: number;
  totalEarned: number;
  jobsFunded: number;
  totalSpent: number;
}

// ── Job Registry Calls ───────────────────────────

export async function postJob(
  publicKey: string,
  walletType: WalletType,
  title: string,
  description: string,
  budget: number,
  milestoneCount: number
): Promise<{ job: Job; txHash: string }> {
  // 1. Build and sign transaction with real connected wallet
  const txResult = await executeContractTx(
    CONTRACTS.jobRegistry,
    "post_job",
    [publicKey, title, description, budget, milestoneCount],
    publicKey,
    walletType
  );

  // 2. Persist in state store
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

// ── Escrow Calls ─────────────────────────────────

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

// ── Reputation Calls ─────────────────────────────

export async function getReputation(address: string): Promise<ReputationScore> {
  return store.getReputation(address);
}
