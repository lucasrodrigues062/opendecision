import { useEffect, useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { StrategyResponse } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenModal({ isOpen, onClose }: Props) {
  const { loadStrategy } = useStrategyStore();
  const [strategies, setStrategies] = useState<StrategyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen]);

  const fetchStrategies = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.listStrategies();
      setStrategies(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (strategy: StrategyResponse) => {
    loadStrategy({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      nodes: [],
      edges: [],
      createdAt: new Date(strategy.created_at),
      updatedAt: new Date(strategy.updated_at),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Open Strategy</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="border-red-900/50 bg-red-950/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {loading && <div className="text-center py-8 text-slate-400">Loading...</div>}

          {!loading && strategies.length === 0 && !error && (
            <div className="text-center py-8 text-slate-500">No strategies yet</div>
          )}

          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => handleOpen(strategy)}
              className="w-full p-4 text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <div className="font-medium text-slate-100">{strategy.name}</div>
              <div className="text-sm text-slate-400">{strategy.description}</div>
              <div className="text-xs text-slate-500 mt-2">{new Date(strategy.created_at).toLocaleDateString()}</div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-100">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
