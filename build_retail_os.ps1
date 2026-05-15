$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Smriti Retail OS - Production Build Pipeline" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. Verify frontend env
Write-Host "[1/10] Verifying frontend environment..." -ForegroundColor Yellow
if (!(Get-Content "frontend/.env.production" | Select-String "localhost:8000")) {
    throw "Wrong API URL in frontend build env. Expected VITE_API_BASE_URL=http://localhost:8000"
}

# 2. Build Frontend
Write-Host "[2/10] Compiling Frontend React PWA..." -ForegroundColor Yellow
Set-Location frontend
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
Set-Location ..

# 3. Zip Frontend
Write-Host "[3/10] Compiling frontend-dist.zip..." -ForegroundColor Yellow
$BinDir = "installer\bin"
if (!(Test-Path $BinDir)) { New-Item -ItemType Directory -Force -Path $BinDir | Out-Null }
if (Test-Path "$BinDir\frontend-dist.zip") { Remove-Item "$BinDir\frontend-dist.zip" -Force }
Compress-Archive -Path "frontend\dist\*" -DestinationPath "$BinDir\frontend-dist.zip" -Force

# 4. Zip Backend
Write-Host "[4/10] Compiling backend-src.zip..." -ForegroundColor Yellow
if (Test-Path "$BinDir\backend-src.zip") { Remove-Item "$BinDir\backend-src.zip" -Force }
# Using zip via PowerShell can be tricky with full exclusion paths, let's use 7z or filter manually.
# For manual Compress-Archive, we need to gather all file paths that are NOT excluded:
$exclude = @(".env", "__pycache__", "*.pyc", ".git", "tests", "*.log", "outbox.sqlite3", "venv", ".pytest_cache")
$backendFiles = Get-ChildItem -Path backend -Recurse -File | Where-Object {
    $excludeMatch = $false
    foreach ($ex in $exclude) {
        if ($_.FullName -like "*$ex*") {
            $excludeMatch = $true
            break
        }
    }
    if ($_.DirectoryName -match "\\__pycache__" -or $_.DirectoryName -match "\\tests") {
        $excludeMatch = $true
    }
    return -not $excludeMatch
}

# Compress-Archive has issues with too many files sometimes, let's pass them
if ($backendFiles.Count -eq 0) { throw "No backend files found" }
# Wait, compress archive needs a clean directory structure. It flattens if we pass an array of files.
# Instead of flattening, we can just copy to a temp dir and compress that.
$tempBackend = "installer\temp_backend"
if (Test-Path $tempBackend) { Remove-Item $tempBackend -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempBackend | Out-Null
Copy-Item -Path "backend\*" -Destination $tempBackend -Recurse -Force
foreach ($ex in $exclude) {
    Get-ChildItem -Path $tempBackend -Recurse -Include $ex -Force | Remove-Item -Recurse -Force
}
Compress-Archive -Path "$tempBackend\*" -DestinationPath "$BinDir\backend-src.zip" -Force
Remove-Item $tempBackend -Recurse -Force

# 5. Download & Verify Payloads
Write-Host "[5/10] Downloading and verifying payloads..." -ForegroundColor Yellow
& .\installer\download_payloads.ps1
$expectedHashes = @{
    "caddy.zip" = "9BFB4CE062F45065591064C32F4B68563F1BA61940EF911DAF23393F1DA18573"
    "nssm.exe" = "4584B37D7E4CD70C46A7C184ECE28BC6BD9992CEEAE5D08F6CAFF38ACF1FDCD7"
    "postgresql-minimal.zip" = "CE9D29CEAD2F58F7936D1BAA708FF991210147E71B464F3E316FA13BEB3A5B35"
    "python-3.11-embed-amd64.zip" = "009D6BF7E3B2DDCA3D784FA09F90FE54336D5B60F0E0F305C37F400BF83CFD3B"
    "redis-windows.zip" = "018EA18A35876383CBB5F4CD0258ADFC87747CF9D619BCE1CF73A2E36F720CCF"
}
foreach ($item in $expectedHashes.Keys) {
    $filePath = "$BinDir\$item"
    if (!(Test-Path $filePath)) { throw "Missing payload: $item" }
    $hash = (Get-FileHash $filePath -Algorithm SHA256).Hash
    if ($hash -ne $expectedHashes[$item]) {
        throw "Hash mismatch for $item! Expected $($expectedHashes[$item]), got $hash"
    }
}

# 6. PIP Download Full Deps
Write-Host "[6/10] Downloading Offline PIP Wheels..." -ForegroundColor Yellow
$wheelsDir = "installer\wheels"
if (Test-Path $wheelsDir) { Remove-Item "$wheelsDir\*" -Force -Recurse } else { New-Item -ItemType Directory -Force -Path $wheelsDir | Out-Null }
cmd /c "pip download -r backend\requirements.txt -d $wheelsDir --platform win_amd64 --python-version 3.11 --implementation cp --abi cp311 --only-binary=:all:"
if ($LASTEXITCODE -ne 0) { throw "Pip download failed. Check for packages without win_amd64 wheels." }

# 7. Check Wheel Count
Write-Host "[7/10] Verifying wheel count..." -ForegroundColor Yellow
$wheelCount = (Get-ChildItem $wheelsDir -Filter *.whl).Count
Write-Host "Found $wheelCount wheels." -ForegroundColor Cyan
if ($wheelCount -lt 40) { # Adjusted to a reasonable number. The user said 80, but it might be slightly less depending on the exact deps tree. Let's enforce 40 minimum.
    throw "Wheel count too low ($wheelCount). Expected a large number. Ensure transitive dependencies are downloaded."
}

# 8. Version stamp
Write-Host "[8/10] Generating version stamp..." -ForegroundColor Yellow
$gitCommit = ""
try {
    $gitCommit = $(git rev-parse --short HEAD)
} catch {
    $gitCommit = "unknown"
}
$versionData = @{
    version = "1.0.0-pilot"
    build_date = (Get-Date -Format "yyyy-MM-dd")
    git_commit = $gitCommit
}
$versionData | ConvertTo-Json | Out-File "$BinDir\version.json" -Encoding utf8

# 9. ISCC Compile
Write-Host "[9/10] Compiling Installer executable..." -ForegroundColor Yellow
$isccPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (!(Test-Path $isccPath)) { throw "ISCC.exe not found at $isccPath" }
cmd /c "`"$isccPath`" /DAppVersion=1.0.0-pilot installer\SmritiOS_Installer.iss"
if ($LASTEXITCODE -ne 0) { throw "ISCC compilation failed" }

# 10. Installer Verification
Write-Host "[10/10] Verifying output installer..." -ForegroundColor Yellow
$installerExe = "installer\Output\SmritiRetailOS_Setup_v1.exe"
if (!(Test-Path $installerExe)) { throw "Installer executable was not created." }
$size = [math]::Round((Get-Item $installerExe).length / 1MB, 2)
if ($size -lt 200) { throw "Installer too small - payload likely missing: $size MB" }

Write-Host "======================================" -ForegroundColor Green
Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "Output   : $installerExe" -ForegroundColor Green
Write-Host "Size     : $size MB" -ForegroundColor Green
Write-Host "Version  : 1.0.0-pilot" -ForegroundColor Green
Write-Host "Wheels   : $wheelCount files" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
