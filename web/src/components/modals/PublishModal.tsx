import { useState } from 'react';
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
import { Rocket, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PublishModal({ isOpen, onClose, onSuccess }: Props) {
  const { strategy, nodes, edges, getCompiledSteps, markPublished } = useStrategyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!strategy) return;

    setLoading(true);
    setError(null);

    try {
      const steps = getCompiledSteps();
      const payload = {
        name: strategy.name,
        description: strategy.description,
        steps,
        nodes,
        edges,
      };

      if (strategy.backendId) {
        await api.updateStrategy(strategy.backendId, payload);
      } else {
        const response = await api.publishStrategy(payload);
        markPublished(response.id);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-500" />
            </div>
            <DialogTitle>Publish Strategy</DialogTitle>
          </div>
        </DialogHeader>

        <Card className="border-border bg-card">
          <CardContent className="space-y-3 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground text-right">{strategy?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Description</span>
              <span className="text-foreground text-right">
                {strategy?.description || '(none)'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground">
                {strategy?.backendId ? 'Update existing' : 'Create new'}
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive/90 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Publishing...' : strategy?.backendId ? 'Update' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
