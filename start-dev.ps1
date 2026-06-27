# OpenDecision Development Environment Startup Script
# Starts all services: LocalStack, Backend, and Frontend

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Show-Header($text) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $($text.PadRight(58))║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Success($text) {
    Write-Host "✅ $text" -ForegroundColor Green
}

function Show-Error($text) {
    Write-Host "❌ $text" -ForegroundColor Red
}

function Show-Info($text) {
    Write-Host "ℹ️  $text" -ForegroundColor Blue
}

# Check prerequisites
Show-Header "Checking Prerequisites"

try { docker --version | Out-Null; Show-Success "Docker found" } catch { Show-Error "Docker not installed"; exit 1 }
try { go version | Out-Null; Show-Success "Go found" } catch { Show-Error "Go not installed"; exit 1 }
try { npm --version | Out-Null; Show-Success "Node.js found" } catch { Show-Error "Node.js not installed"; exit 1 }

# Load env vars
Show-Header "Loading Configuration"
if (-not (Test-Path ".env.local")) {
    Show-Error ".env.local not found"
    exit 1
}
Show-Success ".env.local loaded"

Get-Content .env.local | Where-Object { $_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$' } | ForEach-Object {
    $key = $matches[1].Trim()
    $value = $matches[2].Trim()
    [Environment]::SetEnvironmentVariable($key, $value, "Process")
}

# Start Docker infrastructure
Show-Header "Starting Infrastructure"
Push-Location docker
docker compose --profile dynamo up -d | Out-Null
Show-Success "Docker containers started"

Show-Info "Waiting for LocalStack to be ready..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:4566/_localstack/health" -ErrorAction SilentlyContinue
        $ready = $true
        break
    } catch { Start-Sleep -Milliseconds 500 }
}

if ($ready) {
    Show-Success "LocalStack is ready"
} else {
    Show-Info "LocalStack starting (may take a moment)..."
}
Pop-Location

# Start Backend in new window
Show-Header "Starting Backend & Frontend"
$backendCmd = "cd '$PWD'; go run ./cmd/opendecision/"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal
Show-Success "Backend starting (http://localhost:8080)"
Start-Sleep -Seconds 3

# Start Frontend in new window
$frontendCmd = "cd '$PWD\web'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
Show-Success "Frontend starting (http://localhost:5173)"

# Summary
Show-Header "🚀 Development Environment Ready"
Write-Host ""
Write-Host "  🎨 Frontend:      http://localhost:5173" -ForegroundColor Cyan
Write-Host "  🔧 Backend:       http://localhost:8080" -ForegroundColor Cyan
Write-Host "  📦 LocalStack:    http://localhost:4566" -ForegroundColor Cyan
Write-Host "  📊 DynamoDB UI:   http://localhost:8001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Stop all services:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker/docker-compose.yml down" -ForegroundColor Cyan
Write-Host ""
