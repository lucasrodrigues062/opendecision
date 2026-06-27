#!/bin/bash
# Utilitário para subir ambiente com DynamoDB

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 OpenDecision - Iniciando ambiente..."
echo ""

# Opções
PROFILE="${1:-dynamo}"  # padrão: dynamo (LocalStack)

case "$PROFILE" in
  dynamo)
    echo "📦 Iniciando com DynamoDB (LocalStack)..."
    cd "$PROJECT_ROOT"
    docker compose -f docker/docker-compose.yml --profile dynamo up -d

    echo ""
    echo "⏳ Aguardando LocalStack ficar pronto..."
    sleep 10

    echo ""
    echo "📊 Inicializando tabelas DynamoDB..."
    docker compose -f docker/docker-compose.yml --profile dynamo exec -T localstack bash /docker/init-dynamodb.sh

    echo ""
    echo "✅ Ambiente DynamoDB está pronto!"
    echo ""
    echo "Para rodar o servidor:"
    echo "  cp docker/.env.example .env"
    echo "  go run ./cmd/opendecision/"
    echo ""
    echo "DynamoDB Admin:"
    echo "  http://localhost:8001"
    ;;

  redis)
    echo "📦 Iniciando Redis..."
    cd "$PROJECT_ROOT"
    docker compose -f docker/docker-compose.yml --profile redis up -d
    echo "✅ Redis rodando em localhost:6379"
    ;;

  all)
    echo "📦 Iniciando DynamoDB + Redis..."
    cd "$PROJECT_ROOT"
    docker compose -f docker/docker-compose.yml --profile all up -d

    echo ""
    echo "⏳ Aguardando serviços ficarem prontos..."
    sleep 10

    echo ""
    echo "📊 Inicializando DynamoDB..."
    docker compose -f docker/docker-compose.yml --profile all exec -T localstack bash /docker/init-dynamodb.sh

    echo ""
    echo "✅ Todos os serviços estão prontos!"
    ;;

  stop)
    echo "⛔ Parando containers..."
    cd "$PROJECT_ROOT"
    docker compose -f docker/docker-compose.yml down
    echo "✅ Containers parados"
    ;;

  *)
    echo "Uso: $0 [dynamo|redis|all|stop]"
    echo ""
    echo "  dynamo  - Inicia LocalStack com DynamoDB (padrão)"
    echo "  redis   - Inicia apenas Redis"
    echo "  all     - Inicia DynamoDB + Redis"
    echo "  stop    - Para todos os containers"
    exit 1
    ;;
esac
