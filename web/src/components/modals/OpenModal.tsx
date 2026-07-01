import { useEffect, useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { api } from '../../utils/api';
import { Modal, List, Card, Button, Spin, Alert, Typography } from 'antd';
import { FolderOpenOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { StrategyResponse } from '../../types';

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenModal({ isOpen, onClose }: Props) {
  const { loadStrategy } = useStrategyStore();
  const [strategies, setStrategies] = useState<StrategyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen]);

  const fetchStrategies = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.listStrategies();
      setStrategies(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (strategy: StrategyResponse) => {
    loadStrategy({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      nodes: strategy.nodes || [],
      edges: strategy.edges || [],
      backendId: strategy.id,
      createdAt: new Date(strategy.created_at),
      updatedAt: new Date(strategy.updated_at),
    });
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <span className="flex items-center gap-2">
          <FolderOpenOutlined className="text-blue-500" />
          Open Strategy
        </span>
      }
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-4"
          closable
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="py-8 text-center">
          <Spin tip="Loading strategies..." />
        </div>
      ) : (
        <List
          dataSource={strategies}
          locale={{ emptyText: 'No strategies yet' }}
          renderItem={(strategy) => (
            <List.Item className="!px-0">
              <Card
                hoverable
                size="small"
                className="w-full bg-slate-900 border-slate-800 hover:border-blue-500/50"
                onClick={() => handleOpen(strategy)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Text strong className="text-foreground">
                      {strategy.name}
                    </Text>
                    {strategy.description && (
                      <Text type="secondary" className="block text-sm mt-0.5">
                        {strategy.description}
                      </Text>
                    )}
                  </div>
                  <Text type="secondary" className="text-xs flex items-center gap-1 shrink-0">
                    <ClockCircleOutlined />
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
