import { useState } from 'react';
import { useStrategyStore } from '../stores/strategyStore';
import { Card, Button, Typography, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function PreviewPanel() {
  const { getCompiledSteps } = useStrategyStore();
  const [copied, setCopied] = useState(false);

  let compiled: ReturnType<typeof getCompiledSteps> | null = null;
  let error: string | null = null;
  try {
    compiled = getCompiledSteps();
  } catch (err) {
    error = (err as Error).message;
  }

  const handleCopy = async () => {
    if (!compiled) return;
    await navigator.clipboard.writeText(JSON.stringify(compiled, null, 2));
    setCopied(true);
    message.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  const title = compiled && 'graph' in compiled ? 'Compiled Graph' : 'Compiled Pipeline';

  return (
    <div className="p-4">
      <Card
        size="small"
        title={title}
        className="bg-slate-900 border-slate-800"
        extra={
          <Button
            type="text"
            size="small"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
            disabled={!compiled}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        }
      >
        <div className="bg-slate-950 rounded p-3 overflow-auto max-h-80">
          {compiled ? (
            <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-words m-0">
              {JSON.stringify(compiled, null, 2)}
            </pre>
          ) : (
            <div className="text-center py-8">
              {error ? (
                <Text type="danger" className="text-sm">
                  {error}
                </Text>
              ) : (
                <Text type="secondary" className="text-sm">
                  Create nodes to see compiled JSON
                </Text>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
