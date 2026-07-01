import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type NodeChange,
  type EdgeChange,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStrategyStore } from '../stores/strategyStore';
import type { PipelineNode, PipelineEdge } from '../types';
import FilterNode from './nodes/FilterNode';
import ComputeNode from './nodes/ComputeNode';
import SortNode from './nodes/SortNode';
import SortArrayNode from './nodes/SortArrayNode';
import FilterArrayNode from './nodes/FilterArrayNode';
import DeletePropertyNode from './nodes/DeletePropertyNode';
import ConditionNode from './nodes/ConditionNode';

const nodeTypes = {
  filter: FilterNode,
  compute: ComputeNode,
  sort: SortNode,
  sort_array: SortArrayNode,
  filter_array: FilterArrayNode,
  delete_property: DeletePropertyNode,
  condition: ConditionNode,
};

// Custom edge that shows a label (used for condition true/false branches).
function LabeledEdge({ id, sourceX, sourceY, targetX, targetY, label, markerEnd }: any) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%)`,
              left: (sourceX + targetX) / 2,
              top: (sourceY + targetY) / 2,
              background: '#1e293b',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              color: label === 'true' ? '#34d399' : '#f87171',
              border: '1px solid #334155',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = {
  labeled: LabeledEdge,
};

export default function EditorCanvas() {
  const { nodes, edges, setNodes, setEdges, selectNode } = useStrategyStore();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      let next = [...nodes];

      changes.forEach((change) => {
        if (change.type === 'position') {
          next = next.map((n) =>
            n.id === change.id ? { ...n, position: change.position ?? n.position } : n
          );
        } else if (change.type === 'remove') {
          next = next.filter((n) => n.id !== change.id);
        } else if (change.type === 'select') {
          selectNode(change.selected ? change.id : null);
        }
      });

      setNodes(next as PipelineNode[]);
    },
    [nodes, setNodes, selectNode]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      let next = [...edges];

      changes.forEach((change) => {
        if (change.type === 'remove') {
          next = next.filter((e) => e.id !== change.id);
        }
      });

      setEdges(next as PipelineEdge[]);
    },
    [edges, setEdges]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const isConditionSource = sourceNode?.type === 'condition';

      const newEdge: PipelineEdge = {
        id: `e_${connection.source}-${connection.sourceHandle || 'out'}_${connection.target}-${connection.targetHandle || 'in'}`,
        source: connection.source!,
        target: connection.target!,
        label: isConditionSource ? connection.sourceHandle || 'true' : undefined,
      };

      const newEdges = addEdge(newEdge as unknown as Edge, edges as unknown as Edge[]);
      setEdges(newEdges as unknown as PipelineEdge[]);
    },
    [edges, setEdges, nodes]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: { id: string }) => {
    selectNode(node.id);
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes as any}
        edges={edges.map((e) => ({
          ...e,
          type: e.label ? 'labeled' : 'default',
          markerEnd: { type: 'arrowclosed' },
        }))}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Background gap={20} size={1} color="hsl(215 20% 22%)" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              filter: '#3b82f6',
              compute: '#10b981',
              sort: '#a855f7',
              sort_array: '#f97316',
              filter_array: '#06b6d4',
              delete_property: '#ef4444',
              condition: '#eab308',
            };
            return colors[node.type || ''] || '#64748b';
          }}
          maskColor="rgba(2, 6, 23, 0.6)"
          className="!bg-card !border-border !rounded-md"
        />
      </ReactFlow>
    </div>
  );
}
