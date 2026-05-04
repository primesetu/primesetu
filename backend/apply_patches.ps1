$sourcePath = "D:\Shoper9\PatchTemp"
$destPath = "D:\Shoper9"

# Get all POS_ directories, sort them so oldest patches are applied first, newest last
$patchDirs = Get-ChildItem -Path $sourcePath -Filter "POS_*" -Directory | Sort-Object Name

foreach ($dir in $patchDirs) {
    Write-Host "Applying Patch: $($dir.Name)"
    
    # Copy root files
    Copy-Item -Path "$($dir.FullName)\*.*" -Destination $destPath -Force -ErrorAction SilentlyContinue
    
    # Copy Script files if the folder exists
    if (Test-Path "$($dir.FullName)\Script") {
        Copy-Item -Path "$($dir.FullName)\Script\*.*" -Destination "$destPath\Script" -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "All patches copied successfully."
