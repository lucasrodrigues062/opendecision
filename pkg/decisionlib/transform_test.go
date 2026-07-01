package decisionlib

import (
	"testing"
)

func TestApplyTransformAddField(t *testing.T) {
	data := []Row{
		{"price": 10.0, "quantity": 2},
		{"price": 5.0, "quantity": 4},
	}

	result, err := applyTransform(data, `$merge([$, {"total": price * quantity}])`)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 results, got %d", len(result))
	}

	if result[0]["total"] != 20.0 {
		t.Errorf("expected total 20, got %v", result[0]["total"])
	}
	if result[1]["total"] != 20.0 {
		t.Errorf("expected total 20, got %v", result[1]["total"])
	}
}

func TestApplyTransformReshape(t *testing.T) {
	data := []Row{
		{"customer": map[string]any{"name": "Alice"}, "order": map[string]any{"total": 100.0}},
	}

	result, err := applyTransform(data, `{"name": customer.name, "total": order.total}`)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 1 {
		t.Fatalf("expected 1 result, got %d", len(result))
	}

	if result[0]["name"] != "Alice" {
		t.Errorf("expected name Alice, got %v", result[0]["name"])
	}
	if result[0]["total"] != 100.0 {
		t.Errorf("expected total 100, got %v", result[0]["total"])
	}
}

func TestApplyTransformInvalidExpression(t *testing.T) {
	_, err := applyTransform([]Row{{"x": 1}}, `not a valid jsonata`)
	if err == nil {
		t.Fatal("expected error for invalid expression")
	}
}
