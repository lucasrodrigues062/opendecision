import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStrategyStore } from '../stores/strategyStore';
import FilterNode from './nodes/FilterNode';
import ComputeNode from './nodes/ComputeNode';
import SortNode from './nodes/SortNode';

const nodeTypes = {
  filter: FilterNode,
  compute: ComputeNode,
  sort: SortNode,
};

export default function EditorCanvas() {
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, selectNode } = useStrategyStore();

  const [nodes, , onNodesChange] = useNodesState(storeNodes as any);
  const [edges, setLocalEdges, onEdgesChange] = useEdgesState(storeEdges as any);

  // Sync with store on changes
  const handleNodesChange = (changes: any[]) => {
    onNodesChange(changes);
    setNodes(nodes as any);
    selectNode(null);
  };

  const handleEdgesChange = (changes: any[]) => {
    onEdgesChange(changes);
    setEdges(edges as any);
  };

  const handleConnect = (connection: Connection) => {
    const newEdges = addEdge(connection, edges);
    setLocalEdges(newEdges);
    setEdges(newEdges as any);
  };

  const handleNodeClick = (_event: any, node: any) => {
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
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
