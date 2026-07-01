package decisionlib

import (
	"fmt"
	"strings"
)

// applyDeleteProperty removes a property from each row.
// Supports dot notation for nested properties (e.g., "person.address.zip").
// If the property does not exist, the row is unchanged.
func applyDeleteProperty(data []Row, property string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:      OpDeleteProperty,
			Err:     ErrInvalidProperty,
			Details: "property must not be empty",
		}
	}

	result := make([]Row, len(data))
	copy(result, data)

	for i, row := range result {
		if err := deleteNestedValue(row, property); err != nil {
			return nil, &OperationError{
				Op:      OpDeleteProperty,
				Err:     ErrInvalidProperty,
				Details: fmt.Sprintf("row %d: %v", i, err),
			}
		}
	}

	return result, nil
}

// deleteNestedValue removes a value from a row using dot notation.
func deleteNestedValue(row Row, path string) error {
	parts := strings.Split(path, ".")
	if len(parts) == 0 {
		return fmt.Errorf("invalid property path: %s", path)
	}

	current := row
	for i := 0; i < len(parts)-1; i++ {
		key := parts[i]
		v, exists := current[key]
		if !exists {
			return nil
		}

		m, ok := v.(map[string]any)
		if !ok {
			return fmt.Errorf("cannot navigate through non-map value at '%s'", strings.Join(parts[:i+1], "."))
		}
		current = m
	}

	finalKey := parts[len(parts)-1]
	delete(current, finalKey)
	return nil
}
