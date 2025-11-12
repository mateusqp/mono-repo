import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

const keycloak = new Keycloak({
  url: import.meta.env.VITE_OIDC_AUTHORITY?.replace('/realms/app', ''),
  realm: 'app',
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID || 'app-frontend'
});

ReactDOM.createRoot(container).render(
  <ReactKeycloakProvider 
    authClient={keycloak}
    initOptions={{ pkceMethod: 'S256' }}
  >
    <App />
  </ReactKeycloakProvider>
);
