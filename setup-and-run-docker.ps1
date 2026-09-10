# Post-Reboot ERPNext Docker Setup Script for Windows Server 2022
# Run this script in PowerShell as Administrator after the machine restarts.

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ERPNext Docker Setup on Windows Server  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Verify WSL status
Write-Host "`n[1/5] Verifying WSL status..." -ForegroundColor Yellow
try {
    wsl --status
} catch {
    Write-Host "WSL is not ready yet. Please ensure the machine has completed its reboot." -ForegroundColor Red
    exit 1
}

# 2. Ensure Ubuntu distro is installed
Write-Host "`n[2/5] Setting up Ubuntu Linux environment in WSL..." -ForegroundColor Yellow
$distros = (wsl -l -q 2>$null) -replace "`0", ""
if ($distros -notmatch "Ubuntu") {
    Write-Host "Installing Ubuntu distribution..."
    wsl --install -d Ubuntu --no-launch
    Start-Sleep -Seconds 10
} else {
    Write-Host "Ubuntu distribution already present." -ForegroundColor Green
}

# 3. Install Docker and Compose inside Ubuntu
Write-Host "`n[3/5] Installing Docker Engine & Docker Compose inside Ubuntu..." -ForegroundColor Yellow
wsl -d Ubuntu -u root -- bash -c "apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2"

# 4. Start Docker daemon
Write-Host "`n[4/5] Starting Docker daemon..." -ForegroundColor Yellow
wsl -d Ubuntu -u root -- service docker start

# 5. Launch ERPNext stack
Write-Host "`n[5/5] Launching ERPNext Docker Compose stack..." -ForegroundColor Yellow
$wslPath = "/mnt/c/Users/hs32/Desktop/erpnext"
wsl -d Ubuntu -- bash -c "cd $wslPath && sudo docker compose up -d"

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "ERPNext containers started successfully!" -ForegroundColor Green
Write-Host "To monitor site initialization progress, run:" -ForegroundColor Cyan
Write-Host "wsl -d Ubuntu -- bash -c 'cd $wslPath && sudo docker compose logs -f create-site'" -ForegroundColor White
Write-Host "Web access will be at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
