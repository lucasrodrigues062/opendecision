import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import type { ExecutionResult } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestModal({ isOpen, onClose }: Props) {
  const { getCompiledSteps } = useStrategyStore();
  const [testData, setTestData] = useState('[]');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = JSON.parse(testData);
      const steps = getCompiledSteps();

      const execResult = await api.executeStrategy(steps, data);
      setResult(execResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Strategy</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Data (JSON)</label>
            <textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded font-mono text-xs focus:outline-none focus:border-blue-500"
              placeholder='[{"score": 80}, {"score": 60}]'
            />
          </div>

          {/* Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
            <div className="w-full h-48 px-3 py-2 border border-gray-300 rounded bg-gray-900 text-green-400 font-mono text-xs overflow-auto">
              {result ? <pre>{JSON.stringify(result.result, null, 2)}</pre> : <span className="text-gray-500">Run to see result...</span>}
            </div>
          </div>
        </div>

        {result && <div className="mb-4 text-sm text-gray-700">⏱️ Executed in {result.elapsed_ms.toFixed(2)}ms</div>}

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Execute'}
          </button>
        </div>
      </div>
    </div>
  );
}
