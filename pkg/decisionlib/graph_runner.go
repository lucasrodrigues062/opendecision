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

			if node.Mode == "per_row" {
				merged, nextID, err := executeConditionPerRow(current, graph, node.ID, outgoing, nodeMap)
				if err != nil {
					return nil, fmt.Errorf("node %s: %w", node.ID, err)
				}
				current = merged
				currentID = nextID
				continue
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

// executeConditionPerRow splits the dataset by evaluating the condition expression
// against each row, executes both branches, and merges the results preserving
// the original row order.
func executeConditionPerRow(
	data []Row,
	graph Graph,
	conditionID string,
	outgoing map[string][]GraphEdge,
	nodeMap map[string]GraphNode,
) ([]Row, string, error) {
	edges := outgoing[conditionID]
	trueNext := pickNextByPort(edges, "true")
	falseNext := pickNextByPort(edges, "false")

	if trueNext == "" || falseNext == "" {
		return nil, "", fmt.Errorf("condition node %s must have both true and false edges", conditionID)
	}

	mergeID := findMergePoint(graph, trueNext, falseNext)

	trueRows := make([]Row, 0, len(data))
	falseRows := make([]Row, 0, len(data))
	trueIndices := make([]int, 0, len(data))
	falseIndices := make([]int, 0, len(data))

	expr, err := NewEvaluator(nodeMap[conditionID].Expression)
	if err != nil {
		return nil, "", err
	}

	for i, row := range data {
		env := make(map[string]any, len(row)+4)
		for k, v := range row {
			env[k] = v
		}
		env["_count"] = len(data)
		env["_rows"] = data
		env["_first"] = data[0]
		env["_last"] = data[len(data)-1]

		result, err := expr.Run(env)
		if err != nil {
			return nil, "", fmt.Errorf("row %d: %w", i, err)
		}

		shouldTakeTrue, ok := result.(bool)
		if !ok {
			return nil, "", fmt.Errorf("row %d: condition expression must return bool, got %T", i, result)
		}

		if shouldTakeTrue {
			trueRows = append(trueRows, row)
			trueIndices = append(trueIndices, i)
		} else {
			falseRows = append(falseRows, row)
			falseIndices = append(falseIndices, i)
		}
	}

	trueResult, err := executeSubgraph(trueRows, graph, trueNext, mergeID, outgoing, nodeMap)
	if err != nil {
		return nil, "", fmt.Errorf("true branch: %w", err)
	}

	falseResult, err := executeSubgraph(falseRows, graph, falseNext, mergeID, outgoing, nodeMap)
	if err != nil {
		return nil, "", fmt.Errorf("false branch: %w", err)
	}

	merged := make([]Row, len(data))
	for i, idx := range trueIndices {
		if i < len(trueResult) {
			merged[idx] = trueResult[i]
		} else {
			merged[idx] = trueRows[i]
		}
	}
	for i, idx := range falseIndices {
		if i < len(falseResult) {
			merged[idx] = falseResult[i]
		} else {
			merged[idx] = falseRows[i]
		}
	}

	return merged, mergeID, nil
}

// executeSubgraph executes a graph from startID (inclusive) until stopID (exclusive)
// or until an end node is reached.
func executeSubgraph(
	data []Row,
	graph Graph,
	startID string,
	stopID string,
	outgoing map[string][]GraphEdge,
	nodeMap map[string]GraphNode,
) ([]Row, error) {
	currentID := startID
	current := data

	for currentID != "" && currentID != stopID {
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

// findMergePoint returns the first node reachable from both branch starts.
// If no common node exists, it returns "end".
func findMergePoint(graph Graph, branchA, branchB string) string {
	if branchA == branchB {
		return branchA
	}

	reachableA := reachableNodes(graph, branchA)
	reachableB := reachableNodes(graph, branchB)

	// Prefer the earliest common node in topological order.
	seen := make(map[string]bool)
	for _, id := range reachableA {
		seen[id] = true
	}
	for _, id := range reachableB {
		if seen[id] {
			return id
		}
	}

	return "end"
}

// reachableNodes returns all node IDs reachable from start in breadth-first order.
func reachableNodes(graph Graph, start string) []string {
	outgoing := make(map[string][]string)
	for _, e := range graph.Edges {
		outgoing[e.Source] = append(outgoing[e.Source], e.Target)
	}

	visited := make(map[string]bool)
	var order []string
	queue := []string{start}

	for len(queue) > 0 {
		id := queue[0]
		queue = queue[1:]

		if visited[id] {
			continue
		}
		visited[id] = true
		order = append(order, id)

		for _, next := range outgoing[id] {
			if !visited[next] {
				queue = append(queue, next)
			}
		}
	}

	return order
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

	case OpTransform:
		return applyTransform(data, step.Expression)

	case OpAggregate:
		return applyAggregate(data, step.Agg, step.Property, step.ResultProperty)

	case OpGroupBy:
		return applyGroupBy(data, step.Property)

	case OpDistinct:
		return applyDistinct(data, step.Property)

	default:
		return nil, ErrUnknownOp
	}
}

// evaluateCondition evaluates a condition expression against the first row,
// while also exposing dataset metadata:
//   - _count: number of rows in the dataset
//   - _rows: the full dataset
//   - _first: alias for the first row
//   - _last: alias for the last row
//
// This allows global conditions like "_count > 1" or "len(_rows) > 0".
func evaluateCondition(data []Row, expression string) (string, error) {
	eval, err := NewEvaluator(expression)
	if err != nil {
		return "", err
	}

	if len(data) == 0 {
		// No data to evaluate; default to false branch.
		return "false", nil
	}

	// Build an environment that merges the first row with dataset metadata.
	env := make(map[string]any, len(data[0])+4)
	for k, v := range data[0] {
		env[k] = v
	}
	env["_count"] = len(data)
	env["_rows"] = data
	env["_first"] = data[0]
	if len(data) > 0 {
		env["_last"] = data[len(data)-1]
	}

	result, err := eval.Run(env)
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
