#!/usr/bin/env bash
# ================================================================
# deploy.sh — Deploy all 3 contracts to Stellar Testnet
# ================================================================
#
# Prerequisites:
#   - stellar-cli installed (https://developers.stellar.org)
#   - Funded Testnet identity: stellar keys generate deployer --network testnet
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
# ================================================================

set -euo pipefail

NETWORK="testnet"
SOURCE="deployer"
if [ -d "target/wasm32v1-none/release" ]; then
  WASM_DIR="target/wasm32v1-none/release"
else
  WASM_DIR="target/wasm32-unknown-unknown/release"
fi

echo "╔══════════════════════════════════════════════════╗"
echo "║  Stellar Escrow Marketplace — Testnet Deployment ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Fund deployer account ─────────────────────
echo "▶ Funding deployer account on Testnet…"
stellar keys fund "${SOURCE}" --network "${NETWORK}" || true
echo "  ✓ Account ready"
echo ""

# ── 2. Build contracts ────────────────────────────
echo "▶ Building contracts with stellar CLI…"
stellar contract build
echo "  ✓ Build complete"
echo ""

# ── 2. Deploy Job Registry ───────────────────────
echo "▶ Deploying Job Registry…"
JOB_REGISTRY_ID=$(stellar contract deploy \
  --wasm "${WASM_DIR}/soroban_job_registry_contract.wasm" \
  --source "${SOURCE}" \
  --network "${NETWORK}")
echo "  ✓ Job Registry:  ${JOB_REGISTRY_ID}"

# ── 3. Deploy Reputation ─────────────────────────
echo "▶ Deploying Reputation…"
REPUTATION_ID=$(stellar contract deploy \
  --wasm "${WASM_DIR}/soroban_reputation_contract.wasm" \
  --source "${SOURCE}" \
  --network "${NETWORK}")
echo "  ✓ Reputation:    ${REPUTATION_ID}"

# ── 4. Deploy Escrow ─────────────────────────────
echo "▶ Deploying Escrow…"
ESCROW_ID=$(stellar contract deploy \
  --wasm "${WASM_DIR}/soroban_escrow_contract.wasm" \
  --source "${SOURCE}" \
  --network "${NETWORK}")
echo "  ✓ Escrow:        ${ESCROW_ID}"
echo ""

# ── 5. Initialize Escrow ─────────────────────────
echo "▶ Initializing Escrow contract…"
DEPLOYER_PK=$(stellar keys address "${SOURCE}")
# NOTE: Replace NATIVE_TOKEN_ID with the actual SAC address for XLM on Testnet
NATIVE_TOKEN_ID="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

stellar contract invoke \
  --id "${ESCROW_ID}" \
  --source "${SOURCE}" \
  --network "${NETWORK}" \
  -- initialize \
  --admin "${DEPLOYER_PK}" \
  --token_id "${NATIVE_TOKEN_ID}" \
  --job_registry_id "${JOB_REGISTRY_ID}" \
  --reputation_id "${REPUTATION_ID}"
echo "  ✓ Escrow initialized"

# ── 6. Initialize Reputation ─────────────────────
echo "▶ Initializing Reputation contract…"
stellar contract invoke \
  --id "${REPUTATION_ID}" \
  --source "${SOURCE}" \
  --network "${NETWORK}" \
  -- initialize \
  --admin "${DEPLOYER_PK}" \
  --escrow_id "${ESCROW_ID}"
echo "  ✓ Reputation initialized"
echo ""

# ── 7. Summary ───────────────────────────────────
echo "╔══════════════════════════════════════════════════╗"
echo "║  Deployment Complete!                             ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Job Registry:  ${JOB_REGISTRY_ID}"
echo "║  Escrow:        ${ESCROW_ID}"
echo "║  Reputation:    ${REPUTATION_ID}"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Add these to your frontend/.env.local:"
echo "  NEXT_PUBLIC_JOB_REGISTRY_ID=${JOB_REGISTRY_ID}"
echo "  NEXT_PUBLIC_ESCROW_ID=${ESCROW_ID}"
echo "  NEXT_PUBLIC_REPUTATION_ID=${REPUTATION_ID}"
echo "  NEXT_PUBLIC_NATIVE_TOKEN_ID=${NATIVE_TOKEN_ID}"
