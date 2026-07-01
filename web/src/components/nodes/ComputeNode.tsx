import { Handle, Position } from '@xyflow/react';
import { Calculator, Trash2 } from 'lucide-react';
import { useStrategyStore } from '../../stores/strategyStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  data: {
    label: string;
    property?: string;
    computeExpr?: string;
  };
}

export default function ComputeNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const propertyError = !data.property || data.property.trim() === '';
  const exprError = !data.computeExpr || data.computeExpr.trim() === '';

  return (
    <div
      onClick={() => selectNode(id)}
      className="w-56 rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-foreground">Compute</span>
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
          <label className="text-xs font-medium text-muted-foreground">Property</label>
          <Input
            type="text"
            placeholder="newScore"
            value={data.property || ''}
            onChange={(e) => updateNode(id, { ...data, property: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className={`h-8 text-xs mt-1 bg-background border ${
              propertyError
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border'
            }`}
          />
          {propertyError && <p className="text-[10px] text-destructive mt-1">Property is required</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Expression</label>
          <Input
            type="text"
            placeholder="score * 2"
            value={data.computeExpr || ''}
            onChange={(e) => updateNode(id, { ...data, computeExpr: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className={`h-8 text-xs mt-1 bg-background border ${
              exprError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'
            }`}
          />
          {exprError && <p className="text-[10px] text-destructive mt-1">Expression is required</p>}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-emerald-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400" />
    </div>
  );
}
