#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Env, String};
use soroban_job_registry_contract::{JobRegistryContract, JobRegistryContractClient, JobStatus as JrJobStatus};
use soroban_reputation_contract::{ReputationContract, ReputationContractClient};

// ── Test helpers ──────────────────────────────────

/// Create a test token and return (admin, token_address, token_client, admin_client).
fn setup_token<'a>(env: &'a Env) -> (Address, Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let admin = Address::generate(env);
    let token_addr = env.register_stellar_asset_contract_v2(admin.clone());
    let tc = token::Client::new(env, &token_addr.address());
    let ac = token::StellarAssetClient::new(env, &token_addr.address());
    (admin, token_addr.address().clone(), tc, ac)
}

/// Register the Escrow contract alone and initialize it.
fn setup_escrow<'a>(
    env: &'a Env,
    token_addr: &Address,
) -> (Address, EscrowContractClient<'a>) {
    let job_registry = env.register(JobRegistryContract, ());
    let reputation = env.register(ReputationContract, ());
    let id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(env, &id);
    let admin = Address::generate(env);
    client.initialize(&admin, token_addr, &job_registry, &reputation);
    (id, client)
}

// ────────────────────────────────────────────────────
//  Initialization
// ────────────────────────────────────────────────────

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, _, _) = setup_token(&env);
    let (_, _client) = setup_escrow(&env, &token_addr);
    // No panic → success
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, _, _) = setup_token(&env);
    let id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &id);

    let admin = Address::generate(&env);
    let jr = Address::generate(&env);
    let rp = Address::generate(&env);

    client.initialize(&admin, &token_addr, &jr, &rp);
    client.initialize(&admin, &token_addr, &jr, &rp); // should panic
}

// ────────────────────────────────────────────────────
//  Funding
// ────────────────────────────────────────────────────

#[test]
fn test_fund_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (escrow_addr, escrow_client) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    // Mint tokens
    token_admin.mint(&client_addr, &10_000_i128);
    assert_eq!(token_client.balance(&client_addr), 10_000);

    // Fund escrow
    escrow_client.fund_escrow(&client_addr, &0_u64, &freelancer, &10_000_i128, &4_u32);

    // Verify escrow record
    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.total_amount, 10_000);
    assert_eq!(escrow.milestone_count, 4);
    assert_eq!(escrow.per_milestone, 2_500);
    assert_eq!(escrow.milestones_approved, 0);
    assert_eq!(escrow.status, EscrowStatus::Active);

    // Verify token balances
    assert_eq!(token_client.balance(&escrow_addr), 10_000);
    assert_eq!(token_client.balance(&client_addr), 0);
}

// ────────────────────────────────────────────────────
//  Milestone Approval
// ────────────────────────────────────────────────────

#[test]
fn test_approve_single_milestone() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (_escrow_addr, escrow_client) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    token_admin.mint(&client_addr, &9_000_i128);
    escrow_client.fund_escrow(&client_addr, &0_u64, &freelancer, &9_000_i128, &3_u32);

    // Approve first milestone → releases 3000
    escrow_client.approve_milestone(&client_addr, &0_u64);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.milestones_approved, 1);
    assert_eq!(escrow.milestones_released, 1);
    assert_eq!(escrow.status, EscrowStatus::Active); // not yet complete
    assert_eq!(token_client.balance(&freelancer), 3_000);
}

// ────────────────────────────────────────────────────
//  Refund
// ────────────────────────────────────────────────────

#[test]
fn test_refund_full() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (_escrow_addr, escrow_client) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    token_admin.mint(&client_addr, &6_000_i128);
    escrow_client.fund_escrow(&client_addr, &0_u64, &freelancer, &6_000_i128, &3_u32);

    // No milestones approved → full refund
    escrow_client.refund(&client_addr, &0_u64);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Refunded);
    assert_eq!(token_client.balance(&client_addr), 6_000);
}

#[test]
fn test_refund_partial() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (_escrow_addr, escrow_client) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    token_admin.mint(&client_addr, &6_000_i128);
    escrow_client.fund_escrow(&client_addr, &0_u64, &freelancer, &6_000_i128, &3_u32);

    // Approve 1 milestone (releases 2000)
    escrow_client.approve_milestone(&client_addr, &0_u64);
    assert_eq!(token_client.balance(&freelancer), 2_000);

    // Refund remaining (4000)
    escrow_client.refund(&client_addr, &0_u64);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Refunded);
    assert_eq!(token_client.balance(&client_addr), 4_000);
    assert_eq!(token_client.balance(&freelancer), 2_000);
}

// ────────────────────────────────────────────────────
//  Full Integration (with Job Registry + Reputation)
// ────────────────────────────────────────────────────

#[test]
fn test_full_milestone_flow() {
    let env = Env::default();
    env.mock_all_auths();

    // Register all three contracts
    let job_registry_id = env.register(JobRegistryContract, ());
    let reputation_id = env.register(ReputationContract, ());
    let escrow_id = env.register(EscrowContract, ());

    // Setup token
    let (_, token_addr, token_client, token_admin) = setup_token(&env);

    // Initialize escrow
    let admin = Address::generate(&env);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);
    escrow_client.initialize(&admin, &token_addr, &job_registry_id, &reputation_id);

    // Initialize reputation (escrow_id is the authorized caller)
    let rep_client =
        ReputationContractClient::new(&env, &reputation_id);
    rep_client.initialize(&admin, &escrow_id);

    // Post a job
    let jr_client =
        JobRegistryContractClient::new(&env, &job_registry_id);
    let poster = Address::generate(&env);
    let freelancer = Address::generate(&env);

    jr_client.post_job(
        &poster,
        &String::from_str(&env, "Integration Test Job"),
        &String::from_str(&env, "End-to-end cross-contract test"),
        &10_000_i128,
        &2_u32,
    );

    // Fund escrow
    token_admin.mint(&poster, &10_000_i128);
    escrow_client.fund_escrow(&poster, &0_u64, &freelancer, &10_000_i128, &2_u32);

    // Approve milestone 1 → releases 5000
    escrow_client.approve_milestone(&poster, &0_u64);
    assert_eq!(token_client.balance(&freelancer), 5_000);
    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.milestones_approved, 1);
    assert_eq!(escrow.status, EscrowStatus::Active);

    // Approve milestone 2 (final) → releases remaining, triggers cross-contract
    escrow_client.approve_milestone(&poster, &0_u64);
    assert_eq!(token_client.balance(&freelancer), 10_000);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.milestones_approved, 2);
    assert_eq!(escrow.status, EscrowStatus::Completed);

    // Verify Job Registry status was updated to Completed
    let job = jr_client.get_job(&0);
    assert_eq!(job.status, JrJobStatus::Completed);

    // Verify Reputation was updated
    let fl_score = rep_client.get_score(&freelancer);
    assert_eq!(fl_score.jobs_completed, 1);
    assert_eq!(fl_score.total_earned, 10_000);

    let cl_score = rep_client.get_score(&poster);
    assert_eq!(cl_score.jobs_funded, 1);
    assert_eq!(cl_score.total_spent, 10_000);
}
