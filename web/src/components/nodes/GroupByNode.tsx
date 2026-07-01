import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { PartitionOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    groupByProperty?: string;
  };
}

export default function GroupByNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.groupByProperty;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-56 shadow-lg cursor-pointer border-lime-500/30 bg-gradient-to-b from-lime-500/5 to-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-lime-400">
          <PartitionOutlined />
          <Text strong className="text-lime-400">
            Group By
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
          Group Property
        </Text>
        <Input
          size="small"
          placeholder="category"
          value={data.groupByProperty || ''}
          onChange={(e) => updateNode(id, { ...data, groupByProperty: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          status={hasError ? 'error' : ''}
        />
        {hasError && (
          <Text type="danger" className="text-xs">
            Group property is required
          </Text>
        )}
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-lime-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-lime-500" />
    </Card>
  );
}
