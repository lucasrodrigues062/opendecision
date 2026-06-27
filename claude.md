# Contexto do Projeto: OpenDecision Engine (Golang)

## 1. Visão Geral
Você atuará como um Staff Engineer especializado em Golang e sistemas distribuídos. Nosso objetivo é construir o **OpenDecision**, um Motor de Decisão (*Decision Pipeline*) open source de altíssima performance. 
A arquitetura permitirá que regras complexas de priorização geradas por um front-end visual sejam executadas em milissegundos sobre arrays de dados dinâmicos.

## 2. Estratégia de Desenvolvimento (Faseamento)
O projeto será desenvolvido em duas fases estritas para garantir desacoplamento absoluto:
* **Fase 1 (Atual): O Core (Package `decisionlib`).** Uma biblioteca Go pura, sem dependências de HTTP, Redis ou DB. Ela recebe um slice dinâmico (`[]map[string]any`) e uma Árvore Sintática (AST) de execução, aplica filtros, cálculos e ordenação, retornando o payload mutado.
* **Fase 2 (Futuro): A Infraestrutura (`cmd/server`).** O servidor HTTP, integração com Redis/PostgreSQL e orquestração de I/O de rede via Goroutines (para nós de enriquecimento HTTP).

## 3. Requisitos da Fase 1 (O Motor de Avaliação)
* **Linguagem:** Go 1.21+.
* **Engine de Expressões:** Utilizar a biblioteca `antonmedv/expr` como motor base para avaliar lógicas dinâmicas com segurança (sem eval inseguro).
* **Tipagem Dinâmica:** Como o motor lida com payloads JSON arbitrários, o pacote deve manipular eficientemente abstrações como `map[string]any`, implementando asserções de tipo (*type assertions*) seguras para evitar *panics*.
* **Contrato de Operações:** A biblioteca deve suportar um *Pipeline Runner* que itere sobre os passos:
    * `filter`: Remove itens do array se a expressão for falsa.
    * `compute`: Cria/altera uma propriedade no objeto do array baseado numa equação matemática.
    * `sort`: Ordena o array baseado em propriedades dinâmicas.

## 4. Estrutura do Repositório (Monorepo Idiomático Go)
O projeto utilizará um único repositório, mas isolando rigidamente as responsabilidades através do "Standard Go Project Layout":
* `/pkg/decisionlib`: Conterá exclusivamente a lógica da Fase 1 (O Motor). Esta pasta deve ser tratada como um pacote de terceiros, sem conhecer nada sobre o resto do repositório.
* `/cmd/opendecision`: Conterá o `main.go` da Fase 2, que importará localmente o `/pkg/decisionlib`.
* Inicialmente, focaremos 100% da codificação dentro de `/pkg/decisionlib`.

---

## 5. Status Atual (Atualizado: 2026-06-27)

### ✅ Fase 1: CONCLUÍDA

A biblioteca `decisionlib` foi implementada completamente e testada. Entrega:

**Código Implementado:**
- `types.go` — AST, Op, Step, PipelineAST, Row
- `errors.go` — OperationError com contexto de step
- `evaluator.go` — Wrapper seguro para `antonmedv/expr` com compilação antecipada
- `filter.go` — Operação filter com expressões booleanas
- `compute.go` — Operação compute com suporte a dot notation
- `sort.go` — Operação sort com suporte a múltiplos tipos
- `runner.go` — Pipeline runner com validação e execução sequencial

**Testes:** 35 testes, 83.5% cobertura, todos passando

**Documentação:**
- `pkg/decisionlib/README.md` — Overview e exemplos rápidos
- `CONTRIBUTING.md` — Setup, testes, convenções de código
- `IMPLEMENTATION_STATUS.md` — Detalhes de marcos alcançados
- Godoc em 100% das funções/tipos públicos
- `example.go` — 4 exemplos práticos rodando

**Como Usar:**
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
    },
}

result, err := decisionlib.Run(data, pipeline)
```

### 📋 Padrões Adotados na Fase 1

**Type Safety:**
- Todas as type assertions usam `v, ok := ...` pattern
- Panics são capturados em `defer recover()` em operações críticas
- Erros retornam tipos específicos (`ErrExpressionFailed`, `ErrTypeMismatch`, etc)

**Expressões:**
- Compilação antecipada com `expr.Compile()` para performance
- Sem `eval()` — seguro para dados de usuários
- Suporta operadores: `+`, `-`, `*`, `/`, `%`, `&&`, `||`, `!`, `>`, `<`, `>=`, `<=`, `==`, `!=`

**Operações:**
- **Filter:** Remove itens onde expressão == false
- **Compute:** Cria/altera propriedade com dot notation (ex: `"person.stats.score"`)
- **Sort:** Ordena por tipo (float64, int, string, bool, nil)

**Pipeline:**
- Execução **sequencial** de steps
- Validação antecipada de todos os steps
- Cada erro inclui: step index, operação, mensagem detalhada

**Testes:**
- Nomeação: `TestOperationScenario` (ex: `TestFilterComplex`)
- Cobertura: >80%
- Edge cases: arrays vazios, nil values, tipos mistos, erros

**Documentação:**
- Função pública = comentário Godoc obrigatório
- Exemplos nos comentários para funções principais
- README.md em cada pacote principal

### 🔮 Próximos Passos (Fase 2)

**Quando começar a Fase 2:**
1. Verifique que `/pkg/decisionlib` funciona em seu use case
2. Abra uma issue descrevendo o servidor HTTP desejado
3. Siga o ROADMAP.md para M2.1+

**Estrutura esperada:**
```
cmd/opendecision/
├── main.go
├── handlers.go        — Handlers HTTP
├── repository.go      — Persistência (PostgreSQL)
├── cache.go           — Cache (Redis)
└── orchestration.go   — Enriquecimento assíncrono
```

**Restrições mantidas:**
- `/pkg/decisionlib` continua 100% pura (zero dependências externas exceto expr)
- `/cmd/opendecision` importa `decisionlib` localmente
- Sem breaking changes em `decisionlib` — versione como v1.x após release
