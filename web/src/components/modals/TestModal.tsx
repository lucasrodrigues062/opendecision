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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Beaker, AlertCircle, Zap, Copy, Check } from 'lucide-react';
import type { ExecutionResult } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DATA = `[
  { "name": "Alice", "score": 80, "active": true },
  { "name": "Bob", "score": 60, "active": false },
  { "name": "Carol", "score": 95, "active": true }
]`;

export default function TestModal({ isOpen, onClose }: Props) {
  const { getCompiledSteps } = useStrategyStore();
  const [testData, setTestData] = useState(SAMPLE_DATA);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result.result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>Test Strategy</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="testData" className="text-sm font-medium text-foreground">
                Test Data (JSON)
              </Label>
              <textarea
                id="testData"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="w-full h-56 px-3 py-2 bg-background border border-border rounded-md font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Result</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!result}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="w-full h-56 px-3 py-2 border border-border rounded-md bg-background/50 font-mono text-xs overflow-auto">
                {result ? (
                  <pre className="whitespace-pre-wrap break-words text-foreground">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                ) : (
                  <span className="text-muted-foreground">Run to see result...</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {result && (
          <div className="flex items-center gap-2 text-sm text-foreground bg-muted/30 border border-border rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Executed in {result.elapsed_ms.toFixed(2)}ms
          </div>
        )}

        {error && (
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive/90 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button onClick={handleExecute} disabled={loading}>
            {loading ? 'Testing...' : 'Execute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
