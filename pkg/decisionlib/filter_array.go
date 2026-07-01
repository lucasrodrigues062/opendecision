package decisionlib

import "fmt"

// applyFilterArray filters a nested array inside each row based on a boolean expression.
//
// For every row, the property identified by `property` must be a slice (`[]any`).
// Each element of that slice is evaluated against the expression. Items where the
// expression evaluates to true are kept.
//
// Inside the expression, the current array element is available as the top-level
// context (e.g., "quantidade > 10").
//
// Example:
//
//	property="codigos_servico", expression="quantidade > 10"
func applyFilterArray(data []Row, property string, expression string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:      OpFilterArray,
			Err:     ErrInvalidProperty,
			Details: "property must not be empty",
		}
	}
	if expression == "" {
		return nil, &OperationError{
			Op:      OpFilterArray,
			Err:     ErrExpressionFailed,
			Details: "expression must not be empty",
		}
	}

	eval, err := NewEvaluator(expression)
	if err != nil {
		return nil, err
	}

	result := make([]Row, len(data))
	copy(result, data)

	for i, row := range result {
		value, exists := getNestedValueExists(row, property)
		if !exists {
			continue
		}

		slice, ok := value.([]any)
		if !ok {
			return nil, &OperationError{
				Op:      OpFilterArray,
				Err:     ErrTypeMismatch,
				Details: fmt.Sprintf("row %d: property '%s' is not an array", i, property),
			}
		}

		filtered := make([]any, 0, len(slice))
		for j, item := range slice {
			itemMap, ok := item.(map[string]any)
			if !ok {
				return nil, &OperationError{
					Op:      OpFilterArray,
					Err:     ErrTypeMismatch,
					Details: fmt.Sprintf("row %d, item %d: not an object", i, j),
				}
			}

			keep, err := eval.Run(itemMap)
			if err != nil {
				return nil, &OperationError{
					Op:      OpFilterArray,
					Err:     ErrExpressionFailed,
					Details: fmt.Sprintf("row %d, item %d: %v", i, j, err),
				}
			}

			shouldKeep, ok := keep.(bool)
			if !ok {
				return nil, &OperationError{
					Op:      OpFilterArray,
					Err:     ErrTypeMismatch,
					Details: fmt.Sprintf("row %d, item %d: expression must return bool, got %T", i, j, keep),
				}
			}

			if shouldKeep {
				filtered = append(filtered, item)
			}
		}

		setNestedValue(row, property, filtered)
	}

	return result, nil
}
