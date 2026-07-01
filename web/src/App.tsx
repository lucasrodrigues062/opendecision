import React, { useEffect, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  FolderOpen,
  Beaker,
  Rocket,
  Workflow,
  Layers,
  Eye,
  CircleDot,
} from 'lucide-react';

type SidebarTab = 'operations' | 'preview';

function App() {
  const { strategy, isDirty } = useStrategyStore();
  const [apiReady, setApiReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('operations');

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
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold text-foreground tracking-tight">OpenDecision</h1>
            {strategy && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-foreground">{strategy.name}</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border ${
                    strategy.backendId
                      ? isDirty
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <CircleDot className="w-3 h-3" />
                  {strategy.backendId ? (isDirty ? 'Modified' : 'Saved') : 'Local'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreate(true)}
            disabled={!apiReady}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New
          </Button>
          <Button
            onClick={() => setShowOpen(true)}
            disabled={!apiReady}
            variant="outline"
            size="sm"
          >
            <FolderOpen className="w-4 h-4 mr-1.5" />
            Open
          </Button>
          <Button
            onClick={() => setShowTest(true)}
            disabled={!strategy}
            variant="outline"
            size="sm"
          >
            <Beaker className="w-4 h-4 mr-1.5" />
            Test
          </Button>
          <Button
            onClick={() => setShowPublish(true)}
            disabled={!strategy}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Rocket className="w-4 h-4 mr-1.5" />
            Publish
          </Button>
        </div>
      </header>

      {/* Alerts */}
      <div className="px-4 pt-3 space-y-2 shrink-0">
        {error && (
          <Alert className="border-destructive/30 bg-destructive/10 py-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive/90 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {publishSuccess && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <AlertDescription className="text-emerald-300 text-sm">{publishSuccess}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 min-h-0">
        {/* Editor Area */}
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <CardContent className="flex-1 p-0 min-h-0 relative">
            {apiReady && strategy ? (
              <EditorCanvas />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                  <Workflow className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Welcome to OpenDecision
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Create a new strategy or open an existing one to start building your decision
                    pipeline.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => setShowCreate(true)} disabled={!apiReady}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Strategy
                  </Button>
                  <Button
                    onClick={() => setShowOpen(true)}
                    disabled={!apiReady}
                    variant="outline"
                  >
                    <FolderOpen className="w-4 h-4 mr-1.5" />
                    Open Existing
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <aside className="w-80 shrink-0 flex flex-col gap-4 min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('operations')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition ${
                  activeTab === 'operations'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-4 h-4" />
                Operations
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition ${
                  activeTab === 'preview'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {activeTab === 'operations' && <NodePalette />}
              {activeTab === 'preview' && <PreviewPanel />}
            </div>
          </Card>
        </aside>
      </main>

      {/* Modals */}
      <CreateStrategyModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <OpenModal isOpen={showOpen} onClose={() => setShowOpen(false)} />
      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        onSuccess={handlePublishSuccess}
      />
      <TestModal isOpen={showTest} onClose={() => setShowTest(false)} />
    </div>
  );
}

export default App;
