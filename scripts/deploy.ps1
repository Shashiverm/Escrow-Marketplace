# ================================================================
# deploy.ps1 — Deploy all 3 contracts to Stellar Testnet (PowerShell)
# ================================================================

$ErrorActionPreference = "Continue"

$NETWORK = "testnet"
$SOURCE = "deployer"

if (Test-Path "target/wasm32v1-none/release/soroban_job_registry_contract.wasm") {
    $WASM_DIR = "target/wasm32v1-none/release"
} else {
    $WASM_DIR = "target/wasm32-unknown-unknown/release"
}

Write-Host "+--------------------------------------------------+" -ForegroundColor Cyan
Write-Host "|  Stellar Escrow Marketplace -- Testnet Deployment |" -ForegroundColor Cyan
Write-Host "+--------------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

# ── 1. Fund deployer account ─────────────────────
Write-Host ">> Funding deployer account on Testnet..." -ForegroundColor Yellow
try {
    stellar keys fund $SOURCE --network $NETWORK 2>&1 | Out-Null
    Write-Host "  * Deployer account funded. Waiting 5s for ledger propagation..." -ForegroundColor Green
    Start-Sleep -Seconds 5
} catch {
    Write-Host "  * Deployer account funding checked" -ForegroundColor Green
}
Write-Host ""

# ── 2. Build contracts ────────────────────────────
Write-Host ">> Building contracts with stellar CLI..." -ForegroundColor Yellow
stellar contract build
Write-Host "  * Build complete" -ForegroundColor Green
Write-Host ""

function Deploy-ContractWithRetry {
    param([string]$WasmPath)
    for ($i = 1; $i -le 3; $i++) {
        $raw = (stellar contract deploy --wasm $WasmPath --source $SOURCE --network $NETWORK 2>&1) | Out-String
        $id = ([regex]::Match($raw, 'C[A-Z0-9]{55}').Value)
        if ($id) {
            return $id
        }
        Write-Host "  * Network delay, retrying deployment (attempt $i / 3)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    return $null
}

# ── 3. Deploy Job Registry ───────────────────────
Write-Host ">> Deploying Job Registry..." -ForegroundColor Yellow
$JOB_REGISTRY_ID = Deploy-ContractWithRetry -WasmPath "$WASM_DIR/soroban_job_registry_contract.wasm"
if (-not $JOB_REGISTRY_ID) {
    Write-Host "Failed to deploy Job Registry after retries." -ForegroundColor Red
    exit 1
}
Write-Host "  * Job Registry:  $JOB_REGISTRY_ID" -ForegroundColor Green

# ── 4. Deploy Reputation ─────────────────────────
Write-Host ">> Deploying Reputation..." -ForegroundColor Yellow
$REPUTATION_ID = Deploy-ContractWithRetry -WasmPath "$WASM_DIR/soroban_reputation_contract.wasm"
if (-not $REPUTATION_ID) {
    Write-Host "Failed to deploy Reputation after retries." -ForegroundColor Red
    exit 1
}
Write-Host "  * Reputation:    $REPUTATION_ID" -ForegroundColor Green

# ── 5. Deploy Escrow ─────────────────────────────
Write-Host ">> Deploying Escrow..." -ForegroundColor Yellow
$ESCROW_ID = Deploy-ContractWithRetry -WasmPath "$WASM_DIR/soroban_escrow_contract.wasm"
if (-not $ESCROW_ID) {
    Write-Host "Failed to deploy Escrow after retries." -ForegroundColor Red
    exit 1
}
Write-Host "  * Escrow:        $ESCROW_ID" -ForegroundColor Green
Write-Host ""

# ── 6. Initialize Escrow ─────────────────────────
Write-Host ">> Initializing Escrow contract..." -ForegroundColor Yellow
$DEPLOYER_PK = (stellar keys address $SOURCE 2>&1 | Out-String).Trim()
$NATIVE_TOKEN_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

stellar contract invoke --id $ESCROW_ID --source $SOURCE --network $NETWORK -- initialize --admin $DEPLOYER_PK --token_id $NATIVE_TOKEN_ID --job_registry_id $JOB_REGISTRY_ID --reputation_id $REPUTATION_ID 2>&1 | Out-Null
Write-Host "  * Escrow initialized" -ForegroundColor Green

# ── 7. Initialize Reputation ─────────────────────
Write-Host ">> Initializing Reputation contract..." -ForegroundColor Yellow
stellar contract invoke --id $REPUTATION_ID --source $SOURCE --network $NETWORK -- initialize --admin $DEPLOYER_PK --escrow_id $ESCROW_ID 2>&1 | Out-Null
Write-Host "  * Reputation initialized" -ForegroundColor Green
Write-Host ""

# ── 8. Summary ───────────────────────────────────
Write-Host "+--------------------------------------------------+" -ForegroundColor Cyan
Write-Host "|  Deployment Complete!                             |" -ForegroundColor Cyan
Write-Host "+--------------------------------------------------+" -ForegroundColor Cyan
Write-Host "  Job Registry:  $JOB_REGISTRY_ID" -ForegroundColor White
Write-Host "  Escrow:        $ESCROW_ID" -ForegroundColor White
Write-Host "  Reputation:    $REPUTATION_ID" -ForegroundColor White
Write-Host "+--------------------------------------------------+" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these to your frontend/.env.local:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_JOB_REGISTRY_ID=$JOB_REGISTRY_ID"
Write-Host "  NEXT_PUBLIC_ESCROW_ID=$ESCROW_ID"
Write-Host "  NEXT_PUBLIC_REPUTATION_ID=$REPUTATION_ID"
Write-Host "  NEXT_PUBLIC_NATIVE_TOKEN_ID=$NATIVE_TOKEN_ID"
