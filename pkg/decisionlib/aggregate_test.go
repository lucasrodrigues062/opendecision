package decisionlib

import (
	"testing"
)

func TestApplyAggregateSum(t *testing.T) {
	data := []Row{
		{"price": 10.0},
		{"price": 20.0},
		{"price": 30.0},
	}

	result, err := applyAggregate(data, "sum", "price", "total")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 1 {
		t.Fatalf("expected 1 result, got %d", len(result))
	}
	if result[0]["total"] != 60.0 {
		t.Errorf("expected total 60, got %v", result[0]["total"])
	}
}

func TestApplyAggregateCount(t *testing.T) {
	data := []Row{
		{"x": 1},
		{"x": 2},
		{"x": 3},
	}

	result, err := applyAggregate(data, "count", "", "count")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result[0]["count"] != 3 {
		t.Errorf("expected count 3, got %v", result[0]["count"])
	}
}

func TestApplyGroupBy(t *testing.T) {
	data := []Row{
		{"category": "a", "value": 1},
		{"category": "a", "value": 2},
		{"category": "b", "value": 3},
	}

	result, err := applyGroupBy(data, "category")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 groups, got %d", len(result))
	}

	itemsA := result[0]["items"].([]Row)
	itemsB := result[1]["items"].([]Row)

	if len(itemsA) != 2 {
		t.Errorf("expected 2 items in group a, got %d", len(itemsA))
	}
	if len(itemsB) != 1 {
		t.Errorf("expected 1 item in group b, got %d", len(itemsB))
	}
}

func TestApplyDistinct(t *testing.T) {
	data := []Row{
		{"id": 1, "name": "Alice"},
		{"id": 2, "name": "Bob"},
		{"id": 1, "name": "Alice Duplicate"},
	}

	result, err := applyDistinct(data, "id")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 distinct rows, got %d", len(result))
	}

	if result[0]["name"] != "Alice" {
		t.Errorf("expected first Alice, got %v", result[0]["name"])
	}
}
