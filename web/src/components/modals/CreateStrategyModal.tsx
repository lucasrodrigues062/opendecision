import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';
import { Modal, Form, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStrategyModal({ isOpen, onClose }: Props) {
  const [form] = Form.useForm();
  const { createNewStrategy } = useStrategyStore();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      createNewStrategy(values.name, values.description || '');
      form.resetFields();
      onClose();
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
          <PlusOutlined className="text-blue-500" />
          Create New Strategy
        </span>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="create" type="primary" loading={loading} onClick={handleCreate}>
          Create Strategy
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Strategy Name"
          rules={[{ required: true, message: 'Please enter a strategy name' }]}
        >
          <Input placeholder="e.g., Qualify Leads" autoFocus />
        </Form.Item>

        <Form.Item name="description" label="Description (optional)">
          <Input.TextArea
            placeholder="Describe what this strategy does..."
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
