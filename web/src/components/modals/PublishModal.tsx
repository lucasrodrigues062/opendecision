import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import { Modal, Card, Button, Alert, Space, Typography, Spin } from 'antd';
import { RocketOutlined, AlertOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PublishModal({ isOpen, onClose, onSuccess }: Props) {
  const { strategy, nodes, edges, getCompiledSteps, markPublished } = useStrategyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!strategy) return;

    setLoading(true);
    setError(null);

    try {
      const compiled = getCompiledSteps();
      const payload = {
        name: strategy.name,
        description: strategy.description,
        ...('steps' in compiled ? { steps: compiled.steps } : {}),
        ...('graph' in compiled ? { graph: compiled.graph } : {}),
        nodes,
        edges,
      };

      if (strategy.backendId) {
        await api.updateStrategy(strategy.backendId, payload);
      } else {
        const response = await api.publishStrategy(payload);
        markPublished(response.id);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <span className="flex items-center gap-2">
          <RocketOutlined className="text-emerald-500" />
          Publish Strategy
        </span>
      }
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="publish"
          type="primary"
          loading={loading}
          onClick={handlePublish}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {strategy?.backendId ? 'Update' : 'Publish'}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Card size="small" className="bg-slate-900 border-slate-800 mb-4">
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Text type="secondary">Name</Text>
              <Text strong className="text-right">
                {strategy?.name}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">Description</Text>
              <Text className="text-right">{strategy?.description || '(none)'}</Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">Status</Text>
              <Text>{strategy?.backendId ? 'Update existing' : 'Create new'}</Text>
            </div>
          </Space>
        </Card>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            icon={<AlertOutlined />}
            className="mb-0"
          />
        )}
      </Spin>
    </Modal>
  );
}
