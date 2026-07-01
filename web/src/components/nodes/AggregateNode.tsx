import { Handle, Position } from '@xyflow/react';
import { Card, Input, Select, Button, Space, Typography } from 'antd';
import { CalculatorOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    aggregateFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    aggregateProperty?: string;
    aggregateResultProperty?: string;
  };
}

export default function AggregateNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.aggregateFunction || !data.aggregateProperty || !data.aggregateResultProperty;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-60 shadow-lg cursor-pointer border-pink-500/30 bg-gradient-to-b from-pink-500/5 to-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-pink-400">
          <CalculatorOutlined />
          <Text strong className="text-pink-400">
            Aggregate
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
            Function
          </Text>
          <Select
            size="small"
            value={data.aggregateFunction || 'sum'}
            onChange={(value) => updateNode(id, { ...data, aggregateFunction: value })}
            onClick={(e) => e.stopPropagation()}
            options={[
              { value: 'sum', label: 'Sum' },
              { value: 'avg', label: 'Average' },
              { value: 'count', label: 'Count' },
              { value: 'min', label: 'Minimum' },
              { value: 'max', label: 'Maximum' },
            ]}
            className="w-full mt-1"
          />
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Property
          </Text>
          <Input
            size="small"
            placeholder="price"
            value={data.aggregateProperty || ''}
            onChange={(e) => updateNode(id, { ...data, aggregateProperty: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Result Property
          </Text>
          <Input
            size="small"
            placeholder="total"
            value={data.aggregateResultProperty || ''}
            onChange={(e) => updateNode(id, { ...data, aggregateResultProperty: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
        </div>
        {hasError && (
          <Text type="danger" className="text-xs">
            Function, property and result property are required
          </Text>
        )}
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-pink-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
    </Card>
  );
}
