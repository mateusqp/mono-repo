import { PropsWithChildren, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider.tsx';

export function ProtectedRoute({ children }: PropsWithChildren): JSX.Element | null {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void signIn();
    }
  }, [isAuthenticated, isLoading, signIn]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <p>Redirecting to identity provider...</p>;
}
