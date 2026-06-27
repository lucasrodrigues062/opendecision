# OpenDecision Development Environment - Start all services
param()

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host ""
Write-Host "======= OpenDecision Development Environment =======" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "[1] Checking prerequisites..." -ForegroundColor Blue
try { docker --version | Out-Null; Write-Host "  OK: Docker" -ForegroundColor Green } catch { Write-Host "  FAIL: Docker not found" -ForegroundColor Red; exit 1 }
try { go version | Out-Null; Write-Host "  OK: Go" -ForegroundColor Green } catch { Write-Host "  FAIL: Go not found" -ForegroundColor Red; exit 1 }
try { npm --version | Out-Null; Write-Host "  OK: Node.js" -ForegroundColor Green } catch { Write-Host "  FAIL: Node.js not found" -ForegroundColor Red; exit 1 }

# Load environment
Write-Host ""
Write-Host "[2] Loading configuration..." -ForegroundColor Blue
if (-not (Test-Path ".env.local")) {
    Write-Host "  FAIL: .env.local not found" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: .env.local loaded" -ForegroundColor Green

Get-Content .env.local | Where-Object { $_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$' } | ForEach-Object {
    $key = $matches[1].Trim()
    $value = $matches[2].Trim()
    [Environment]::SetEnvironmentVariable($key, $value, "Process")
}

# Start Docker
Write-Host ""
Write-Host "[3] Starting Docker infrastructure..." -ForegroundColor Blue
Push-Location docker
docker compose --profile dynamo up -d | Out-Null
Pop-Location
Write-Host "  OK: Docker containers started" -ForegroundColor Green

# Wait for LocalStack
Write-Host ""
Write-Host "[4] Waiting for LocalStack..." -ForegroundColor Blue
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:4566/_localstack/health" -ErrorAction SilentlyContinue
        $ready = $true
        break
    } catch { Start-Sleep -Milliseconds 500 }
}

if ($ready) {
    Write-Host "  OK: LocalStack is ready" -ForegroundColor Green
} else {
    Write-Host "  WARN: LocalStack may still be starting..." -ForegroundColor Yellow
}

# Start Backend
Write-Host ""
Write-Host "[5] Starting Backend..." -ForegroundColor Blue
$backendCmd = "cd '$PWD'; go run ./cmd/opendecision/"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal
Write-Host "  OK: Backend window opening" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Frontend
Write-Host ""
Write-Host "[6] Starting Frontend..." -ForegroundColor Blue
$frontendCmd = "cd '$PWD\web'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
Write-Host "  OK: Frontend window opening" -ForegroundColor Green

# Done
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:       http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:        http://localhost:8080" -ForegroundColor Cyan
Write-Host "LocalStack:     http://localhost:4566" -ForegroundColor Cyan
Write-Host "DynamoDB UI:    http://localhost:8001" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker/docker-compose.yml down" -ForegroundColor Cyan
Write-Host ""
