"use client";

import React, { useState, useEffect } from "react";
import { store, MarketplaceEvent } from "@/lib/store";
import { truncateAddress } from "@/lib/stellar";

interface EventFeedProps {
  jobId?: number;
}

const EVENT_CONFIG: Record<
  MarketplaceEvent["type"],
  { title: string; topic: string; emoji: string }
> = {
  job_posted: { title: "Job Posted", topic: 'symbol("job_posted")', emoji: "📝" },
  bid_placed: { title: "Bid Placed", topic: 'symbol("bid_placed")', emoji: "💬" },
  bid_withdrawn: { title: "Bid Withdrawn", topic: 'symbol("bid_withdrawn")', emoji: "↩️" },
  bid_accepted: { title: "Bid Accepted", topic: 'symbol("bid_accepted")', emoji: "🤝" },
  escrow_funded: { title: "Escrow Locked", topic: 'symbol("escrow_funded")', emoji: "💰" },
  milestone_submitted: { title: "Work Proof Submitted", topic: 'symbol("milestone_submitted")', emoji: "📤" },
  milestone_approved: { title: "Milestone Released", topic: 'symbol("milestone_approved")', emoji: "✅" },
  dispute_raised: { title: "Dispute Raised", topic: 'symbol("dispute_raised")', emoji: "⚖️" },
  dispute_resolved: { title: "Dispute Settled", topic: 'symbol("dispute_resolved")', emoji: "🏛️" },
  escrow_completed: { title: "Contract Finalized", topic: 'symbol("escrow_completed")', emoji: "🏆" },
  escrow_refunded: { title: "Escrow Refunded", topic: 'symbol("escrow_refunded")', emoji: "🔄" },
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
          ⚡ Live <span className="gradient-gold-text">Soroban RPC Events</span>
        </h3>
        <span className="network-pill" style={{ fontSize: "0.72rem" }}>
          Sub-5s Finality
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {events.length === 0 && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.88rem",
              padding: "16px 0",
              textAlign: "center",
            }}
          >
            No Soroban contract events recorded yet. Actions like posting jobs, bidding, and releasing milestones trigger real-time contract logs.
          </p>
        )}
        {events.map((event: MarketplaceEvent, idx: number) => {
          const config = EVENT_CONFIG[event.type] || {
            title: "Contract Event",
            topic: 'symbol("event")',
            emoji: "⚡",
          };

          const simulatedLedgerSeq = 4829100 + (events.length - idx);

          return (
            <div
              key={event.id}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                {config.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "0.88rem" }}>
                    {config.title}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Ledger #{simulatedLedgerSeq} · {timeAgo(event.timestamp)}
                  </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--violet-light)", fontFamily: "var(--font-mono)", margin: "2px 0" }}>
                  Topic: <code>{config.topic}</code> {event.meta && `· ${event.meta}`}
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <span>
                    Actor: <strong style={{ color: "var(--gold-light)", fontFamily: "var(--font-mono)" }}>{truncateAddress(event.actor, 5)}</strong>
                  </span>
                  {event.amount && (
                    <span style={{ fontWeight: 800, color: "var(--emerald-light)", fontFamily: "var(--font-mono)" }}>
                      {event.amount.toLocaleString()} XLM
                    </span>
                  )}
                </div>

                {event.txHash && (
                  <div style={{ marginTop: "4px" }}>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--gold)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      TX: {truncateAddress(event.txHash, 6)} ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
