import { useStrategyStore } from '../stores/strategyStore';
import { Button } from '@/components/ui/button';
import { Filter, Calculator, ArrowUpDown } from 'lucide-react';

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
    <div className="space-y-3">
      <Button
        draggable
        onDragStart={(e) => handleDragStart(e, 'filter')}
        onClick={() => addNodeAtCenter('filter')}
        variant="outline"
        className="w-full bg-blue-950/30 hover:bg-blue-900/50 border-blue-700/50 text-blue-300 hover:text-blue-100 cursor-grab active:cursor-grabbing"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
      <Button
        draggable
        onDragStart={(e) => handleDragStart(e, 'compute')}
        onClick={() => addNodeAtCenter('compute')}
        variant="outline"
        className="w-full bg-green-950/30 hover:bg-green-900/50 border-green-700/50 text-green-300 hover:text-green-100 cursor-grab active:cursor-grabbing"
      >
        <Calculator className="w-4 h-4 mr-2" />
        Compute
      </Button>
      <Button
        draggable
        onDragStart={(e) => handleDragStart(e, 'sort')}
        onClick={() => addNodeAtCenter('sort')}
        variant="outline"
        className="w-full bg-purple-950/30 hover:bg-purple-900/50 border-purple-700/50 text-purple-300 hover:text-purple-100 cursor-grab active:cursor-grabbing"
      >
        <ArrowUpDown className="w-4 h-4 mr-2" />
        Sort
      </Button>
    </div>
  );
}
