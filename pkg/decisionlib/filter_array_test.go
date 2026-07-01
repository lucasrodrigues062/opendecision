package decisionlib

import "testing"

func TestApplyFilterArray(t *testing.T) {
	data := []Row{
		{
			"id": 1,
			"items": []any{
				map[string]any{"name": "a", "qty": 10.0},
				map[string]any{"name": "b", "qty": 5.0},
				map[string]any{"name": "c", "qty": 20.0},
			},
		},
	}

	result, err := applyFilterArray(data, "items", "qty > 5")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	items := result[0]["items"].([]any)
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}

	first := items[0].(map[string]any)
	if first["name"] != "a" {
		t.Errorf("expected first item name 'a', got %v", first["name"])
	}
}

func TestApplyFilterArrayMissingProperty(t *testing.T) {
	data := []Row{{"id": 1}}

	result, err := applyFilterArray(data, "missing", "qty > 5")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	items := result[0]["missing"]
	if items != nil {
		t.Errorf("expected nil, got %v", items)
	}
}
