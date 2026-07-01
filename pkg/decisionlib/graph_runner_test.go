package decisionlib

import (
	"testing"
)

func TestRunGraphLinear(t *testing.T) {
	graph := Graph{
		Nodes: []GraphNode{
			{ID: "start", Type: GraphNodeStart},
			{ID: "filter", Type: GraphNodeOperation, Step: &Step{Op: OpFilter, Expression: "age >= 30"}},
			{ID: "end", Type: GraphNodeEnd},
		},
		Edges: []GraphEdge{
			{ID: "e1", Source: "start", Target: "filter"},
			{ID: "e2", Source: "filter", Target: "end"},
		},
	}

	data := []Row{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
	}

	result, err := RunGraph(data, graph)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 1 {
		t.Fatalf("expected 1 result, got %d", len(result))
	}

	if result[0]["name"] != "Alice" {
		t.Errorf("expected Alice, got %v", result[0]["name"])
	}
}

func TestRunGraphConditionTrue(t *testing.T) {
	graph := Graph{
		Nodes: []GraphNode{
			{ID: "start", Type: GraphNodeStart},
			{ID: "check", Type: GraphNodeCondition, Expression: "age >= 30"},
			{ID: "keep", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "status", Expression: `'adult'`}},
			{ID: "drop", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "status", Expression: `'minor'`}},
			{ID: "end", Type: GraphNodeEnd},
		},
		Edges: []GraphEdge{
			{ID: "e1", Source: "start", Target: "check"},
			{ID: "e2", Source: "check", Target: "keep", SourcePort: "true"},
			{ID: "e3", Source: "check", Target: "drop", SourcePort: "false"},
			{ID: "e4", Source: "keep", Target: "end"},
			{ID: "e5", Source: "drop", Target: "end"},
		},
	}

	data := []Row{
		{"name": "Alice", "age": 30},
	}

	result, err := RunGraph(data, graph)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 1 {
		t.Fatalf("expected 1 result, got %d", len(result))
	}

	if result[0]["status"] != "adult" {
		t.Errorf("expected status 'adult', got %v", result[0]["status"])
	}
}

func TestRunGraphConditionCount(t *testing.T) {
	graph := Graph{
		Nodes: []GraphNode{
			{ID: "start", Type: GraphNodeStart},
			{ID: "check", Type: GraphNodeCondition, Expression: "_count > 1"},
			{ID: "many", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "size", Expression: `'many'`}},
			{ID: "single", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "size", Expression: `'single'`}},
			{ID: "end", Type: GraphNodeEnd},
		},
		Edges: []GraphEdge{
			{ID: "e1", Source: "start", Target: "check"},
			{ID: "e2", Source: "check", Target: "many", SourcePort: "true"},
			{ID: "e3", Source: "check", Target: "single", SourcePort: "false"},
			{ID: "e4", Source: "many", Target: "end"},
			{ID: "e5", Source: "single", Target: "end"},
		},
	}

	// More than one row -> true branch.
	result, err := RunGraph([]Row{{"name": "Alice"}, {"name": "Bob"}}, graph)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 || result[0]["size"] != "many" {
		t.Errorf("expected 'many' branch for 2 rows, got %v", result)
	}

	// Single row -> false branch.
	result, err = RunGraph([]Row{{"name": "Alice"}}, graph)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 1 || result[0]["size"] != "single" {
		t.Errorf("expected 'single' branch for 1 row, got %v", result)
	}
}

func TestRunGraphConditionPerRow(t *testing.T) {
	graph := Graph{
		Nodes: []GraphNode{
			{ID: "start", Type: GraphNodeStart},
			{ID: "check", Type: GraphNodeCondition, Expression: "age >= 30", Mode: "per_row"},
			{ID: "adult", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "status", Expression: `'adult'`}},
			{ID: "minor", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "status", Expression: `'minor'`}},
			{ID: "end", Type: GraphNodeEnd},
		},
		Edges: []GraphEdge{
			{ID: "e1", Source: "start", Target: "check"},
			{ID: "e2", Source: "check", Target: "adult", SourcePort: "true"},
			{ID: "e3", Source: "check", Target: "minor", SourcePort: "false"},
			{ID: "e4", Source: "adult", Target: "end"},
			{ID: "e5", Source: "minor", Target: "end"},
		},
	}

	data := []Row{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
		{"name": "Carol", "age": 35},
	}

	result, err := RunGraph(data, graph)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 3 {
		t.Fatalf("expected 3 results, got %d", len(result))
	}

	expected := []string{"adult", "minor", "adult"}
	for i, exp := range expected {
		if result[i]["status"] != exp {
			t.Errorf("row %d: expected status %q, got %v", i, exp, result[i]["status"])
		}
	}
}

func TestRunGraphInvalidCycle(t *testing.T) {
	graph := Graph{
		Nodes: []GraphNode{
			{ID: "start", Type: GraphNodeStart},
			{ID: "a", Type: GraphNodeOperation, Step: &Step{Op: OpCompute, Property: "x", Expression: "1"}},
			{ID: "end", Type: GraphNodeEnd},
		},
		Edges: []GraphEdge{
			{ID: "e1", Source: "start", Target: "a"},
			{ID: "e2", Source: "a", Target: "end"},
			{ID: "e3", Source: "end", Target: "a"},
		},
	}

	_, err := RunGraph([]Row{}, graph)
	if err == nil {
		t.Fatal("expected error for cyclic graph")
	}
}
