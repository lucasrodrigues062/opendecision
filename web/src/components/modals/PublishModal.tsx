import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';

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
        // New strategy
        await api.publishStrategy({
          name: strategy.name,
          description: strategy.description,
          steps,
        });
      } else {
        // Update existing
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Publish Strategy</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">
            <strong>Name:</strong> {strategy?.name}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <strong>Description:</strong> {strategy?.description || '(none)'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
