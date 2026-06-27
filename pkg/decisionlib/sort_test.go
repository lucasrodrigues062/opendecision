package decisionlib

import (
	"testing"
)

func TestSortAscending(t *testing.T) {
	data := []Row{
		{"name": "Charlie", "age": 35.0},
		{"name": "Alice", "age": 30.0},
		{"name": "Bob", "age": 25.0},
	}

	result, err := applySort(data, "age", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["name"] != "Bob" || result[1]["name"] != "Alice" || result[2]["name"] != "Charlie" {
		t.Errorf("unexpected sort order: %v", result)
	}
}

func TestSortDescending(t *testing.T) {
	data := []Row{
		{"name": "Charlie", "age": 35.0},
		{"name": "Alice", "age": 30.0},
		{"name": "Bob", "age": 25.0},
	}

	result, err := applySort(data, "age", "desc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["name"] != "Charlie" || result[1]["name"] != "Alice" || result[2]["name"] != "Bob" {
		t.Errorf("unexpected sort order: %v", result)
	}
}

func TestSortString(t *testing.T) {
	data := []Row{
		{"name": "Charlie"},
		{"name": "Alice"},
		{"name": "Bob"},
	}

	result, err := applySort(data, "name", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["name"] != "Alice" || result[1]["name"] != "Bob" || result[2]["name"] != "Charlie" {
		t.Errorf("unexpected sort order: %v", result)
	}
}

func TestSortWithNil(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 30.0},
		{"name": "Bob", "age": nil},
		{"name": "Charlie", "age": 25.0},
	}

	result, err := applySort(data, "age", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Nil values should sort to the end.
	if result[2]["name"] != "Bob" {
		t.Errorf("expected nil value to sort last, got: %v", result)
	}
}

func TestSortBoolean(t *testing.T) {
	data := []Row{
		{"name": "Alice", "active": true},
		{"name": "Bob", "active": false},
		{"name": "Charlie", "active": true},
	}

	result, err := applySort(data, "active", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// false < true, so Bob should be first.
	if result[0]["name"] != "Bob" {
		t.Errorf("unexpected sort order: %v", result)
	}
}

func TestSortDotNotation(t *testing.T) {
	data := []Row{
		{"person": map[string]any{"name": "Charlie", "age": 35.0}},
		{"person": map[string]any{"name": "Alice", "age": 30.0}},
		{"person": map[string]any{"name": "Bob", "age": 25.0}},
	}

	result, err := applySort(data, "person.age", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["person"].(map[string]any)["name"] != "Bob" {
		t.Errorf("unexpected sort order")
	}
}

func TestSortInvalidDirection(t *testing.T) {
	data := []Row{{"age": 30.0}}

	_, err := applySort(data, "age", "invalid")
	if err == nil {
		t.Fatal("expected error for invalid direction")
	}
}

func TestSortEmptyProperty(t *testing.T) {
	data := []Row{{"age": 30.0}}

	_, err := applySort(data, "", "asc")
	if err == nil {
		t.Fatal("expected error for empty property")
	}
}

func TestSortDefaultDirection(t *testing.T) {
	data := []Row{
		{"age": 30.0},
		{"age": 25.0},
		{"age": 35.0},
	}

	// Empty direction should default to asc.
	result, err := applySort(data, "age", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["age"] != 25.0 || result[2]["age"] != 35.0 {
		t.Errorf("unexpected sort order with default direction: %v", result)
	}
}

func TestSortIntType(t *testing.T) {
	data := []Row{
		{"id": 3},
		{"id": 1},
		{"id": 2},
	}

	result, err := applySort(data, "id", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["id"] != 1 || result[1]["id"] != 2 || result[2]["id"] != 3 {
		t.Errorf("unexpected sort order for int type: %v", result)
	}
}
