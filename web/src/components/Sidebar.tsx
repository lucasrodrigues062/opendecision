import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Tabs, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import NodePalette from './NodePalette';
import PreviewPanel from './PreviewPanel';

type SidebarTab = 'operations' | 'preview';

const MIN_WIDTH = 240;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 320;

interface Props {
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidthRef.current - delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing) return;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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

  if (collapsed) {
    return (
      <div className="shrink-0 flex flex-col h-full">
        <Card
          className="bg-slate-900 border-slate-800 h-full"
          bodyStyle={{ padding: 8, height: '100%' }}
        >
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setCollapsed(false)}
            className="text-slate-300"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="shrink-0 flex h-full" style={{ width }}>
      <Card
        className="flex-1 overflow-hidden bg-slate-900 border-slate-800"
        bodyStyle={{ padding: 0, height: '100%' }}
        title={
          <div className="flex items-center justify-between">
            <span className="text-slate-200 text-sm font-medium">Panel</span>
            <Button
              type="text"
              size="small"
              icon={<MenuFoldOutlined />}
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-slate-200"
            />
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => onChangeTab(key as SidebarTab)}
          items={sidebarItems}
          className="h-full ant-tabs-content"
        />
      </Card>

      <div
        onMouseDown={handleMouseDown}
        className={`w-1.5 shrink-0 cursor-col-resize transition-colors ${
          isResizing ? 'bg-indigo-500' : 'bg-slate-800 hover:bg-indigo-500/50'
        }`}
        style={{ marginLeft: -1 }}
      />
    </div>
  );
}
