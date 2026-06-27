package decisionlib

import (
	"testing"
)

// toNumeric converts various numeric types to float64 for comparison.
func toNumeric(v any) float64 {
	switch x := v.(type) {
	case float64:
		return x
	case int:
		return float64(x)
	case int32:
		return float64(x)
	case int64:
		return float64(x)
	}
	return 0
}

func TestComputeNewField(t *testing.T) {
	data := []Row{
		{"name": "Alice", "age": 30},
		{"name": "Bob", "age": 25},
	}

	result, err := applyCompute(data, "isAdult", "age >= 18")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 2 {
		t.Fatalf("expected 2 results, got %d", len(result))
	}

	isAdult, ok := result[0]["isAdult"].(bool)
	if !ok || !isAdult {
		t.Errorf("unexpected isAdult value: %v", result[0]["isAdult"])
	}
}

func TestComputeArithmetic(t *testing.T) {
	data := []Row{
		{"name": "Alice", "salary": 1000.0},
		{"name": "Bob", "salary": 2000.0},
	}

	result, err := applyCompute(data, "adjusted_salary", "salary * 1.1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := 1100.0
	actual := toNumeric(result[0]["adjusted_salary"])
	if actual != expected {
		t.Errorf("expected %v, got %v", expected, actual)
	}
}

func TestComputeDotNotation(t *testing.T) {
	data := []Row{
		{"person": map[string]any{"name": "Alice", "age": 30}},
		{"person": map[string]any{"name": "Bob", "age": 25}},
	}

	result, err := applyCompute(data, "person.score", "person.age * 2")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	person := result[0]["person"].(map[string]any)
	score := toNumeric(person["score"])
	if score != 60.0 {
		t.Errorf("expected 60.0, got %v", score)
	}
}

func TestComputeNestedPathCreation(t *testing.T) {
	data := []Row{
		{"name": "Alice"},
	}

	result, err := applyCompute(data, "stats.total", "1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	stats := result[0]["stats"].(map[string]any)
	total := toNumeric(stats["total"])
	if total != 1.0 {
		t.Errorf("unexpected value: %v", total)
	}
}

func TestComputeOverwriteExisting(t *testing.T) {
	data := []Row{
		{"name": "Alice", "score": 50},
	}

	result, err := applyCompute(data, "score", "100")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	score := toNumeric(result[0]["score"])
	if score != 100.0 {
		t.Errorf("expected 100.0, got %v", score)
	}
}

func TestComputeInvalidExpression(t *testing.T) {
	data := []Row{{"age": 30}}

	_, err := applyCompute(data, "score", "age +")
	if err == nil {
		t.Fatal("expected error for invalid expression")
	}
}

func TestComputeEmptyProperty(t *testing.T) {
	data := []Row{{"age": 30}}

	_, err := applyCompute(data, "", "age * 2")
	if err == nil {
		t.Fatal("expected error for empty property")
	}
}

func TestComputeMultipleRows(t *testing.T) {
	data := []Row{
		{"age": 20},
		{"age": 30},
		{"age": 40},
	}

	result, err := applyCompute(data, "doubled", "age * 2")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expectedValues := []float64{40, 60, 80}
	for i, expected := range expectedValues {
		doubled := toNumeric(result[i]["doubled"])
		if doubled != expected {
			t.Errorf("row %d: expected %v, got %v", i, expected, doubled)
		}
	}
}
