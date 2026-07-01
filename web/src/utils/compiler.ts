import type { PipelineNode, PipelineEdge, Step, ExecutionGraph, GraphNode, GraphEdge, CompiledPlan } from '../types';

/**
 * Compiles a graph (nodes + edges) into an execution plan.
 *
 * If the graph contains condition nodes, it returns a Graph payload.
 * Otherwise it returns a linear Steps payload for backward compatibility
 * and maximum performance on the backend.
 */
export function compileStrategy(
  nodes: PipelineNode[],
  edges: PipelineEdge[]
): CompiledPlan {
  if (nodes.length === 0) {
    return { steps: [] };
  }

  const hasCondition = nodes.some((n) => n.type === 'condition');
  if (hasCondition) {
    return { graph: compileGraph(nodes, edges) };
  }

  return { steps: compileSteps(nodes, edges) };
}

/**
 * Compiles a linear pipeline from nodes and edges.
 */
function compileSteps(nodes: PipelineNode[], edges: PipelineEdge[]): Step[] {
  // Build adjacency map for topological sort
  const adjacencyMap = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacencyMap.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    adjacencyMap.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  const sorted: string[] = [];

  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sorted.push(nodeId);

    adjacencyMap.get(nodeId)?.forEach((neighbor) => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (sorted.length !== nodes.length) {
    throw new Error('Cycle detected in pipeline graph');
  }

  // Build steps from sorted nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const steps: Step[] = [];

  sorted.forEach((nodeId) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const step = nodeToStep(node);
    if (step) {
      steps.push(step);
    }
  });

  return steps;
}

/**
 * Compiles an execution graph from nodes and edges.
 */
function compileGraph(nodes: PipelineNode[], edges: PipelineEdge[]): ExecutionGraph {
  const graphNodes: GraphNode[] = [
    { id: 'start', type: 'start', label: 'Start' },
  ];

  const graphEdges: GraphEdge[] = [];

  nodes.forEach((node) => {
    const step = nodeToStep(node);

    if (node.type === 'condition') {
      graphNodes.push({
        id: node.id,
        type: 'condition',
        label: node.data.label,
        expression: node.data.conditionExpression || '',
      });
    } else if (step) {
      graphNodes.push({
        id: node.id,
        type: 'operation',
        label: node.data.label,
        step,
      });
    }
  });

  graphNodes.push({ id: 'end', type: 'end', label: 'End' });

  // Connect start to root nodes (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map((e) => e.target));
  nodes.forEach((node) => {
    if (!hasIncoming.has(node.id)) {
      graphEdges.push({
        id: `e_start_${node.id}`,
        source: 'start',
        target: node.id,
      });
    }
  });

  // Connect user edges
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    graphEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      source_port: sourceNode?.type === 'condition' ? edge.label || 'true' : undefined,
      label: edge.label,
    });
  });

  // Connect leaf nodes to end
  const hasOutgoing = new Set(edges.map((e) => e.source));
  nodes.forEach((node) => {
    if (!hasOutgoing.has(node.id)) {
      graphEdges.push({
        id: `e_${node.id}_end`,
        source: node.id,
        target: 'end',
      });
    }
  });

  return { nodes: graphNodes, edges: graphEdges };
}

/**
 * Converts a single node to a step.
 */
function nodeToStep(node: PipelineNode): Step | null {
  const { type, data } = node;

  switch (type) {
    case 'filter':
      if (!data.expression) {
        throw new Error(`Filter node ${node.id} missing expression`);
      }
      return {
        op: 'filter',
        expression: data.expression,
      };

    case 'compute':
      if (!data.property || !data.computeExpr) {
        throw new Error(`Compute node ${node.id} missing property or expression`);
      }
      return {
        op: 'compute',
        property: data.property,
        expression: data.computeExpr,
      };

    case 'sort':
      if (!data.sortBy) {
        throw new Error(`Sort node ${node.id} missing sort property`);
      }
      return {
        op: 'sort',
        property: data.sortBy,
        direction: data.sortDirection || 'asc',
      };

    case 'sort_array':
      if (!data.arrayProperty || !data.arraySortBy) {
        throw new Error(`SortArray node ${node.id} missing array property or sort by`);
      }
      return {
        op: 'sort_array',
        property: data.arrayProperty,
        sort_by: data.arraySortBy,
        direction: data.arraySortDirection || 'asc',
      };

    case 'filter_array':
      if (!data.arrayFilterProperty || !data.arrayFilterExpression) {
        throw new Error(`FilterArray node ${node.id} missing array property or expression`);
      }
      return {
        op: 'filter_array',
        property: data.arrayFilterProperty,
        expression: data.arrayFilterExpression,
      };

    case 'delete_property':
      if (!data.deleteProperty) {
        throw new Error(`DeleteProperty node ${node.id} missing property`);
      }
      return {
        op: 'delete_property',
        property: data.deleteProperty,
      };

    case 'condition':
      // Condition nodes are handled by the graph compiler.
      return null;

    default:
      return null;
  }
}

/**
 * Validates a single step.
 */
export function validateStep(step: Step): { valid: boolean; error?: string } {
  switch (step.op) {
    case 'filter':
      if (!step.expression) {
        return { valid: false, error: 'Filter expression is required' };
      }
      if (!isValidExpression(step.expression)) {
        return { valid: false, error: 'Invalid filter expression' };
      }
      return { valid: true };

    case 'compute':
      if (!step.property) {
        return { valid: false, error: 'Property is required' };
      }
      if (!step.expression) {
        return { valid: false, error: 'Expression is required' };
      }
      if (!isValidExpression(step.expression)) {
        return { valid: false, error: 'Invalid compute expression' };
      }
      return { valid: true };

    case 'sort':
      if (!step.property) {
        return { valid: false, error: 'Sort property is required' };
      }
      if (!['asc', 'desc'].includes(step.direction || 'asc')) {
        return { valid: false, error: 'Direction must be asc or desc' };
      }
      return { valid: true };

    case 'sort_array':
      if (!step.property) {
        return { valid: false, error: 'Array property is required' };
      }
      if (!step.sort_by) {
        return { valid: false, error: 'Sort by property is required' };
      }
      return { valid: true };

    case 'filter_array':
      if (!step.property) {
        return { valid: false, error: 'Array property is required' };
      }
      if (!step.expression) {
        return { valid: false, error: 'Filter expression is required' };
      }
      return { valid: true };

    case 'delete_property':
      if (!step.property) {
        return { valid: false, error: 'Property to delete is required' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown operation type' };
  }
}

/**
 * Basic validation of expression syntax.
 * Checks for balanced parentheses and basic structure.
 */
function isValidExpression(expr: string): boolean {
  if (!expr || expr.trim() === '') {
    return false;
  }

  // Check balanced parentheses
  let parenCount = 0;
  for (const char of expr) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) return false;
  }

  return parenCount === 0;
}
