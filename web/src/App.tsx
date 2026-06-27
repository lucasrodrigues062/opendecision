import React, { useEffect } from 'react';
import { useStrategyStore } from './stores/strategyStore';
import { api } from './utils/api';
import EditorCanvas from './components/EditorCanvas';
import NodePalette from './components/NodePalette';
import PreviewPanel from './components/PreviewPanel';
import CreateStrategyModal from './components/modals/CreateStrategyModal';
import OpenModal from './components/modals/OpenModal';
import PublishModal from './components/modals/PublishModal';
import TestModal from './components/modals/TestModal';

function App() {
  const { strategy } = useStrategyStore();
  const [apiReady, setApiReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Modal states
  const [showCreate, setShowCreate] = React.useState(false);
  const [showOpen, setShowOpen] = React.useState(false);
  const [showPublish, setShowPublish] = React.useState(false);
  const [showTest, setShowTest] = React.useState(false);
  const [publishSuccess, setPublishSuccess] = React.useState<string | null>(null);

  useEffect(() => {
    // Check API health on mount
    api
      .health()
      .then(() => {
        console.log('✅ Backend API is healthy');
        setApiReady(true);
        setError(null);
      })
      .catch((err) => {
        console.error('❌ Backend API error:', err);
        setError('Could not connect to backend. Make sure it is running on http://localhost:8080');
      });
  }, []);

  const handlePublishSuccess = () => {
    setPublishSuccess('Strategy published successfully!');
    setTimeout(() => setPublishSuccess(null), 3000);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">OD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OpenDecision</h1>
          {strategy && <span className="text-sm text-gray-500">/ {strategy.name}</span>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
            disabled={!apiReady}
          >
            ✨ New
          </button>
          <button
            onClick={() => setShowOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 transition"
            disabled={!apiReady}
          >
            📂 Open
          </button>
          <button
            onClick={() => setShowTest(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition"
            disabled={!strategy}
          >
            🧪 Test
          </button>
          <button
            onClick={() => setShowPublish(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
            disabled={!strategy}
          >
            🚀 Publish
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Success Banner */}
      {publishSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <p className="text-sm text-green-700">✅ {publishSuccess}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 bg-white border-r border-gray-200">
          {apiReady && strategy ? <EditorCanvas /> : <div className="w-full h-full flex items-center justify-center text-gray-400">Create or open a strategy to begin</div>}
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-8">
            <NodePalette />
            <hr />
            <PreviewPanel />
          </div>
        </aside>
      </main>

      {/* Modals */}
      <CreateStrategyModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <OpenModal isOpen={showOpen} onClose={() => setShowOpen(false)} />
      <PublishModal isOpen={showPublish} onClose={() => setShowPublish(false)} onSuccess={handlePublishSuccess} />
      <TestModal isOpen={showTest} onClose={() => setShowTest(false)} />
    </div>
  );
}

export default App;
