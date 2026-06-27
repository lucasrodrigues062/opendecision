# Docker Environment — OpenDecision

Ambiente Docker para desenvolvimento com **DynamoDB** (LocalStack) e opcionalmente **Redis**.

## Pré-requisitos

- Docker e Docker Compose instalados
- AWS CLI (para inicializar tabelas DynamoDB)
- Bash (ou WSL no Windows)

## Quick Start

### 1. Subir DynamoDB (LocalStack)

```bash
cd docker
docker compose --profile dynamo up -d

# Inicializar tabelas (criar tabela 'pipelines')
docker compose --profile dynamo exec localstack aws dynamodb create-table \
  --table-name pipelines \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:4566 \
  --region us-east-1 \
  --aws-access-key-id test \
  --aws-secret-access-key test
```

### 2. Rodar o servidor (na raiz do projeto)

```bash
cp docker/.env.example .env
go run ./cmd/opendecision/
```

### 3. Acessar DynamoDB Admin UI (opcional)

```
http://localhost:8001
```

---

## Profiles Disponíveis

| Profile | Serviços | Quando Usar |
|---------|----------|------------|
| `dynamo` | LocalStack (DynamoDB) + DynamoDB Admin | Desenvolvimento com DynamoDB |
| `redis` | Redis | Cache opcional |
| `all` | LocalStack + Redis + DynamoDB Admin | Dev completo |
| *(nenhum)* | Nada | Usar banco de dados remoto (AWS) |

### Exemplos

```bash
# Apenas DynamoDB
docker compose --profile dynamo up -d

# DynamoDB + Redis
docker compose --profile dynamo --profile redis up -d

# Tudo
docker compose --profile all up -d

# Parar tudo
docker compose down
```

---

## Variáveis de Ambiente

Copie o `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example ../.env
```

### Para LocalStack (desenvolvimento)

```env
STORE_BACKEND=dynamo
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=us-east-1
DYNAMO_TABLE=pipelines
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

### Para AWS (produção)

```env
STORE_BACKEND=dynamo
AWS_REGION=us-east-1
DYNAMO_TABLE=pipelines-prod
# AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY virão de ~/.aws/credentials ou env vars
```

---

## Verificação de Saúde

### LocalStack está rodando?

```bash
curl http://localhost:4566/_localstack/health
```

### DynamoDB funciona?

```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region us-east-1 \
  --aws-access-key-id test \
  --aws-secret-access-key test
```

### Redis está funcional?

```bash
redis-cli ping
# Resposta esperada: PONG
```

---

## Troubleshooting

### LocalStack demora para iniciar

LocalStack pode levar 10-30 segundos para ficar pronto. Aguarde antes de criar tabelas.

```bash
docker compose --profile dynamo logs localstack
```

### Tabela já existe

Se a tabela já existe, o create falha. Use update-table ou delete-table:

```bash
# Deletar tabela
aws dynamodb delete-table \
  --table-name pipelines \
  --endpoint-url http://localhost:4566 \
  --region us-east-1 \
  --aws-access-key-id test \
  --aws-secret-access-key test

# Esperar deletar
sleep 5

# Recriar
docker compose --profile dynamo exec localstack bash /docker/init-dynamodb.sh
```

### Erro de conexão ao AWS

Verifique que `AWS_ENDPOINT_URL=http://localhost:4566` está definido (LocalStack) ou não definido (AWS real).

---

## Persistência de Dados

- **LocalStack**: dados salvos em `./.localstack/` (volume Docker)
- **Redis**: dados salvos em `redis_data` volume

Para limpar tudo:

```bash
docker compose down -v  # Remove volumes também
```

---

## Logging

Ver logs de um serviço:

```bash
docker compose logs -f localstack
docker compose logs -f redis
docker compose logs -f dynamodb-admin
```

---

## Desenvolvimento Local

```bash
# 1. Subir ambiente
cd docker
docker compose --profile dynamo up -d

# 2. Criar .env na raiz
cp .env.example ../.env

# 3. Rodar servidor
cd ..
go run ./cmd/opendecision/

# 4. Testar
curl -X POST http://localhost:8080/pipelines \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","steps":[{"op":"filter","expression":"age >= 18"}]}'

# 5. Ver dados no DynamoDB Admin
# http://localhost:8001
```

---

**Documentação completa:** [../README.md](../README.md)
