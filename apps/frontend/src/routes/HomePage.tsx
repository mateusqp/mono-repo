import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';

export function HomePage(): JSX.Element {
  const { isAuthenticated, user, signIn, signOut } = useAuth();

  return (
    <section className="card">
      <h1>React OIDC Example</h1>
      <p>
        This example demonstrates how to authenticate a Vite + React application using{' '}
        <code>oidc-client-ts</code>.
      </p>

      <div className="actions">
        {isAuthenticated ? (
          <button type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        ) : (
          <button type="button" onClick={() => void signIn()}>
            Sign in
          </button>
        )}
        <Link to="/protected" className="link-button">
          Go to protected page
        </Link>
      </div>

      {isAuthenticated && user && (
        <article className="user-details">
          <h2>Current user</h2>
          <dl>
            <dt>Subject</dt>
            <dd>{user.profile.sub}</dd>
            <dt>Name</dt>
            <dd>{user.profile.name ?? 'N/A'}</dd>
            <dt>Email</dt>
            <dd>{user.profile.email ?? 'N/A'}</dd>
          </dl>
        </article>
      )}
    </section>
  );
}
