//! # Job Registry Contract
//!
//! Manages the lifecycle of freelance jobs on the Stellar Freelance Escrow Marketplace.
//! Handles job posting with categories & deadlines, scalable bidding, bid withdrawal,
//! bid acceptance, and status tracking.
//!
//! ## Events Emitted
//! - `job_posted`     — when a new job is created
//! - `bid_placed`     — when a freelancer submits a bid
//! - `bid_withdrawn`  — when a freelancer withdraws their bid
//! - `bid_accepted`   — when the client accepts a bid
//! - `status_updated` — when the job status changes (via escrow contract)

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec,
};

#[cfg(test)]
mod test;

// ──────────────────────────────────────────────
//  Data types
// ──────────────────────────────────────────────

/// Possible states of a job listing.
#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum JobStatus {
    Open = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
    Disputed = 4,
}

/// A freelancer's bid on a job.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Bid {
    pub freelancer: Address,
    pub amount: i128,
    pub proposal: String,
    pub estimated_days: u32,
    pub is_active: bool,
}

/// A job listing with metadata, status, and assigned freelancer.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Job {
    pub id: u64,
    pub client: Address,
    pub title: String,
    pub description: String,
    pub category: String,
    pub budget: i128,
    pub milestone_count: u32,
    pub status: JobStatus,
    pub freelancer: Address,
    pub bid_count: u32,
    pub deadline: u64,
}

/// Storage keys for the Job Registry contract.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Global job counter (u64)
    JobCount,
    /// Individual job by ID
    Job(u64),
    /// Bids for a job by ID
    Bids(u64),
}

// ──────────────────────────────────────────────
//  Contract
// ──────────────────────────────────────────────

#[contract]
pub struct JobRegistryContract;

#[contractimpl]
impl JobRegistryContract {
    // ── Job Posting ──────────────────────────

    /// Create a new job listing with category and deadline.
    ///
    /// Returns the newly assigned `job_id`.
    /// The caller (`client`) must authorize the transaction.
    pub fn post_job(
        env: Env,
        client: Address,
        title: String,
        description: String,
        category: String,
        budget: i128,
        milestone_count: u32,
        deadline: u64,
    ) -> u64 {
        client.require_auth();

        assert!(budget > 0, "Budget must be positive");
        assert!(milestone_count > 0, "Must have at least one milestone");

        // Increment job counter
        let job_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::JobCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::JobCount, &(job_id + 1));

        let job = Job {
            id: job_id,
            client: client.clone(),
            title,
            description,
            category,
            budget,
            milestone_count,
            status: JobStatus::Open,
            freelancer: client.clone(), // placeholder until bid accepted
            bid_count: 0,
            deadline,
        };

        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        // Initialize an empty bids vector for this job
        let empty_bids: Vec<Bid> = Vec::new(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Bids(job_id), &empty_bids);

        env.events()
            .publish((Symbol::new(&env, "job_posted"), client), (job_id, budget));

        job_id
    }

    // ── Bidding ──────────────────────────────

    /// Place a bid on an open job.
    ///
    /// Returns the index of the new bid in the job's bid list.
    pub fn place_bid(
        env: Env,
        freelancer: Address,
        job_id: u64,
        amount: i128,
        proposal: String,
        estimated_days: u32,
    ) -> u32 {
        freelancer.require_auth();

        let mut job: Job = env
            .storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        assert!(job.status == JobStatus::Open, "Job is not open for bids");
        assert!(freelancer != job.client, "Cannot bid on own job");
        assert!(amount > 0, "Bid amount must be positive");

        let bid = Bid {
            freelancer: freelancer.clone(),
            amount,
            proposal,
            estimated_days,
            is_active: true,
        };

        let mut bids: Vec<Bid> = env
            .storage()
            .persistent()
            .get(&DataKey::Bids(job_id))
            .unwrap_or(Vec::new(&env));

        let bid_index = bids.len();
        bids.push_back(bid);
        env.storage()
            .persistent()
            .set(&DataKey::Bids(job_id), &bids);

        job.bid_count = bids.len();
        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (Symbol::new(&env, "bid_placed"), freelancer),
            (job_id, amount),
        );

        bid_index
    }

    /// Withdraw an active bid before it is accepted.
    pub fn withdraw_bid(env: Env, freelancer: Address, job_id: u64, bid_index: u32) {
        freelancer.require_auth();

        let job: Job = env
            .storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");
        assert!(job.status == JobStatus::Open, "Job is not open");

        let mut bids: Vec<Bid> = env
            .storage()
            .persistent()
            .get(&DataKey::Bids(job_id))
            .expect("No bids found");

        let mut bid = bids.get(bid_index).expect("Invalid bid index");
        assert!(bid.freelancer == freelancer, "Not your bid");
        assert!(bid.is_active, "Bid already withdrawn");

        bid.is_active = false;
        bids.set(bid_index, bid);
        env.storage()
            .persistent()
            .set(&DataKey::Bids(job_id), &bids);

        env.events().publish(
            (Symbol::new(&env, "bid_withdrawn"), freelancer),
            (job_id, bid_index),
        );
    }

    /// Accept a bid. Only the job's client may call this.
    ///
    /// Sets the job status to `InProgress` and records the winning freelancer.
    pub fn accept_bid(env: Env, client: Address, job_id: u64, bid_index: u32) {
        client.require_auth();

        let mut job: Job = env
            .storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        assert!(job.client == client, "Only job owner can accept bids");
        assert!(job.status == JobStatus::Open, "Job is not open");

        let bids: Vec<Bid> = env
            .storage()
            .persistent()
            .get(&DataKey::Bids(job_id))
            .expect("No bids found");

        let accepted_bid = bids.get(bid_index).expect("Invalid bid index");
        assert!(accepted_bid.is_active, "Cannot accept withdrawn bid");

        job.status = JobStatus::InProgress;
        job.freelancer = accepted_bid.freelancer.clone();
        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (Symbol::new(&env, "bid_accepted"), accepted_bid.freelancer),
            (job_id, accepted_bid.amount),
        );
    }

    // ── Status Management ────────────────────

    /// Update job status. Intended for cross-contract calls from the Escrow contract.
    ///
    /// Status codes: 0 = Open, 1 = InProgress, 2 = Completed, 3 = Cancelled, 4 = Disputed
    pub fn update_status(env: Env, caller: Address, job_id: u64, new_status: u32) {
        caller.require_auth();

        let mut job: Job = match env.storage().persistent().get(&DataKey::Job(job_id)) {
            Some(j) => j,
            None => return,
        };

        job.status = match new_status {
            0 => JobStatus::Open,
            1 => JobStatus::InProgress,
            2 => JobStatus::Completed,
            3 => JobStatus::Cancelled,
            4 => JobStatus::Disputed,
            _ => panic!("Invalid status code"),
        };

        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (Symbol::new(&env, "status_updated"),),
            (job_id, new_status),
        );
    }

    // ── Queries ──────────────────────────────

    /// Retrieve a single job by ID.
    pub fn get_job(env: Env, job_id: u64) -> Job {
        env.storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .expect("Job not found")
    }

    /// Retrieve all bids for a job.
    pub fn get_bids(env: Env, job_id: u64) -> Vec<Bid> {
        env.storage()
            .persistent()
            .get(&DataKey::Bids(job_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Returns the total number of jobs posted.
    pub fn job_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::JobCount)
            .unwrap_or(0)
    }

    /// List jobs with pagination.
    ///
    /// Returns up to `limit` jobs starting from `start` index.
    pub fn list_jobs(env: Env, start: u64, limit: u64) -> Vec<Job> {
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::JobCount)
            .unwrap_or(0);

        let mut end = start + limit;
        if end > count {
            end = count;
        }

        let mut jobs = Vec::new(&env);
        let mut i = start;
        while i < end {
            if let Some(job) = env.storage().persistent().get(&DataKey::Job(i)) {
                jobs.push_back(job);
            }
            i += 1;
        }
        jobs
    }

    /// List jobs filtered by status.
    pub fn list_jobs_by_status(env: Env, status: u32, start: u64, limit: u64) -> Vec<Job> {
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::JobCount)
            .unwrap_or(0);

        let target_status = match status {
            0 => JobStatus::Open,
            1 => JobStatus::InProgress,
            2 => JobStatus::Completed,
            3 => JobStatus::Cancelled,
            4 => JobStatus::Disputed,
            _ => return Vec::new(&env),
        };

        let mut matched = Vec::new(&env);
        let mut skipped: u64 = 0;
        let mut i: u64 = 0;

        while i < count && (matched.len() as u64) < limit {
            if let Some(job) = env.storage().persistent().get::<DataKey, Job>(&DataKey::Job(i)) {
                if job.status == target_status {
                    if skipped >= start {
                        matched.push_back(job);
                    } else {
                        skipped += 1;
                    }
                }
            }
            i += 1;
        }

        matched
    }
}
