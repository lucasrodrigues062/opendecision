import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { CodeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    transformExpression?: string;
  };
}

export default function TransformNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.transformExpression;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-64 shadow-lg cursor-pointer border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-indigo-400">
          <CodeOutlined />
          <Text strong className="text-indigo-400">
            Transform
          </Text>
        </Space>
      }
      extra={
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
        />
      }
    >
      <Space direction="vertical" size="small" className="w-full">
        <Text type="secondary" className="text-xs">
          JSONata Expression
        </Text>
        <Input.TextArea
          size="small"
          placeholder={`$merge([$, {"total": price * qty}])`}
          value={data.transformExpression || ''}
          onChange={(e) => updateNode(id, { ...data, transformExpression: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          status={hasError ? 'error' : ''}
          rows={3}
          className="font-mono text-xs"
        />
        {hasError && (
          <Text type="danger" className="text-xs">
            Transform expression is required
          </Text>
        )}
        <Text type="secondary" className="text-[10px]">
          Uses JSONata. $ is the current row.
        </Text>
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </Card>
  );
}
