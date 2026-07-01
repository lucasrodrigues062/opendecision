import { Handle, Position } from '@xyflow/react';
import { Card, Input, Select, Button, Space, Typography } from 'antd';
import { SortAscendingOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    arrayProperty?: string;
    arraySortBy?: string;
    arraySortDirection?: 'asc' | 'desc';
  };
}

export default function SortArrayNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.arrayProperty || !data.arraySortBy;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-56 shadow-lg cursor-pointer border-orange-500/30 bg-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-orange-400">
          <SortAscendingOutlined />
          <Text strong className="text-orange-400">
            Sort Array
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
            Array Property
          </Text>
          <Input
            size="small"
            placeholder="codigos_servico"
            value={data.arrayProperty || ''}
            onChange={(e) => updateNode(id, { ...data, arrayProperty: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={!data.arrayProperty ? 'error' : ''}
            className="mt-1"
          />
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Sort By
          </Text>
          <Input
            size="small"
            placeholder="quantidade"
            value={data.arraySortBy || ''}
            onChange={(e) => updateNode(id, { ...data, arraySortBy: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={!data.arraySortBy ? 'error' : ''}
            className="mt-1"
          />
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Direction
          </Text>
          <Select
            size="small"
            value={data.arraySortDirection || 'asc'}
            onChange={(value) => updateNode(id, { ...data, arraySortDirection: value })}
            onClick={(e) => e.stopPropagation()}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' },
            ]}
            className="w-full mt-1"
          />
        </div>
        {hasError && (
          <Text type="danger" className="text-xs">
            Array property and sort by are required
          </Text>
        )}
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </Card>
  );
}
