// Operation types (aligned with decisionlib backend)
export type OperationType = 'filter' | 'compute' | 'sort';

// Direction for sort operations
export type SortDirection = 'asc' | 'desc';

// A single operation step
export interface Step {
  op: OperationType;
  expression?: string;      // for filter and compute
  property?: string;        // for compute (target) and sort (key)
  direction?: SortDirection; // for sort
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
}

// Complete strategy in local storage
export interface Strategy {
  id: string;
  name: string;
  description: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// Payload sent to backend POST /pipelines
export interface StrategyPayload {
  name: string;
  description: string;
  steps: Step[];
}

// Response from backend when getting strategy
export interface StrategyResponse {
  id: string;
  name: string;
  description: string;
  steps: Step[];
  created_at: string;
  updated_at: string;
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
