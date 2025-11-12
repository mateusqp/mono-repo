import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router-dom';

export function LoginPage(): JSX.Element {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <section className="card">
        <h1>Carregando...</h1>
      </section>
    );
  }

  if (keycloak.authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="card">
      <h1>Bem-vindo</h1>
      <p>Você precisa fazer login para acessar o sistema.</p>
      <button type="button" onClick={() => keycloak.login()}>
        Fazer Login
      </button>
    </section>
  );
}
