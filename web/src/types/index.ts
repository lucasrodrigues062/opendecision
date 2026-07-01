// Operation types (aligned with decisionlib backend)
export type OperationType =
  | 'filter'
  | 'compute'
  | 'sort'
  | 'sort_array'
  | 'filter_array'
  | 'delete_property'
  | 'transform'
  | 'aggregate'
  | 'group_by'
  | 'distinct'
  | 'condition';

// Direction for sort operations
export type SortDirection = 'asc' | 'desc';

// A single operation step (linear pipeline)
// Fields use snake_case to match the Go backend JSON tags.
export interface Step {
  op: OperationType;
  expression?: string; // for filter, compute, filter_array and transform
  property?: string; // for compute, sort, sort_array, filter_array, delete_property, group_by, distinct
  sort_by?: string; // for sort_array
  direction?: SortDirection; // for sort and sort_array
  agg?: 'sum' | 'avg' | 'count' | 'min' | 'max'; // for aggregate
  result_property?: string; // for aggregate
}

// Graph node types (matching decisionlib backend)
export type GraphNodeType = 'start' | 'end' | 'operation' | 'condition';

// A node in the execution graph
export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label?: string;
  step?: Step;
  expression?: string; // for condition nodes
  mode?: 'global' | 'per_row'; // for condition nodes
}

// An edge in the execution graph
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  source_port?: string; // 'true' | 'false' for condition branches
  target_port?: string;
  label?: string;
}

// Execution graph payload
export interface ExecutionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Node data stored in React Flow
export interface NodeData {
  label: string;

  // Filter specific
  expression?: string;

  // Compute specific
  property?: string;
  computeExpr?: string;

  // Sort specific
  sortBy?: string;
  sortDirection?: SortDirection;

  // Sort array specific
  arrayProperty?: string;
  arraySortBy?: string;
  arraySortDirection?: SortDirection;

  // Filter array specific
  arrayFilterProperty?: string;
  arrayFilterExpression?: string;

  // Delete property specific
  deleteProperty?: string;

  // Transform specific
  transformExpression?: string;

  // Aggregate specific
  aggregateFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  aggregateProperty?: string;
  aggregateResultProperty?: string;

  // Group by specific
  groupByProperty?: string;

  // Distinct specific
  distinctProperty?: string;

  // Condition specific
  conditionExpression?: string;
  conditionMode?: 'global' | 'per_row';

  // UI state
  isValid?: boolean;
  errorMessage?: string;
}

// React Flow Node
export interface PipelineNode {
  id: string;
  type: OperationType;
  position: { x: number; y: number };
  data: NodeData;
}

// React Flow Edge
export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Complete strategy in local storage
export interface Strategy {
  id: string;
  name: string;
  description: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  backendId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payload sent to backend POST /pipelines
export interface StrategyPayload {
  name: string;
  description: string;
  steps?: Step[];
  graph?: ExecutionGraph;
  nodes?: PipelineNode[];
  edges?: PipelineEdge[];
}

// Response from backend when getting strategy
export interface StrategyResponse {
  id: string;
  name: string;
  description: string;
  steps?: Step[];
  graph?: ExecutionGraph;
  nodes?: PipelineNode[];
  edges?: PipelineEdge[];
  created_at: string;
  updated_at: string;
}

// Compiled strategy without input data (used for preview/publish)
export type CompiledPlan =
  | { steps: Step[]; graph?: never }
  | { steps?: never; graph: ExecutionGraph };

// Execution request payload
export interface ExecutionRequest {
  data: Record<string, any>[];
  steps?: Step[];
  graph?: ExecutionGraph;
}

// Execution result from backend
export interface ExecutionResult {
  result: Record<string, any>[];
  elapsed_ms: number;
  error?: string;
}

// Backend API error response
export interface ApiError {
  error: string;
  details?: string;
}
