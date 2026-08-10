"use client";

import { useState, useEffect } from "react";
import { store, MarketplaceEvent } from "@/lib/store";
import { truncateAddress } from "@/lib/stellar";

interface EventFeedProps {
  jobId?: number;
}

const EVENT_CONFIG: Record<
  MarketplaceEvent["type"],
  { title: string; emoji: string; className: string }
> = {
  job_posted: { title: "Job Posted", emoji: "📝", className: "funded" },
  bid_placed: { title: "Bid Placed", emoji: "💬", className: "milestone" },
  bid_accepted: { title: "Bid Accepted", emoji: "🤝", className: "funded" },
  escrow_funded: { title: "Escrow Funded", emoji: "💰", className: "funded" },
  milestone_approved: { title: "Milestone Approved", emoji: "✅", className: "milestone" },
  escrow_completed: { title: "Job Completed", emoji: "🏆", className: "completed" },
  escrow_refunded: { title: "Escrow Refunded", emoji: "🔄", className: "completed" },
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
      <div className="detail-label" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>On-Chain Live Events</span>
        <span style={{ fontSize: "0.75rem", color: "var(--cyan-light)", fontWeight: 400 }}>
          ⚡ Testnet RPC
        </span>
      </div>

      <div className="event-feed">
        {events.length === 0 && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.88rem",
              padding: "16px 0",
            }}
          >
            No events yet for this job. Actions like posting, bidding, and releasing escrow will display in real-time.
          </p>
        )}
        {events.map((event) => {
          const config = EVENT_CONFIG[event.type] || {
            title: "Event",
            emoji: "⚡",
            className: "milestone",
          };
          return (
            <div key={event.id} className="event-item">
              <div className={`event-icon ${config.className}`}>
                {config.emoji}
              </div>
              <div className="event-content">
                <div className="event-title" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{config.title}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {timeAgo(event.timestamp)}
                  </span>
                </div>
                <div className="event-time" style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {truncateAddress(event.actor)}
                  {event.amount ? ` · ${event.amount.toLocaleString()} XLM` : ""}
                </div>
                {event.txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.74rem",
                      color: "var(--cyan-light)",
                      display: "inline-block",
                      marginTop: "2px",
                    }}
                  >
                    Tx: {truncateAddress(event.txHash, 6)} →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
