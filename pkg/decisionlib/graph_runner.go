package decisionlib

import "fmt"

// RunGraph executes a decision graph against a data array.
//
// The graph must be a valid DAG. Execution starts at the single "start" node,
// follows edges according to port labels, applies operations, and returns when
// it reaches an "end" node.
//
// For performance, if the graph is equivalent to a linear pipeline (no condition
// nodes and exactly one output edge per node), it is converted to a PipelineAST
// and executed via Run, avoiding any graph traversal overhead.
func RunGraph(data []Row, graph Graph) ([]Row, error) {
	if err := ValidateGraph(graph); err != nil {
		return nil, err
	}

	// Fast path: linear graphs run through the optimized pipeline runner.
	if isLinearGraph(graph) {
		ast, err := graphToPipelineAST(graph)
		if err != nil {
			return nil, err
		}
		return Run(data, ast)
	}

	// General graph execution.
	return executeGraph(data, graph)
}

// isLinearGraph returns true if the graph has no condition nodes and each
// operation/start node has exactly one outgoing edge.
func isLinearGraph(graph Graph) bool {
	outDegree := make(map[string]int)
	for _, e := range graph.Edges {
		outDegree[e.Source]++
	}

	for _, n := range graph.Nodes {
		switch n.Type {
		case GraphNodeCondition:
			return false
		case GraphNodeStart, GraphNodeOperation:
			if outDegree[n.ID] != 1 {
				return false
			}
		case GraphNodeEnd:
			if outDegree[n.ID] != 0 {
				return false
			}
		}
	}

	return true
}

// graphToPipelineAST converts a linear graph to a PipelineAST.
func graphToPipelineAST(graph Graph) (PipelineAST, error) {
	nodeMap := make(map[string]GraphNode)
	for _, n := range graph.Nodes {
		nodeMap[n.ID] = n
	}

	// Find start node.
	var currentID string
	for _, n := range graph.Nodes {
		if n.Type == GraphNodeStart {
			currentID = n.ID
			break
		}
	}

	outgoing := make(map[string][]GraphEdge)
	for _, e := range graph.Edges {
		outgoing[e.Source] = append(outgoing[e.Source], e)
	}

	var steps []Step
	for currentID != "" {
		node := nodeMap[currentID]
		switch node.Type {
		case GraphNodeStart:
			// no-op
		case GraphNodeOperation:
			if node.Step == nil {
				return PipelineAST{}, fmt.Errorf("operation node %s has no step", node.ID)
			}
			steps = append(steps, *node.Step)
		case GraphNodeEnd:
			return PipelineAST{Steps: steps}, nil
		}

		edges := outgoing[currentID]
		if len(edges) == 0 {
			return PipelineAST{Steps: steps}, nil
		}
		currentID = edges[0].Target
	}

	return PipelineAST{Steps: steps}, nil
}

// executeGraph runs a non-linear graph node by node.
func executeGraph(data []Row, graph Graph) ([]Row, error) {
	nodeMap := make(map[string]GraphNode)
	for _, n := range graph.Nodes {
		nodeMap[n.ID] = n
	}

	outgoing := make(map[string][]GraphEdge)
	for _, e := range graph.Edges {
		outgoing[e.Source] = append(outgoing[e.Source], e)
	}

	// Find start node.
	var currentID string
	for _, n := range graph.Nodes {
		if n.Type == GraphNodeStart {
			currentID = n.ID
			break
		}
	}

	current := data
	visited := make(map[string]int)
	maxVisits := len(graph.Nodes) + 1

	for currentID != "" {
		visited[currentID]++
		if visited[currentID] > maxVisits {
			return nil, fmt.Errorf("graph execution exceeded maximum visits, possible cycle")
		}

		node := nodeMap[currentID]

		switch node.Type {
		case GraphNodeStart:
			// no-op

		case GraphNodeEnd:
			return current, nil

		case GraphNodeOperation:
			if node.Step == nil {
				return nil, fmt.Errorf("operation node %s has no step", node.ID)
			}
			result, err := executeStep(current, *node.Step)
			if err != nil {
				return nil, fmt.Errorf("node %s: %w", node.ID, err)
			}
			current = result

		case GraphNodeCondition:
			if node.Expression == "" {
				return nil, fmt.Errorf("condition node %s has no expression", node.ID)
			}
			port, err := evaluateCondition(current, node.Expression)
			if err != nil {
				return nil, fmt.Errorf("node %s: %w", node.ID, err)
			}
			nextID := pickNextByPort(outgoing[currentID], port)
			if nextID == "" {
				return nil, fmt.Errorf("condition node %s has no %s edge", node.ID, port)
			}
			currentID = nextID
			continue
		}

		edges := outgoing[currentID]
		if len(edges) == 0 {
			return current, nil
		}
		currentID = edges[0].Target
	}

	return current, nil
}

// executeStep runs a single step against the current data.
func executeStep(data []Row, step Step) ([]Row, error) {
	switch step.Op {
	case OpFilter:
		return applyFilter(data, step.Expression)
	case OpCompute:
		return applyCompute(data, step.Property, step.Expression)
	case OpSort:
		return applySort(data, step.Property, step.Direction)
	case OpSortArray:
		return applySortArray(data, step.Property, step.SortBy, step.Direction)
	case OpFilterArray:
		return applyFilterArray(data, step.Property, step.Expression)
	case OpDeleteProperty:
		return applyDeleteProperty(data, step.Property)
	default:
		return nil, ErrUnknownOp
	}
}

// evaluateCondition evaluates a condition expression against the first row.
// The condition is considered true if the expression evaluates to true for the
// first row, or if there are no rows and the expression is "true".
func evaluateCondition(data []Row, expression string) (string, error) {
	eval, err := NewEvaluator(expression)
	if err != nil {
		return "", err
	}

	if len(data) == 0 {
		// No data to evaluate; default to false branch.
		return "false", nil
	}

	result, err := eval.Run(data[0])
	if err != nil {
		return "", err
	}

	shouldTakeTrue, ok := result.(bool)
	if !ok {
		return "", fmt.Errorf("condition expression must return bool, got %T", result)
	}

	if shouldTakeTrue {
		return "true", nil
	}
	return "false", nil
}

// pickNextByPort selects the edge whose SourcePort matches the given port.
// Falls back to an unlabeled edge if no exact match is found.
func pickNextByPort(edges []GraphEdge, port string) string {
	for _, e := range edges {
		if e.SourcePort == port {
			return e.Target
		}
	}
	for _, e := range edges {
		if e.SourcePort == "" {
			return e.Target
		}
	}
	return ""
}
