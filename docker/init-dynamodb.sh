#!/bin/bash
# Inicializa as tabelas DynamoDB no LocalStack

set -e

ENDPOINT="http://localstack:4566"
REGION="us-east-1"

echo "Aguardando LocalStack ficar pronto..."
sleep 5

echo "Criando tabela 'pipelines' no DynamoDB..."

aws dynamodb create-table \
  --table-name pipelines \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=created_at,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=created_at,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --aws-access-key-id test \
  --aws-secret-access-key test \
  2>/dev/null || echo "Tabela já existe"

echo "✅ DynamoDB inicializado com sucesso!"
echo ""
echo "Detalhes da tabela:"
aws dynamodb describe-table \
  --table-name pipelines \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --aws-access-key-id test \
  --aws-secret-access-key test \
  --query 'Table.[TableName,TableStatus,ItemCount]' \
  --output text

echo ""
echo "Variáveis de ambiente para conectar:"
echo "  STORE_BACKEND=dynamo"
echo "  AWS_ENDPOINT_URL=http://localhost:4566"
echo "  AWS_REGION=us-east-1"
echo "  DYNAMO_TABLE=pipelines"
echo "  AWS_ACCESS_KEY_ID=test"
echo "  AWS_SECRET_ACCESS_KEY=test"
