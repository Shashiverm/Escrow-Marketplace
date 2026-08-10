//! # Escrow Contract
//!
//! Handles milestone-based fund locking and release for the Stellar Freelance
//! Escrow Marketplace.  Tokens are transferred from the client into this
//! contract on funding, then proportionally released to the freelancer as
//! milestones are approved.
//!
//! ## Cross-contract calls
//! - **Job Registry** — updates job status to `Completed` or `Cancelled`
//! - **Reputation**   — records completion for both freelancer and client
//!
//! ## Events Emitted
//! - `escrow_funded`       — tokens locked for a job
//! - `milestone_approved`  — client approved + released a milestone payment
//! - `escrow_completed`    — all milestones paid, job done
//! - `escrow_refunded`     — remaining funds returned to client

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, IntoVal, Symbol, Val, Vec,
};

#[cfg(test)]
mod test;

// ──────────────────────────────────────────────
//  Data types
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq)]
#[repr(u32)]
pub enum EscrowStatus {
    Active = 0,
    Completed = 1,
    Refunded = 2,
}

/// Escrow record for a single job.
#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub job_id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub total_amount: i128,
    pub milestone_count: u32,
    pub per_milestone: i128,
    pub milestones_approved: u32,
    pub milestones_released: u32,
    pub status: EscrowStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenId,
    JobRegistryId,
    ReputationId,
    Escrow(u64),
}

// ──────────────────────────────────────────────
//  Contract
// ──────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // ── Initialization ───────────────────────

    /// One-time setup.  Stores references to the token contract, Job Registry,
    /// and Reputation contract addresses.
    pub fn initialize(
        env: Env,
        admin: Address,
        token_id: Address,
        job_registry_id: Address,
        reputation_id: Address,
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
    }

    // ── Funding ──────────────────────────────

    /// Lock tokens for a job.  The `client` transfers `amount` into this
    /// contract's address.  Each milestone pays `amount / milestone_count`.
    pub fn fund_escrow(
        env: Env,
        client: Address,
        job_id: u64,
        freelancer: Address,
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

        let escrow = EscrowData {
            job_id,
            client: client.clone(),
            freelancer,
            total_amount: amount,
            milestone_count,
            per_milestone,
            milestones_approved: 0,
            milestones_released: 0,
            status: EscrowStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "escrow_funded"), client),
            (job_id, amount, milestone_count),
        );
    }

    // ── Milestone Approval & Release ─────────

    /// Approve the next sequential milestone and release payment to the
    /// freelancer.  Only the `client` who funded the escrow may call this.
    ///
    /// On the final milestone:
    /// - Releases all remaining funds (avoids rounding dust)
    /// - Marks the escrow as `Completed`
    /// - Cross-contract: updates Job Registry status to Completed
    /// - Cross-contract: records completion in Reputation contract
    pub fn approve_milestone(env: Env, client: Address, job_id: u64) {
        client.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(escrow.client == client, "Only client can approve");
        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");
        assert!(
            escrow.milestones_approved < escrow.milestone_count,
            "All milestones already approved"
        );

        escrow.milestones_approved += 1;

        // Calculate release amount — last milestone gets the remainder
        let release_amount = if escrow.milestones_approved == escrow.milestone_count {
            let already_released =
                escrow.per_milestone * ((escrow.milestones_approved - 1) as i128);
            escrow.total_amount - already_released
        } else {
            escrow.per_milestone
        };

        // Transfer payment to freelancer
        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenId)
            .expect("Not initialized");
        let token_client = token::Client::new(&env, &token_id);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.freelancer,
            &release_amount,
        );

        escrow.milestones_released = escrow.milestones_approved;

        // Final milestone — mark completed + cross-contract calls
        if escrow.milestones_approved == escrow.milestone_count {
            escrow.status = EscrowStatus::Completed;

            // Update job status → Completed (2)
            let job_registry_id: Address = env
                .storage()
                .instance()
                .get(&DataKey::JobRegistryId)
                .expect("Not initialized");
            Self::call_update_status(&env, &job_registry_id, job_id, 2);

            // Record completion in Reputation contract
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
            (job_id, escrow.milestones_approved, release_amount),
        );
    }

    // ── Refund ───────────────────────────────

    /// Refund remaining locked funds to the client and cancel the job.
    /// Any milestones already released stay with the freelancer.
    pub fn refund(env: Env, client: Address, job_id: u64) {
        client.require_auth();

        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(job_id))
            .expect("Escrow not found");

        assert!(escrow.client == client, "Only client can refund");
        assert!(escrow.status == EscrowStatus::Active, "Escrow not active");

        let released = escrow.per_milestone * (escrow.milestones_released as i128);
        let remaining = escrow.total_amount - released;

        if remaining > 0 {
            let token_id: Address = env
                .storage()
                .instance()
                .get(&DataKey::TokenId)
                .expect("Not initialized");
            let token_client = token::Client::new(&env, &token_id);
            token_client.transfer(&env.current_contract_address(), &client, &remaining);
        }

        escrow.status = EscrowStatus::Refunded;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(job_id), &escrow);

        // Update job status → Cancelled (3)
        let job_registry_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::JobRegistryId)
            .expect("Not initialized");
        Self::call_update_status(&env, &job_registry_id, job_id, 3);

        env.events().publish(
            (Symbol::new(&env, "escrow_refunded"), client),
            (job_id, remaining),
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

    // ── Cross-Contract Helpers (private) ─────

    /// Invoke `update_status` on the Job Registry contract.
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

    /// Invoke `record_completion` on the Reputation contract.
    fn call_record_completion(
        env: &Env,
        reputation_id: &Address,
        freelancer: &Address,
        client: &Address,
        amount: i128,
    ) {
        let func = Symbol::new(env, "record_completion");
        let caller: Val = env.current_contract_address().into_val(env);
        let fl: Val = freelancer.into_val(env);
        let cl: Val = client.into_val(env);
        let am: Val = amount.into_val(env);

        let mut args: Vec<Val> = Vec::new(env);
        args.push_back(caller);
        args.push_back(fl);
        args.push_back(cl);
        args.push_back(am);

        env.invoke_contract::<()>(reputation_id, &func, args);
    }
}
