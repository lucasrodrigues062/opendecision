// Package decisionlib provides a high-performance decision pipeline engine
// for processing dynamic data arrays through declarative operations.
//
// The engine accepts a slice of maps ([]map[string]any) and an AST of operations,
// executing filter, compute, and sort steps to transform the data.
// All operations are type-safe with no eval() vulnerability.
package decisionlib

// Op represents a pipeline operation type.
type Op string

const (
	// OpFilter removes items from the array if the expression evaluates to false.
	OpFilter Op = "filter"

	// OpCompute creates or mutates a property in each array element based on an expression.
	OpCompute Op = "compute"

	// OpSort orders the array based on a property value.
	OpSort Op = "sort"

	// OpSortArray sorts an array nested inside each row.
	OpSortArray Op = "sort_array"

	// OpFilterArray filters an array nested inside each row.
	OpFilterArray Op = "filter_array"

	// OpDeleteProperty removes a property from each row.
	OpDeleteProperty Op = "delete_property"

	// OpTransform applies a JSONata expression to each row for arbitrary transformations.
	OpTransform Op = "transform"

	// OpAggregate computes a single value over the dataset (sum, avg, count, min, max).
	OpAggregate Op = "aggregate"

	// OpGroupBy groups rows by a property value.
	OpGroupBy Op = "group_by"

	// OpDistinct removes duplicate rows based on a property value.
	OpDistinct Op = "distinct"
)

// Step represents a single operation in the pipeline.
// Each step is executed sequentially on the data.
type Step struct {
	// Op is the operation to apply (filter, compute, or sort).
	Op Op `json:"op"`

	// Expression is the evaluable expression for filter or compute operations.
	// For filter: a boolean expression (e.g., "age >= 30")
	// For compute: a value expression (e.g., "salary * 1.1")
	Expression string `json:"expression,omitempty"`

	// Property is the target property name for compute or the sort key for sort.
	// For compute: the field to create/update (supports dot notation: "person.age")
	// For sort: the field to sort by (supports dot notation)
	Property string `json:"property,omitempty"`

	// Direction specifies sort order for sort operations.
	// Valid values: "asc" (default), "desc"
	// Ignored for filter and compute operations.
	Direction string `json:"direction,omitempty"`

	// SortBy specifies the property inside a nested array to sort by.
	// Used only by sort_array operations.
	SortBy string `json:"sort_by,omitempty"`

	// Agg specifies the aggregate function for aggregate operations.
	// Valid values: "sum", "avg", "count", "min", "max".
	Agg string `json:"agg,omitempty"`

	// ResultProperty is the target property for aggregate results.
	ResultProperty string `json:"result_property,omitempty"`
}

// PipelineAST is the abstract syntax tree representing a sequence of operations.
// Steps are executed in order, each operation receiving the output of the previous one.
type PipelineAST struct {
	// Steps is the sequence of operations to execute.
	Steps []Step `json:"steps"`
}

// Row is a type alias for a single element in the data array.
// It represents a dynamic object with string keys and any values.
type Row = map[string]any
