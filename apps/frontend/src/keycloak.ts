import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_OIDC_AUTHORITY?.replace('/realms/app', ''),
  realm: 'app',
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID || 'app-frontend'
});

export default keycloak;
