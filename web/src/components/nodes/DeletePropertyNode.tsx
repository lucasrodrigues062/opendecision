import { Handle, Position } from '@xyflow/react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStrategyStore } from '../../stores/strategyStore';

const { Text } = Typography;

interface Props {
  id: string;
  data: {
    label: string;
    deleteProperty?: string;
  };
}

export default function DeletePropertyNode({ id, data }: Props) {
  const { updateNode, deleteNode, selectNode } = useStrategyStore();
  const hasError = !data.deleteProperty;

  return (
    <Card
      size="small"
      onClick={() => selectNode(id)}
      className="w-56 shadow-lg cursor-pointer border-red-500/30 bg-gradient-to-b from-red-500/5 to-slate-900"
      styles={{ body: { padding: 12 } }}
      title={
        <Space className="text-red-400">
          <MinusCircleOutlined />
          <Text strong className="text-red-400">
            Delete Property
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
          Property Path
        </Text>
        <Input
          size="small"
          placeholder="observacoes or pessoa.nome"
          value={data.deleteProperty || ''}
          onChange={(e) => updateNode(id, { ...data, deleteProperty: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          status={hasError ? 'error' : ''}
        />
        {hasError && (
          <Text type="danger" className="text-xs">
            Property path is required
          </Text>
        )}
      </Space>

      <Handle type="target" position={Position.Top} className="!bg-red-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-red-500" />
    </Card>
  );
}
