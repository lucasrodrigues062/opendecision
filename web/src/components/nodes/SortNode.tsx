import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useStrategyStore } from '../../stores/strategyStore';

export default function SortNode({ data, id }: any) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();

  return (
    <div
      onClick={() => selectNode(id)}
      className="px-4 py-3 bg-white border-2 border-purple-400 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">↕️</span>
        <div className="font-semibold text-purple-700">Sort</div>
      </div>
      <input
        type="text"
        placeholder="property"
        value={data.sortBy || ''}
        onChange={(e) => updateNode(id, { ...data, sortBy: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="w-40 px-2 py-1 text-xs border border-gray-300 rounded mb-2 focus:outline-none focus:border-purple-500"
      />
      <select
        value={data.sortDirection || 'asc'}
        onChange={(e) => updateNode(id, { ...data, sortDirection: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="w-40 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-purple-500"
      >
        <option value="asc">ASC</option>
        <option value="desc">DESC</option>
      </select>
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
