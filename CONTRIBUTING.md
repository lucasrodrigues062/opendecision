# Contributing to OpenDecision

Obrigado por considerar contribuir ao OpenDecision! Este documento descreve como configurar seu ambiente e submeter mudanças.

## Pré-requisitos

- **Go 1.21+** — [Download aqui](https://golang.org/dl/)
- **Git**
- Um editor/IDE com suporte a Go (VS Code + Go extension, GoLand, etc.)

## Setup Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/lucasrodrigues062/opendecision.git
cd opendecision
```

### 2. Valide a instalação do Go

```bash
go version  # deve ser 1.21+
```

### 3. Baixe as dependências

```bash
go mod download
```

## Estrutura do Projeto

```
opendecision/
├── pkg/decisionlib/      # Fase 1: O Core (biblioteca pura)
│   ├── types.go          # Definição de AST e tipos base
│   ├── evaluator.go      # Wrapper seguro para expr
│   ├── filter.go         # Operação filter
│   ├── compute.go        # Operação compute
│   ├── sort.go           # Operação sort
│   ├── runner.go         # Orquestrador de pipeline
│   ├── errors.go         # Tipos de erro
│   ├── *_test.go         # Testes de cada módulo
│   └── README.md         # Documentação do pacote
├── cmd/                  # Fase 2 (ainda não iniciada)
├── ROADMAP.md            # Plano de desenvolvimento
├── CLAUDE.md             # Context para AI assistants
└── go.mod / go.sum       # Dependências Go
```

## Rodando Testes

### Executar todos os testes

```bash
go test ./pkg/decisionlib/... -v
```

### Com cobertura de testes

```bash
go test ./pkg/decisionlib/... -v -cover
```

### Gerar relatório de cobertura em HTML

```bash
go test ./pkg/decisionlib/... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

## Análise de Código

### Executar `go vet`

```bash
go vet ./...
```

Este comando detecta erros potenciais e código suspeito.

### Verificar formatação com `gofmt`

```bash
gofmt -d ./pkg/decisionlib/
```

Se houver diferenças, corrija com:

```bash
gofmt -w ./pkg/decisionlib/
```

## Convenções de Código

### Type Assertions Seguras

Sempre use type assertions seguras:

```go
// ❌ Evitar - pode causar panic
value := row["age"].(int)

// ✅ Preferir
value, ok := row["age"].(int)
if !ok {
    return nil, ErrTypeMismatch
}
```

### Tratamento de Panics

Nunca deixe um panic se propagar além de limites de funções públicas:

```go
// ✅ Sempre recupere panics em operações críticas
defer func() {
    if r := recover(); r != nil {
        // log ou retorne erro
    }
}()
```

### Naming

- Variáveis e funções: `camelCase`
- Constantes: `PascalCase`
- Pacotes: `lowercase`
- Interfaces: `er` suffix (ex: `Reader`, `Writer`)

### Documentação

- Todas as funções/tipos/constantes exportadas devem ter comentários Godoc
- O comentário começa com o nome do símbolo: `// Run executa...`
- Um exemplo no comentário ajuda muito

```go
// Run executa um pipeline contra um array de dados.
//
// Example:
//
//	result, err := Run(data, ast)
func Run(data []Row, ast PipelineAST) ([]Row, error) {
    // ...
}
```

### Cobertura de Testes

- Alvo mínimo: **80%** de cobertura
- Testes devem ser específicos — um teste por caso de uso
- Use nomes descritivos: `TestRunSimplePipeline` é melhor que `TestRun1`

## Fazendo um Commit

### 1. Faça suas mudanças

```bash
# Edite arquivos conforme necessário
```

### 2. Verifique o status

```bash
git status
go vet ./...
go test ./pkg/decisionlib/... -v
```

### 3. Commit com mensagem clara

```bash
git add pkg/decisionlib/filter.go pkg/decisionlib/filter_test.go
git commit -m "Add filter operation with expression support"
```

**Guia de mensagens de commit:**
- Primeira linha: até 70 caracteres, imperativo ("Add", "Fix", "Refactor")
- Linha em branco
- Corpo: explicar **por quê** a mudança, não o quê
- Se houver issue, referencie: `Fixes #42`

## Abrindo um Pull Request

### 1. Push para seu fork

```bash
git push origin sua-branch
```

### 2. Abra um PR no GitHub

- **Título**: descritivo e claro (ex: "Add dot notation support to compute operation")
- **Descrição**:
  - O que foi mudado?
  - Por quê?
  - Como testar?

Exemplo:

```markdown
## Summary

Adds support for dot notation in compute property paths.

Previously, `compute` only allowed flat keys. Now supports nested paths:
- `"person.address.city"` → creates nested maps if needed

## Testing

- [x] New tests for nested path creation
- [x] Existing tests still pass
- [x] Coverage > 80%
```

### 3. Aguarde review

Um maintainer irá revisar seu código e pedir melhorias se necessário.

## Estrutura de Diretórios de um PR Ideal

Para manutenibilidade, cada PR deve seguir este padrão:

- **1 arquivo principal**: a operação ou módulo sendo tocado
- **1 arquivo de testes**: testes para aquele arquivo
- **1 commit**: agrupando lógica coerente (pode ser quebrado se necessário)
- **Documentação**: atualizada junto com código

Exemplo:

```
PR: "Add sort operation"
├── pkg/decisionlib/sort.go       ← implementação
├── pkg/decisionlib/sort_test.go  ← testes
└── pkg/decisionlib/README.md     ← docs atualizadas
```

## Dúvidas?

- Abra uma [Issue](https://github.com/lucasrodrigues062/opendecision/issues)
- Consulte o [ROADMAP](./ROADMAP.md) para entender os próximos passos
- Leia o [CLAUDE.md](./CLAUDE.md) para visão arquitetural

---

**Obrigado por contribuir!** 🎉

Todos os contribuidores são bem-vindos independente do nível de experiência. Se você ficou preso em algo, abra uma issue e descreva onde começou. Adoraremos ajudar!
