"use client";

import React, { useState, useCallback } from "react";

interface UseContractResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Generic hook for invoking a Soroban contract function.
 *
 * Wraps async contract calls with loading/error state management.
 */
export function useContract<T>(
  contractFn: (...args: unknown[]) => Promise<T>
): UseContractResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await contractFn(...args);
        setData(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Contract call failed";
        setError(message);
        console.error("Contract invocation error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contractFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}
