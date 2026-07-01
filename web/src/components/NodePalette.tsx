import { useStrategyStore } from '../stores/strategyStore';
import { Card, Space, Typography } from 'antd';
import {
  FilterOutlined,
  CalculatorOutlined,
  SortAscendingOutlined,
  SortAscendingOutlined as SortArrayIcon,
  FilterOutlined as FilterArrayIcon,
  MinusCircleOutlined,
  ForkOutlined,
} from '@ant-design/icons';
import type { OperationType } from '../types';

const { Text } = Typography;

type OperationConfig = {
  type: OperationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const operations: OperationConfig[] = [
  {
    type: 'filter',
    title: 'Filter',
    description: 'Keep only rows that match a condition.',
    icon: FilterOutlined,
    color: 'text-blue-400 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10',
  },
  {
    type: 'compute',
    title: 'Compute',
    description: 'Create or update a property on each row.',
    icon: CalculatorOutlined,
    color: 'text-emerald-400 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10',
  },
  {
    type: 'sort',
    title: 'Sort',
    description: 'Order rows by a property ascending or descending.',
    icon: SortAscendingOutlined,
    color: 'text-purple-400 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10',
  },
  {
    type: 'sort_array',
    title: 'Sort Array',
    description: 'Sort a nested array inside each row.',
    icon: SortArrayIcon,
    color: 'text-orange-400 border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10',
  },
  {
    type: 'filter_array',
    title: 'Filter Array',
    description: 'Filter a nested array inside each row.',
    icon: FilterArrayIcon,
    color: 'text-cyan-400 border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10',
  },
  {
    type: 'delete_property',
    title: 'Delete Property',
    description: 'Remove a property from each row.',
    icon: MinusCircleOutlined,
    color: 'text-red-400 border-red-500/30 hover:border-red-500 hover:bg-red-500/10',
  },
  {
    type: 'condition',
    title: 'Condition',
    description: 'Branch execution into true/false paths.',
    icon: ForkOutlined,
    color: 'text-yellow-400 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10',
  },
];

export default function NodePalette() {
  const { addNode, nodes } = useStrategyStore();

  const handleAdd = (type: OperationType) => {
    const offset = nodes.length * 20;
    addNode(type, { x: 300 + offset, y: 200 + offset });
  };

  return (
    <Space direction="vertical" size="middle" className="w-full p-4">
      {operations.map((op) => {
        const Icon = op.icon;
        return (
          <Card
            key={op.type}
            hoverable
            size="small"
            onClick={() => handleAdd(op.type)}
            className={`border ${op.color} bg-slate-900 transition-all`}
          >
            <Space align="start">
              <Icon className="text-lg mt-0.5" />
              <div>
                <Text strong className="text-foreground">
                  {op.title}
                </Text>
                <Text type="secondary" className="block text-xs leading-relaxed">
                  {op.description}
                </Text>
              </div>
            </Space>
          </Card>
        );
      })}

      <Text type="secondary" className="text-xs leading-relaxed">
        Click an operation to add it to the canvas. Connect nodes to define the execution order.
        Use Condition to branch into true/false paths.
      </Text>
    </Space>
  );
}
