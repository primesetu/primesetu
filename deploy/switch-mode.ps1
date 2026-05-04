# ============================================================
# SMRITI-OS — Quick Mode Switcher
# Usage: .\switch-mode.ps1 -Mode LOCAL / CLOUD / HYBRID
# ============================================================

param(
    [ValidateSet("LOCAL","CLOUD","HYBRID")]
    [string]$Mode = "LOCAL",
    [string]$AppPath = "D:\IMP\GitHub\primesetu"
)

$modeMap = @{
    "LOCAL"  = "SOVEREIGN"
    "CLOUD"  = "CLOUD"
    "HYBRID" = "HYBRID"
}

$envFile = "$AppPath\backend\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

$storageMode = $modeMap[$Mode]
(Get-Content $envFile) -replace "STORAGE_MODE=.*", "STORAGE_MODE=$storageMode" | Set-Content $envFile

# Restart backend
$service = Get-Service "SMRITI-Backend" -ErrorAction SilentlyContinue
if ($service) {
    Restart-Service SMRITI-Backend
}

Write-Host @"

SMRITI-OS mode switched to: $Mode ($storageMode)
Backend restarted.

"@ -ForegroundColor Green
