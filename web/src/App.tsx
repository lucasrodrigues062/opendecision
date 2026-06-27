import React, { useEffect } from 'react';
import { useStrategyStore } from './stores/strategyStore';
import { api } from './utils/api';

function App() {
  const { strategy, nodes, edges } = useStrategyStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    // Check API health on mount
    api.health()
      .then(() => {
        console.log('✅ Backend API is healthy');
        setError(null);
      })
      .catch((err) => {
        console.error('❌ Backend API error:', err);
        setError('Could not connect to backend. Make sure it is running on http://localhost:8080');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">OD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OpenDecision</h1>
        </div>
        <div className="text-sm text-gray-600">
          {strategy ? `Strategy: ${strategy.name}` : 'No strategy loaded'}
        </div>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New Strategy'}
        </button>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 bg-white border-r border-gray-200">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Editor Canvas</p>
              <p className="text-sm text-gray-400">React Flow will be rendered here</p>
              <p className="text-xs text-gray-400 mt-2">
                {nodes.length} nodes, {edges.length} edges
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operations</h2>

            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition flex items-center gap-2">
                <span>🔍</span> Filter
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition flex items-center gap-2">
                <span>🧮</span> Compute
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition flex items-center gap-2">
                <span>↕️</span> Sort
              </button>
            </div>

            <hr className="my-6" />

            <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
            <p className="text-sm text-gray-500">Select a node to edit its properties</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
