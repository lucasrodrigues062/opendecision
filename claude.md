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
