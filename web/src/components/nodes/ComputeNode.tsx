import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStrategyStore } from '../../stores/strategyStore';

export default function ComputeNode({ data, id }: any) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();

  return (
    <div
      onClick={() => selectNode(id)}
      className="px-4 py-3 bg-white border-2 border-green-400 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🧮</span>
        <div className="font-semibold text-green-700">Compute</div>
      </div>
      <input
        type="text"
        placeholder="property"
        value={data.property || ''}
        onChange={(e) => updateNode(id, { ...data, property: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="w-40 px-2 py-1 text-xs border border-gray-300 rounded mb-2 focus:outline-none focus:border-green-500"
      />
      <input
        type="text"
        placeholder="score * 2"
        value={data.computeExpr || ''}
        onChange={(e) => updateNode(id, { ...data, computeExpr: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="w-40 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-green-500"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
      >
        <Trash2 size={16} />
      </button>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
