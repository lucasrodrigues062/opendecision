import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Zap } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Test Strategy</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Input */}
          <div>
            <Label htmlFor="testData" className="text-slate-300 mb-2 block">Test Data (JSON)</Label>
            <textarea
              id="testData"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-full h-48 px-3 py-2 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder='[{"score": 80}, {"score": 60}]'
            />
          </div>

          {/* Output */}
          <div>
            <Label className="text-slate-300 mb-2 block">Result</Label>
            <div className="w-full h-48 px-3 py-2 border border-slate-700 rounded bg-slate-950/50 text-slate-300 font-mono text-xs overflow-auto">
              {result ? (
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result.result, null, 2)}</pre>
              ) : (
                <span className="text-slate-500">Run to see result...</span>
              )}
            </div>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 border border-slate-700 rounded p-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            Executed in {result.elapsed_ms.toFixed(2)}ms
          </div>
        )}

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
            Close
          </Button>
          <Button
            onClick={handleExecute}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Testing...' : 'Execute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
