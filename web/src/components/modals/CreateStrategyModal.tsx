import { useState } from 'react';
import { useStrategyStore } from '../../stores/strategyStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStrategyModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createNewStrategy } = useStrategyStore();

  const handleCreate = () => {
    if (!name.trim()) return;
    createNewStrategy(name, description);
    onClose();
    setName('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Strategy</h2>

        <input
          type="text"
          placeholder="Strategy name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500 h-20 resize-none"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
