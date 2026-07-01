import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography, Tag } from 'antd';
import { ForkOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    conditionExpression?: string;
  };
}

export default function ConditionNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.conditionExpression;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-60 shadow-lg cursor-pointer border-yellow-500/30 bg-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-yellow-400">
          <ForkOutlined />
          <Text strong className="text-yellow-400">
            Condition
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
          Expression
        </Text>
        <Input
          size="small"
          placeholder="qtd_chapas > 1"
          value={data.conditionExpression || ''}
          onChange={(e) => updateNode(id, { ...data, conditionExpression: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          status={hasError ? 'error' : ''}
        />
        {hasError && (
          <Text type="danger" className="text-xs">
            Condition expression is required
          </Text>
        )}
        <div className="flex justify-between mt-1">
          <Tag color="success">true</Tag>
          <Tag color="error">false</Tag>
        </div>
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '30%' }}
        className="!bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '70%' }}
        className="!bg-red-500"
      />
    </Card>
  );
}
