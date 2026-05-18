<#
.SYNOPSIS
    SMRITI Golden Seed — Backfill Migration Runner

.DESCRIPTION
    Runs the Golden Seed Engine against all existing SMRITI tenant databases
    to provision Phase 1-3 tables that were added after initial deployment.

.EXAMPLES
    # Show what would be done (no changes):
    .\run_backfill.ps1 -DryRun

    # Backfill ALL existing stores:
    .\run_backfill.ps1

    # Backfill a SINGLE store by invoice prefix:
    .\run_backfill.ps1 -Tenant gkp

    # Backfill single store, dry-run first:
    .\run_backfill.ps1 -Tenant gkp -DryRun
#>

param(
    [string]$Tenant  = "",      # Invoice prefix to target one store (leave blank for all)
    [switch]$DryRun  = $false   # Preview changes without writing to DB
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir   # backend/

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SMRITI Golden Seed — Backfill Migration                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Build argument list
$args_list = @("seeds/backfill_golden_seeds.py")

if ($Tenant -ne "") {
    $args_list += "--tenant"
    $args_list += $Tenant
    Write-Host "  Target   : Single store — prefix='$Tenant'" -ForegroundColor Yellow
} else {
    Write-Host "  Target   : ALL stores in smriti_registry" -ForegroundColor Yellow
}

if ($DryRun) {
    $args_list += "--dry-run"
    Write-Host "  Mode     : DRY-RUN — no changes will be made" -ForegroundColor Yellow
} else {
    Write-Host "  Mode     : LIVE — writing to database" -ForegroundColor Green
}

Write-Host ""

# Run from backend dir so imports resolve correctly
Set-Location $BackendDir
python @args_list

$exit_code = $LASTEXITCODE
Write-Host ""

if ($exit_code -eq 0) {
    Write-Host "  ✅  Backfill completed successfully." -ForegroundColor Green
} else {
    Write-Host "  ❌  Backfill completed with ERRORS. Check output above." -ForegroundColor Red
}

Write-Host ""
exit $exit_code
