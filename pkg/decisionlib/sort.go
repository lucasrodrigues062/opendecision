package decisionlib

import (
	"fmt"
	"sort"
	"strings"
)

// applySort orders the data array based on a property value.
// Supports dot notation for nested properties (e.g., "person.age").
// Direction can be "asc" (ascending, default) or "desc" (descending).
//
// Supported types for sorting:
//
//	- float64 (and int, which is converted internally)
//	- string
//	- bool (false < true)
//	- nil values (sorted to the end)
//
// Example: property="age", direction="desc" sorts by age in descending order.
func applySort(data []Row, property string, direction string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:      OpSort,
			Err:     ErrInvalidSort,
			Details: "property must not be empty",
		}
	}

	// Default direction is ascending.
	isDescending := false
	if direction == "desc" {
		isDescending = true
	} else if direction != "" && direction != "asc" {
		return nil, &OperationError{
			Op:      OpSort,
			Err:     ErrInvalidSort,
			Details: fmt.Sprintf("invalid direction: %s (expected 'asc' or 'desc')", direction),
		}
	}

	// Make a copy to avoid mutating the input.
	result := make([]Row, len(data))
	copy(result, data)

	// Sort using a custom comparator that handles dynamic types.
	sort.SliceStable(result, func(i, j int) bool {
		valI := getNestedValue(result[i], property)
		valJ := getNestedValue(result[j], property)

		cmp := compareValues(valI, valJ)
		if isDescending {
			cmp = -cmp
		}

		return cmp < 0
	})

	return result, nil
}

// getNestedValue retrieves a value from a row using dot notation.
// If the path doesn't exist, returns nil.
func getNestedValue(row Row, path string) any {
	parts := strings.Split(path, ".")
	current := any(row)

	for _, part := range parts {
		m, ok := current.(map[string]any)
		if !ok {
			return nil
		}

		v, exists := m[part]
		if !exists {
			return nil
		}

		current = v
	}

	return current
}

// compareValues compares two values for sorting.
// Returns: -1 if a < b, 0 if a == b, 1 if a > b
// Nil values are always considered greater (last in sort order).
func compareValues(a, b any) int {
	// Nil handling: nil values sort to the end.
	if a == nil && b == nil {
		return 0
	}
	if a == nil {
		return 1
	}
	if b == nil {
		return -1
	}

	// Handle numeric types (int and float64).
	aNum, aIsNum := toFloat64(a)
	bNum, bIsNum := toFloat64(b)

	if aIsNum && bIsNum {
		if aNum < bNum {
			return -1
		}
		if aNum > bNum {
			return 1
		}
		return 0
	}

	// Handle strings.
	aStr, aIsStr := a.(string)
	bStr, bIsStr := b.(string)

	if aIsStr && bIsStr {
		if aStr < bStr {
			return -1
		}
		if aStr > bStr {
			return 1
		}
		return 0
	}

	// Handle booleans.
	aBool, aIsBool := a.(bool)
	bBool, bIsBool := b.(bool)

	if aIsBool && bIsBool {
		// false (0) < true (1)
		if !aBool && bBool {
			return -1
		}
		if aBool && !bBool {
			return 1
		}
		return 0
	}

	// Type mismatch: compare by type name as a fallback.
	aType := fmt.Sprintf("%T", a)
	bType := fmt.Sprintf("%T", b)

	if aType < bType {
		return -1
	}
	if aType > bType {
		return 1
	}

	return 0
}

// toFloat64 attempts to convert a value to float64.
func toFloat64(v any) (float64, bool) {
	switch x := v.(type) {
	case float64:
		return x, true
	case int:
		return float64(x), true
	case int32:
		return float64(x), true
	case int64:
		return float64(x), true
	case uint:
		return float64(x), true
	case uint32:
		return float64(x), true
	case uint64:
		return float64(x), true
	}

	return 0, false
}
