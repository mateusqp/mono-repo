import { useKeycloak } from '@react-keycloak/web';

export function ProtectedPage(): JSX.Element {
  const { keycloak } = useKeycloak();

  return (
    <section className="card">
      <h1>Página Protegida</h1>
      <p>Esta página é acessível apenas para usuários autenticados.</p>
      {keycloak.tokenParsed && (
        <p>Bem-vindo(a), {keycloak.tokenParsed.name}!</p>
      )}
    </section>
  );
}
