.PHONY: help docker-up docker-down docker-logs test run

help:
	@echo "OpenDecision - Make Targets"
	@echo ""
	@echo "Docker & Infrastructure:"
	@echo "  make docker-up          - Subir LocalStack com DynamoDB"
	@echo "  make docker-redis       - Subir Redis (cache)"
	@echo "  make docker-all         - Subir tudo (DynamoDB + Redis)"
	@echo "  make docker-down        - Parar todos os containers"
	@echo "  make docker-logs        - Ver logs (localstack)"
	@echo ""
	@echo "Development:"
	@echo "  make run                - Rodar servidor (requer docker-up antes)"
	@echo "  make test               - Rodar testes"
	@echo "  make test-unit          - Rodar apenas testes unitários"
	@echo "  make lint               - Executar go vet"
	@echo ""
	@echo "Dependencies:"
	@echo "  make deps               - Baixar dependências Go"
	@echo ""

# Docker
docker-up:
	@echo "🚀 Iniciando DynamoDB (LocalStack)..."
	cd docker && docker compose --profile dynamo up -d
	@sleep 10
	@echo "✅ LocalStack rodando em http://localhost:4566"
	@echo "📊 DynamoDB Admin em http://localhost:8001"

docker-redis:
	@echo "🚀 Iniciando Redis..."
	cd docker && docker compose --profile redis up -d
	@echo "✅ Redis rodando em localhost:6379"

docker-all:
	@echo "🚀 Iniciando DynamoDB + Redis..."
	cd docker && docker compose --profile all up -d
	@sleep 10
	@echo "✅ Todos os serviços rodando"

docker-down:
	@echo "⛔ Parando containers..."
	cd docker && docker compose down
	@echo "✅ Containers parados"

docker-logs:
	docker compose -f docker/docker-compose.yml logs -f localstack

docker-clean:
	@echo "🧹 Limpando volumes Docker..."
	cd docker && docker compose down -v
	@echo "✅ Volumes removidos"

# Development
run:
	@echo "🏃 Rodando servidor..."
	go run ./cmd/opendecision/

test:
	@echo "🧪 Rodando testes..."
	go test ./... -v

test-unit:
	@echo "🧪 Rodando testes unitários..."
	go test ./pkg/... ./internal/... -v

test-coverage:
	@echo "📊 Gerando cobertura de testes..."
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out

lint:
	@echo "🔍 Verificando código..."
	go vet ./...
	go fmt ./...

# Dependencies
deps:
	@echo "📦 Baixando dependências..."
	go mod download
	go mod tidy

# Setup
setup:
	@echo "⚙️  Setup inicial..."
	@if [ ! -f .env ]; then cp docker/.env.example .env; fi
	@go mod download
	@make docker-up
	@echo "✅ Setup completo!"
	@echo "   Para rodar: make run"
