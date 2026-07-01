import { Handle, Position } from '@xyflow/react';
import { Filter, Trash2 } from 'lucide-react';
import { useStrategyStore } from '../../stores/strategyStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  data: {
    label: string;
    expression?: string;
  };
}

export default function FilterNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.expression || data.expression.trim() === '';

  return (
    <div
      onClick={() => selectNode(id)}
      className="w-56 rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-blue-500/10 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-foreground">Filter</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Expression</label>
        <Input
          type="text"
          placeholder="age >= 30"
          value={data.expression || ''}
          onChange={(e) => updateNode(id, { ...data, expression: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={`h-8 text-xs bg-background border ${
            hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'
          }`}
        />
        {hasError && <p className="text-[10px] text-destructive">Expression is required</p>}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}
