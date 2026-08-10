"use client";

import { useState, useEffect } from "react";

interface ContractEvent {
  id: string;
  type: "funded" | "milestone" | "completed" | "bid" | "posted";
  title: string;
  detail: string;
  timestamp: Date;
}

const ICON_MAP = {
  funded: { emoji: "💰", className: "funded" },
  milestone: { emoji: "✅", className: "milestone" },
  completed: { emoji: "🏆", className: "completed" },
  bid: { emoji: "💬", className: "milestone" },
  posted: { emoji: "📝", className: "funded" },
};

/**
 * Real-time event feed sidebar.
 *
 * In production: polls Soroban `getEvents` via React Query.
 * For demo: shows mock events with slide-in animation.
 */
export function EventFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([]);

  // Demo: populate mock events on mount
  useEffect(() => {
    const mockEvents: ContractEvent[] = [
      {
        id: "1",
        type: "posted",
        title: "New Job Posted",
        detail: "Smart Contract Audit — 5,000 XLM",
        timestamp: new Date(Date.now() - 120_000),
      },
      {
        id: "2",
        type: "bid",
        title: "Bid Received",
        detail: "GBCD…WXYZ bid 4,500 XLM",
        timestamp: new Date(Date.now() - 90_000),
      },
      {
        id: "3",
        type: "funded",
        title: "Escrow Funded",
        detail: "10,000 XLM locked for DeFi App",
        timestamp: new Date(Date.now() - 60_000),
      },
      {
        id: "4",
        type: "milestone",
        title: "Milestone Approved",
        detail: "M1 released — 2,500 XLM to GDEF…5678",
        timestamp: new Date(Date.now() - 30_000),
      },
      {
        id: "5",
        type: "completed",
        title: "Job Completed",
        detail: "All milestones paid — reputation updated",
        timestamp: new Date(Date.now() - 10_000),
      },
    ];
    setEvents(mockEvents);
  }, []);

  function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  return (
    <div className="card" id="event-feed">
      <div className="detail-label">Live Events</div>
      <div className="event-feed">
        {events.length === 0 && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.88rem",
              padding: "16px 0",
            }}
          >
            No events yet. Events will appear here as contracts are invoked.
          </p>
        )}
        {events.map((event) => {
          const icon = ICON_MAP[event.type];
          return (
            <div key={event.id} className="event-item">
              <div className={`event-icon ${icon.className}`}>
                {icon.emoji}
              </div>
              <div className="event-content">
                <div className="event-title">{event.title}</div>
                <div className="event-time">
                  {event.detail} &middot; {timeAgo(event.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
