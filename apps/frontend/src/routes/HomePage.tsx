import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

export function HomePage(): JSX.Element {
  const { keycloak } = useKeycloak();

  return (
    <section className="card">
      <h1>Exemplo React Keycloak</h1>
      <p>
        Este exemplo demonstra como autenticar uma aplicação Vite + React usando Keycloak.
      </p>

      <div className="actions">
        {keycloak.authenticated ? (
          <button type="button" onClick={() => keycloak.logout()}>
            Sair
          </button>
        ) : (
          <button type="button" onClick={() => keycloak.login()}>
            Entrar
          </button>
        )}
        <Link to="/protected" className="link-button">
          Ir para página protegida
        </Link>
      </div>

      {keycloak.authenticated && keycloak.tokenParsed && (
        <article className="user-details">
          <h2>Usuário atual</h2>
          <dl>
            <dt>ID</dt>
            <dd>{keycloak.tokenParsed.sub}</dd>
            <dt>Nome</dt>
            <dd>{keycloak.tokenParsed.name ?? 'N/A'}</dd>
            <dt>Email</dt>
            <dd>{keycloak.tokenParsed.email ?? 'N/A'}</dd>
          </dl>
        </article>
      )}
    </section>
  );
}
