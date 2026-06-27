package decisionlib

import (
	"fmt"
	"strings"
)

// applyCompute creates or updates a property in each row based on an expression result.
// The property supports dot notation for nested objects (e.g., "person.address.city").
//
// Example: property="score", expression="age * 2 + bonus"
// This would compute a new field "score" in each row.
func applyCompute(data []Row, property string, expression string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:  OpCompute,
			Err: ErrInvalidProperty,
			Details: "property must not be empty",
		}
	}

	// Compile the expression once.
	evaluator, err := NewEvaluator(expression)
	if err != nil {
		return nil, err
	}

	// Compute and update each row.
	result := make([]Row, len(data))
	copy(result, data)

	for i, row := range result {
		computed, err := evaluator.Run(row)
		if err != nil {
			return nil, &OperationError{
				StepIndex: -1,
				Op:        OpCompute,
				Err:       ErrExpressionFailed,
				Details:   fmt.Sprintf("row %d: %v", i, err),
			}
		}

		// Set the computed value in the row using the property path.
		if err := setNestedValue(row, property, computed); err != nil {
			return nil, &OperationError{
				StepIndex: -1,
				Op:        OpCompute,
				Err:       ErrInvalidProperty,
				Details:   fmt.Sprintf("row %d: %v", i, err),
			}
		}
	}

	return result, nil
}

// setNestedValue sets a value in a row, supporting dot notation for nested objects.
// For example, setNestedValue(row, "person.score", 100) would:
// 1. Ensure row["person"] is a map[string]any
// 2. Set row["person"]["score"] = 100
func setNestedValue(row Row, path string, value any) error {
	parts := strings.Split(path, ".")
	if len(parts) == 0 {
		return fmt.Errorf("invalid property path: %s", path)
	}

	// Navigate to the parent of the target property.
	current := row
	for i := 0; i < len(parts)-1; i++ {
		key := parts[i]
		v, exists := current[key]
		if !exists {
			// Create intermediate maps as needed.
			newMap := make(Row)
			current[key] = newMap
			current = newMap
		} else {
			// Ensure the value is a map.
			m, ok := v.(map[string]any)
			if !ok {
				return fmt.Errorf("cannot navigate through non-map value at '%s'", strings.Join(parts[:i+1], "."))
			}
			current = m
		}
	}

	// Set the final property.
	finalKey := parts[len(parts)-1]
	current[finalKey] = value
	return nil
}
