"use client";

import React, { useState, useEffect } from "react";
import { store, MarketplaceEvent } from "@/lib/store";
import { truncateAddress } from "@/lib/stellar";

interface EventFeedProps {
  jobId?: number;
}

const EVENT_CONFIG: Record<
  MarketplaceEvent["type"],
  { title: string; topic: string; emoji: string; className: string }
> = {
  job_posted: { title: "Job Posted", topic: 'symbol("job_posted")', emoji: "📝", className: "funded" },
  bid_placed: { title: "Bid Placed", topic: 'symbol("bid_placed")', emoji: "💬", className: "milestone" },
  bid_accepted: { title: "Bid Accepted", topic: 'symbol("bid_accepted")', emoji: "🤝", className: "funded" },
  escrow_funded: { title: "Escrow Funded", topic: 'symbol("escrow_funded")', emoji: "💰", className: "funded" },
  milestone_approved: { title: "Milestone Approved", topic: 'symbol("milestone_approved")', emoji: "✅", className: "milestone" },
  escrow_completed: { title: "Job Completed", topic: 'symbol("job_completed")', emoji: "🏆", className: "completed" },
  escrow_refunded: { title: "Escrow Refunded", topic: 'symbol("escrow_refunded")', emoji: "🔄", className: "completed" },
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
    <div className="card hover-glow" id="event-feed">
      <div className="detail-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Soroban On-Chain Events</span>
        </div>
        <span className="network-pill" style={{ fontSize: "0.72rem" }}>
          ⚡ Testnet RPC Live
        </span>
      </div>

      <div className="event-feed">
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
            className: "milestone",
          };
          
          const simulatedLedgerSeq = 4829100 + (events.length - idx);

          return (
            <div key={event.id} className="event-item" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "10px" }}>
              <div className={`event-icon ${config.className}`}>
                {config.emoji}
              </div>
              <div className="event-content" style={{ flex: 1 }}>
                <div className="event-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{config.title}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Ledger #{simulatedLedgerSeq} &middot; {timeAgo(event.timestamp)}
                  </span>
                </div>

                <div style={{ fontSize: "0.76rem", color: "var(--purple-light)", fontFamily: "var(--font-mono)", margin: "2px 0" }}>
                  Topic: <code>{config.topic}</code>
                </div>

                <div className="event-time" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    Actor: <strong style={{ color: "var(--cyan-light)", fontFamily: "var(--font-mono)" }}>{truncateAddress(event.actor, 5)}</strong>
                  </span>
                  {event.amount && (
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
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
                        fontSize: "0.74rem",
                        color: "var(--cyan-light)",
                        fontFamily: "var(--font-mono)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
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
