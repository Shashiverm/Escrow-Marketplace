#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

/// Helper: register and initialize the reputation contract.
fn setup(env: &Env, escrow_id: &Address) -> (Address, ReputationContractClient) {
    let id = env.register_contract(None, ReputationContract);
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
    // No panic → success
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let id = env.register_contract(None, ReputationContract);
    let client = ReputationContractClient::new(&env, &id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &escrow);
    client.initialize(&admin, &escrow); // should panic
}

// ────────────────────────────────────────────────────
//  Score Recording
// ────────────────────────────────────────────────────

#[test]
fn test_record_completion() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let freelancer = Address::generate(&env);
    let job_client = Address::generate(&env);

    client.record_completion(&escrow, &freelancer, &job_client, &5_000_i128);

    let fl_score = client.get_score(&freelancer);
    assert_eq!(fl_score.jobs_completed, 1);
    assert_eq!(fl_score.total_earned, 5_000);
    assert_eq!(fl_score.jobs_funded, 0);
    assert_eq!(fl_score.total_spent, 0);

    let cl_score = client.get_score(&job_client);
    assert_eq!(cl_score.jobs_completed, 0);
    assert_eq!(cl_score.total_earned, 0);
    assert_eq!(cl_score.jobs_funded, 1);
    assert_eq!(cl_score.total_spent, 5_000);
}

#[test]
fn test_multiple_completions() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let freelancer = Address::generate(&env);
    let client1 = Address::generate(&env);
    let client2 = Address::generate(&env);

    client.record_completion(&escrow, &freelancer, &client1, &3_000_i128);
    client.record_completion(&escrow, &freelancer, &client2, &7_000_i128);

    let fl_score = client.get_score(&freelancer);
    assert_eq!(fl_score.jobs_completed, 2);
    assert_eq!(fl_score.total_earned, 10_000);
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

    // Call from a non-escrow address → should panic
    client.record_completion(&imposter, &freelancer, &job_client, &1_000_i128);
}

// ────────────────────────────────────────────────────
//  Queries
// ────────────────────────────────────────────────────

#[test]
fn test_get_score_nonexistent() {
    let env = Env::default();
    env.mock_all_auths();

    let escrow = Address::generate(&env);
    let (_id, client) = setup(&env, &escrow);

    let unknown = Address::generate(&env);
    let score = client.get_score(&unknown);

    assert_eq!(score.jobs_completed, 0);
    assert_eq!(score.total_earned, 0);
    assert_eq!(score.jobs_funded, 0);
    assert_eq!(score.total_spent, 0);
}
