# Fase 2 — Setup & Quick Start

## 🚀 Começar Rápido (5 minutos)

### Pré-requisitos
- Go 1.25+
- Docker & Docker Compose
- AWS CLI (opcional, para gerenciar DynamoDB manualmente)

### 1️⃣ Subir LocalStack com DynamoDB

```bash
# Abra um terminal na raiz do projeto

# Opção A: Com Makefile
make docker-up

# Opção B: Com Docker Compose direto
docker compose -f docker/docker-compose.yml --profile dynamo up -d

# Opção C: Com script Bash
bash docker/up.sh dynamo
```

✅ LocalStack estará rodando em `http://localhost:4566`  
✅ DynamoDB Admin estará em `http://localhost:8001`

### 2️⃣ Preparar variáveis de ambiente

```bash
# Na raiz do projeto
cp docker/.env.example .env
```

Arquivo `.env` deve ter:
```env
STORE_BACKEND=dynamo
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=us-east-1
DYNAMO_TABLE=pipelines
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

### 3️⃣ Rodar o servidor

```bash
# Instalar dependências (primeira vez)
go mod tidy

# Rodar servidor
go run ./cmd/opendecision/
```

✅ Servidor estará em `http://localhost:8080`

### 4️⃣ Testar (abra outro terminal)

```bash
# Criar um pipeline
curl -X POST http://localhost:8080/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Qualify Leads",
    "description": "Filtra leads com score >= 60",
    "steps": [
      {"op": "filter", "expression": "score >= 60"},
      {"op": "sort", "property": "score", "direction": "desc"}
    ]
  }'

# Response (guarde o ID retornado)
# {"id": "abc123...", "name": "Qualify Leads", "created_at": "..."}
```

---

## 📁 Estrutura da Fase 2

```
├── cmd/opendecision/          ← Servidor HTTP (Adapter)
│   ├── main.go                ← Entry point
│   ├── server.go              ← Server struct + rotas
│   ├── handler_pipelines.go   ← CRUD endpoints
│   ├── handler_execute.go     ← Execução de pipelines
│   ├── middleware.go          ← Logging, CORS, etc
│   └── errors.go              ← Error mapping
│
├── internal/
│   ├── config/
│   │   └── config.go          ← Configuração (env vars)
│   │
│   ├── executor/
│   │   ├── executor.go        ← Executive business logic
│   │   └── executor_test.go
│   │
│   ├── store/                 ← Repositório de pipelines
│   │   ├── store.go           ← Interface + Pipeline struct
│   │   ├── memory.go          ← In-memory (dev)
│   │   └── dynamo.go          ← DynamoDB
│   │
│   └── cache/                 ← Cache de resultados
│       ├── cache.go           ← Interface
│       ├── memory.go          ← In-memory (dev)
│       └── redis.go           ← Redis (futuro)
│
├── docker/
│   ├── docker-compose.yml     ← LocalStack + Redis profiles
│   ├── .env.example           ← Template de variáveis
│   ├── init-dynamodb.sh       ← Script de init
│   ├── up.sh                  ← Helper script
│   └── README.md              ← Documentação Docker
│
├── Makefile                    ← Comandos úteis
└── PHASE2_SETUP.md            ← Este arquivo
```

---

## 🛠️ Comandos Úteis

### Docker

```bash
# Subir ambiente
make docker-up          # DynamoDB
make docker-redis       # Redis
make docker-all         # DynamoDB + Redis

# Parar tudo
make docker-down

# Ver logs
make docker-logs

# Limpar tudo (⚠️ deleta dados)
make docker-clean
```

### Desenvolvimento

```bash
# Rodar servidor
make run

# Rodar testes
make test
make test-coverage

# Verificar código
make lint

# Setup inicial (cria .env, baixa deps, sobe docker)
make setup
```

---

## 📝 Variáveis de Ambiente

Veja `docker/.env.example` para todos os valores possíveis.

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `8080` | Porta do servidor HTTP |
| `STORE_BACKEND` | `memory` | `memory` \| `dynamo` |
| `CACHE_BACKEND` | `memory` | `memory` \| `redis` |
| `AWS_ENDPOINT_URL` | — | LocalStack: `http://localhost:4566` |
| `AWS_REGION` | `us-east-1` | Região AWS |
| `DYNAMO_TABLE` | `pipelines` | Nome da tabela |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |

---

## 🧪 Testar Endpoints

### Criar Pipeline

```bash
curl -X POST http://localhost:8080/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Pipeline",
    "steps": [{"op": "filter", "expression": "age >= 18"}]
  }'
```

### Listar Pipelines

```bash
curl http://localhost:8080/pipelines
```

### Buscar Pipeline

```bash
curl http://localhost:8080/pipelines/{id}
```

### Executar Pipeline

```bash
curl -X POST http://localhost:8080/pipelines/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"age": 25, "name": "Alice"},
      {"age": 15, "name": "Bob"}
    ]
  }'
```

### Health Check

```bash
curl http://localhost:8080/health
```

---

## 🔗 Recursos

- **Fase 1 (Core)**: `pkg/decisionlib/README.md`
- **Docker**: `docker/README.md`
- **Plano Completo**: [ROADMAP.md](./ROADMAP.md)
- **Instruções AI**: [CLAUDE.md](./CLAUDE.md)

---

## ❓ Troubleshooting

### LocalStack não inicia

```bash
# Ver logs
docker compose logs localstack

# Aguardar mais tempo
sleep 30  # antes de testar
```

### Erro "Connection refused"

Verifique que:
- Docker está rodando
- LocalStack está pronto (`docker compose ps`)
- `AWS_ENDPOINT_URL` aponta para `http://localhost:4566`

### Tabela DynamoDB não existe

```bash
# Recriar tabela
docker compose -f docker/docker-compose.yml exec localstack \
  aws dynamodb create-table \
    --table-name pipelines \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:4566 \
    --region us-east-1
```

---

**Próximo passo:** Implementar `internal/config` e depois os módulos de executor, store e handlers HTTP.
