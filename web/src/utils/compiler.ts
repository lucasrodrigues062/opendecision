import type { PipelineNode, PipelineEdge, Step } from '../types';

/**
 * Compiles a graph (nodes + edges) into an ordered sequence of steps.
 * Validates node data and builds the execution plan.
 */
export function compileStrategy(nodes: PipelineNode[], edges: PipelineEdge[]): Step[] {
  if (nodes.length === 0) {
    return [];
  }

  // Build adjacency map for topological sort
  const adjacencyMap = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach((node) => {
    adjacencyMap.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build edges
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
