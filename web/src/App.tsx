import { useEffect, useState } from 'react';
import {
  Layout,
  Button,
  Card,
  Tabs,
  Badge,
  Alert,
  Space,
  Typography,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  FolderOpenOutlined,
  ExperimentOutlined,
  RocketOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { useStrategyStore } from './stores/strategyStore';
import { api } from './utils/api';
import EditorCanvas from './components/EditorCanvas';
import NodePalette from './components/NodePalette';
import PreviewPanel from './components/PreviewPanel';
import CreateStrategyModal from './components/modals/CreateStrategyModal';
import OpenModal from './components/modals/OpenModal';
import PublishModal from './components/modals/PublishModal';
import TestModal from './components/modals/TestModal';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type SidebarTab = 'operations' | 'preview';

function App() {
  const { strategy, isDirty } = useStrategyStore();
  const [apiReady, setApiReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(
          'Could not connect to backend. Make sure it is running on http://localhost:8080'
        );
      });
  }, []);

  const handlePublishSuccess = () => {
    setPublishSuccess('Strategy published successfully!');
    setTimeout(() => setPublishSuccess(null), 3000);
  };

  const sidebarItems = [
    {
      key: 'operations',
      label: 'Operations',
      children: <NodePalette />,
    },
    {
      key: 'preview',
      label: 'Preview',
      children: <PreviewPanel />,
    },
  ];

  return (
    <Layout className="h-screen">
      <Header className="flex items-center justify-between px-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 h-16">
        <Space align="center" size="middle">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BranchesOutlined className="text-white text-lg" />
          </div>
          <Space align="baseline" size="small">
            <Title level={4} className="!text-white !m-0">
              OpenDecision
            </Title>
            {strategy && (
              <>
                <Text className="text-slate-500">/</Text>
                <Text className="text-slate-200">{strategy.name}</Text>
                <Badge
                  status={strategy.backendId ? (isDirty ? 'warning' : 'success') : 'default'}
                  text={strategy.backendId ? (isDirty ? 'Modified' : 'Saved') : 'Local'}
                  className="ml-2"
                />
              </>
            )}
          </Space>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreate(true)}
            disabled={!apiReady}
          >
            New
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => setShowOpen(true)}
            disabled={!apiReady}
          >
            Open
          </Button>
          <Button
            icon={<ExperimentOutlined />}
            onClick={() => setShowTest(true)}
            disabled={!strategy}
          >
            Test
          </Button>
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={() => setShowPublish(true)}
            disabled={!strategy}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Publish
          </Button>
        </Space>
      </Header>

      <Content className="p-4 bg-slate-950">
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

        {publishSuccess && (
          <Alert
            message={publishSuccess}
            type="success"
            showIcon
            className="mb-4"
            closable
            onClose={() => setPublishSuccess(null)}
          />
        )}

        <div className="flex gap-4 h-[calc(100vh-8rem)]">
          <Card
            className="flex-1 overflow-hidden bg-slate-900 border-slate-800"
            bodyStyle={{ padding: 0, height: '100%' }}
          >
            {apiReady && strategy ? (
              <EditorCanvas />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                      <BranchesOutlined className="text-4xl text-indigo-400" />
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="middle" align="center">
                      <div>
                        <Title level={4} className="!text-slate-200 !m-0">
                          Welcome to OpenDecision
                        </Title>
                        <Text className="text-slate-500">
                          Create a new strategy or open an existing one to start building your
                          decision pipeline.
                        </Text>
                      </div>
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setShowCreate(true)}
                          disabled={!apiReady}
                        >
                          New Strategy
                        </Button>
                        <Button
                          icon={<FolderOpenOutlined />}
                          onClick={() => setShowOpen(true)}
                          disabled={!apiReady}
                        >
                          Open Existing
                        </Button>
                      </Space>
                    </Space>
                  }
                />
              </div>
            )}
          </Card>

          <Card
            className="w-80 shrink-0 bg-slate-900 border-slate-800"
            bodyStyle={{ padding: 0, height: '100%' }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as SidebarTab)}
              items={sidebarItems}
              className="h-full ant-tabs-content"
            />
          </Card>
        </div>
      </Content>

      <CreateStrategyModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <OpenModal isOpen={showOpen} onClose={() => setShowOpen(false)} />
      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        onSuccess={handlePublishSuccess}
      />
      <TestModal isOpen={showTest} onClose={() => setShowTest(false)} />
    </Layout>
  );
}

export default App;
