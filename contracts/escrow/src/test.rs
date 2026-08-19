#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Env, String, Vec};
use soroban_job_registry_contract::{JobRegistryContract, JobRegistryContractClient, JobStatus as JrJobStatus};
use soroban_reputation_contract::{ReputationContract, ReputationContractClient};

// ── Test helpers ──────────────────────────────────

fn setup_token<'a>(env: &'a Env) -> (Address, Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let admin = Address::generate(env);
    let token_addr = env.register_stellar_asset_contract_v2(admin.clone());
    let tc = token::Client::new(env, &token_addr.address());
    let ac = token::StellarAssetClient::new(env, &token_addr.address());
    (admin, token_addr.address().clone(), tc, ac)
}

fn setup_escrow<'a>(
    env: &'a Env,
    token_addr: &Address,
) -> (Address, EscrowContractClient<'a>, Address, Address) {
    let job_registry = env.register(JobRegistryContract, ());
    let reputation = env.register(ReputationContract, ());
    let id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(env, &id);
    let admin = Address::generate(env);
    let treasury = Address::generate(env);
    client.initialize(&admin, token_addr, &job_registry, &reputation, &treasury, &100_u32); // 1% fee

    let rep_client = ReputationContractClient::new(env, &reputation);
    rep_client.initialize(&admin, &id);

    (id, client, job_registry, reputation)
}

// ────────────────────────────────────────────────────
//  Initialization
// ────────────────────────────────────────────────────

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, _, _) = setup_token(&env);
    let (_, _client, _, _) = setup_escrow(&env, &token_addr);
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
    let tr = Address::generate(&env);

    client.initialize(&admin, &token_addr, &jr, &rp, &tr, &100_u32);
    client.initialize(&admin, &token_addr, &jr, &rp, &tr, &100_u32);
}

// ────────────────────────────────────────────────────
//  Funding & Milestone Submission & Approval
// ────────────────────────────────────────────────────

#[test]
fn test_fund_and_custom_milestones() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (escrow_addr, escrow_client, _, _) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    token_admin.mint(&client_addr, &10_000_i128);

    let mut amounts = Vec::new(&env);
    amounts.push_back(3_000_i128);
    amounts.push_back(7_000_i128);

    escrow_client.fund_escrow_custom(&client_addr, &0_u64, &freelancer, &arbitrator, &amounts);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.total_amount, 10_000);
    assert_eq!(escrow.milestone_count, 2);
    assert_eq!(escrow.status, EscrowStatus::Active);

    let milestones = escrow_client.get_milestones(&0);
    assert_eq!(milestones.len(), 2);
    assert_eq!(milestones.get(0).unwrap().amount, 3_000);
    assert_eq!(milestones.get(1).unwrap().amount, 7_000);
    assert_eq!(token_client.balance(&escrow_addr), 10_000);
}

#[test]
fn test_submit_and_approve_milestone() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (_escrow_addr, escrow_client, _, _) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    token_admin.mint(&client_addr, &10_000_i128);
    escrow_client.fund_escrow(&client_addr, &0_u64, &freelancer, &arbitrator, &10_000_i128, &2_u32);

    // Freelancer submits milestone 0
    escrow_client.submit_milestone(
        &freelancer,
        &0_u64,
        &0_u32,
        &String::from_str(&env, "ipfs://deliverable-1"),
    );

    let ms = escrow_client.get_milestones(&0);
    assert_eq!(ms.get(0).unwrap().state, MilestoneState::Submitted);

    // Client approves milestone 0 (1% protocol fee: 5000 * 0.01 = 50 fee, 4950 payout)
    escrow_client.approve_milestone(&client_addr, &0_u64, &0_u32, &5_u32, &5_u32);

    assert_eq!(token_client.balance(&freelancer), 4_950);
    let updated_ms = escrow_client.get_milestones(&0);
    assert_eq!(updated_ms.get(0).unwrap().state, MilestoneState::Approved);
}

// ────────────────────────────────────────────────────
//  Dispute & Arbitrator Resolution
// ────────────────────────────────────────────────────

#[test]
fn test_dispute_and_resolution() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, token_addr, token_client, token_admin) = setup_token(&env);
    let (_escrow_addr, escrow_client, _, _) = setup_escrow(&env, &token_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    token_admin.mint(&client_addr, &10_000_i128);
    escrow_client.fund_escrow(&client_addr, &0_u64, &freelancer, &arbitrator, &10_000_i128, &2_u32);

    // Raise dispute on milestone 0
    escrow_client.raise_dispute(&client_addr, &0_u64, &0_u32);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Disputed);

    // Arbitrator resolves: split milestone 0 (5000 total) -> 2000 to freelancer, 3000 to client
    escrow_client.resolve_dispute(&arbitrator, &0_u64, &0_u32, &2_000_i128, &3_000_i128);

    assert_eq!(token_client.balance(&freelancer), 2_000);
    assert_eq!(token_client.balance(&client_addr), 3_000);
}

// ────────────────────────────────────────────────────
//  Full End-to-End Flow
// ────────────────────────────────────────────────────

#[test]
fn test_full_integration_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let job_registry_id = env.register(JobRegistryContract, ());
    let reputation_id = env.register(ReputationContract, ());
    let escrow_id = env.register(EscrowContract, ());

    let (_, token_addr, token_client, token_admin) = setup_token(&env);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);
    escrow_client.initialize(&admin, &token_addr, &job_registry_id, &reputation_id, &treasury, &0_u32);

    let rep_client = ReputationContractClient::new(&env, &reputation_id);
    rep_client.initialize(&admin, &escrow_id);

    let jr_client = JobRegistryContractClient::new(&env, &job_registry_id);
    let poster = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    jr_client.post_job(
        &poster,
        &String::from_str(&env, "Full Integration"),
        &String::from_str(&env, "Test job"),
        &String::from_str(&env, "Smart Contracts"),
        &10_000_i128,
        &2_u32,
        &0_u64,
    );

    token_admin.mint(&poster, &10_000_i128);
    escrow_client.fund_escrow(&poster, &0_u64, &freelancer, &arbitrator, &10_000_i128, &2_u32);

    escrow_client.submit_milestone(&freelancer, &0_u64, &0_u32, &String::from_str(&env, "ipfs://hash1"));
    escrow_client.approve_milestone(&poster, &0_u64, &0_u32, &5_u32, &5_u32);

    escrow_client.submit_milestone(&freelancer, &0_u64, &1_u32, &String::from_str(&env, "ipfs://hash2"));
    escrow_client.approve_milestone(&poster, &0_u64, &1_u32, &5_u32, &5_u32);

    let escrow = escrow_client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Completed);
    assert_eq!(token_client.balance(&freelancer), 10_000);

    let job = jr_client.get_job(&0);
    assert_eq!(job.status, JrJobStatus::Completed);

    let fl_score = rep_client.get_score(&freelancer);
    assert_eq!(fl_score.jobs_completed, 1);
    assert_eq!(fl_score.total_earned, 10_000);
}
