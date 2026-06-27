package main

import (
	"fmt"
	"github.com/lucasrodrigues062/opendecision/pkg/decisionlib"
)

// Example 1: Complete decision pipeline with filter, compute, and sort
func Example1_CompletePipeline() {
	// Sample data: an array of employee records
	employees := []decisionlib.Row{
		{"name": "Alice", "dept": "Engineering", "salary": 5000.0, "years": 3},
		{"name": "Bob", "dept": "Sales", "salary": 4000.0, "years": 1},
		{"name": "Charlie", "dept": "Engineering", "salary": 6000.0, "years": 5},
		{"name": "Diana", "dept": "HR", "salary": 4500.0, "years": 2},
		{"name": "Eve", "dept": "Engineering", "salary": 5500.0, "years": 4},
	}

	// Define a pipeline:
	// 1. Filter: keep only Engineering employees
	// 2. Compute: calculate annual bonus (salary * 0.1 * years)
	// 3. Sort: order by bonus descending
	pipeline := decisionlib.PipelineAST{
		Steps: []decisionlib.Step{
			{
				Op:         decisionlib.OpFilter,
				Expression: "dept == 'Engineering'",
			},
			{
				Op:         decisionlib.OpCompute,
				Property:   "annual_bonus",
				Expression: "salary * 0.1 * years",
			},
			{
				Op:        decisionlib.OpSort,
				Property:  "annual_bonus",
				Direction: "desc",
			},
		},
	}

	// Execute the pipeline
	result, err := decisionlib.Run(employees, pipeline)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	// Print results
	fmt.Println("=== Example 1: Complete Pipeline ===")
	fmt.Println("Engineering employees by annual bonus:")
	for i, emp := range result {
		fmt.Printf("%d. %s: $%.0f\n", i+1, emp["name"], emp["annual_bonus"])
	}
	fmt.Println()
}

// Example 2: Filter operation
func Example2_Filtering() {
	data := []decisionlib.Row{
		{"product": "Laptop", "price": 1200, "in_stock": true},
		{"product": "Mouse", "price": 25, "in_stock": false},
		{"product": "Keyboard", "price": 75, "in_stock": true},
	}

	// Keep only products in stock with price > 50
	pipeline := decisionlib.PipelineAST{
		Steps: []decisionlib.Step{
			{
				Op:         decisionlib.OpFilter,
				Expression: "in_stock && price > 50",
			},
		},
	}

	result, _ := decisionlib.Run(data, pipeline)

	fmt.Println("=== Example 2: Filter Operation ===")
	fmt.Println("Available premium products:")
	for _, item := range result {
		fmt.Printf("- %s: $%v\n", item["product"], item["price"])
	}
	fmt.Println()
}

// Example 3: Compute operation
func Example3_Computing() {
	data := []decisionlib.Row{
		{"name": "Alice", "base_salary": 5000.0, "performance_rating": 1.2},
		{"name": "Bob", "base_salary": 4000.0, "performance_rating": 0.9},
	}

	// Compute adjusted salary = base_salary * performance_rating
	pipeline := decisionlib.PipelineAST{
		Steps: []decisionlib.Step{
			{
				Op:         decisionlib.OpCompute,
				Property:   "adjusted_salary",
				Expression: "base_salary * performance_rating",
			},
		},
	}

	result, _ := decisionlib.Run(data, pipeline)

	fmt.Println("=== Example 3: Compute Operation ===")
	fmt.Println("Adjusted salaries:")
	for _, emp := range result {
		fmt.Printf("%s: $%.0f\n", emp["name"], emp["adjusted_salary"])
	}
	fmt.Println()
}

// Example 4: Sort operation
func Example4_Sorting() {
	data := []decisionlib.Row{
		{"country": "Brazil", "gdp": 1800.0},
		{"country": "Germany", "gdp": 3800.0},
		{"country": "Japan", "gdp": 4200.0},
		{"country": "USA", "gdp": 23300.0},
	}

	// Sort by GDP descending
	pipeline := decisionlib.PipelineAST{
		Steps: []decisionlib.Step{
			{
				Op:        decisionlib.OpSort,
				Property:  "gdp",
				Direction: "desc",
			},
		},
	}

	result, _ := decisionlib.Run(data, pipeline)

	fmt.Println("=== Example 4: Sort Operation ===")
	fmt.Println("Countries by GDP (largest first):")
	for i, country := range result {
		fmt.Printf("%d. %s: $%.0f billion\n", i+1, country["country"], country["gdp"])
	}
	fmt.Println()
}

func main() {
	Example1_CompletePipeline()
	Example2_Filtering()
	Example3_Computing()
	Example4_Sorting()
}
