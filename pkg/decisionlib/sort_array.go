package decisionlib

import (
	"fmt"
	"sort"
	"strings"
)

// applySortArray sorts a nested array inside each row based on a property value.
//
// For every row, the property identified by `property` must be a slice (`[]any`).
// Each element of that slice is expected to be a map with a key matching `sortBy`.
// The element slices are sorted in-place using stable sort.
//
// Example:
//
//	property="codigos_servico", sortBy="quantidade", direction="asc"
func applySortArray(data []Row, property string, sortBy string, direction string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:      OpSortArray,
			Err:     ErrInvalidProperty,
			Details: "property must not be empty",
		}
	}
	if sortBy == "" {
		return nil, &OperationError{
			Op:      OpSortArray,
			Err:     ErrInvalidSort,
			Details: "sort_by must not be empty",
		}
	}

	isDescending := false
	if direction == "desc" {
		isDescending = true
	} else if direction != "" && direction != "asc" {
		return nil, &OperationError{
			Op:      OpSortArray,
			Err:     ErrInvalidSort,
			Details: fmt.Sprintf("invalid direction: %s (expected 'asc' or 'desc')", direction),
		}
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
				Op:      OpSortArray,
				Err:     ErrTypeMismatch,
				Details: fmt.Sprintf("row %d: property '%s' is not an array", i, property),
			}
		}

		sort.SliceStable(slice, func(a, b int) bool {
			itemA, okA := slice[a].(map[string]any)
			itemB, okB := slice[b].(map[string]any)
			if !okA || !okB {
				return false
			}

			cmp := compareValues(itemA[sortBy], itemB[sortBy])
			if isDescending {
				cmp = -cmp
			}
			return cmp < 0
		})

		setNestedValue(row, property, slice)
	}

	return result, nil
}

// getNestedValueExists retrieves a value from a row using dot notation and
// reports whether the path exists.
func getNestedValueExists(row Row, path string) (any, bool) {
	parts := strings.Split(path, ".")
	current := any(row)

	for _, part := range parts {
		m, ok := current.(map[string]any)
		if !ok {
			return nil, false
		}

		v, exists := m[part]
		if !exists {
			return nil, false
		}

		current = v
	}

	return current, true
}
