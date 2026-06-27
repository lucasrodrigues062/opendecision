import { useEffect, useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Open Strategy</h2>

        {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

        {!loading && strategies.length === 0 && !error && <div className="text-center py-8 text-gray-500">No strategies yet</div>}

        <div className="space-y-2">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => handleOpen(strategy)}
              className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded transition"
            >
              <div className="font-medium text-gray-900">{strategy.name}</div>
              <div className="text-xs text-gray-500">{strategy.description}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(strategy.created_at).toLocaleDateString()}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
