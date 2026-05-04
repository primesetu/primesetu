# ============================================================
# SMRITI-OS — Hybrid Mode Setup Script
# Cloudflare Tunnel OR self-hosted FRP
# Run as Administrator
# ============================================================

param(
    [string]$Mode = "CLOUDFLARE",  # CLOUDFLARE or FRP
    [string]$Domain = "yourdomain.com",
    [string]$VpsIP = "",
    [string]$AppPath = "D:\IMP\GitHub\primesetu"
)

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "   OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "   !! $msg" -ForegroundColor Yellow }

Write-Host @"
╔══════════════════════════════════════════════╗
║   SMRITI-OS — HYBRID BRIDGE SETUP           ║
║   Local Power + Cloud Reach                  ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor DarkYellow

if ($Mode -eq "CLOUDFLARE") {
    Write-Step "Setting up Cloudflare Tunnel..."
    
    # Check if cloudflared is installed
    $cf = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cf) {
        Write-Step "Installing cloudflared..."
        winget install Cloudflare.cloudflared
    }

    Write-Host @"

Next Steps (Manual - One Time Only):
─────────────────────────────────────
1. Run: cloudflared tunnel login
   (Opens browser, login to Cloudflare)

2. Run: cloudflared tunnel create smriti-os-tunnel
   (Note the Tunnel ID shown)

3. Create config file at:
   C:\Users\$env:USERNAME\.cloudflared\config.yml

   Contents:
   ─────────
   tunnel: <YOUR-TUNNEL-ID>
   credentials-file: C:\Users\$env:USERNAME\.cloudflared\<TUNNEL-ID>.json

   ingress:
     - hostname: api.$Domain
       service: http://localhost:8000
     - hostname: app.$Domain
       service: http://localhost:80
     - service: http_status:404

4. In Cloudflare DNS dashboard, add CNAME:
   app.$Domain → <TUNNEL-ID>.cfargotunnel.com
   api.$Domain → <TUNNEL-ID>.cfargotunnel.com

5. Install as Windows service:
   cloudflared service install

"@ -ForegroundColor White

    Write-Warn "After setup, run: cloudflared service start"
}

elseif ($Mode -eq "FRP") {
    Write-Step "Setting up FRP (Self-hosted Tunnel)..."
    
    if (-not $VpsIP) {
        Write-Host "VPS IP required. Usage: .\deploy-hybrid.ps1 -Mode FRP -VpsIP 123.45.67.89 -Domain yourdomain.com"
        exit 1
    }

    # Download FRP
    $frpVersion = "0.58.1"
    $frpUrl = "https://github.com/fatedier/frp/releases/download/v$frpVersion/frp_${frpVersion}_windows_amd64.zip"
    $frpDir = "C:\frp"
    
    if (-not (Test-Path $frpDir)) {
        Write-Step "Downloading FRP v$frpVersion..."
        Invoke-WebRequest -Uri $frpUrl -OutFile "$env:TEMP\frp.zip"
        Expand-Archive "$env:TEMP\frp.zip" -DestinationPath $frpDir -Force
        Write-Ok "FRP extracted to $frpDir"
    }

    # Create frpc.ini (Client config for Windows machine)
    $frpcConfig = @"
[common]
server_addr = $VpsIP
server_port = 7000
token = smriti_sovereign_$(Get-Random -Maximum 99999)

[smriti-api]
type = http
local_ip = 127.0.0.1
local_port = 8000
custom_domains = api.$Domain

[smriti-app]
type = http
local_ip = 127.0.0.1
local_port = 80
custom_domains = app.$Domain
"@
    $frpcConfig | Set-Content "$frpDir\frpc.ini" -Encoding UTF8
    Write-Ok "frpc.ini created at $frpDir\frpc.ini"

    # VPS setup instructions
    Write-Host @"

VPS Setup (Run on your VPS via SSH):
──────────────────────────────────────
# Download FRP server
wget https://github.com/fatedier/frp/releases/download/v$frpVersion/frp_${frpVersion}_linux_amd64.tar.gz
tar -xzf frp_*.tar.gz && cd frp_*

# Create frps.ini
cat > frps.ini << EOF
[common]
bind_port = 7000
vhost_http_port = 80
vhost_https_port = 443
EOF

# Run as service
sudo ./frps -c frps.ini &

"@ -ForegroundColor White

    # Register frpc as Windows service
    nssm install SMRITI-FRP "$frpDir\frpc.exe" 2>$null
    nssm set SMRITI-FRP AppParameters "-c $frpDir\frpc.ini"
    nssm set SMRITI-FRP Start SERVICE_AUTO_START
    nssm start SMRITI-FRP
    Write-Ok "FRP client registered as Windows service"
}

# Update .env for HYBRID mode
Write-Step "Setting Storage Mode to HYBRID..."
$envFile = "$AppPath\backend\.env"
if (Test-Path $envFile) {
    (Get-Content $envFile) -replace "STORAGE_MODE=.*", "STORAGE_MODE=HYBRID" | Set-Content $envFile
    Write-Ok ".env updated to HYBRID mode"
}

Write-Host @"

╔══════════════════════════════════════════════╗
║   HYBRID BRIDGE CONFIGURED!                 ║
║                                              ║
║   Local  : http://localhost (Always works)  ║
║   Remote : https://app.$Domain             ║
║   API    : https://api.$Domain             ║
║                                              ║
║   "Internet gaya? Local kaam karega."       ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor DarkYellow
