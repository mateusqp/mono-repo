import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ConfigProvider } from './config/ConfigContext.tsx';
import { loadRuntimeConfig } from './config/config.ts';
import { AuthProvider } from './auth/AuthProvider.tsx';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

const root = ReactDOM.createRoot(container);

async function bootstrap() {
  try {
    const config = await loadRuntimeConfig();

    root.render(
      <React.StrictMode>
        <ConfigProvider value={config}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConfigProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to bootstrap application', error);
    root.render(
      <div className="bootstrap-error">
        Unable to load runtime configuration. Check the console output for details.
      </div>
    );
  }
}

void bootstrap();
