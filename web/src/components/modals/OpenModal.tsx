import { useEffect, useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, AlertCircle, Clock } from 'lucide-react';
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
      nodes: strategy.nodes || [],
      edges: strategy.edges || [],
      backendId: strategy.id,
      createdAt: new Date(strategy.created_at),
      updatedAt: new Date(strategy.updated_at),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>Open Strategy</DialogTitle>
          </div>
        </DialogHeader>

        {error && (
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive/90 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-h-[55vh] overflow-y-auto space-y-2">
          {loading && <div className="text-center py-8 text-muted-foreground">Loading...</div>}

          {!loading && strategies.length === 0 && !error && (
            <div className="text-center py-8 text-muted-foreground">No strategies yet</div>
          )}

          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="border-border bg-card hover:border-primary/50 cursor-pointer transition"
              onClick={() => handleOpen(strategy)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">{strategy.name}</h4>
                    {strategy.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{strategy.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
