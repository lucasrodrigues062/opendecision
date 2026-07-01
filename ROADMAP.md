# OpenDecision Roadmap

Uma visão estratégica do desenvolvimento do Motor de Decisão de Alta Performance.

---

## 📋 Visão Geral

O OpenDecision evoluiu de um Decision Pipeline linear para uma plataforma de automação de transformação de dados baseada em **grafo de execução**, similar ao n8n, mas focada em transformações declarativas de JSON em alta performance.

O desenvolvimento é dividido em **3 fases**:

1. **Fase 1 — Core Library:** motor puro de operações lineares (`filter`, `compute`, `sort`). ✅
2. **Fase 2 — Infraestrutura:** servidor HTTP, persistência, cache e frontend embedado. ✅
3. **Fase 3 — Grafo Genérico:** executor baseado em grafos com branching, loops, joins e transformações aninhadas. 🚧

---

## ✅ Fase 1: O Core (Biblioteca Pura)

**Status:** Concluída  
**Entrega:** Package `/pkg/decisionlib` com engine de decisão funcional

- Motor de expressões com `antonmedv/expr`
- Operações `filter`, `compute`, `sort`
- Pipeline runner linear
- Testes com cobertura >80%

---

## ✅ Fase 2: Infraestrutura & Servidor

**Status:** Concluída  
**Entrega:** Servidor HTTP funcional com frontend embedado

- Servidor HTTP com `chi/v5`
- CRUD de pipelines (`/pipelines`)
- Execução ad-hoc e por ID (`/execute`, `/pipelines/{id}/execute`)
- Persistência in-memory e DynamoDB
- Cache in-memory
- Frontend React + Vite + Tailwind/Ant Design embedado no binário Go

---

## 🚧 Fase 3: Grafo de Execução Genérico

**Status:** Em planejamento/execução  
**Entrega:** Motor capaz de executar workflows arbitrários representados como grafos

### Objetivo

Transformar o OpenDecision em um motor genérico de transformação de dados, permitindo:

- Nós com múltiplas saídas (condicionais)
- Branchs paralelas e joins
- Operações em arrays aninhados
- Loops e sub-workflows
- Comparações, merges, splits e enriquecimento

### Arquitetura Alvo

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Start     │─────▶│     IF      │      │   Merge     │
└─────────────┘      │  (condition)│      │             │
                     └──────┬──────┘      └──────┬──────┘
                            │                      ▲
                     true   │   false              │
                            ▼                      │
                     ┌─────────────┐      ┌─────────────┐
                     │  Filter     │      │  Compute    │
                     │  Pedidos    │      │  Default    │
                     └──────┬──────┘      └──────┬──────┘
                            │                      │
                            └──────────────────────┘
```

### Marcos (Milestones)

#### M3.1: Modelo de Grafo (Semana 1)

- [x] Definir `Graph` como coleção de `Node` + `Edge`
- [x] Tipos de nó: `start`, `operation`, `condition`, `end`
- [x] Múltiplas portas de entrada/saída por nó
- [x] Persistência do grafo (nodes + edges + metadata)
- [x] Validação de grafos (ciclos, nós órfãos, portas não conectadas)

#### M3.2: Executor de Grafo (Semana 1-2)

- [x] Engine de execução baseada em estado
- [x] Resolver próximo nó a partir das arestas ativas
- [x] Suporte a execução condicional
- [ ] Join de múltiplas branches
- [x] Preservar imutabilidade do input original

#### M3.3: Nó Condicional (IF/ELSE) (Semana 2)

- [x] Nó com expressão booleana
- [x] Duas saídas: `true` e `false`
- [ ] Conexões visualmente rotuladas no React Flow
- [x] Execução segue apenas a branch ativa

#### M3.4: Operações Aninhadas (Semana 2-3)

- [x] `sort_array` — ordenar arrays dentro de cada item
- [x] `filter_array` — filtrar arrays aninhados
- [ ] `map_array` — transformar cada elemento de um array interno
- [x] `delete_property` — remover campos
- [ ] `rename_property` — renomear campos

#### M3.5: Loops e Iterações (Semana 3-4)

- [ ] Nó de loop sobre array
- [ ] Sub-workflow por iteração
- [ ] Agregação de resultados do loop

#### M3.6: Joins e Merges (Semana 4)

- [ ] Nó `join` que espera múltiplas branches
- [ ] Estratégias: `first`, `all`, `any`
- [ ] Merge de payloads de branches paralelas

#### M3.7: Frontend — Editor de Grafo (Semana 4-5)

- [ ] Nó condicional com portas `true`/`false`
- [ ] Edges rotuladas
- [ ] Validação visual do grafo
- [ ] Nós para `sort_array`, `filter_array`, `map_array`
- [ ] Preview de execução passo a passo

#### M3.8: Testes e Documentação (Semana 5-6)

- [ ] Testes unitários do executor de grafo
- [ ] Testes de integração grafos complexos
- [ ] Documentação de nós disponíveis
- [ ] Exemplos práticos

#### M3.9: Release v2.0.0 (Semana 6)

- [ ] Tag Git `v2.0.0`
- [ ] CHANGELOG
- [ ] Migração de pipelines lineares para grafos

---

## 🎯 KPIs & Definição de Pronto

### Fase 3
- ✅ Execução de grafos acíclicos com branching
- ✅ Operações em arrays aninhados testadas
- ✅ Cobertura de testes >80% no novo executor
- ✅ Frontend permite construir grafos condicionais visualmente
- ✅ Backward compatibility com pipelines lineares (migração automática)

---

## 🔄 Dependências & Riscos

| Risco | Mitigação |
|-------|-----------|
| Complexidade do executor de grafos | Começar com DAGs acíclicos simples |
| Ciclos infinitos em loops | Limitador de iterações e timeout |
| Performance com grafos grandes | Execução lazy e caching de nós |
| Complexidade visual do React Flow | Usar portas customizadas e validação |

---

## 📝 Próximos Passos Imediatos

1. **M3.1** — Criar modelo de grafo em `pkg/decisionlib`
2. **M3.2** — Implementar executor de grafo básico
3. **M3.3** — Adicionar nó condicional
4. **M3.4** — Implementar `sort_array` e `filter_array`
5. **M3.7** — Atualizar frontend para suportar novo modelo

---

**Última atualização:** 2026-06-30  
**Maintainer:** lucas
