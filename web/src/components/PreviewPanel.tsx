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
    <div className="space-y-3">
      <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 overflow-auto max-h-96">
        {steps ? (
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(steps, null, 2)}
          </pre>
        ) : (
          <div className="text-slate-500 text-sm text-center py-8">
            Create nodes to see compiled JSON
          </div>
        )}
      </div>
    </div>
  );
}
