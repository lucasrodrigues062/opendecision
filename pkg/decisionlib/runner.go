package decisionlib

import "fmt"

// Run executes a pipeline AST against a data array.
// Each step in the pipeline is executed sequentially, with the output of one step
// becoming the input to the next.
//
// Supported operations:
//   - filter: remove items where expression is false
//   - compute: create/update a property based on an expression
//   - sort: order items by a property
//
// Example:
//
//	data := []map[string]any{
//		{"name": "Alice", "age": 30},
//		{"name": "Bob", "age": 25},
//	}
//
//	pipeline := PipelineAST{
//		Steps: []Step{
//			{Op: OpFilter, Expression: "age >= 25"},
//			{Op: OpSort, Property: "age", Direction: "asc"},
//		},
//	}
//
//	result, err := Run(data, pipeline)
//	if err != nil {
//		panic(err)
//	}
//	// result: [{"name":"Bob","age":25}, {"name":"Alice","age":30}]
func Run(data []Row, ast PipelineAST) ([]Row, error) {
	// Validate all steps upfront to catch errors early.
	for i, step := range ast.Steps {
		if err := validateStep(step); err != nil {
			return nil, &OperationError{
				StepIndex: i,
				Op:        step.Op,
				Err:       err,
				Details:   "validation failed",
			}
		}
	}

	// Execute steps sequentially.
	current := data
	for i, step := range ast.Steps {
		var err error

		switch step.Op {
		case OpFilter:
			current, err = applyFilter(current, step.Expression)

		case OpCompute:
			current, err = applyCompute(current, step.Property, step.Expression)

		case OpSort:
			current, err = applySort(current, step.Property, step.Direction)

		default:
			err = ErrUnknownOp
		}

		if err != nil {
			// Wrap the error with step context if it's not already wrapped.
			if opErr, ok := err.(*OperationError); ok && opErr.StepIndex == -1 {
				opErr.StepIndex = i
				return nil, opErr
			}

			return nil, &OperationError{
				StepIndex: i,
				Op:        step.Op,
				Err:       err,
			}
		}
	}

	return current, nil
}

// validateStep checks that a step is well-formed before execution.
func validateStep(step Step) error {
	switch step.Op {
	case OpFilter:
		if step.Expression == "" {
			return fmt.Errorf("filter requires non-empty expression")
		}
		return nil

	case OpCompute:
		if step.Property == "" {
			return fmt.Errorf("compute requires non-empty property")
		}
		if step.Expression == "" {
			return fmt.Errorf("compute requires non-empty expression")
		}
		return nil

	case OpSort:
		if step.Property == "" {
			return fmt.Errorf("sort requires non-empty property")
		}
		return nil

	default:
		return ErrUnknownOp
	}
}
