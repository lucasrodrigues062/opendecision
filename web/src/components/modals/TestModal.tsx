import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import {
  Modal,
  Button,
  Input,
  Card,
  Alert,
  Space,
  Typography,
  message,
} from 'antd';
import {
  ExperimentOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { ExecutionResult } from '../../types';

const { Text } = Typography;

const SAMPLE_DATA = `[
  { "name": "Alice", "score": 80, "active": true },
  { "name": "Bob", "score": 60, "active": false },
  { "name": "Carol", "score": 95, "active": true }
]`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

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
      const request = getCompiledSteps();

      const execResult = await api.executeStrategy({ ...request, data });
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
    message.success('Result copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={800}
      title={
        <span className="flex items-center gap-2">
          <ExperimentOutlined className="text-blue-500" />
          Test Strategy
        </span>
      }
      footer={[
        <Button key="close" onClick={onClose} disabled={loading}>
          Close
        </Button>,
        <Button key="execute" type="primary" loading={loading} onClick={handleExecute}>
          Execute
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            size="small"
            title="Test Data (JSON)"
            className="bg-slate-900 border-slate-800"
          >
            <Input.TextArea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              rows={10}
              className="font-mono text-xs bg-slate-950"
            />
          </Card>

          <Card
            size="small"
            title={
              <div className="flex justify-between items-center">
                <span>Result</span>
                <Button
                  type="text"
                  size="small"
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={handleCopy}
                  disabled={!result}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            }
            className="bg-slate-900 border-slate-800"
          >
            <div className="h-60 px-3 py-2 bg-slate-950 rounded border border-slate-800 overflow-auto">
              {result ? (
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-words m-0">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              ) : (
                <Text type="secondary" className="text-sm">
                  Run to see result...
                </Text>
              )}
            </div>
          </Card>
        </div>

        {result && (
          <Card size="small" className="bg-slate-900 border-slate-800">
            <Space>
              <ThunderboltOutlined className="text-yellow-500" />
              <Text>Executed in {result.elapsed_ms.toFixed(2)}ms</Text>
            </Space>
          </Card>
        )}

        {error && <Alert message={error} type="error" showIcon />}
      </Space>
    </Modal>
  );
}
