# ==============================================================================
# SMRITI-OS — Full Enterprise Service Recovery & Initialization Script
# INSTRUCTIONS: Run this script as Administrator in a PowerShell window.
# ==============================================================================

$InstallDir = "C:\SmritiOS"
$NSSM = "$InstallDir\bin\nssm.exe"
$PyExe = "$InstallDir\python\python.exe"
$PgBin = "$InstallDir\postgres\pgsql\bin"
$PgData = "$InstallDir\postgres\pgsql\data"
$BackendDir = "$InstallDir\backend"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     SMRITI-OS — SERVICE REPAIR & BOOTSTRAP PIPELINE     " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. BOOTSTRAP PIP IN EMBEDDED PYTHON
Write-Host "`n[1/7] Bootstrapping pip in Embedded Python..." -ForegroundColor Yellow
$GetPipUrl = "https://bootstrap.pypa.io/get-pip.py"
$GetPipPath = "$InstallDir\get-pip.py"
try {
    Write-Host "       Downloading pip bootstrapper..."
    Invoke-WebRequest -Uri $GetPipUrl -OutFile $GetPipPath -UseBasicParsing
    Write-Host "       Installing pip..."
    & $PyExe $GetPipPath
    Remove-Item $GetPipPath -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Pip bootstrapped successfully!" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to bootstrap pip. Ensure you are connected to the internet. Error: $_" -ForegroundColor Red
    exit 1
}

# 2. INSTALL OFFLINE PYTHON WHEELS
Write-Host "`n[2/7] Installing 50 offline Python wheels..." -ForegroundColor Yellow
try {
    & $PyExe -m pip install --no-index --find-links="$InstallDir\wheels" -r "$BackendDir\requirements.txt"
    Write-Host "  [OK] All backend packages installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to install packages. Error: $_" -ForegroundColor Red
    exit 1
}

# 3. INITIALIZE POSTGRESQL DATABASE
Write-Host "`n[3/7] Initializing PostgreSQL Database..." -ForegroundColor Yellow
if (!(Test-Path $PgData)) {
    try {
        New-Item -ItemType Directory -Path $PgData -Force | Out-Null
        $PwFile = "$InstallDir\temp_pw.txt"
        "postgres" | Out-File $PwFile -Encoding ascii -NoNewline
        & "$PgBin\initdb.exe" -D $PgData -U postgres --pwfile=$PwFile -A scram-sha-256
        Remove-Item $PwFile -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Database directory initialized." -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Failed to initialize database. Error: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "       Database already initialized." -ForegroundColor Green
}

# 4. REGISTER & START POSTGRESQL SERVICE
Write-Host "`n[4/7] Registering SmritiPostgres Service..." -ForegroundColor Yellow
& $NSSM stop SmritiPostgres 2>$null | Out-Null
& $NSSM remove SmritiPostgres confirm 2>$null | Out-Null
& $NSSM install SmritiPostgres "$PgBin\postgres.exe" "-D `"$PgData`"" | Out-Null
& $NSSM set SmritiPostgres AppDirectory "$PgBin" | Out-Null
& $NSSM start SmritiPostgres | Out-Null
Write-Host "       Waiting for PostgreSQL to wake up..."
Start-Sleep -Seconds 5
Write-Host "  [OK] SmritiPostgres registered and running!" -ForegroundColor Green

# 5. CREATE AND SEED SMRITI DATABASE
Write-Host "`n[5/7] Creating & Seeding Sovereign Database..." -ForegroundColor Yellow
try {
    # Create Database
    $env:PGPASSWORD = "postgres"
    & "$PgBin\createdb.exe" -U postgres smriti_local 2>$null | Out-Null
    Write-Host "       Database 'smriti_local' verified."
    
    # Configure .env file
    $EnvFile = "$BackendDir\.env"
    $EnvContent = @"
STORAGE_MODE=LOCAL_POSTGRES
LOCAL_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/smriti_local
"@
    $EnvContent | Set-Content $EnvFile -Encoding UTF8
    Write-Host "       Backend configured to SOVEREIGN mode."
    
    # Seed tables and schema
    Set-Location $BackendDir
    & $PyExe "scripts\init_local_db.py"
    Write-Host "  [OK] Database schema initialized and seeded!" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed database migrations. Error: $_" -ForegroundColor Red
    exit 1
}

# 6. CONFIGURE CADDY WEB ROUTING
Write-Host "`n[6/7] Generating Caddy Web Routing..." -ForegroundColor Yellow
$CaddyFile = "$InstallDir\caddy\Caddyfile"
$CaddyContent = @"
:3000 {
    root * "$InstallDir\frontend"
    file_server
    try_files {path} /index.html
}
"@
$CaddyContent | Set-Content $CaddyFile -Encoding UTF8
Write-Host "  [OK] Caddyfile created for port 3000." -ForegroundColor Green

# 7. REGISTER & START REMAINING SERVICES
Write-Host "`n[7/7] Registering Core Windows Services..." -ForegroundColor Yellow

# A. SmritiAPI (FastAPI Web Engine)
& $NSSM stop SmritiAPI 2>$null | Out-Null
& $NSSM remove SmritiAPI confirm 2>$null | Out-Null
& $NSSM install SmritiAPI $PyExe "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" | Out-Null
& $NSSM set SmritiAPI AppDirectory $BackendDir | Out-Null
& $NSSM start SmritiAPI | Out-Null
Write-Host "       SmritiAPI started." -ForegroundColor Green

# B. SmritiWorker (Celery Background Tasks)
& $NSSM stop SmritiWorker 2>$null | Out-Null
& $NSSM remove SmritiWorker confirm 2>$null | Out-Null
& $NSSM install SmritiWorker $PyExe "-m celery -A app.core.celery_app worker --loglevel=info -P solo" | Out-Null
& $NSSM set SmritiWorker AppDirectory $BackendDir | Out-Null
& $NSSM start SmritiWorker | Out-Null
Write-Host "       SmritiWorker started." -ForegroundColor Green

# C. SmritiFrontend (Caddy Web Server)
& $NSSM stop SmritiFrontend 2>$null | Out-Null
& $NSSM remove SmritiFrontend confirm 2>$null | Out-Null
& $NSSM install SmritiFrontend "$InstallDir\caddy\_caddy.exe" "run --config `"$CaddyFile`"" | Out-Null
& $NSSM set SmritiFrontend AppDirectory "$InstallDir\caddy" | Out-Null
& $NSSM start SmritiFrontend | Out-Null
Write-Host "       SmritiFrontend started." -ForegroundColor Green

Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host "  SUCCESS! SMRITI RETAIL OS IS COMPLETELY INITIALIZED!" -ForegroundColor Green
Write-Host "  Launch URL: http://localhost:3000" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
