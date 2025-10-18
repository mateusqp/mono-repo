import { useAuth } from '../auth/AuthProvider.tsx';

export function ProtectedPage(): JSX.Element {
  const { user } = useAuth();

  return (
    <section className="card">
      <h1>Protected Resource</h1>
      <p>You have successfully authenticated and can view protected content.</p>

      {user && (
        <div className="token-info">
          <h2>Token details</h2>
          <dl>
            <dt>Access token expires at</dt>
            <dd>
              {user.expires_at ? new Date(user.expires_at * 1000).toLocaleString() : 'Unknown'}
            </dd>
            <dt>ID token</dt>
            <dd className="token-preview">{user.id_token ?? 'Not issued'}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
