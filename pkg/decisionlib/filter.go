package decisionlib

import "fmt"

// applyFilter removes items from the data array where the expression evaluates to false.
// Only items where the expression returns true are kept.
//
// The expression must evaluate to a boolean. If it returns any other type,
// an error is returned.
//
// Example expression: "age >= 30 && status == 'active'"
func applyFilter(data []Row, expression string) ([]Row, error) {
	// Compile the expression once for reuse across all rows.
	evaluator, err := NewEvaluator(expression)
	if err != nil {
		return nil, err
	}

	// Filter in-place: iterate and append only items that pass the predicate.
	filtered := make([]Row, 0, len(data))
	for i, row := range data {
		result, err := evaluator.Run(row)
		if err != nil {
			return nil, &OperationError{
				StepIndex: -1, // will be filled by caller
				Op:        OpFilter,
				Err:       ErrExpressionFailed,
				Details:   fmt.Sprintf("row %d: %v", i, err),
			}
		}

		// Ensure the expression returned a boolean.
		shouldKeep, ok := result.(bool)
		if !ok {
			return nil, &OperationError{
				StepIndex: -1,
				Op:        OpFilter,
				Err:       ErrTypeMismatch,
				Details:   fmt.Sprintf("expression must return bool, got %T", result),
			}
		}

		if shouldKeep {
			filtered = append(filtered, row)
		}
	}

	return filtered, nil
}
