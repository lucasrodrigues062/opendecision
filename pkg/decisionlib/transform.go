package decisionlib

import (
	"fmt"

	jsonata "github.com/blues/jsonata-go"
)

// applyTransform evaluates a JSONata expression against each row.
// The expression receives the row as its input context ($).
// The result replaces the row, allowing arbitrary JSON transformations.
//
// Examples:
//   - Add a computed field: $merge([$, {"total": price * quantity}])
//   - Filter nested arrays: $map(items, function($i) { $i[$i.price > 10] })
//   - Reshape data: {"name": $.customer.name, "total": $.order.total}
func applyTransform(data []Row, expression string) ([]Row, error) {
	if expression == "" {
		return nil, &OperationError{
			Op:      OpTransform,
			Err:     fmt.Errorf("transform requires a non-empty expression"),
			Details: "expression must not be empty",
		}
	}

	compiled, err := jsonata.Compile(expression)
	if err != nil {
		return nil, &OperationError{
			Op:      OpTransform,
			Err:     fmt.Errorf("failed to compile JSONata expression"),
			Details: err.Error(),
		}
	}

	result := make([]Row, 0, len(data))
	for i, row := range data {
		transformed, err := compiled.Eval(row)
		if err != nil {
			return nil, &OperationError{
				Op:      OpTransform,
				Err:     fmt.Errorf("transform failed at row %d", i),
				Details: err.Error(),
			}
		}

		// JSONata may return a single object or an array. Normalize to Row.
		switch v := transformed.(type) {
		case map[string]any:
			result = append(result, v)
		default:
			return nil, &OperationError{
				Op:      OpTransform,
				Err:     fmt.Errorf("transform at row %d did not return an object", i),
				Details: fmt.Sprintf("got %T", transformed),
			}
		}
	}

	return result, nil
}
