//! # Escrow Contract
//!
//! Handles advanced milestone-based fund locking, deliverable submission, client approval,
//! dispute arbitration, and protocol fee deduction for the Stellar Freelance Escrow Marketplace.
//!
//! ## Cross-contract calls
//! - **Job Registry** — updates job status to `Completed`, `Cancelled`, or `Disputed`
//! - **Reputation**   — records rating & completion for both parties or records dispute
//!
//! ## Events Emitted
//! - `escrow_funded`      — tokens locked for a job
//! - `milestone_submitted` — freelancer submitted work proof/hash
//! - `milestone_approved`  — client approved + released a milestone payment
//! - `dispute_raised`      — milestone entered dispute
//! - `dispute_resolved`    — arbitrator resolved milestone distribution
//! - `escrow_completed`    — all milestones paid, job finalized
//! - `escrow_refunded`     — unreleased funds returned to client

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, IntoVal, String, Symbol, Val, Vec,
};

#[cfg(test)]
mod test;

// ──────────────────────────────────────────────
//  Data types
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum EscrowStatus {
    Active = 0,
    Completed = 1,
    Refunded = 2,
    Disputed = 3,
}

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum MilestoneState {
    Pending = 0,
    Submitted = 1,
    Approved = 2,
    Disputed = 3,
    Refunded = 4,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Milestone {
    pub index: u32,
    pub amount: i128,
    pub state: MilestoneState,
    pub deliverable_hash: String,
}

/// Escrow record for a single job.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EscrowData {
    pub job_id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub arbitrator: Address,
    pub total_amount: i128,
    pub milestone_count: u32,
    pub per_milestone: i128,
    pub milestones_approved: u32,
    pub status: EscrowStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenId,
    JobRegistryId,
    ReputationId,
    TreasuryAccount,
    TreasuryFeeBps,
    Escrow(u64),
    Milestones(u64),
}

// ──────────────────────────────────────────────
//  Contract
// ──────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // ── Initialization ───────────────────────

    /// One-time setup.
    pub fn initialize(
        env: Env,
        admin: Address,
        token_id: Address,
        job_registry_id: Address,
        reputation_id: Address,
        treasury_account: Address,
        treasury_fee_bps: u32,
    ) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenId, &token_id);
        env.storage()
            .instance()
            .set(&DataKey::JobRegistryId, &job_registry_id);
        env.storage()
            .instance()
            .set(&DataKey::ReputationId, &reputation_id);
        env.storage()
            .instance()
            .set(&DataKey::TreasuryAccount, &treasury_account);
        env.storage()
            .instance()
            .set(&DataKey::TreasuryFeeBps, &treasury_fee_bps);
    }

    // ── Funding ──────────────────────────────

    /// Lock tokens for a job with equal milestone amounts.
    pub fn fund_escrow(
        env: Env,
        client: Address,
        job_id: u64,
        freelancer: Address,
        arbitrator: Address,
        amount: i128,
        milestone_count: u32,
    ) {
        client.require_auth();

        assert!(amount > 0, "Amount must be positive");
        assert!(milestone_count > 0, "Need at least one milestone");

        if env.storage().persistent().has(&DataKey::Escrow(job_id)) {
            panic!("Escrow already exists for this job");
        }

        // Transfer tokens from client → this contract
        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenId)
            .expect("Not initialized");
        let token_client = token::Client::new(&env, &token_id);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        let per_milestone = amount / (milestone_count as i128);

        let mut milestones = Vec::new(&env);
        let mut i: u32 = 0;
        while i < milestone_count {
            let m_amount = if i == milestone_count - 1 {
                amount - (per_milestone * ((milestone_count - 1) as i128))
            } else {
                per_milestone
            };

            milestones.push_back(Milestone {
                index: i,
                amount: m_amount,
                state: MilestoneState::Pending,
                deliverable_hash: String::from_str(&env, ""),
            });
            i += 1;
        }

        let escrow = EscrowData {
            job_id,
            client: client.clone(),
            freelancer,
            arbitrator,
            total_amount: amount,
            milestone_count,
            per_milestone,
            milestones_approved: 0,
            status: EscrowStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        env.events().publish(
            (Symbol::new(&env, "escrow_funded"), client),
            (job_id, amount, milestone_count),
        );
    }

    /// Lock tokens for a job with custom milestone payout amounts.
    pub fn fund_escrow_custom(
        env: Env,
        client: Address,
        job_id: u64,
        freelancer: Address,
        arbitrator: Address,
        milestone_amounts: Vec<i128>,
    ) {
        client.require_auth();

        let count = milestone_amounts.len();
        assert!(count > 0, "Need at least one milestone");

        let mut total_amount: i128 = 0;
        let mut i: u32 = 0;
        while i < count {
            let amt = milestone_amounts.get(i).unwrap();
            assert!(amt > 0, "Milestone amount must be positive");
            total_amount += amt;
            i += 1;
        }

        if env.storage().persistent().has(&DataKey::Escrow(job_id)) {
            panic!("Escrow already exists for this job");
        }

        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenId)
            .expect("Not initialized");
        let token_client = token::Client::new(&env, &token_id);
        token_client.transfer(&client, &env.current_contract_address(), &total_amount);

        let mut milestones = Vec::new(&env);
        i = 0;
        while i < count {
            milestones.push_back(Milestone {
                index: i,
                amount: milestone_amounts.get(i).unwrap(),
                state: MilestoneState::Pending,
                deliverable_hash: String::from_str(&env, ""),
            });
            i += 1;
        }

        let escrow = EscrowData {
            job_id,
            client: client.clone(),
            freelancer,
            arbitrator,
            total_amount,
            milestone_count: count,
            per_milestone: total_amount / (count as i128),
            milestones_approved: 0,
            status: EscrowStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        env.events().publish(
            (Symbol::new(&env, "escrow_funded"), client),
            (job_id, total_amount, count),
        );
    }

    // ── Milestone Submission ─────────────────

    /// Freelancer submits proof of work/deliverable hash for review.
    pub fn submit_milestone(
        env: Env,
        freelancer: Address,
        job_id: u64,
        milestone_index: u32,
        deliverable_hash: String,
    ) {
        freelancer.require_auth();

        let escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(escrow.freelancer == freelancer, "Only assigned freelancer can submit");
        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");

        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(job_id))
            .expect("Milestones not found");

        let mut milestone = milestones.get(milestone_index).expect("Invalid milestone index");
        assert!(
            milestone.state == MilestoneState::Pending || milestone.state == MilestoneState::Submitted,
            "Cannot submit for current milestone state"
        );

        milestone.state = MilestoneState::Submitted;
        milestone.deliverable_hash = deliverable_hash.clone();
        milestones.set(milestone_index, milestone);
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        env.events().publish(
            (Symbol::new(&env, "milestone_submitted"), freelancer),
            (job_id, milestone_index),
        );
    }

    // ── Milestone Approval & Release ─────────

    /// Approve milestone payment with counter-party ratings (1 to 5).
    pub fn approve_milestone(
        env: Env,
        client: Address,
        job_id: u64,
        milestone_index: u32,
        freelancer_rating: u32,
        client_rating: u32,
    ) {
        client.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(escrow.client == client, "Only client can approve");
        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");

        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(job_id))
            .expect("Milestones not found");

        let mut milestone = milestones.get(milestone_index).expect("Invalid milestone index");
        assert!(
            milestone.state == MilestoneState::Pending || milestone.state == MilestoneState::Submitted,
            "Milestone is not in an approvable state"
        );

        milestone.state = MilestoneState::Approved;
        milestones.set(milestone_index, milestone.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        escrow.milestones_approved += 1;

        // Protocol fee calculation
        let fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TreasuryFeeBps)
            .unwrap_or(0);
        let treasury: Address = env
            .storage()
            .instance()
            .get(&DataKey::TreasuryAccount)
            .unwrap_or_else(|| client.clone());

        let fee_amount = if fee_bps > 0 {
            (milestone.amount * (fee_bps as i128)) / 10_000
        } else {
            0
        };
        let payout = milestone.amount - fee_amount;

        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenId)
            .expect("Not initialized");
        let token_client = token::Client::new(&env, &token_id);

        if fee_amount > 0 {
            token_client.transfer(&env.current_contract_address(), &treasury, &fee_amount);
        }
        token_client.transfer(&env.current_contract_address(), &escrow.freelancer, &payout);

        // Final milestone check
        if escrow.milestones_approved == escrow.milestone_count {
            escrow.status = EscrowStatus::Completed;

            // Update Job Registry status → Completed (2)
            let job_registry_id: Address = env
                .storage()
                .instance()
                .get(&DataKey::JobRegistryId)
                .expect("Not initialized");
            Self::call_update_status(&env, &job_registry_id, job_id, 2);

            // Record completion and ratings in Reputation contract
            let reputation_id: Address = env
                .storage()
                .instance()
                .get(&DataKey::ReputationId)
                .expect("Not initialized");
            Self::call_record_completion(
                &env,
                &reputation_id,
                &escrow.freelancer,
                &escrow.client,
                escrow.total_amount,
                freelancer_rating,
                client_rating,
            );

            env.events()
                .publish((Symbol::new(&env, "escrow_completed"),), job_id);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);

        env.events().publish(
            (
                Symbol::new(&env, "milestone_approved"),
                escrow.freelancer.clone(),
            ),
            (job_id, milestone_index, payout),
        );
    }

    // ── Dispute Raising & Resolution ─────────

    /// Raise a dispute on a milestone by either the client or freelancer.
    pub fn raise_dispute(env: Env, caller: Address, job_id: u64, milestone_index: u32) {
        caller.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(
            caller == escrow.client || caller == escrow.freelancer,
            "Only client or freelancer can raise dispute"
        );
        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");

        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(job_id))
            .expect("Milestones not found");

        let mut milestone = milestones.get(milestone_index).expect("Invalid milestone index");
        assert!(
            milestone.state == MilestoneState::Pending || milestone.state == MilestoneState::Submitted,
            "Cannot dispute already finalized milestone"
        );

        milestone.state = MilestoneState::Disputed;
        milestones.set(milestone_index, milestone);
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        escrow.status = EscrowStatus::Disputed;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);

        // Update Job Registry status → Disputed (4)
        let job_registry_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::JobRegistryId)
            .expect("Not initialized");
        Self::call_update_status(&env, &job_registry_id, job_id, 4);

        // Record dispute on both parties
        let reputation_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::ReputationId)
            .expect("Not initialized");
        Self::call_record_dispute(&env, &reputation_id, &escrow.freelancer);
        Self::call_record_dispute(&env, &reputation_id, &escrow.client);

        env.events().publish(
            (Symbol::new(&env, "dispute_raised"), caller),
            (job_id, milestone_index),
        );
    }

    /// Arbitrator resolves a disputed milestone by dividing the milestone amount.
    pub fn resolve_dispute(
        env: Env,
        arbitrator: Address,
        job_id: u64,
        milestone_index: u32,
        freelancer_payout: i128,
        client_refund: i128,
    ) {
        arbitrator.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(
            escrow.arbitrator == arbitrator,
            "Only assigned arbitrator can resolve"
        );
        assert!(escrow.status == EscrowStatus::Disputed, "Escrow not disputed");

        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(job_id))
            .expect("Milestones not found");

        let mut milestone = milestones.get(milestone_index).expect("Invalid milestone index");
        assert!(
            milestone.state == MilestoneState::Disputed,
            "Milestone not in disputed state"
        );
        assert!(
            freelancer_payout + client_refund <= milestone.amount,
            "Total payout exceeds milestone amount"
        );

        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenId)
            .expect("Not initialized");
        let token_client = token::Client::new(&env, &token_id);

        if freelancer_payout > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.freelancer,
                &freelancer_payout,
            );
        }
        if client_refund > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.client,
                &client_refund,
            );
        }

        milestone.state = MilestoneState::Approved;
        milestones.set(milestone_index, milestone);
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        escrow.milestones_approved += 1;
        if escrow.milestones_approved == escrow.milestone_count {
            escrow.status = EscrowStatus::Completed;
        } else {
            escrow.status = EscrowStatus::Active;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "dispute_resolved"), arbitrator),
            (job_id, milestone_index, freelancer_payout, client_refund),
        );
    }

    // ── Refund ───────────────────────────────

    /// Refund remaining unapproved milestones to the client and cancel the job.
    pub fn refund(env: Env, client: Address, job_id: u64) {
        client.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(escrow.client == client, "Only client can refund");
        assert!(
            escrow.status == EscrowStatus::Active || escrow.status == EscrowStatus::Disputed,
            "Escrow cannot be refunded"
        );

        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&DataKey::Milestones(job_id))
            .expect("Milestones not found");

        let mut refundable: i128 = 0;
        let mut i: u32 = 0;
        let count = milestones.len();
        while i < count {
            let mut m = milestones.get(i).unwrap();
            if m.state != MilestoneState::Approved && m.state != MilestoneState::Refunded {
                refundable += m.amount;
                m.state = MilestoneState::Refunded;
                milestones.set(i, m);
            }
            i += 1;
        }

        if refundable > 0 {
            let token_id: Address = env
                .storage()
                .instance()
                .get(&DataKey::TokenId)
                .expect("Not initialized");
            let token_client = token::Client::new(&env, &token_id);
            token_client.transfer(&env.current_contract_address(), &client, &refundable);
        }

        escrow.status = EscrowStatus::Refunded;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);
        env.storage()
            .persistent()
            .set(&DataKey::Milestones(job_id), &milestones);

        // Update job status → Cancelled (3)
        let job_registry_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::JobRegistryId)
            .expect("Not initialized");
        Self::call_update_status(&env, &job_registry_id, job_id, 3);

        env.events().publish(
            (Symbol::new(&env, "escrow_refunded"), client),
            (job_id, refundable),
        );
    }

    // ── Queries ──────────────────────────────

    /// Retrieve escrow data for a job.
    pub fn get_escrow(env: Env, job_id: u64) -> EscrowData {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found")
    }

    /// Retrieve milestones for a job.
    pub fn get_milestones(env: Env, job_id: u64) -> Vec<Milestone> {
        env.storage()
            .persistent()
            .get(&DataKey::Milestones(job_id))
            .unwrap_or(Vec::new(&env))
    }

    // ── Cross-Contract Helpers (private) ─────

    fn call_update_status(env: &Env, job_registry_id: &Address, job_id: u64, status: u32) {
        let func = Symbol::new(env, "update_status");
        let caller: Val = env.current_contract_address().into_val(env);
        let jid: Val = job_id.into_val(env);
        let st: Val = status.into_val(env);

        let mut args: Vec<Val> = Vec::new(env);
        args.push_back(caller);
        args.push_back(jid);
        args.push_back(st);

        env.invoke_contract::<()>(job_registry_id, &func, args);
    }

    fn call_record_completion(
        env: &Env,
        reputation_id: &Address,
        freelancer: &Address,
        client: &Address,
        amount: i128,
        freelancer_rating: u32,
        client_rating: u32,
    ) {
        let func = Symbol::new(env, "record_completion");
        let caller: Val = env.current_contract_address().into_val(env);
        let fl: Val = freelancer.into_val(env);
        let cl: Val = client.into_val(env);
        let am: Val = amount.into_val(env);
        let fr: Val = freelancer_rating.into_val(env);
        let cr: Val = client_rating.into_val(env);

        let mut args: Vec<Val> = Vec::new(env);
        args.push_back(caller);
        args.push_back(fl);
        args.push_back(cl);
        args.push_back(am);
        args.push_back(fr);
        args.push_back(cr);

        env.invoke_contract::<()>(reputation_id, &func, args);
    }

    fn call_record_dispute(env: &Env, reputation_id: &Address, party: &Address) {
        let func = Symbol::new(env, "record_dispute");
        let caller: Val = env.current_contract_address().into_val(env);
        let p: Val = party.into_val(env);

        let mut args: Vec<Val> = Vec::new(env);
        args.push_back(caller);
        args.push_back(p);

        env.invoke_contract::<()>(reputation_id, &func, args);
    }
}
