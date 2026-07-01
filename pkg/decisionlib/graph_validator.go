package decisionlib

import "fmt"

// ValidateGraph checks that a graph is well-formed and ready for execution.
func ValidateGraph(graph Graph) error {
	if len(graph.Nodes) == 0 {
		return fmt.Errorf("graph has no nodes")
	}

	nodeMap := make(map[string]struct{})
	var startCount, endCount int

	for _, n := range graph.Nodes {
		if n.ID == "" {
			return fmt.Errorf("node has empty id")
		}
		if _, exists := nodeMap[n.ID]; exists {
			return fmt.Errorf("duplicate node id: %s", n.ID)
		}
		nodeMap[n.ID] = struct{}{}

		switch n.Type {
		case GraphNodeStart:
			startCount++
		case GraphNodeEnd:
			endCount++
		case GraphNodeOperation, GraphNodeCondition:
			// valid
		default:
			return fmt.Errorf("node %s has unknown type: %s", n.ID, n.Type)
		}
	}

	if startCount != 1 {
		return fmt.Errorf("graph must have exactly one start node, found %d", startCount)
	}
	if endCount != 1 {
		return fmt.Errorf("graph must have exactly one end node, found %d", endCount)
	}

	edgeMap := make(map[string]struct{})
	for _, e := range graph.Edges {
		if e.ID == "" {
			return fmt.Errorf("edge has empty id")
		}
		if _, exists := edgeMap[e.ID]; exists {
			return fmt.Errorf("duplicate edge id: %s", e.ID)
		}
		edgeMap[e.ID] = struct{}{}

		if _, exists := nodeMap[e.Source]; !exists {
			return fmt.Errorf("edge %s references unknown source node: %s", e.ID, e.Source)
		}
		if _, exists := nodeMap[e.Target]; !exists {
			return fmt.Errorf("edge %s references unknown target node: %s", e.ID, e.Target)
		}
	}

	if hasCycle(graph) {
		return fmt.Errorf("graph contains a cycle")
	}

	return nil
}

// hasCycle detects cycles in the graph using DFS.
func hasCycle(graph Graph) bool {
	adj := make(map[string][]string)
	for _, e := range graph.Edges {
		adj[e.Source] = append(adj[e.Source], e.Target)
	}

	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	var dfs func(string) bool
	dfs = func(node string) bool {
		visited[node] = true
		recStack[node] = true

		for _, neighbor := range adj[node] {
			if !visited[neighbor] {
				if dfs(neighbor) {
					return true
				}
			} else if recStack[neighbor] {
				return true
			}
		}

		recStack[node] = false
		return false
	}

	for _, n := range graph.Nodes {
		if !visited[n.ID] {
			if dfs(n.ID) {
				return true
			}
		}
	}

	return false
}
