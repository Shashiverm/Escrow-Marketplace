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
        &String::from_str(&env, "DeFi"),
        &10_000_i128,
        &3_u32,
        &1750000000_u64,
    );

    assert_eq!(job_id, 0);
    assert_eq!(client.job_count(), 1);

    let job = client.get_job(&0);
    assert_eq!(job.budget, 10_000);
    assert_eq!(job.milestone_count, 3);
    assert_eq!(job.status, JobStatus::Open);
    assert_eq!(job.client, user);
    assert_eq!(job.bid_count, 0);
    assert_eq!(job.deadline, 1750000000_u64);
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
        &String::from_str(&env, "Smart Contracts"),
        &1_000_i128,
        &1_u32,
        &0_u64,
    );
    let id2 = client.post_job(
        &user,
        &String::from_str(&env, "Job Two"),
        &String::from_str(&env, "Second job"),
        &String::from_str(&env, "Frontend"),
        &2_000_i128,
        &2_u32,
        &0_u64,
    );

    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(client.job_count(), 2);
}

// ────────────────────────────────────────────────────
//  Bidding & Bid Withdrawal
// ────────────────────────────────────────────────────

#[test]
fn test_place_and_withdraw_bid() {
    let env = Env::default();
    env.mock_all_auths();

    let (_, client) = setup(&env);
    let poster = Address::generate(&env);
    let bidder = Address::generate(&env);

    client.post_job(
        &poster,
        &String::from_str(&env, "Audit"),
        &String::from_str(&env, "Audit Soroban contracts"),
        &String::from_str(&env, "Security"),
        &5_000_i128,
        &2_u32,
        &0_u64,
    );

    let bid_idx = client.place_bid(
        &bidder,
        &0_u64,
        &4_500_i128,
        &String::from_str(&env, "5 years experience in security audits"),
        &7_u32,
    );
    assert_eq!(bid_idx, 0);

    let bids = client.get_bids(&0);
    assert_eq!(bids.len(), 1);
    assert_eq!(bids.get(0).unwrap().is_active, true);
    assert_eq!(bids.get(0).unwrap().estimated_days, 7);

    // Withdraw bid
    client.withdraw_bid(&bidder, &0_u64, &0_u32);
    let updated_bids = client.get_bids(&0);
    assert_eq!(updated_bids.get(0).unwrap().is_active, false);
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
        &String::from_str(&env, "Frontend"),
        &8_000_i128,
        &4_u32,
        &0_u64,
    );

    client.place_bid(
        &bidder,
        &0_u64,
        &7_500_i128,
        &String::from_str(&env, "Expert React developer"),
        &14_u32,
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
        &String::from_str(&env, "Category"),
        &5_000_i128,
        &2_u32,
        &0_u64,
    );

    client.place_bid(
        &bidder1,
        &0_u64,
        &4_000_i128,
        &String::from_str(&env, "Bid 1"),
        &5_u32,
    );
    client.accept_bid(&poster, &0_u64, &0_u32);

    // Should panic — job is InProgress, not Open
    client.place_bid(
        &bidder2,
        &0_u64,
        &3_500_i128,
        &String::from_str(&env, "Bid 2"),
        &3_u32,
    );
}

// ────────────────────────────────────────────────────
//  Listing & Pagination & Filter
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
            &String::from_str(&env, "Category"),
            &1_000_i128,
            &1_u32,
            &0_u64,
        );
    }

    let page1 = client.list_jobs(&0_u64, &3_u64);
    assert_eq!(page1.len(), 3);

    let page2 = client.list_jobs(&3_u64, &3_u64);
    assert_eq!(page2.len(), 2);

    let open_jobs = client.list_jobs_by_status(&0_u32, &0_u64, &10_u64);
    assert_eq!(open_jobs.len(), 5);
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
        &String::from_str(&env, "DeFi"),
        &1_000_i128,
        &1_u32,
        &0_u64,
    );

    let escrow_addr = Address::generate(&env);
    client.update_status(&escrow_addr, &0_u64, &2_u32);

    let job = client.get_job(&0);
    assert_eq!(job.status, JobStatus::Completed);
}
