//! # Reputation Contract
//!
//! Tracks on-chain reputation scores, ratings (1-5 stars), completion metrics,
//! dispute records, and tier ranking for freelancers and clients on the
//! Stellar Freelance Escrow Marketplace.
//!
//! ## Events Emitted
//! - `reputation_updated` — score and tier changed for a freelancer/client pair
//! - `dispute_recorded`   — dispute penalty recorded for a party

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[cfg(test)]
mod test;

// ──────────────────────────────────────────────
//  Data types
// ──────────────────────────────────────────────

/// Reputation score for a single address.
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationScore {
    /// Number of jobs completed as a freelancer
    pub jobs_completed: u32,
    /// Total tokens earned as a freelancer
    pub total_earned: i128,
    /// Number of jobs funded as a client
    pub jobs_funded: u32,
    /// Total tokens spent as a client
    pub total_spent: i128,
    /// Total star rating count (number of reviews received)
    pub rating_count: u32,
    /// Sum of all star ratings (each 1..=5)
    pub rating_sum: u32,
    /// Number of disputes recorded
    pub disputes_count: u32,
    /// Tier level: 1 = Novice, 2 = Bronze, 3 = Silver, 4 = Gold, 5 = Elite Master
    pub tier: u32,
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

    /// One-time setup. Registers the Escrow contract address.
    pub fn initialize(env: Env, admin: Address, escrow_id: Address) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::EscrowId, &escrow_id);
    }

    // ── Score Recording ──────────────────────

    /// Record a completed escrow with ratings (1 to 5 stars).
    /// Access control: only the registered Escrow contract may call this.
    pub fn record_completion(
        env: Env,
        caller: Address,
        freelancer: Address,
        client: Address,
        amount: i128,
        freelancer_rating: u32,
        client_rating: u32,
    ) {
        caller.require_auth();

        let escrow_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowId)
            .expect("Not initialized");
        assert!(
            caller == escrow_id,
            "Only escrow contract can record completions"
        );

        let fl_rating = freelancer_rating.clamp(1, 5);
        let cl_rating = client_rating.clamp(1, 5);

        // ── Update freelancer score ──
        let mut fl_score = Self::load_score(&env, &freelancer);
        fl_score.jobs_completed += 1;
        fl_score.total_earned += amount;
        fl_score.rating_count += 1;
        fl_score.rating_sum += fl_rating;
        fl_score.tier = Self::calculate_tier(&fl_score);
        env.storage()
            .persistent()
            .set(&DataKey::Score(freelancer.clone()), &fl_score);

        // ── Update client score ──
        let mut cl_score = Self::load_score(&env, &client);
        cl_score.jobs_funded += 1;
        cl_score.total_spent += amount;
        cl_score.rating_count += 1;
        cl_score.rating_sum += cl_rating;
        cl_score.tier = Self::calculate_tier(&cl_score);
        env.storage()
            .persistent()
            .set(&DataKey::Score(client.clone()), &cl_score);

        env.events().publish(
            (Symbol::new(&env, "reputation_updated"),),
            (freelancer, client, amount),
        );
    }

    /// Record a dispute on an address.
    pub fn record_dispute(env: Env, caller: Address, party: Address) {
        caller.require_auth();

        let escrow_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowId)
            .expect("Not initialized");
        assert!(
            caller == escrow_id,
            "Only escrow contract can record disputes"
        );

        let mut score = Self::load_score(&env, &party);
        score.disputes_count += 1;
        score.tier = Self::calculate_tier(&score);
        env.storage()
            .persistent()
            .set(&DataKey::Score(party.clone()), &score);

        env.events().publish(
            (Symbol::new(&env, "dispute_recorded"),),
            (party, score.disputes_count),
        );
    }

    // ── Queries ──────────────────────────────

    /// Get the reputation score for an address.
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
                rating_count: 0,
                rating_sum: 0,
                disputes_count: 0,
                tier: 1,
            })
    }

    fn calculate_tier(score: &ReputationScore) -> u32 {
        let total_activity = score.jobs_completed + score.jobs_funded;
        if total_activity == 0 {
            return 1; // Novice
        }

        let avg_rating_x10 = if score.rating_count > 0 {
            (score.rating_sum * 10) / score.rating_count
        } else {
            30 // neutral
        };

        if total_activity >= 10 && avg_rating_x10 >= 45 && score.disputes_count == 0 {
            5 // Elite Master
        } else if total_activity >= 5 && avg_rating_x10 >= 40 {
            4 // Gold
        } else if total_activity >= 3 && avg_rating_x10 >= 35 {
            3 // Silver
        } else if total_activity >= 1 {
            2 // Bronze
        } else {
            1 // Novice
        }
    }
}
