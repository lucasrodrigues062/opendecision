package decisionlib

import (
	"fmt"
	"sort"
)

// applyAggregate computes a single aggregate value over the dataset.
// Supported aggregates: sum, avg, count, min, max.
// The result is stored as a single-row dataset with the aggregate value.
//
// Examples:
//   - sum:  {op: "aggregate", agg: "sum", property: "price", result_property: "total"}
//   - avg:  {op: "aggregate", agg: "avg", property: "score", result_property: "avg_score"}
//   - count:{op: "aggregate", agg: "count", result_property: "count"}
//   - min:  {op: "aggregate", agg: "min", property: "age", result_property: "min_age"}
//   - max:  {op: "aggregate", agg: "max", property: "age", result_property: "max_age"}
func applyAggregate(data []Row, agg, property, resultProperty string) ([]Row, error) {
	if resultProperty == "" {
		return nil, &OperationError{
			Op:      OpAggregate,
			Err:     fmt.Errorf("aggregate requires non-empty result_property"),
			Details: "result_property must not be empty",
		}
	}

	switch agg {
	case "sum":
		return aggregateSum(data, property, resultProperty)
	case "avg":
		return aggregateAvg(data, property, resultProperty)
	case "count":
		return []Row{{resultProperty: len(data)}}, nil
	case "min":
		return aggregateMinMax(data, property, resultProperty, true)
	case "max":
		return aggregateMinMax(data, property, resultProperty, false)
	default:
		return nil, &OperationError{
			Op:      OpAggregate,
			Err:     fmt.Errorf("unsupported aggregate %q", agg),
			Details: "supported aggregates: sum, avg, count, min, max",
		}
	}
}

func aggregateSum(data []Row, property, resultProperty string) ([]Row, error) {
	var sum float64
	for i, row := range data {
		value := getNestedValue(row, property)
		if value == nil {
			return nil, &OperationError{
				Op:      OpAggregate,
				Err:     fmt.Errorf("row %d: property %q not found", i, property),
				Details: "failed to read property",
			}
		}
		sum += toFloat64OrZero(value)
	}
	return []Row{{resultProperty: sum}}, nil
}

func aggregateAvg(data []Row, property, resultProperty string) ([]Row, error) {
	if len(data) == 0 {
		return []Row{{resultProperty: 0.0}}, nil
	}

	var sum float64
	for i, row := range data {
		value := getNestedValue(row, property)
		if value == nil {
			return nil, &OperationError{
				Op:      OpAggregate,
				Err:     fmt.Errorf("row %d: property %q not found", i, property),
				Details: "failed to read property",
			}
		}
		sum += toFloat64OrZero(value)
	}

	return []Row{{resultProperty: sum / float64(len(data))}}, nil
}

func aggregateMinMax(data []Row, property, resultProperty string, isMin bool) ([]Row, error) {
	if len(data) == 0 {
		return []Row{{resultProperty: nil}}, nil
	}

	first := getNestedValue(data[0], property)
	if first == nil {
		return nil, &OperationError{
			Op:      OpAggregate,
			Err:     fmt.Errorf("row 0: property %q not found", property),
			Details: "failed to read property",
		}
	}

	result := first
	for i := 1; i < len(data); i++ {
		value := getNestedValue(data[i], property)
		if value == nil {
			return nil, &OperationError{
				Op:      OpAggregate,
				Err:     fmt.Errorf("row %d: property %q not found", i, property),
				Details: "failed to read property",
			}
		}

		cmp := compareValues(value, result)
		if (isMin && cmp < 0) || (!isMin && cmp > 0) {
			result = value
		}
	}

	return []Row{{resultProperty: result}}, nil
}

// toFloat64OrZero converts numeric values to float64, defaulting to 0.
func toFloat64OrZero(v any) float64 {
	f, _ := toFloat64(v)
	return f
}

// applyGroupBy groups rows by a property value.
// Returns one row per group with the group key and the original items.
//
// Example:
//   input:  [{category: "a", value: 1}, {category: "a", value: 2}, {category: "b", value: 3}]
//   output: [{key: "a", items: [...]}, {key: "b", items: [...]}]
func applyGroupBy(data []Row, property string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:      OpGroupBy,
			Err:     fmt.Errorf("group_by requires non-empty property"),
			Details: "property must not be empty",
		}
	}

	groups := make(map[string][]Row)
	var keys []string

	for i, row := range data {
		value := getNestedValue(row, property)
		if value == nil {
			return nil, &OperationError{
				Op:      OpGroupBy,
				Err:     fmt.Errorf("row %d: property %q not found", i, property),
				Details: "failed to read property",
			}
		}

		key := fmt.Sprintf("%v", value)
		if _, exists := groups[key]; !exists {
			keys = append(keys, key)
		}
		groups[key] = append(groups[key], row)
	}

	result := make([]Row, 0, len(keys))
	for _, key := range keys {
		result = append(result, Row{
			"key":   key,
			"items": groups[key],
		})
	}

	// Sort by key for deterministic output.
	sort.Slice(result, func(i, j int) bool {
		return fmt.Sprintf("%v", result[i]["key"]) < fmt.Sprintf("%v", result[j]["key"])
	})

	return result, nil
}

// applyDistinct removes duplicate rows based on a property value.
// The first occurrence is kept.
func applyDistinct(data []Row, property string) ([]Row, error) {
	if property == "" {
		return nil, &OperationError{
			Op:      OpDistinct,
			Err:     fmt.Errorf("distinct requires non-empty property"),
			Details: "property must not be empty",
		}
	}

	seen := make(map[string]bool)
	result := make([]Row, 0, len(data))

	for i, row := range data {
		value := getNestedValue(row, property)
		if value == nil {
			return nil, &OperationError{
				Op:      OpDistinct,
				Err:     fmt.Errorf("row %d: property %q not found", i, property),
				Details: "failed to read property",
			}
		}

		key := fmt.Sprintf("%v", value)
		if !seen[key] {
			seen[key] = true
			result = append(result, row)
		}
	}

	return result, nil
}

