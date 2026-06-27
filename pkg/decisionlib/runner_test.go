package decisionlib

import (
	"testing"
)

func TestRunSimplePipeline(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
		{"name": "Charlie", "age": 35},
	}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpFilter, Expression: "age >= 30"},
			{Op: OpSort, Property: "age", Direction: "asc"},
		},
	}

	result, err := Run(data, pipeline)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 results, got %d", len(result))
	}

	if result[0]["name"] != "Alice" || result[1]["name"] != "Charlie" {
		t.Errorf("unexpected result: %v", result)
	}
}

func TestRunComplexPipeline(t *testing.T) {
	data := []Row{
		{"name": "Alice", "salary": 1000},
		{"name": "Bob", "salary": 2000},
		{"name": "Charlie", "salary": 1500},
	}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpCompute, Property: "bonus", Expression: "salary * 0.1"},
			{Op: OpFilter, Expression: "bonus >= 150"},
			{Op: OpSort, Property: "name", Direction: "asc"},
		},
	}

	result, err := Run(data, pipeline)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 results, got %d", len(result))
	}

	if result[0]["name"] != "Bob" || result[1]["name"] != "Charlie" {
		t.Errorf("unexpected result: %v", result)
	}

	if result[0]["bonus"] != 200.0 {
		t.Errorf("expected bonus 200, got %v", result[0]["bonus"])
	}
}

func TestRunEmptyData(t *testing.T) {
	data := []Row{}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpFilter, Expression: "age >= 30"},
		},
	}

	result, err := Run(data, pipeline)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 0 {
		t.Fatalf("expected empty result, got %v", result)
	}
}

func TestRunEmptyPipeline(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
	}

	pipeline := PipelineAST{
		Steps: []Step{},
	}

	result, err := Run(data, pipeline)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 results, got %d", len(result))
	}
}

func TestRunInvalidStep(t *testing.T) {
	data := []Row{{"age": 30}}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: "unknown_op"},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error for unknown operation")
	}
}

func TestRunMissingFilterExpression(t *testing.T) {
	data := []Row{{"age": 30}}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpFilter, Expression: ""},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error for missing filter expression")
	}
}

func TestRunMissingComputeProperty(t *testing.T) {
	data := []Row{{"age": 30}}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpCompute, Property: "", Expression: "age * 2"},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error for missing compute property")
	}
}

func TestRunMissingComputeExpression(t *testing.T) {
	data := []Row{{"age": 30}}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpCompute, Property: "doubled", Expression: ""},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error for missing compute expression")
	}
}

func TestRunMissingSortProperty(t *testing.T) {
	data := []Row{{"age": 30}}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpSort, Property: ""},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error for missing sort property")
	}
}

func TestRunErrorPropagation(t *testing.T) {
	data := []Row{{"age": 30}}

	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpFilter, Expression: "age >="},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error for invalid expression")
	}

	// Error should contain step information.
	opErr, ok := err.(*OperationError)
	if !ok {
		t.Fatalf("expected OperationError, got %T", err)
	}

	if opErr.StepIndex != 0 {
		t.Errorf("expected StepIndex 0, got %d", opErr.StepIndex)
	}

	if opErr.Op != OpFilter {
		t.Errorf("expected Op OpFilter, got %v", opErr.Op)
	}
}

func TestRunMultipleErrors(t *testing.T) {
	data := []Row{
		{"age": 30},
		{"age": "invalid"},
		{"age": 25},
	}

	// This will fail during evaluation of the second row.
	pipeline := PipelineAST{
		Steps: []Step{
			{Op: OpCompute, Property: "doubled", Expression: "age * 2"},
		},
	}

	_, err := Run(data, pipeline)
	if err == nil {
		t.Fatal("expected error during compute")
	}
}
