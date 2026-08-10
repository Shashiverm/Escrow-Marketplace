#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

/// Helper: register the contract and return a client.
fn setup<'a>(env: &'a Env) -> (Address, JobRegistryContractClient<'a>) {
    let id = env.register(JobRegistryContract, ());
    let client = JobRegistryContractClient::new(env, &id);
    (id, client)
}

// ────────────────────────────────────────────────────
//  Job Posting
// ────────────────────────────────────────────────────

#[test]
fn test_post_job() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let user = Address::generate(&env);

    let job_id = client.post_job(
        &user,
        &String::from_str(&env, "Build DeFi App"),
        &String::from_str(&env, "Need a DeFi application on Stellar"),
        &10_000_i128,
        &3_u32,
    );

    assert_eq!(job_id, 0);
    assert_eq!(client.job_count(), 1);

    let job = client.get_job(&0);
    assert_eq!(job.budget, 10_000);
    assert_eq!(job.milestone_count, 3);
    assert_eq!(job.status, JobStatus::Open);
    assert_eq!(job.client, user);
    assert_eq!(job.bid_count, 0);
}

#[test]
fn test_post_multiple_jobs() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let user = Address::generate(&env);

    let id1 = client.post_job(
        &user,
        &String::from_str(&env, "Job One"),
        &String::from_str(&env, "First job"),
        &1_000_i128,
        &1_u32,
    );
    let id2 = client.post_job(
        &user,
        &String::from_str(&env, "Job Two"),
        &String::from_str(&env, "Second job"),
        &2_000_i128,
        &2_u32,
    );

    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(client.job_count(), 2);
}

// ────────────────────────────────────────────────────
//  Bidding
// ────────────────────────────────────────────────────

#[test]
fn test_place_bid() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let poster = Address::generate(&env);
    let bidder = Address::generate(&env);

    client.post_job(
        &poster,
        &String::from_str(&env, "Audit"),
        &String::from_str(&env, "Audit Soroban contracts"),
        &5_000_i128,
        &2_u32,
    );

    let bid_idx = client.place_bid(
        &bidder,
        &0_u64,
        &4_500_i128,
        &String::from_str(&env, "5 years experience in security audits"),
    );
    assert_eq!(bid_idx, 0);

    let bids = client.get_bids(&0);
    assert_eq!(bids.len(), 1);

    let job = client.get_job(&0);
    assert_eq!(job.bid_count, 1);
}

#[test]
fn test_multiple_bids() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let poster = Address::generate(&env);
    let bidder1 = Address::generate(&env);
    let bidder2 = Address::generate(&env);

    client.post_job(
        &poster,
        &String::from_str(&env, "Website"),
        &String::from_str(&env, "Build a portfolio site"),
        &3_000_i128,
        &2_u32,
    );

    client.place_bid(
        &bidder1,
        &0_u64,
        &2_800_i128,
        &String::from_str(&env, "React expert"),
    );
    client.place_bid(
        &bidder2,
        &0_u64,
        &2_500_i128,
        &String::from_str(&env, "Full-stack dev"),
    );

    let bids = client.get_bids(&0);
    assert_eq!(bids.len(), 2);
}

// ────────────────────────────────────────────────────
//  Bid Acceptance
// ────────────────────────────────────────────────────

#[test]
fn test_accept_bid() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let poster = Address::generate(&env);
    let bidder = Address::generate(&env);

    client.post_job(
        &poster,
        &String::from_str(&env, "Frontend Dev"),
        &String::from_str(&env, "React frontend"),
        &8_000_i128,
        &4_u32,
    );

    client.place_bid(
        &bidder,
        &0_u64,
        &7_500_i128,
        &String::from_str(&env, "Expert React developer"),
    );

    client.accept_bid(&poster, &0_u64, &0_u32);

    let job = client.get_job(&0);
    assert_eq!(job.status, JobStatus::InProgress);
    assert_eq!(job.freelancer, bidder);
}

#[test]
#[should_panic]
fn test_bid_on_closed_job() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let poster = Address::generate(&env);
    let bidder1 = Address::generate(&env);
    let bidder2 = Address::generate(&env);

    client.post_job(
        &poster,
        &String::from_str(&env, "Job"),
        &String::from_str(&env, "Desc"),
        &5_000_i128,
        &2_u32,
    );

    client.place_bid(
        &bidder1,
        &0_u64,
        &4_000_i128,
        &String::from_str(&env, "Bid 1"),
    );
    client.accept_bid(&poster, &0_u64, &0_u32);

    // Should panic — job is InProgress, not Open
    client.place_bid(
        &bidder2,
        &0_u64,
        &3_500_i128,
        &String::from_str(&env, "Bid 2"),
    );
}

// ────────────────────────────────────────────────────
//  Listing & Pagination
// ────────────────────────────────────────────────────

#[test]
fn test_list_jobs() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let user = Address::generate(&env);

    // Post 5 jobs
    for _i in 0..5u32 {
        client.post_job(
            &user,
            &String::from_str(&env, "Job"),
            &String::from_str(&env, "Desc"),
            &1_000_i128,
            &1_u32,
        );
    }

    // Paginate: first 3
    let page1 = client.list_jobs(&0_u64, &3_u64);
    assert_eq!(page1.len(), 3);

    // Paginate: next 3 (only 2 remain)
    let page2 = client.list_jobs(&3_u64, &3_u64);
    assert_eq!(page2.len(), 2);
}

// ────────────────────────────────────────────────────
//  Status Updates
// ────────────────────────────────────────────────────

#[test]
fn test_update_status() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let user = Address::generate(&env);

    client.post_job(
        &user,
        &String::from_str(&env, "Job"),
        &String::from_str(&env, "Desc"),
        &1_000_i128,
        &1_u32,
    );

    // Simulate escrow contract updating status to Completed
    let escrow_addr = Address::generate(&env);
    client.update_status(&escrow_addr, &0_u64, &2_u32);

    let job = client.get_job(&0);
    assert_eq!(job.status, JobStatus::Completed);
}
