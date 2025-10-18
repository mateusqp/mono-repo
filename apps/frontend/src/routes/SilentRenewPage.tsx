import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider.tsx';

export function SilentRenewPage(): JSX.Element {
  const { completeSilentSignIn } = useAuth();

  useEffect(() => {
    const complete = async () => {
      try {
        await completeSilentSignIn();
      } catch (error) {
        console.error('Silent renew callback failed', error);
      } finally {
        window.close();
      }
    };

    void complete();
  }, [completeSilentSignIn]);

  return (
    <section className="card">
      <h1>Renewing session…</h1>
      <p>This page should close automatically once the silent renewal completes.</p>
    </section>
  );
}
