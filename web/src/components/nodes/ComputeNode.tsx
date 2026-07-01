import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { CalculatorOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    property?: string;
    computeExpr?: string;
  };
}

export default function ComputeNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const propertyError = !data.property || data.property.trim() === '';
  const exprError = !data.computeExpr || data.computeExpr.trim() === '';

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-56 shadow-lg cursor-pointer border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-emerald-400">
          <CalculatorOutlined />
          <Text strong className="text-emerald-400">
            Compute
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
        <div>
          <Text type="secondary" className="text-xs">
            Property
          </Text>
          <Input
            size="small"
            placeholder="newScore"
            value={data.property || ''}
            onChange={(e) => updateNode(id, { ...data, property: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={propertyError ? 'error' : ''}
            className="mt-1"
          />
          {propertyError && (
            <Text type="danger" className="text-xs">
              Property is required
            </Text>
          )}
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Expression
          </Text>
          <Input
            size="small"
            placeholder="score * 2"
            value={data.computeExpr || ''}
            onChange={(e) => updateNode(id, { ...data, computeExpr: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={exprError ? 'error' : ''}
            className="mt-1"
          />
          {exprError && (
            <Text type="danger" className="text-xs">
              Expression is required
            </Text>
          )}
        </div>
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </Card>
  );
}
