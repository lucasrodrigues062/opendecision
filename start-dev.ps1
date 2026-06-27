# OpenDecision Development Environment Startup Script
# This script starts LocalStack (DynamoDB), Backend Server, and optionally the Frontend

param(
    [switch]$NoFrontend,
    [switch]$NoBackend,
    [switch]$NoInfra
)

$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $args[0]$(' ' * (56 - $args[0].Length))║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success {
    Write-Host "✅ $args[0]" -ForegroundColor Green
}

function Write-Error-Custom {
    Write-Host "❌ $args[0]" -ForegroundColor Red
}

function Write-Info {
    Write-Host "ℹ️  $args[0]" -ForegroundColor Blue
}

# Check prerequisites
Write-Header "Checking Prerequisites"

# Check Docker
try {
    docker --version | Out-Null
    Write-Success "Docker is installed"
} catch {
    Write-Error-Custom "Docker is not installed or not in PATH"
    exit 1
}

# Check Go
try {
    go version | Out-Null
    Write-Success "Go is installed"
} catch {
    Write-Error-Custom "Go is not installed or not in PATH"
    exit 1
}

# Check Node (optional, for frontend)
if (-not $NoFrontend) {
    try {
        node --version | Out-Null
        npm --version | Out-Null
        Write-Success "Node.js is installed"
    } catch {
        Write-Error-Custom "Node.js is not installed (required for frontend)"
        Write-Info "Skipping frontend startup. To install: https://nodejs.org/"
        $NoFrontend = $true
    }
}

# Load environment variables from .env.local
Write-Header "Loading Environment Variables"
if (Test-Path ".env.local") {
    Write-Success ".env.local found"
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Success "Environment variables loaded"
} else {
    Write-Error-Custom ".env.local not found"
    exit 1
}

# Start Infrastructure (LocalStack)
if (-not $NoInfra) {
    Write-Header "Starting Infrastructure (LocalStack)"
    Write-Info "Starting Docker containers..."

    Push-Location docker
    try {
        docker compose --profile dynamo up -d 2>&1 | Out-Null
        Write-Success "LocalStack started"

        # Wait for LocalStack to be ready
        Write-Info "Waiting for LocalStack health check..."
        $maxAttempts = 30
        $attempts = 0

        while ($attempts -lt $maxAttempts) {
            try {
                $response = curl.exe -s http://localhost:4566/_localstack/health
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "LocalStack is ready"
                    break
                }
            } catch { }

            $attempts++
            Start-Sleep -Seconds 1
        }

        if ($attempts -eq $maxAttempts) {
            Write-Error-Custom "LocalStack health check failed after $maxAttempts seconds"
            Write-Info "Continuing anyway... you may need to wait a bit more"
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Info "Skipping infrastructure startup (use without -NoInfra to start)"
}

# Start Backend
if (-not $NoBackend) {
    Write-Header "Starting Backend Server"
    Write-Info "Launching on http://localhost:8080"

    # Start backend in a new PowerShell window
    $backendScript = @"
cd "$PWD"
go run ./cmd/opendecision/
"@

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript `
        -WindowTitle "OpenDecision Backend" `
        -Verb RunAs

    Write-Success "Backend window opened"
    Start-Sleep -Seconds 2
} else {
    Write-Info "Skipping backend startup (use without -NoBackend to start)"
}

# Start Frontend
if (-not $NoFrontend) {
    Write-Header "Starting Frontend (React Dev Server)"
    Write-Info "Launching on http://localhost:5173"

    if (Test-Path "web") {
        $frontendScript = @"
cd "$PWD\web"
npm run dev
"@

        Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript `
            -WindowTitle "OpenDecision Frontend" `
            -Verb RunAs

        Write-Success "Frontend window opened"
    } else {
        Write-Error-Custom "web directory not found"
    }
} else {
    Write-Info "Skipping frontend startup (use without -NoFrontend to start)"
}

# Final summary
Write-Header "Development Environment Ready"
Write-Success "All services are starting up"
Write-Info ""
Write-Info "Services:"
Write-Info "  Backend:   http://localhost:8080"
Write-Info "  Frontend:  http://localhost:5173"
Write-Info "  LocalStack: http://localhost:4566"
Write-Info "  DynamoDB Admin: http://localhost:8001 (optional)"
Write-Info ""
Write-Info "To stop all services:"
Write-Info "  docker compose -f docker/docker-compose.yml down"
Write-Info ""
