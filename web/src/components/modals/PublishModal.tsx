import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PublishModal({ isOpen, onClose, onSuccess }: Props) {
  const { strategy, getCompiledSteps } = useStrategyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!strategy) return;

    setLoading(true);
    setError(null);

    try {
      const steps = getCompiledSteps();

      if (strategy.id && strategy.id.startsWith('temp_')) {
        await api.publishStrategy({
          name: strategy.name,
          description: strategy.description,
          steps,
        });
      } else {
        await api.updateStrategy(strategy.id, {
          name: strategy.name,
          description: strategy.description,
          steps,
        });
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
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Publish Strategy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold">Name:</span> {strategy?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold">Description:</span> {strategy?.description || '(none)'}
            </p>
          </div>
        </div>

        {error && (
          <Alert className="border-red-900/50 bg-red-950/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-600 text-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
