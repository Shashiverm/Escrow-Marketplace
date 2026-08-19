#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

/// Helper: register and initialize the reputation contract.
fn setup<'a>(env: &'a Env, escrow_id: &Address) -> (Address, ReputationContractClient<'a>) {
    let id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(env, &id);
    let admin = Address::generate(env);
    client.initialize(&admin, escrow_id);
    (id, client)
}

// ────────────────────────────────────────────────────
//  Initialization
// ────────────────────────────────────────────────────

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, _client) = setup(&env, &escrow);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &escrow);
    client.initialize(&admin, &escrow);
}

// ────────────────────────────────────────────────────
//  Score & Tier Recording
// ────────────────────────────────────────────────────

#[test]
fn test_record_completion_and_tier() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let freelancer = Address::generate(&env);
    let job_client = Address::generate(&env);

    client.record_completion(&escrow, &freelancer, &job_client, &5_000_i128, &5_u32, &5_u32);

    let fl_score = client.get_score(&freelancer);
    assert_eq!(fl_score.jobs_completed, 1);
    assert_eq!(fl_score.total_earned, 5_000);
    assert_eq!(fl_score.rating_count, 1);
    assert_eq!(fl_score.rating_sum, 5);
    assert_eq!(fl_score.tier, 2); // Bronze (1 completion)

    let cl_score = client.get_score(&job_client);
    assert_eq!(cl_score.jobs_funded, 1);
    assert_eq!(cl_score.total_spent, 5_000);
    assert_eq!(cl_score.tier, 2);
}

#[test]
fn test_multiple_completions_tier_progression() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let freelancer = Address::generate(&env);
    let poster = Address::generate(&env);

    for _ in 0..5 {
        client.record_completion(&escrow, &freelancer, &poster, &2_000_i128, &5_u32, &5_u32);
    }

    let fl_score = client.get_score(&freelancer);
    assert_eq!(fl_score.jobs_completed, 5);
    assert_eq!(fl_score.total_earned, 10_000);
    assert_eq!(fl_score.tier, 4); // Gold (5 completed, 5.0 avg)
}

#[test]
fn test_dispute_recording() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let user = Address::generate(&env);
    client.record_dispute(&escrow, &user);

    let score = client.get_score(&user);
    assert_eq!(score.disputes_count, 1);
}

// ────────────────────────────────────────────────────
//  Access Control
// ────────────────────────────────────────────────────

#[test]
#[should_panic(expected = "Only escrow contract can record completions")]
fn test_unauthorized_caller() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let imposter = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let job_client = Address::generate(&env);

    client.record_completion(&imposter, &freelancer, &job_client, &1_000_i128, &5_u32, &5_u32);
}
