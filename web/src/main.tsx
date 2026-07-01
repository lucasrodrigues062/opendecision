import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App.tsx';
import './index.css';
import { palette } from './theme/colors';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: palette.primary,
          colorSuccess: palette.success,
          colorWarning: palette.warning,
          colorError: palette.danger,
          colorInfo: palette.info,
          colorBgBase: palette.bgBase,
          colorTextBase: palette.textPrimary,
          colorBorder: palette.border,
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
