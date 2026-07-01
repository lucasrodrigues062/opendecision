import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PipelineNode, PipelineEdge, Strategy, OperationType, CompiledPlan } from '../types';
import { compileStrategy } from '../utils/compiler';
import { v4 as uuidv4 } from 'uuid';

interface StrategyStore {
  // Current strategy
  strategy: Strategy | null;
  nodes: PipelineNode[];
  edges: PipelineEdge[];

  // UI state
  selectedNodeId: string | null;
  isDirty: boolean;

  // Actions
  createNewStrategy: (name: string, description: string) => void;
  loadStrategy: (strategy: Strategy) => void;
  updateStrategy: (name: string, description: string) => void;
  markPublished: (backendId: string) => void;
  addNode: (type: OperationType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setEdges: (edges: PipelineEdge[]) => void;
  setNodes: (nodes: PipelineNode[]) => void;
  getCompiledSteps: () => CompiledPlan;
  resetStrategy: () => void;
}

const nodeLabels: Record<OperationType, string> = {
  filter: 'Filter',
  compute: 'Compute',
  sort: 'Sort',
  sort_array: 'Sort Array',
  filter_array: 'Filter Array',
  delete_property: 'Delete Property',
  condition: 'Condition',
};

export const useStrategyStore = create<StrategyStore>()(
  devtools(
    persist(
      (set, get) => ({
        strategy: null,
        nodes: [],
        edges: [],
        selectedNodeId: null,
        isDirty: false,

        createNewStrategy: (name: string, description: string) => {
          const id = uuidv4();
          const newStrategy: Strategy = {
            id,
            name,
            description,
            nodes: [],
            edges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set({ strategy: newStrategy, nodes: [], edges: [], isDirty: false, selectedNodeId: null });
        },

        loadStrategy: (strategy: Strategy) => {
          set({
            strategy,
            nodes: strategy.nodes,
            edges: strategy.edges,
            isDirty: false,
            selectedNodeId: null,
          });
        },

        updateStrategy: (name: string, description: string) => {
          const { strategy } = get();
          if (!strategy) return;

          const updated = {
            ...strategy,
            name,
            description,
            updatedAt: new Date(),
          };
          set({ strategy: updated, isDirty: true });
        },

        markPublished: (backendId: string) => {
          const { strategy } = get();
          if (!strategy) return;

          set({
            strategy: { ...strategy, backendId, updatedAt: new Date() },
            isDirty: false,
          });
        },

        addNode: (type: OperationType, position: { x: number; y: number }) => {
          const { nodes } = get();
          const id = `${type}_${Date.now()}`;

          const newNode: PipelineNode = {
            id,
            type,
            position,
            data: {
              label: nodeLabels[type],
            },
          };

          set({ nodes: [...nodes, newNode], isDirty: true, selectedNodeId: id });
        },

        updateNode: (id: string, data: any) => {
          const { nodes } = get();
          set({
            nodes: nodes.map((node) => (node.id === id ? { ...node, data } : node)),
            isDirty: true,
          });
        },

        deleteNode: (id: string) => {
          const { nodes, edges } = get();
          set({
            nodes: nodes.filter((node) => node.id !== id),
            edges: edges.filter((edge) => edge.source !== id && edge.target !== id),
            isDirty: true,
            selectedNodeId: null,
          });
        },

        selectNode: (id: string | null) => {
          set({ selectedNodeId: id });
        },

        setEdges: (edges: PipelineEdge[]) => {
          set({ edges, isDirty: true });
        },

        setNodes: (nodes: PipelineNode[]) => {
          set({ nodes, isDirty: true });
        },

        getCompiledSteps: () => {
          const { nodes, edges } = get();
          return compileStrategy(nodes, edges);
        },

        resetStrategy: () => {
          set({
            strategy: null,
            nodes: [],
            edges: [],
            selectedNodeId: null,
            isDirty: false,
          });
        },
      }),
      {
        name: 'opendecision-strategy',
        partialize: (state) => ({
          strategy: state.strategy,
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    )
  )
);
