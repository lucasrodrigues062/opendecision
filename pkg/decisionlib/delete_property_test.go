package decisionlib

import "testing"

func TestApplyDeleteProperty(t *testing.T) {
	data := []Row{
		{"id": 1, "name": "Alice", "age": 30},
	}

	result, err := applyDeleteProperty(data, "age")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if _, exists := result[0]["age"]; exists {
		t.Errorf("expected age to be deleted")
	}

	if result[0]["name"] != "Alice" {
		t.Errorf("expected name to remain")
	}
}

func TestApplyDeletePropertyNested(t *testing.T) {
	data := []Row{
		{
			"id": 1,
			"person": map[string]any{
				"name": "Alice",
				"age":  30,
			},
		},
	}

	result, err := applyDeleteProperty(data, "person.age")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	person := result[0]["person"].(map[string]any)
	if _, exists := person["age"]; exists {
		t.Errorf("expected person.age to be deleted")
	}

	if person["name"] != "Alice" {
		t.Errorf("expected person.name to remain")
	}
}
