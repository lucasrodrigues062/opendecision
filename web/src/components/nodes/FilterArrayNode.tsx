import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { FilterOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    arrayFilterProperty?: string;
    arrayFilterExpression?: string;
  };
}

export default function FilterArrayNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.arrayFilterProperty || !data.arrayFilterExpression;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-56 shadow-lg cursor-pointer border-cyan-500/30 bg-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-cyan-400">
          <FilterOutlined />
          <Text strong className="text-cyan-400">
            Filter Array
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
            value={data.arrayFilterProperty || ''}
            onChange={(e) => updateNode(id, { ...data, arrayFilterProperty: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={!data.arrayFilterProperty ? 'error' : ''}
            className="mt-1"
          />
        </div>
        <div>
          <Text type="secondary" className="text-xs">
            Expression
          </Text>
          <Input
            size="small"
            placeholder="quantidade > 10"
            value={data.arrayFilterExpression || ''}
            onChange={(e) => updateNode(id, { ...data, arrayFilterExpression: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            status={!data.arrayFilterExpression ? 'error' : ''}
            className="mt-1"
          />
        </div>
        {hasError && (
          <Text type="danger" className="text-xs">
            Array property and expression are required
          </Text>
        )}
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
    </Card>
  );
}
