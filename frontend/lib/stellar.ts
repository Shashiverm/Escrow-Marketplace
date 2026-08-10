/**
 * Stellar SDK configuration and helpers.
 *
 * This module provides the foundation for interacting with the Stellar
 * network from the frontend.  It wraps @stellar/stellar-sdk with
 * project-specific configuration (network, RPC endpoint, contract IDs).
 */

// NOTE: These imports require `npm install` to resolve.
// import * as StellarSdk from "@stellar/stellar-sdk";
// import { Server } from "@stellar/stellar-sdk/rpc";

// ── Network Configuration ────────────────────────

export const NETWORK = {
  /** Stellar Testnet RPC endpoint */
  rpcUrl: "https://soroban-testnet.stellar.org:443",
  /** Network passphrase for Testnet */
  passphrase: "Test SDF Network ; September 2015",
  /** Explorer base URL for transaction links */
  explorerUrl: "https://stellar.expert/explorer/testnet",
};

// ── Contract Addresses ───────────────────────────
// Populated after deployment via `scripts/deploy.sh`

export const CONTRACTS = {
  jobRegistry: process.env.NEXT_PUBLIC_JOB_REGISTRY_ID ?? "",
  escrow: process.env.NEXT_PUBLIC_ESCROW_ID ?? "",
  reputation: process.env.NEXT_PUBLIC_REPUTATION_ID ?? "",
  /** Native XLM token contract (SAC) on Testnet */
  nativeToken: process.env.NEXT_PUBLIC_NATIVE_TOKEN_ID ?? "",
};

// ── RPC Server ───────────────────────────────────

/**
 * Create a Stellar RPC server instance.
 *
 * Usage:
 * ```ts
 * import { getRpcServer } from "@/lib/stellar";
 * const server = getRpcServer();
 * const health = await server.getHealth();
 * ```
 */
export function getRpcServer() {
  // Lazy import to avoid SSR issues with WASM
  // const { Server } = require("@stellar/stellar-sdk/rpc");
  // return new Server(NETWORK.rpcUrl, { allowHttp: false });

  // Placeholder until dependencies are installed
  return null;
}

// ── Transaction Helpers ──────────────────────────

/**
 * Build a Soroban contract invocation transaction.
 *
 * @param contractId - The deployed contract address
 * @param method     - The contract function name
 * @param args       - Encoded arguments (use StellarSdk.nativeToScVal)
 * @param publicKey  - The caller's Stellar public key
 */
export async function buildContractTx(
  contractId: string,
  method: string,
  args: unknown[],
  publicKey: string
) {
  // In production:
  // 1. Build the transaction using TransactionBuilder
  // 2. Set the Soroban operation with contract invocation
  // 3. Simulate the transaction via RPC to get resource fees
  // 4. Sign with Freighter
  // 5. Submit to the network

  console.log("Building contract tx:", { contractId, method, args, publicKey });

  return {
    status: "simulated",
    contractId,
    method,
    args,
  };
}

// ── Event Helpers ────────────────────────────────

export interface SorobanEvent {
  id: string;
  contractId: string;
  topic: string[];
  value: unknown;
  ledger: number;
  timestamp: number;
}

/**
 * Fetch recent events from a Soroban contract.
 *
 * Uses the `getEvents` RPC method with contract ID filter.
 * Events are ephemeral (~7 day retention on RPC nodes).
 */
export async function getContractEvents(
  contractId: string,
  startLedger?: number
): Promise<SorobanEvent[]> {
  // In production:
  // const server = getRpcServer();
  // const result = await server.getEvents({
  //   startLedger: startLedger ?? (await server.getLatestLedger()).sequence - 1000,
  //   filters: [{ type: "contract", contractIds: [contractId] }],
  //   limit: 50,
  // });
  // return result.events.map(parseEvent);

  // Return empty array until dependencies are installed
  return [];
}

// ── Address Utilities ────────────────────────────

/** Truncate a Stellar address for display: GABC…WXYZ */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Generate a Stellar Expert link for a transaction hash */
export function txExplorerUrl(txHash: string): string {
  return `${NETWORK.explorerUrl}/tx/${txHash}`;
}

/** Generate a Stellar Expert link for a contract address */
export function contractExplorerUrl(contractId: string): string {
  return `${NETWORK.explorerUrl}/contract/${contractId}`;
}
