package decisionlib

import "fmt"

// Error types for the decision pipeline.
// These sentinel errors help callers distinguish between different failure modes.

var (
	// ErrExpressionFailed indicates that an expression compilation or evaluation failed.
	// This occurs when the expression syntax is invalid or evaluation returns an unexpected type.
	ErrExpressionFailed = fmt.Errorf("expression evaluation failed")

	// ErrTypeMismatch indicates that an operation produced a type incompatible with the operation.
	// For example, a filter expression that returns a non-boolean value.
	ErrTypeMismatch = fmt.Errorf("type mismatch")

	// ErrUnknownOp indicates that a Step contains an operation type that is not recognized.
	// Valid operations are: filter, compute, sort.
	ErrUnknownOp = fmt.Errorf("unknown operation")

	// ErrInvalidSort indicates an error during sort operation.
	// This can occur with invalid direction values or unsupported property types.
	ErrInvalidSort = fmt.Errorf("invalid sort operation")

	// ErrInvalidProperty indicates that a property path could not be set or accessed.
	// This occurs during compute operations when the dot-notation path is invalid.
	ErrInvalidProperty = fmt.Errorf("invalid property path")
)

// OperationError wraps an error with context about which step failed.
type OperationError struct {
	StepIndex int    // The index of the step that failed (0-based)
	Op        Op     // The operation type that failed
	Err       error  // The underlying error
	Details   string // Additional context
}

// Error implements the error interface.
func (e *OperationError) Error() string {
	if e.Details != "" {
		return fmt.Sprintf("step %d (%s): %v (%s)", e.StepIndex, e.Op, e.Err, e.Details)
	}
	return fmt.Sprintf("step %d (%s): %v", e.StepIndex, e.Op, e.Err)
}

// Unwrap returns the underlying error.
func (e *OperationError) Unwrap() error {
	return e.Err
}
