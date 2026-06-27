# ⚡ OpenDecision Engine

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**OpenDecision** é um Motor de Decisão (*Decision Pipeline / Rule Engine*) de altíssima performance, estruturado em grafos (DAG) e focado em execução síncrona com **zero-deploy**.

Nascido da necessidade de substituir motores proprietários pesados (como o FICO) e de contornar a latência de orquestradores visuais (como o n8n) em operações síncronas de alto volume, o OpenDecision foi desenhado para rodar regras de negócio dinâmicas na velocidade da memória (RAM).

---

## 🎯 O Problema que Resolvemos

Em sistemas financeiros, logísticos e de e-commerce, as "Regras de Negócio" mudam toda semana. O time de operações precisa alterar prioridades, cortar ofertas ou adicionar pesos sem depender de um novo *deploy* da equipe de engenharia.

O OpenDecision resolve isso **desacoplando a Autoria da Execução**:
1. Uma interface visual (construída pelo usuário final com React Flow, etc.) gera um **Plano de Execução (AST)** em JSON.
2. O **OpenDecision (Backend em Go)** carrega esse JSON em memória e o executa contra arrays dinâmicos de dados em milissegundos.

## ✨ Arquitetura e Diferenciais

O coração do projeto é estruturado em duas camadas estritas:

- **Pipeline Runner:** Executa passos sequenciais sobre arrays (`Filter` -> `Enrich` -> `Compute` -> `Sort`).
- **Segurança e Performance:** Não usamos `eval()`. A matemática é compilada de forma segura usando [antonmedv/expr](https://github.com/antonmedv/expr).
- **Enriquecimento Assíncrono (Batching):** Quando a regra exige bater numa API externa (ex: consultar um *score* de crédito), o motor utiliza **Goroutines** para fazer requisições paralelas, mitigando o gargalo de rede (N+1).
- **Single Binary:** O projeto compila para um único arquivo estático. Baixíssimo consumo de memória inicial (~15MB), perfeito para rodar em containers leves.

---

## 🏗️ Estrutura do Projeto & Roadmap

Estamos adotando o [Standard Go Project Layout](https://github.com/golang-standards/project-layout). O desenvolvimento está dividido em duas grandes fases. **Estamos atualmente na Fase 1, e toda ajuda é bem-vinda!**

### Fase 1: A Biblioteca Core (`/pkg/decisionlib`) ⏳ *Em Andamento*
Construção do motor puro, sem servidor web ou banco de dados. Um pacote Go isolado para carregar lógicas matemáticas sobre payloads JSON arbitrários (`[]map[string]any`).
- [ ] Definição das interfaces do `execution_plan` (AST).
- [ ] Implementação do nó `Filter` (Elegibilidade).
- [ ] Implementação do nó `Compute` (Matemática com *antonmedv/expr*).
- [ ] Implementação do nó `Sort` (Ordenação dinâmica).
- [ ] Cobertura de testes unitários (> 90%).

### Fase 2: O Orquestrador HTTP (`/cmd/server`) 📋 *Planejado*
A infraestrutura para rodar a lib em produção.
- [ ] Servidor HTTP (Gin ou Fiber).
- [ ] Nó `Enrich` (I/O Concorrente com Goroutines para chamadas HTTP externas).
- [ ] Camada de Persistência (PostgreSQL para regras, Redis para cache em memória).
- [ ] Webhooks para *Hot Reload* (Zero-Deploy das regras).

---

## 🚀 Começando (Getting Started)

Se você quer testar a biblioteca localmente ou começar a contribuir:

```bash
# Clone o repositório
git clone [https://github.com/SEU-USUARIO/opendecision.git](https://github.com/SEU-USUARIO/opendecision.git)
cd opendecision

# Baixe as dependências
go mod tidy

# Rode os testes da biblioteca core
go test ./pkg/decisionlib/... -v
