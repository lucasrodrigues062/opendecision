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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Plus, FolderOpen, Flask, Rocket } from 'lucide-react';

function App() {
  const { strategy } = useStrategyStore();
  const [apiReady, setApiReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [showCreate, setShowCreate] = React.useState(false);
  const [showOpen, setShowOpen] = React.useState(false);
  const [showPublish, setShowPublish] = React.useState(false);
  const [showTest, setShowTest] = React.useState(false);
  const [publishSuccess, setPublishSuccess] = React.useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(() => {
        setApiReady(true);
        setError(null);
      })
      .catch(() => {
        setError('Could not connect to backend. Make sure it is running on http://localhost:8080');
      });
  }, []);

  const handlePublishSuccess = () => {
    setPublishSuccess('Strategy published successfully!');
    setTimeout(() => setPublishSuccess(null), 3000);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 px-6 py-4 bg-slate-950/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-25"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OD</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">OpenDecision</h1>
              {strategy && <p className="text-sm text-slate-400">{strategy.name}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreate(true)}
              disabled={!apiReady}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button
              onClick={() => setShowOpen(true)}
              disabled={!apiReady}
              variant="outline"
              className="border-slate-600 text-slate-100 hover:bg-slate-700"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Open
            </Button>
            <Button
              onClick={() => setShowTest(true)}
              disabled={!strategy}
              variant="outline"
              className="border-purple-600/50 text-purple-300 hover:bg-purple-950/30"
            >
              <Flask className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button
              onClick={() => setShowPublish(true)}
              disabled={!strategy}
              className="bg-green-600 hover:bg-green-700"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <Alert className="mx-6 mt-4 border-red-900/50 bg-red-950/50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {publishSuccess && (
        <Alert className="mx-6 mt-4 border-green-900/50 bg-green-950/50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">{publishSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 bg-slate-800 border-r border-slate-700">
          {apiReady && strategy ? (
            <EditorCanvas />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome to OpenDecision</h2>
                <p className="text-slate-400">Create a new strategy or open an existing one to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l border-slate-700 overflow-y-auto bg-slate-850">
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Operations</h3>
              <NodePalette />
            </div>
            <div className="h-px bg-slate-700"></div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Preview</h3>
              <PreviewPanel />
            </div>
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
