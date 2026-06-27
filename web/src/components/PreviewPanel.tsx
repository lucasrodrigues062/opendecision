import { useStrategyStore } from '../stores/strategyStore';

export default function PreviewPanel() {
  const { getCompiledSteps } = useStrategyStore();

  let steps;
  try {
    steps = getCompiledSteps();
  } catch (error) {
    steps = null;
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">JSON Preview</h3>
      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-64">
        {steps ? (
          <pre>{JSON.stringify(steps, null, 2)}</pre>
        ) : (
          <div className="text-gray-400">Create nodes to see JSON</div>
        )}
      </div>
    </div>
  );
}
