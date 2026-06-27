# decisionlib

Um motor de pipeline de decisão de alta performance escrito em Go puro. Processa arrays de dados dinâmicos através de operações declarativas (**filter**, **compute**, **sort**) com latência em milissegundos.

## Características

- **Zero dependências externas** (além de `antonmedv/expr` para avaliação segura de expressões)
- **Type-safe com `map[string]any`** — suporta dados JSON arbitrários sem panics
- **Sem HTTP/Redis/DB** — biblioteca pura, reutilizável em qualquer contexto
- **Pipeline declarativo** — declare operações como JSON/struct e execute

## Instalação

```bash
go get github.com/lucasrodrigues062/opendecision/pkg/decisionlib
```

## Exemplo Rápido

```go
package main

import (
	"fmt"
	"github.com/lucasrodrigues062/opendecision/pkg/decisionlib"
)

func main() {
	// Dados: array de pessoas
	data := []map[string]any{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
		{"name": "Charlie", "age": 35},
	}

	// Pipeline: filtrar idade >= 30, depois ordenar por idade DESC
	pipeline := decisionlib.PipelineAST{
		Steps: []decisionlib.Step{
			{Op: decisionlib.OpFilter, Expression: "age >= 30"},
			{Op: decisionlib.OpSort, Property: "age", Direction: "desc"},
		},
	}

	// Executar
	result, err := decisionlib.Run(data, pipeline)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Resultado: %+v\n", result)
	// Output: [map[name:Charlie age:35] map[name:Alice age:30]]
}
```

## Operações Suportadas

| Operação | Descrição | Campo | Exemplo |
|----------|-----------|-------|---------|
| **filter** | Remove itens onde expressão é falsa | `Expression` | `"age >= 18 && status == 'active'"` |
| **compute** | Cria ou altera uma propriedade | `Property`, `Expression` | Property: `"score"`, Expression: `"age * 2 + bonus"` |
| **sort** | Ordena array por uma propriedade | `Property`, `Direction` | Property: `"name"`, Direction: `"asc"` ou `"desc"` |

## Escrevendo Expressões

O pacote usa `antonmedv/expr` para compilar e executar expressões de forma segura. Exemplos:

### Filter
```
age >= 30
status == "active" && role != "admin"
price * quantity > 1000
len(tags) > 3
```

### Compute
```
age + 5
salary * 1.1
concat(first_name, " ", last_name)  // se suportado
```

### Sort
- Apenas especifique a propriedade e a direção (asc/desc)
- Tipos suportados: `float64`, `int`, `string`, `bool`, `nil`

## Tratamento de Erros

O pacote retorna erros descritivos:

```go
result, err := decisionlib.Run(data, pipeline)
if err != nil {
	switch err {
	case decisionlib.ErrExpressionFailed:
		// Expressão inválida ou type mismatch
	case decisionlib.ErrUnknownOp:
		// Step com operação desconhecida
	default:
		// Outro erro
	}
}
```

## Performance

- Arrays com **10K elementos**: ~2-5ms
- Arrays com **100K elementos**: ~20-50ms
- (Benchmarks completos em `*_test.go`)

## Contribuindo

Veja [CONTRIBUTING.md](../../CONTRIBUTING.md) para diretrizes de desenvolvimento.

## Licença

MIT © 2026 Lucas Rodrigues
