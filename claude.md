# Contexto do Projeto: OpenDecision Engine (Golang)

## 1. Visão Geral
Você atuará como um Staff Engineer especializado em Golang e sistemas distribuídos. Nosso objetivo é construir o **OpenDecision**, um Motor de Decisão (*Decision Pipeline*) open source de altíssima performance. 
A arquitetura permitirá que regras complexas de priorização geradas por um front-end visual sejam executadas em milissegundos sobre arrays de dados dinâmicos.

## 2. Estratégia de Desenvolvimento (Faseamento)
O projeto é desenvolvido em fases com desacoplamento absoluto:
* **Fase 1 (Concluída): O Core (Package `decisionlib`).** Biblioteca Go pura que recebe um slice dinâmico (`[]map[string]any`) e uma AST de execução, aplicando filtros, cálculos e ordenação.
* **Fase 2 (Concluída): A Infraestrutura (`cmd/opendecision`).** Servidor HTTP REST, persistência (memory/DynamoDB), cache (memory/Redis) e frontend React embedado no binário Go.
* **Fase 3 (Concluída): Grafo Genérico.** Executor baseado em grafos com operações aninhadas, condicionais e múltiplas branches.

## 3. Componentes do Sistema

### 3.1 Motor de Avaliação (`pkg/decisionlib`)
* **Linguagem:** Go 1.25+.
* **Engine de Expressões:** `antonmedv/expr` para avaliar lógicas dinâmicas com segurança (sem eval inseguro).
* **Tipagem Dinâmica:** Manipula `map[string]any` com type assertions seguras para evitar panics.
* **Operações:** `filter`, `compute` (com dot notation), `sort`, `sort_array`, `filter_array`, `delete_property`, e nó condicional em grafo.

### 3.2 Servidor HTTP (`cmd/opendecision`)
* **Router:** `chi/v5` com middleware de logging/recovery.
* **Endpoints:**
  * `GET /health` — health check
  * `POST /pipelines` — criar pipeline
  * `GET /pipelines` — listar pipelines
  * `GET /pipelines/{id}` — obter pipeline
  * `PUT /pipelines/{id}` — atualizar pipeline
  * `DELETE /pipelines/{id}` — deletar pipeline
  * `POST /execute` — executar pipeline ad-hoc
  * `POST /pipelines/{id}/execute` — executar pipeline salvo
* **Persistência:** interface `PipelineStore` com implementações in-memory e DynamoDB (LocalStack).
* **Cache:** interface `Cache` com implementação in-memory (Redis planejado).

### 3.3 Frontend (`web/`)
* **Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Ant Design.
* **Editor Visual:** React Flow para construção de pipelines com nós drag-and-drop.
* **Estado:** Zustand com persistência no `localStorage`.
* **Embed:** Build do Vite é copiado para `internal/static/dist` e embedado no binário Go via `//go:embed`.

## 4. Estrutura do Repositório (Monorepo Idiomático Go)
O projeto usa o "Standard Go Project Layout" com frontend na pasta `web/`:
* `/pkg/decisionlib`: Motor puro (Fase 1). Sem conhecimento de HTTP/DB/UI.
* `/cmd/opendecision`: Servidor HTTP, handlers e composição de dependências (Fase 2).
* `/internal/store`: Interface e implementações de persistência (memory, DynamoDB).
* `/internal/cache`: Interface e implementações de cache (memory, Redis futuro).
* `/internal/executor`: Orquestração da execução de pipelines.
* `/internal/static`: Embedd do build do frontend (`//go:embed`).
* `/internal/config`: Carregamento de configuração via variáveis de ambiente.
* `/web/`: Aplicação React com editor visual de pipelines.

---

## 5. Status Atual (Atualizado: 2026-07-01)

### ✅ Fase 1: CONCLUÍDA

A biblioteca `decisionlib` foi implementada completamente e testada.

**Código Implementado:**
- `types.go` — AST, Op, Step, PipelineAST, Row
- `errors.go` — OperationError com contexto de step
- `evaluator.go` — Wrapper seguro para `antonmedv/expr` com compilação antecipada
- `filter.go` / `compute.go` / `sort.go` — Operações do motor
- `runner.go` — Pipeline runner com validação e execução sequencial

**Testes:** Go tests passando, `pkg/decisionlib` com cobertura >80%.

### ✅ Fase 2: CONCLUÍDA (Servidor + Frontend Embedado)

O servidor HTTP, persistência, cache e frontend React estão integrados e funcionando.

### ✅ Fase 3: GRAFO GENÉRICO (Concluída)

O motor foi expandido para suportar execução baseada em grafos, mantendo o fast path linear para pipelines simples.

**Backend:**
- `Graph`, `GraphNode`, `GraphEdge` em `pkg/decisionlib/graph.go`
- Executor de grafo `RunGraph` com fast path para grafos lineares
- Validação de grafos (ciclos, nós órfãos, portas)
- Nó condicional (`condition`) com branches `true`/`false`
- Operações aninhadas: `sort_array`, `filter_array`, `delete_property`
- `internal/executor` suporta `steps` ou `graph`
- Handlers HTTP (`/execute` e `/pipelines/{id}/execute`) aceitam steps ou graph
- Persistência de pipelines salva `steps` ou `graph`, além de `nodes`/`edges` visuais

**Backend (`cmd/opendecision`):**
- Servidor `chi/v5` com middleware de logging/recovery.
- CRUD completo de pipelines (`/pipelines`).
- Execução ad-hoc (`/execute`) e por ID (`/pipelines/{id}/execute`).
- Persistência in-memory (padrão) e DynamoDB via LocalStack.
- Cache in-memory (Redis planejado).
- Frontend embedado em `internal/static/dist` via `//go:embed`.

**Frontend (`web/`):**
- React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Ant Design.
- Editor visual com React Flow.
- Nós disponíveis: `filter`, `compute`, `sort`, `sort_array`, `filter_array`, `delete_property`, `condition`.
- Edges rotuladas automaticamente para branches `true`/`false` do nó condition.
- Sidebar com abas Operations/Preview.
- Publicação correta de novas estratégias (POST) e atualizações (PUT).
- Abertura de estratégias salvas restaura nós, arestas e layout.
- Test modal com JSON de exemplo e execução em tempo real.
- Visual profissional/enterprise com tema escuro.
- Compilador gera `steps` para pipelines lineares ou `graph` quando há nós condition.

**Build Single Binary:**
```bash
cd web && npm run build
cd ..
rm -rf internal/static/dist/*
cp -r web/dist/* internal/static/dist/
go build -o opendecision.exe ./cmd/opendecision/
```

**Como usar via API:**
```go
import "github.com/lucasrodrigues062/opendecision/pkg/decisionlib"

data := []map[string]any{
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
}

pipeline := decisionlib.PipelineAST{
    Steps: []decisionlib.Step{
        {Op: decisionlib.OpFilter, Expression: "age >= 30"},
        {Op: decisionlib.OpSort, Property: "age", Direction: "desc"},
    },}

result, err := decisionlib.Run(data, pipeline)
```

### 📋 Padrões Adotados

**Type Safety:**
- Type assertions com `v, ok := ...`
- Panics capturados em `defer recover()` em operações críticas
- Erros tipados (`ErrExpressionFailed`, `ErrTypeMismatch`, etc.)

**Expressões:**
- Compilação antecipada com `expr.Compile()`
- Sem `eval()` inseguro
- Operadores aritméticos, lógicos e de comparação suportados

**Operações:**
- **Filter:** Remove itens onde expressão == false
- **Compute:** Cria/altera propriedade com dot notation (ex: `"person.stats.score"`)
- **Sort:** Ordena por tipo (float64, int, string, bool, nil)
- **Sort Array:** Ordena array aninhado dentro de cada item
- **Filter Array:** Filtra array aninhado dentro de cada item
- **Delete Property:** Remove propriedade (com dot notation)
- **Condition:** Branching condicional em grafos

**Frontend:**
- Componentes do Ant Design
- Estado global com Zustand + persistência local
- Ícones do Ant Design
- Tema escuro customizado

### 🔮 Próximos Passos

1. **Condition por row:** permitir que nós condition avaliem cada row individualmente e depois façam merge dos resultados (atualmente o branch é decidido pela primeira row).
2. **PostgreSQL:** implementar `PipelineStore` para PostgreSQL.
3. **Redis:** implementar `Cache` real com Redis.
4. **Autenticação/Autorização:** proteger endpoints de pipeline.
5. **Versionamento:** taggear `pkg/decisionlib` como v1.x após estabilização final.
6. **CI/CD:** pipeline de build do frontend + Go em um único binário.
