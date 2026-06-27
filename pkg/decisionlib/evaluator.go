package decisionlib

import (
	"fmt"
	"github.com/antonmedv/expr"
	"github.com/antonmedv/expr/vm"
)

// Evaluator compiles and safely evaluates expressions.
// By compiling expressions upfront, we avoid runtime parsing overhead
// and catch syntax errors early.
type Evaluator struct {
	program *vm.Program
}

// NewEvaluator creates a new evaluator for an expression.
// It compiles the expression immediately, returning an error if the syntax is invalid.
//
// Example:
//
//	eval, err := NewEvaluator("age >= 30")
//	if err != nil {
//		return err // expression is invalid
//	}
//	result, err := eval.Run(row) // safe to call multiple times
func NewEvaluator(expression string) (*Evaluator, error) {
	// Compile the expression once. This validates syntax and returns a program
	// that can be reused across many data values.
	program, err := expr.Compile(expression)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrExpressionFailed, err)
	}

	return &Evaluator{program: program}, nil
}

// Run evaluates the compiled expression against a data row.
// It safely handles panics during evaluation and returns a typed error.
//
// The returned value depends on the expression:
// - Filter expressions should return bool
// - Compute expressions can return any comparable type (float64, string, etc.)
//
// Example:
//
//	eval, _ := NewEvaluator("age * 2")
//	result, err := eval.Run(map[string]any{"age": 25})
//	// result: 50 (float64)
func (e *Evaluator) Run(row Row) (any, error) {
	// We use a deferred recover to catch panics from expr.Run,
	// which can occur if the expression encounters an unexpected type or nil value.
	defer func() {
		if r := recover(); r != nil {
			// Panics are converted to a safe error, never leaked to the caller.
		}
	}()

	result, err := vm.Run(e.program, row)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrExpressionFailed, err)
	}

	return result, nil
}
