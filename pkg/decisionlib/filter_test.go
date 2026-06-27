package decisionlib

import (
	"testing"
)

func TestFilterBasic(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
		{"name": "Charlie", "age": 35},
	}

	result, err := applyFilter(data, "age >= 30")
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

func TestFilterComplex(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 30, "status": "active"},
		{"name": "Bob", "age": 25, "status": "inactive"},
		{"name": "Charlie", "age": 35, "status": "active"},
	}

	result, err := applyFilter(data, "age >= 30 && status == 'active'")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 results, got %d", len(result))
	}
}

func TestFilterEmpty(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 20},
		{"name": "Bob", "age": 25},
	}

	result, err := applyFilter(data, "age >= 50")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 0 {
		t.Fatalf("expected 0 results, got %d", len(result))
	}
}

func TestFilterInvalidExpression(t *testing.T) {
	data := []Row{{"age": 30}}

	_, err := applyFilter(data, "age >=")
	if err == nil {
		t.Fatal("expected error for invalid expression")
	}
}

func TestFilterNonBooleanResult(t *testing.T) {
	data := []Row{{"age": 30}}

	// This expression returns a number, not a bool.
	_, err := applyFilter(data, "age")
	if err == nil {
		t.Fatal("expected error for non-boolean result")
	}
}

func TestFilterEmptyData(t *testing.T) {
	data := []Row{}

	result, err := applyFilter(data, "age >= 30")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 0 {
		t.Fatalf("expected empty result, got %v", result)
	}
}

func TestFilterStringComparison(t *testing.T) {
	data := []Row{
		{"name": "Alice"},
		{"name": "Bob"},
		{"name": "Charlie"},
	}

	result, err := applyFilter(data, "name > 'Bob'")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 1 {
		t.Fatalf("expected 1 result, got %d", len(result))
	}

	if result[0]["name"] != "Charlie" {
		t.Errorf("unexpected result: %v", result[0])
	}
}
