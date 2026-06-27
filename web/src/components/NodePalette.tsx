import { useStrategyStore } from '../stores/strategyStore';

export default function NodePalette() {
  const { addNode } = useStrategyStore();

  const handleDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', type);
  };

  const addNodeAtCenter = (type: 'filter' | 'compute' | 'sort') => {
    addNode(type, { x: Math.random() * 300, y: Math.random() * 300 });
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">Operations</h3>
      <div className="space-y-2">
        <button
          draggable
          onDragStart={(e) => handleDragStart(e, 'filter')}
          onClick={() => addNodeAtCenter('filter')}
          className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm font-medium text-blue-700 transition flex items-center gap-2 cursor-grab active:cursor-grabbing"
        >
          <span>🔍</span> Filter
        </button>
        <button
          draggable
          onDragStart={(e) => handleDragStart(e, 'compute')}
          onClick={() => addNodeAtCenter('compute')}
          className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded text-sm font-medium text-green-700 transition flex items-center gap-2 cursor-grab active:cursor-grabbing"
        >
          <span>🧮</span> Compute
        </button>
        <button
          draggable
          onDragStart={(e) => handleDragStart(e, 'sort')}
          onClick={() => addNodeAtCenter('sort')}
          className="w-full px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-sm font-medium text-purple-700 transition flex items-center gap-2 cursor-grab active:cursor-grabbing"
        >
          <span>↕️</span> Sort
        </button>
      </div>
    </div>
  );
}
