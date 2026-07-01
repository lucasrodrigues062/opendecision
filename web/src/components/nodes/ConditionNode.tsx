import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography, Tag, Select } from 'antd';
import { ForkOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    conditionExpression?: string;
    conditionMode?: 'global' | 'per_row';
  };
}

export default function ConditionNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.conditionExpression;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-60 shadow-lg cursor-pointer border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-slate-900"
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
        <div>
          <Text type="secondary" className="text-xs">
            Evaluation Mode
          </Text>
          <Select
            size="small"
            value={data.conditionMode || 'global'}
            onChange={(value) => updateNode(id, { ...data, conditionMode: value })}
            onClick={(e) => e.stopPropagation()}
            options={[
              { value: 'global', label: 'Global (one branch for all rows)' },
              { value: 'per_row', label: 'Per Row (each row chooses its branch)' },
            ]}
            className="w-full mt-1"
          />
        </div>
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
