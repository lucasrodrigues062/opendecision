package decisionlib

// GraphNodeType represents the type of a node in the execution graph.
type GraphNodeType string

const (
	// GraphNodeStart is the single entry point of a graph.
	GraphNodeStart GraphNodeType = "start"

	// GraphNodeEnd is the single exit point of a graph.
	GraphNodeEnd GraphNodeType = "end"

	// GraphNodeOperation executes a Step against the data.
	GraphNodeOperation GraphNodeType = "operation"

	// GraphNodeCondition branches execution based on a boolean expression.
	GraphNodeCondition GraphNodeType = "condition"
)

// GraphNode represents a single node in the execution graph.
type GraphNode struct {
	// ID is the unique identifier of the node.
	ID string `json:"id"`

	// Type determines how the node behaves during execution.
	Type GraphNodeType `json:"type"`

	// Label is a human-readable name for the node.
	Label string `json:"label,omitempty"`

	// Step is the operation configuration for operation nodes.
	// Ignored for start/end/condition nodes.
	Step *Step `json:"step,omitempty"`

	// Expression is the boolean expression for condition nodes.
	// Ignored for other node types.
	Expression string `json:"expression,omitempty"`
}

// GraphEdge represents a connection between two nodes.
type GraphEdge struct {
	// ID is the unique identifier of the edge.
	ID string `json:"id"`

	// Source is the ID of the originating node.
	Source string `json:"source"`

	// Target is the ID of the destination node.
	Target string `json:"target"`

	// SourcePort identifies which output port of the source node is used.
	// For condition nodes, valid values are "true" and "false".
	// For operation/start/end nodes, the default port is "".
	SourcePort string `json:"source_port,omitempty"`

	// TargetPort identifies which input port of the target node is used.
	// Currently unused but reserved for future multi-input nodes.
	TargetPort string `json:"target_port,omitempty"`

	// Label is an optional human-readable label for the edge.
	Label string `json:"label,omitempty"`
}

// Graph is the full execution graph.
type Graph struct {
	// Nodes is the collection of nodes in the graph.
	Nodes []GraphNode `json:"nodes"`

	// Edges is the collection of connections between nodes.
	Edges []GraphEdge `json:"edges"`
}

// FindNode returns the node with the given ID, or nil if not found.
func (g *Graph) FindNode(id string) *GraphNode {
	for i := range g.Nodes {
		if g.Nodes[i].ID == id {
			return &g.Nodes[i]
		}
	}
	return nil
}

// OutgoingEdges returns all edges that originate from the given node.
func (g *Graph) OutgoingEdges(nodeID string) []GraphEdge {
	var out []GraphEdge
	for _, e := range g.Edges {
		if e.Source == nodeID {
			out = append(out, e)
		}
	}
	return out
}

// IncomingEdges returns all edges that target the given node.
func (g *Graph) IncomingEdges(nodeID string) []GraphEdge {
	var in []GraphEdge
	for _, e := range g.Edges {
		if e.Target == nodeID {
			in = append(in, e)
		}
	}
	return in
}
