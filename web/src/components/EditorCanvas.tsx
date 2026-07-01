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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStrategyStore } from '../stores/strategyStore';
import type { PipelineNode, PipelineEdge } from '../types';
import FilterNode from './nodes/FilterNode';
import ComputeNode from './nodes/ComputeNode';
import SortNode from './nodes/SortNode';

const nodeTypes = {
  filter: FilterNode,
  compute: ComputeNode,
  sort: SortNode,
};

export default function EditorCanvas() {
  const { nodes, edges, setNodes, setEdges, selectNode } = useStrategyStore();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply React Flow changes to the store nodes.
      // We use a simple manual application for position/selection/remove changes.
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
      const newEdges = addEdge(connection, edges as Edge[]);
      setEdges(newEdges as PipelineEdge[]);
    },
    [edges, setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: { id: string }) => {
    selectNode(node.id);
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes as any}
        edges={edges as any}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Background gap={20} size={1} color="hsl(215 20% 22%)" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'filter') return '#3b82f6';
            if (node.type === 'compute') return '#10b981';
            if (node.type === 'sort') return '#a855f7';
            return '#64748b';
          }}
          maskColor="rgba(2, 6, 23, 0.6)"
          className="!bg-card !border-border !rounded-md"
        />
      </ReactFlow>
    </div>
  );
}
