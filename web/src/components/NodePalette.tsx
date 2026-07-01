import { useStrategyStore } from '../stores/strategyStore';
import { Filter, Calculator, ArrowUpDown } from 'lucide-react';

const operations = [
  {
    type: 'filter' as const,
    title: 'Filter',
    description: 'Keep only rows that match a condition.',
    icon: Filter,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20',
  },
  {
    type: 'compute' as const,
    title: 'Compute',
    description: 'Create or update a property on each row.',
    icon: Calculator,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  {
    type: 'sort' as const,
    title: 'Sort',
    description: 'Order rows by a property ascending or descending.',
    icon: ArrowUpDown,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20',
  },
];

export default function NodePalette() {
  const { addNode, nodes } = useStrategyStore();

  const handleAdd = (type: 'filter' | 'compute' | 'sort') => {
    const offset = nodes.length * 20;
    addNode(type, { x: 300 + offset, y: 200 + offset });
  };

  return (
    <div className="space-y-3">
      {operations.map((op) => {
        const Icon = op.icon;
        return (
          <button
            key={op.type}
            onClick={() => handleAdd(op.type)}
            className={`w-full text-left p-3 rounded-lg border transition group ${op.color}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-foreground">
                  {op.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {op.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}

      <div className="pt-2 text-xs text-muted-foreground leading-relaxed">
        Click an operation to add it to the canvas. Connect nodes top-to-bottom to define the
        execution order.
      </div>
    </div>
  );
}
