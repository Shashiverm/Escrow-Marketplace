"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getContractEvents, SorobanEvent } from "@/lib/stellar";

interface UseEventsOptions {
  contractId: string;
  /** Polling interval in milliseconds (default: 10000) */
  interval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
}

interface UseEventsResult {
  events: SorobanEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for polling Soroban contract events.
 *
 * Uses a simple interval-based polling strategy.  In production,
 * consider using React Query for automatic caching and deduplication.
 *
 * Usage:
 * ```tsx
 * const { events, isLoading } = useEvents({
 *   contractId: CONTRACTS.escrow,
 *   interval: 5000,
 * });
 * ```
 */
export function useEvents({
  contractId,
  interval = 10_000,
  enabled = true,
}: UseEventsOptions): UseEventsResult {
  const [events, setEvents] = useState<SorobanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLedgerRef = useRef<number | undefined>();

  const fetchEvents = useCallback(async () => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);

    try {
      const newEvents = await getContractEvents(
        contractId,
        lastLedgerRef.current
      );

      if (newEvents.length > 0) {
        // Track the latest ledger to avoid re-fetching
        const maxLedger = Math.max(...newEvents.map((e) => e.ledger));
        lastLedgerRef.current = maxLedger + 1;

        setEvents((prev) => [...newEvents, ...prev].slice(0, 100));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  // Initial fetch + polling
  useEffect(() => {
    if (!enabled || !contractId) return;

    fetchEvents();

    const timer = setInterval(fetchEvents, interval);
    return () => clearInterval(timer);
  }, [contractId, interval, enabled, fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}
