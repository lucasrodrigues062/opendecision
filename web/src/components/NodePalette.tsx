import { useStrategyStore } from '../stores/strategyStore';
import { Card, Space, Typography } from 'antd';
import {
  FilterOutlined,
  CalculatorOutlined,
  SortAscendingOutlined,
  SortAscendingOutlined as SortArrayIcon,
  FilterOutlined as FilterArrayIcon,
  MinusCircleOutlined,
  CodeOutlined,
  CalculatorOutlined as AggregateIcon,
  PartitionOutlined,
  CompressOutlined,
  ForkOutlined,
} from '@ant-design/icons';
import type { OperationType } from '../types';

const { Text } = Typography;

type OperationConfig = {
  type: OperationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  gradient: string;
};

const operations: OperationConfig[] = [
  {
    type: 'filter',
    title: 'Filter',
    description: 'Keep only rows that match a condition.',
    icon: FilterOutlined,
    color: '#3b82f6',
    gradient: 'from-blue-500/10 to-transparent border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_16px_-4px_rgba(59,130,246,0.4)]',
  },
  {
    type: 'compute',
    title: 'Compute',
    description: 'Create or update a property on each row.',
    icon: CalculatorOutlined,
    color: '#10b981',
    gradient: 'from-emerald-500/10 to-transparent border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_16px_-4px_rgba(16,185,129,0.4)]',
  },
  {
    type: 'sort',
    title: 'Sort',
    description: 'Order rows by a property ascending or descending.',
    icon: SortAscendingOutlined,
    color: '#a855f7',
    gradient: 'from-purple-500/10 to-transparent border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_16px_-4px_rgba(168,85,247,0.4)]',
  },
  {
    type: 'sort_array',
    title: 'Sort Array',
    description: 'Sort a nested array inside each row.',
    icon: SortArrayIcon,
    color: '#f97316',
    gradient: 'from-orange-500/10 to-transparent border-orange-500/30 hover:border-orange-400 hover:shadow-[0_0_16px_-4px_rgba(249,115,22,0.4)]',
  },
  {
    type: 'filter_array',
    title: 'Filter Array',
    description: 'Filter a nested array inside each row.',
    icon: FilterArrayIcon,
    color: '#06b6d4',
    gradient: 'from-cyan-500/10 to-transparent border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_16px_-4px_rgba(6,182,212,0.4)]',
  },
  {
    type: 'delete_property',
    title: 'Delete Property',
    description: 'Remove a property from each row.',
    icon: MinusCircleOutlined,
    color: '#ef4444',
    gradient: 'from-red-500/10 to-transparent border-red-500/30 hover:border-red-400 hover:shadow-[0_0_16px_-4px_rgba(239,68,68,0.4)]',
  },
  {
    type: 'transform',
    title: 'Transform',
    description: 'Apply any JSONata transformation to each row.',
    icon: CodeOutlined,
    color: '#6366f1',
    gradient: 'from-indigo-500/10 to-transparent border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_16px_-4px_rgba(99,102,241,0.4)]',
  },
  {
    type: 'aggregate',
    title: 'Aggregate',
    description: 'Compute sum, avg, count, min or max over the dataset.',
    icon: AggregateIcon,
    color: '#ec4899',
    gradient: 'from-pink-500/10 to-transparent border-pink-500/30 hover:border-pink-400 hover:shadow-[0_0_16px_-4px_rgba(236,72,153,0.4)]',
  },
  {
    type: 'group_by',
    title: 'Group By',
    description: 'Group rows by a property value.',
    icon: PartitionOutlined,
    color: '#84cc16',
    gradient: 'from-lime-500/10 to-transparent border-lime-500/30 hover:border-lime-400 hover:shadow-[0_0_16px_-4px_rgba(132,204,22,0.4)]',
  },
  {
    type: 'distinct',
    title: 'Distinct',
    description: 'Remove duplicate rows based on a property.',
    icon: CompressOutlined,
    color: '#14b8a6',
    gradient: 'from-teal-500/10 to-transparent border-teal-500/30 hover:border-teal-400 hover:shadow-[0_0_16px_-4px_rgba(20,184,166,0.4)]',
  },
  {
    type: 'condition',
    title: 'Condition',
    description: 'Branch execution into true/false paths.',
    icon: ForkOutlined,
    color: '#eab308',
    gradient: 'from-yellow-500/10 to-transparent border-yellow-500/30 hover:border-yellow-400 hover:shadow-[0_0_16px_-4px_rgba(234,179,8,0.4)]',
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
            className={`border bg-gradient-to-r ${op.gradient} transition-all`}
            styles={{ body: { padding: 12 } }}
          >
            <Space align="start">
              <Icon className="text-lg mt-0.5" style={{ color: op.color }} />
              <div>
                <Text strong className="text-slate-100">
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
