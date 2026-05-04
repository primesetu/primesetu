# ============================================================
# SMRITI-OS — Local Sovereign Deployment Script
# Run as Administrator in PowerShell
# ============================================================

param(
    [string]$ServerIP = "192.168.1.104",
    [string]$AppPath = "D:\IMP\GitHub\primesetu",
    [string]$NginxPath = "C:\nginx"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "   OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "   !! $msg" -ForegroundColor Yellow }

Write-Host @"
╔══════════════════════════════════════════════╗
║   SMRITI-OS — LOCAL SOVEREIGN DEPLOY         ║
║   Zero Cloud · Zero Dependency               ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor DarkCyan

# 1. BUILD FRONTEND
Write-Step "Building React Frontend..."
Set-Location $AppPath
npm run build --prefix frontend
Write-Ok "Frontend built → frontend/dist/"

# 2. CONFIGURE NGINX
Write-Step "Configuring Nginx..."
$nginxConf = @"
worker_processes  1;
events { worker_connections  1024; }
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;
    
    server {
        listen 80;
        server_name $ServerIP localhost;

        root $($AppPath.Replace('\','/'))/frontend/dist;
        index index.html;

        location / {
            try_files `$uri `$uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:8000/;
            proxy_http_version 1.1;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_read_timeout 300;
        }
    }
}
"@
$nginxConf | Set-Content "$NginxPath\conf\nginx.conf" -Encoding UTF8
Write-Ok "Nginx configured for $ServerIP"

# 3. INSTALL/UPDATE WINDOWS SERVICES
Write-Step "Setting up Windows Services (NSSM required)..."

$nssmPath = Get-Command nssm -ErrorAction SilentlyContinue
if (-not $nssmPath) {
    Write-Warn "NSSM not found. Install with: winget install nssm OR choco install nssm"
    Write-Warn "Falling back to manual start..."
    
    # Start manually
    Start-Process "$NginxPath\nginx.exe" -WorkingDirectory $NginxPath
    Start-Process "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend" -WorkingDirectory $AppPath
} else {
    # Register as services
    nssm install SMRITI-Nginx "$NginxPath\nginx.exe" 2>$null
    nssm set SMRITI-Nginx AppDirectory $NginxPath
    nssm set SMRITI-Nginx Start SERVICE_AUTO_START

    nssm install SMRITI-Backend "python" 2>$null
    nssm set SMRITI-Backend AppParameters "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend"
    nssm set SMRITI-Backend AppDirectory $AppPath
    nssm set SMRITI-Backend Start SERVICE_AUTO_START

    # Restart services
    nssm restart SMRITI-Nginx
    nssm restart SMRITI-Backend
    Write-Ok "Windows services registered and started"
}

# 4. FIREWALL RULES
Write-Step "Opening Firewall for LAN access..."
netsh advfirewall firewall add rule name="SMRITI-OS HTTP" dir=in action=allow protocol=TCP localport=80 2>$null
netsh advfirewall firewall add rule name="SMRITI-OS API" dir=in action=allow protocol=TCP localport=8000 2>$null
Write-Ok "Firewall rules added"

# 5. UPDATE .ENV for LOCAL mode
Write-Step "Setting Storage Mode to SOVEREIGN..."
$envFile = "$AppPath\backend\.env"
if (Test-Path $envFile) {
    (Get-Content $envFile) -replace "STORAGE_MODE=.*", "STORAGE_MODE=SOVEREIGN" | Set-Content $envFile
    Write-Ok ".env updated to SOVEREIGN mode"
} else {
    Write-Warn ".env file not found at $envFile"
}

Write-Host @"

╔══════════════════════════════════════════════╗
║   SMRITI-OS DEPLOYED SUCCESSFULLY!           ║
║                                              ║
║   Local Access : http://localhost            ║
║   LAN Access   : http://$ServerIP     ║
║   API Health   : http://localhost:8000/health║
║                                              ║
║   "Zero Cloud. 100% Sovereign."             ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor DarkGreen
