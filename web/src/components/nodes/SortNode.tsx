import { Handle, Position } from '@xyflow/react';
import { Card, Input, Select, Button, Space, Typography } from 'antd';
import { SortAscendingOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
}

export default function SortNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.sortBy || data.sortBy.trim() === '';

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-56 shadow-lg cursor-pointer border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-purple-400">
          <SortAscendingOutlined />
          <Text strong className="text-purple-400">
            Sort
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
            Sort By
          </Text>
          <Input
            size="small"
            placeholder="score"
            value={data.sortBy || ''}
            onChange={(e) => updateNode(id, { ...data, sortBy: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={hasError ? 'error' : ''}
            className="mt-1"
          />
          {hasError && (
            <Text type="danger" className="text-xs">
              Sort property is required
            </Text>
          )}
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Direction
          </Text>
          <Select
            size="small"
            value={data.sortDirection || 'asc'}
            onChange={(value) => updateNode(id, { ...data, sortDirection: value })}
            onClick={(e) => e.stopPropagation()}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' },
            ]}
            className="w-full mt-1"
          />
        </div>
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </Card>
  );
}
