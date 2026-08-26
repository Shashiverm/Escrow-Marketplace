"use client";

import React, { useState, useEffect } from "react";
import { store, MarketplaceEvent } from "@/lib/store";
import { truncateAddress } from "@/lib/stellar";

interface EventFeedProps {
  jobId?: number;
}

const EVENT_CONFIG: Record<
  MarketplaceEvent["type"],
  { title: string; topic: string }
> = {
  job_posted: { title: "Job Registered", topic: "soroban::job_posted" },
  bid_placed: { title: "Bid Submitted", topic: "soroban::bid_placed" },
  bid_withdrawn: { title: "Bid Withdrawn", topic: "soroban::bid_withdrawn" },
  bid_accepted: { title: "Bid Accepted", topic: "soroban::bid_accepted" },
  escrow_funded: { title: "Escrow Funded & Locked", topic: "soroban::escrow_funded" },
  milestone_submitted: { title: "Deliverable Submitted", topic: "soroban::milestone_submitted" },
  milestone_approved: { title: "Milestone Released", topic: "soroban::milestone_approved" },
  dispute_raised: { title: "Dispute Flagged", topic: "soroban::dispute_raised" },
  dispute_resolved: { title: "Dispute Arbitrated", topic: "soroban::dispute_resolved" },
  escrow_completed: { title: "Escrow Finalized", topic: "soroban::escrow_completed" },
  escrow_refunded: { title: "Escrow Refunded", topic: "soroban::escrow_refunded" },
};

export function EventFeed({ jobId }: EventFeedProps) {
  const [events, setEvents] = useState<MarketplaceEvent[]>([]);

  useEffect(() => {
    function loadEvents() {
      setEvents(store.getEvents(jobId));
    }
    loadEvents();
    const interval = setInterval(loadEvents, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  return (
    <div className="card" id="event-feed">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
          Live <span className="gradient-gold-text">Soroban RPC Events</span>
        </h3>
        <span className="network-pill" style={{ fontSize: "0.68rem" }}>
          Sub-5s Ledger Finality
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {events.length === 0 && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              padding: "16px 0",
              textAlign: "center",
            }}
          >
            No contract events recorded yet. Smart contract state transitions emit live Soroban ledger events.
          </p>
        )}
        {events.map((event: MarketplaceEvent, idx: number) => {
          const config = EVENT_CONFIG[event.type] || {
            title: "Contract Event",
            topic: "soroban::event",
          };

          const simulatedLedgerSeq = 4829100 + (events.length - idx);

          return (
            <div
              key={event.id}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.84rem" }}>
                  {config.title}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Ledger #{simulatedLedgerSeq} &middot; {timeAgo(event.timestamp)}
                </span>
              </div>

              <div style={{ fontSize: "0.72rem", color: "var(--gold-light)", fontFamily: "var(--font-mono)" }}>
                Topic: <code>{config.topic}</code> {event.meta && `&middot; ${event.meta}`}
              </div>

              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <span>
                  Actor: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{truncateAddress(event.actor, 4)}</strong>
                </span>
                {event.amount && (
                  <span style={{ fontWeight: 700, color: "var(--emerald-light)", fontFamily: "var(--font-mono)" }}>
                    {event.amount.toLocaleString()} XLM
                  </span>
                )}
              </div>

              {event.txHash && (
                <div style={{ marginTop: "2px" }}>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    TX: {truncateAddress(event.txHash, 6)} ↗
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
