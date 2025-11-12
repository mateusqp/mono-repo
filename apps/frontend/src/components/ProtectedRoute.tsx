import { PropsWithChildren, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';

export function ProtectedRoute({ children }: PropsWithChildren): JSX.Element | null {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak]);

  if (keycloak.authenticated) {
    return <>{children}</>;
  }

  return <p>Redirecting to identity provider...</p>;
}
