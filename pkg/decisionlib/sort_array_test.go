package decisionlib

import (
	"testing"
)

func TestApplySortArray(t *testing.T) {
	data := []Row{
		{
			"id": 1,
			"items": []any{
				map[string]any{"name": "c", "qty": 3.0},
				map[string]any{"name": "a", "qty": 1.0},
				map[string]any{"name": "b", "qty": 2.0},
			},
		},
	}

	result, err := applySortArray(data, "items", "qty", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	items, ok := result[0]["items"].([]any)
	if !ok {
		t.Fatalf("expected items to be []any, got %T", result[0]["items"])
	}

	if len(items) != 3 {
		t.Fatalf("expected 3 items, got %d", len(items))
	}

	first := items[0].(map[string]any)
	if first["name"] != "a" {
		t.Errorf("expected first item name 'a', got %v", first["name"])
	}

	last := items[2].(map[string]any)
	if last["name"] != "c" {
		t.Errorf("expected last item name 'c', got %v", last["name"])
	}
}

func TestApplySortArrayDesc(t *testing.T) {
	data := []Row{
		{
			"items": []any{
				map[string]any{"name": "a", "qty": 1.0},
				map[string]any{"name": "c", "qty": 3.0},
			},
		},
	}

	result, err := applySortArray(data, "items", "qty", "desc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	items := result[0]["items"].([]any)
	first := items[0].(map[string]any)
	if first["name"] != "c" {
		t.Errorf("expected first item name 'c', got %v", first["name"])
	}
}

func TestApplySortArrayMissingProperty(t *testing.T) {
	data := []Row{{"id": 1}}

	result, err := applySortArray(data, "missing", "qty", "asc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 1 {
		t.Errorf("expected 1 row, got %d", len(result))
	}
}

func TestApplySortArrayInvalidType(t *testing.T) {
	data := []Row{{"items": "not an array"}}

	_, err := applySortArray(data, "items", "qty", "asc")
	if err == nil {
		t.Fatal("expected error for non-array property")
	}
}
