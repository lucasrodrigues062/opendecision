# 🚀 Quick Start Guide

## Startup Scripts

### Option 1: Automatic Startup (Recommended)

**Windows (PowerShell):**
```powershell
# From project root
.\start-dev.ps1
```

**Windows (Command Prompt):**
```cmd
start-dev.bat
```

This will:
- ✅ Check Docker, Go, and Node.js
- ✅ Start LocalStack (DynamoDB)
- ✅ Start Backend Server (port 8080)
- ✅ Start Frontend Dev Server (port 5173)

**Options:**
```powershell
# Skip frontend
.\start-dev.ps1 -NoFrontend

# Skip backend
.\start-dev.ps1 -NoBackend

# Skip infrastructure (LocalStack)
.\start-dev.ps1 -NoInfra

# Skip everything, just check prerequisites
.\start-dev.ps1 -NoFrontend -NoBackend -NoInfra
```

---

### Option 2: Manual Startup

**Terminal 1 - Infrastructure:**
```bash
cd docker
docker compose --profile dynamo up -d
```

**Terminal 2 - Backend:**
```bash
go run ./cmd/opendecision/
# Server runs on http://localhost:8080
```

**Terminal 3 - Frontend:**
```bash
cd web
npm install  # (first time only)
npm run dev
# Dev server runs on http://localhost:5173
```

---

## URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Visual Editor |
| Backend API | http://localhost:8080 | REST API |
| Health Check | http://localhost:8080/health | Backend Status |
| DynamoDB Admin | http://localhost:8001 | Database UI (optional) |

---

## First Time Setup

```bash
# 1. Install backend dependencies (automatic with go run)
go mod download

# 2. Install frontend dependencies
cd web && npm install && cd ..

# 3. Create .env.local (if not exists)
# Already created - contains LocalStack config

# 4. Run the startup script
.\start-dev.ps1
```

---

## Verify Everything Works

```bash
# Health check
curl http://localhost:8080/health

# List pipelines (should be empty initially)
curl http://localhost:8080/pipelines

# Create a test pipeline
curl -X POST http://localhost:8080/pipelines \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test pipeline","steps":[{"op":"filter","expression":"age >= 18"}]}'
```

---

## Stopping Services

```bash
# Stop all Docker containers
docker compose -f docker/docker-compose.yml down

# Or stop just LocalStack
docker compose -f docker/docker-compose.yml --profile dynamo down

# Stop backend/frontend: Close the PowerShell windows (Ctrl+C or close button)
```

---

## Troubleshooting

### LocalStack won't start
```bash
# Clear Docker cache and retry
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml --profile dynamo up -d
```

### Backend crashes on startup
```bash
# Check .env.local is present and correct
cat .env.local

# Clear Go cache
go clean -cache

# Run with verbose output
go run ./cmd/opendecision/
```

### Frontend doesn't load
```bash
# Check Node.js is installed
node --version
npm --version

# Reinstall dependencies
cd web && rm -r node_modules && npm install && npm run dev
```

### Port already in use
Change `PORT` in `.env.local` (backend) or edit `web/vite.config.ts` (frontend):

```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Or use a different port
set PORT=8081
go run ./cmd/opendecision/
```

---

## Environment Configuration

The `.env.local` file contains:

```env
PORT=8080                           # Backend port
STORE_BACKEND=dynamo                # Storage: memory, dynamo, postgres
AWS_ENDPOINT_URL=http://localhost:4566  # LocalStack endpoint
DYNAMO_TABLE=pipelines              # DynamoDB table name
AWS_REGION=us-east-1                # AWS region
```

For production, use `.env` with different values and secrets.

---

## Next Steps

1. **Verify Backend:** Create and execute a pipeline via REST API
2. **Visual Editor:** Open http://localhost:5173 and design pipelines
3. **Publish:** Save pipelines to DynamoDB via the UI
4. **Test:** Execute pipelines with test data

---

## Documentation

- [Backend Setup](./docker/README.md) — Infrastructure & deployment
- [Frontend Guide](./web/README.md) — Editor & visual components
- [API Reference](./pkg/decisionlib/README.md) — Decision library
- [Contributing](./CONTRIBUTING.md) — Development guidelines

---

Happy coding! 🎉
