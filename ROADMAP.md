# OpenDecision Roadmap

Uma visão estratégica do desenvolvimento do Motor de Decisão de Alta Performance.

---

## 📋 Visão Geral

O OpenDecision é um Decision Pipeline que processa arrays de dados dinâmicos através de operações declarativas (filter, compute, sort) com performance em milissegundos. O desenvolvimento segue **2 fases estritas** para garantir desacoplamento arquitetural absoluto.

**Timeline esperado:** Fase 1 (~4-6 semanas) → Fase 2 (~6-8 semanas)

---

## 🎯 Fase 1: O Core (Biblioteca Pura)

**Status:** 🟡 Em Desenvolvimento  
**Duração estimada:** 4-6 semanas  
**Entrega:** Package `/pkg/decisionlib` com engine de decisão funcional

### Objetivo
Construir uma biblioteca Go **sem dependências externas** (exceto `antonmedv/expr`) que:
- Receba `[]map[string]any` + AST de operações
- Execute pipeline de filter → compute → sort
- Retorne dados transformados com performance garantida

### Marcos (Milestones)

#### M1.1: Setup e Estrutura Base ✓ (Semana 1)
- [x] Inicializar repositório com Standard Go Layout
- [x] Configurar `pkg/decisionlib` com módulos iniciais
- [x] Definir interfaces principais (Pipeline, Operation, Evaluator)
- [x] Setup de testes unitários (via `testing`)

#### M1.2: Motor de Expressões (Semana 1-2)
- [ ] Integração com `antonmedv/expr`
- [ ] Wrapper seguro para avaliação de expressões
- [ ] Suporte a type assertions dinâmicas (sem panics)
- [ ] Testes de expressões com tipos variados (string, int, float, bool, nil)

#### M1.3: Operação FILTER (Semana 2)
- [ ] Implementar `FilterOperation` que:
  - Receba uma expressão (string)
  - Itere sobre array
  - Remova itens onde expressão retorna falsy
  - Retorne array mutado
- [ ] Suporte a predicados complexos (AND, OR, NOT)
- [ ] Benchmarks de performance

#### M1.4: Operação COMPUTE (Semana 2-3)
- [ ] Implementar `ComputeOperation` que:
  - Receba caminho da propriedade (dot notation: `person.age.years`)
  - Receba expressão matemática/lógica
  - Crie/altere a propriedade em cada elemento
  - Retorne array mutado
- [ ] Suporte a tipos numéricos (int, float)
- [ ] Suporte a concatenação de strings
- [ ] Validação de tipos na atribuição

#### M1.5: Operação SORT (Semana 3)
- [ ] Implementar `SortOperation` que:
  - Receba propriedade para ordenação
  - Receba direção (ASC/DESC)
  - Suporte multi-chave (sort by A, then B)
  - Ordene array dinamicamente
- [ ] Comparação segura de tipos
- [ ] Suporte a nulls (first/last)

#### M1.6: Pipeline Runner (Semana 3-4)
- [ ] Implementar `PipelineRunner` que:
  - Aceite AST de operações em sequência
  - Execute cada operação mantendo estado
  - Aplique otimizações (ex: filter antes de sort)
  - Retorne resultado final
- [ ] Suporte a múltiplas operações em cadeia

#### M1.7: Type Safety & Error Handling (Semana 4)
- [ ] Validação de expressões em tempo de parsing
- [ ] Mensagens de erro descritivas
- [ ] Recovery de panics internos
- [ ] Logging estruturado (sem stdlib, apenas erros críticos)

#### M1.8: Otimizações & Benchmarks (Semana 4-5)
- [ ] Profile com pprof
- [ ] Otimizações de alocação de memória
- [ ] Benchmarks comparativos (arrays de 1K, 10K, 100K elementos)
- [ ] Documentação de guarantees de performance

#### M1.9: Documentação & API Publica (Semana 5)
- [ ] Godoc comments em todas as funções públicas
- [ ] Exemplos de uso em `examples/` ou testes
- [ ] README do `/pkg/decisionlib` com tutoriais
- [ ] Decision Tree de quando usar cada operação

#### M1.10: Release v0.1.0-alpha (Semana 5-6)
- [ ] Tag Git `v0.1.0-alpha`
- [ ] CHANGELOG
- [ ] Go module versioning

---

## 🔧 Fase 2: Infraestrutura & Servidor

**Status:** 🔴 Não Iniciada  
**Duração estimada:** 6-8 semanas  
**Entrega:** Servidor HTTP funcional com integração de dados

### Objetivo
Construir um servidor HTTP que:
- Expõe a `decisionlib` via API REST
- Integra-se com Redis (cache de pipelines) e PostgreSQL (persistência)
- Orquestra I/O assíncrono via Goroutines

### Marcos (Milestones)

#### M2.1: Setup HTTP Server (Semana 1-2)
- [ ] Framework HTTP (ex: `chi`, `echo`, ou stdlib `net/http`)
- [ ] Estrutura de rotas e handlers
- [ ] Middleware de logging, CORS, autenticação básica
- [ ] JSON encoding/decoding

#### M2.2: API REST (Semana 2-3)
- [ ] `POST /decisions/execute` — executa pipeline
- [ ] `GET /decisions` — lista pipelines salvos
- [ ] `POST /decisions/{id}` — cria novo pipeline
- [ ] `DELETE /decisions/{id}` — remove pipeline
- [ ] Validação de input/output

#### M2.3: Integração PostgreSQL (Semana 3-4)
- [ ] Migrations (schema para `pipelines`, `executions`)
- [ ] Repository pattern para persistência
- [ ] Query builders seguros (SQLC ou similar)
- [ ] Connection pooling

#### M2.4: Integração Redis (Semana 4-5)
- [ ] Cache de pipelines compilados
- [ ] Cache de resultados (com TTL)
- [ ] Invalidação inteligente
- [ ] Fallback se Redis indisponível

#### M2.5: Nós de Enriquecimento (Semana 5-6)
- [ ] Execução assíncrona de HTTP calls para enriquecimento
- [ ] Timeout e retry logic
- [ ] Circuit breaker pattern
- [ ] Orquestração com WaitGroup

#### M2.6: Observabilidade (Semana 6-7)
- [ ] Estrutured logging (ex: slog)
- [ ] Métricas (ex: Prometheus client)
- [ ] Tracing distribuído (ex: OpenTelemetry)
- [ ] Health check endpoints

#### M2.7: Testes de Integração (Semana 7)
- [ ] Testes end-to-end com PostgreSQL + Redis
- [ ] Docker Compose para ambiente de teste
- [ ] Load testing básico

#### M2.8: Release v1.0.0 (Semana 7-8)
- [ ] Tag Git `v1.0.0`
- [ ] Docker image
- [ ] Helm charts (opcional)
- [ ] Documentação de deployment

---

## 📊 Timeline Visual

```
FASE 1: CORE LIBRARY
├─ Setup (Semana 1)
├─ Motor de Expressões (Semana 1-2)
├─ Filter + Compute + Sort (Semana 2-3)
├─ Pipeline Runner (Semana 3-4)
├─ Type Safety + Optimizations (Semana 4-5)
├─ Documentação (Semana 5)
└─ Release v0.1.0-alpha (Semana 5-6) ✓ COMPLETE

                    ↓ Desacoplamento Total ↓

FASE 2: INFRAESTRUTURA
├─ HTTP Server (Semana 1-2)
├─ API REST (Semana 2-3)
├─ PostgreSQL (Semana 3-4)
├─ Redis (Semana 4-5)
├─ Enriquecimento HTTP (Semana 5-6)
├─ Observabilidade (Semana 6-7)
├─ Testes & Load (Semana 7)
└─ Release v1.0.0 (Semana 7-8)
```

---

## 🎯 KPIs & Definição de Pronto (DoD)

### Fase 1
- ✅ Cobertura de testes **>80%**
- ✅ Latência **<5ms** para arrays de 10K elementos
- ✅ **Zero panics** em type assertions dinâmicas
- ✅ API pública documentada (Godoc 100%)
- ✅ Exemplos funcionais para cada operação

### Fase 2
- ✅ API REST respondendo **<50ms** (p95)
- ✅ PostgreSQL & Redis **integrados e testados**
- ✅ **99.9% uptime** em staging
- ✅ Logs estruturados em todas operações críticas
- ✅ Documentação de deployment (Docker, K8s)

---

## 🔄 Dependências & Riscos

| Risco | Mitigação |
|-------|-----------|
| Integração com `expr` complexa | Prototipagem rápida na M1.2, se necessário procurar alternativas |
| Performance insuficiente em arrays grandes | Profiling contínuo (pprof), otimizações em hot paths |
| Type assertions dinâmicas causarem panics | Defensive programming, testes exhaustivos de tipos |
| Complexidade da integração Redis/PostgreSQL | Usar libraries comprovadas (sqlc, redis client oficial) |

---

## 📝 Próximos Passos

1. **Criar issue board** no GitHub com tasks de M1.1
2. **Inicializar módulo Go** (`go mod init github.com/...`)
3. **Criar estrutura base** de pacotes em `/pkg/decisionlib`
4. **Começar M1.2** — prototipagem com `antonmedv/expr`

---

**Última atualização:** 2026-06-27  
**Maintainer:** lucas (lucasrodrigues062@gmail.com)
