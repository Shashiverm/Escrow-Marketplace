//! # Reputation Contract
//!
//! Tracks on-chain reputation scores for freelancers and clients on the
//! Stellar Freelance Escrow Marketplace.  Only the registered Escrow contract
//! is authorized to record completions — ensuring scores reflect real,
//! settled escrow transactions.
//!
//! ## Events Emitted
//! - `reputation_updated` — score changed for a freelancer/client pair

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[cfg(test)]
mod test;

// ──────────────────────────────────────────────
//  Data types
// ──────────────────────────────────────────────

/// Reputation score for a single address.  Freelancer-specific and
/// client-specific counters are stored together for simplicity.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationScore {
    /// Number of jobs completed as a freelancer
    pub jobs_completed: u32,
    /// Total XLM earned as a freelancer
    pub total_earned: i128,
    /// Number of jobs funded as a client
    pub jobs_funded: u32,
    /// Total XLM spent as a client
    pub total_spent: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    EscrowId,
    Score(Address),
}

// ──────────────────────────────────────────────
//  Contract
// ──────────────────────────────────────────────

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    // ── Initialization ───────────────────────

    /// One-time setup.  Registers the Escrow contract address so that only it
    /// can record completions.
    pub fn initialize(env: Env, admin: Address, escrow_id: Address) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::EscrowId, &escrow_id);
    }

    // ── Score Recording ──────────────────────

    /// Record a completed escrow.  Increments scores for both the freelancer
    /// and the client.
    ///
    /// **Access control**: only the registered Escrow contract may call this.
    pub fn record_completion(
        env: Env,
        caller: Address,
        freelancer: Address,
        client: Address,
        amount: i128,
    ) {
        caller.require_auth();

        // Guard: only the escrow contract can record completions
        let escrow_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowId)
            .expect("Not initialized");
        assert!(
            caller == escrow_id,
            "Only escrow contract can record completions"
        );

        // ── Update freelancer score ──
        let mut fl_score = Self::load_score(&env, &freelancer);
        fl_score.jobs_completed += 1;
        fl_score.total_earned += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Score(freelancer.clone()), &fl_score);

        // ── Update client score ──
        let mut cl_score = Self::load_score(&env, &client);
        cl_score.jobs_funded += 1;
        cl_score.total_spent += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Score(client.clone()), &cl_score);

        env.events().publish(
            (Symbol::new(&env, "reputation_updated"),),
            (freelancer, client, amount),
        );
    }

    // ── Queries ──────────────────────────────

    /// Get the reputation score for an address.
    /// Returns a zero-initialized score if the address has no history.
    pub fn get_score(env: Env, address: Address) -> ReputationScore {
        Self::load_score(&env, &address)
    }

    // ── Helpers ──────────────────────────────

    fn load_score(env: &Env, address: &Address) -> ReputationScore {
        env.storage()
            .persistent()
            .get(&DataKey::Score(address.clone()))
            .unwrap_or(ReputationScore {
                jobs_completed: 0,
                total_earned: 0,
                jobs_funded: 0,
                total_spent: 0,
            })
    }
}
