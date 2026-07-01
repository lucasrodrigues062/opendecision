import { useState } from 'react';
import { useStrategyStore } from '../stores/strategyStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function PreviewPanel() {
  const { getCompiledSteps } = useStrategyStore();
  const [copied, setCopied] = useState(false);

  let steps;
  let error: string | null = null;
  try {
    steps = getCompiledSteps();
  } catch (err) {
    steps = null;
    error = (err as Error).message;
  }

  const handleCopy = async () => {
    if (!steps) return;
    await navigator.clipboard.writeText(JSON.stringify(steps, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      <Card className="border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">Compiled Pipeline</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!steps}
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
        <CardContent className="p-0">
          <div className="bg-background/50 p-3 overflow-auto max-h-80">
            {steps ? (
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(steps, null, 2)}
              </pre>
            ) : (
              <div className="text-muted-foreground text-sm text-center py-8">
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : (
                  'Create nodes to see compiled JSON'
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
