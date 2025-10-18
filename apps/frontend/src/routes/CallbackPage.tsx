import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';

export function CallbackPage(): JSX.Element {
  const { completeSignIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalize = async () => {
      try {
        await completeSignIn();
        navigate('/protected', { replace: true });
      } catch (err) {
        console.error('OIDC redirect completion failed', err);
        setError('Authentication failed. Please try signing in again.');
      }
    };

    void finalize();
  }, [completeSignIn, navigate]);

  if (error) {
    return (
      <section className="card error">
        <h1>Authentication error</h1>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Signing you in…</h1>
      <p>Please wait while we complete the authentication process.</p>
    </section>
  );
}
