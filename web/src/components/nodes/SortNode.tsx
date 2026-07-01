import { Handle, Position } from '@xyflow/react';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { useStrategyStore } from '../../stores/strategyStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  data: {
    label: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
}

export default function SortNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.sortBy || data.sortBy.trim() === '';

  return (
    <div
      onClick={() => selectNode(id)}
      className="w-56 rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-sm font-medium text-foreground">Sort</span>
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
        <div>
          <label className="text-xs font-medium text-muted-foreground">Sort By</label>
          <Input
            type="text"
            placeholder="score"
            value={data.sortBy || ''}
            onChange={(e) => updateNode(id, { ...data, sortBy: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className={`h-8 text-xs mt-1 bg-background border ${
              hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'
            }`}
          />
          {hasError && <p className="text-[10px] text-destructive mt-1">Sort property is required</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Direction</label>
          <select
            value={data.sortDirection || 'asc'}
            onChange={(e) =>
              updateNode(id, { ...data, sortDirection: e.target.value as 'asc' | 'desc' })
            }
            onClick={(e) => e.stopPropagation()}
            className="w-full h-8 px-2 mt-1 text-xs rounded-md bg-background border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
    </div>
  );
}
