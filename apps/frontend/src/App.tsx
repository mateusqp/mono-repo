import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { HomePage } from './routes/HomePage.tsx';
import { LoginPage } from './routes/LoginPage.tsx';
import { ProtectedPage } from './routes/ProtectedPage.tsx';
import { PublicPage } from './routes/PublicPage.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import './App.css';

function Navigation(): JSX.Element {
  const { keycloak } = useKeycloak();

  return (
    <header className="app-header">
      <nav>
        <Link to="/">Início</Link>
        <Link to="/public">Pública</Link>
        <Link to="/protected">Protegida</Link>
      </nav>
      <span className={`status ${keycloak.authenticated ? 'online' : 'offline'}`}>
        {keycloak.authenticated ? 'Autenticado' : 'Anônimo'}
      </span>
    </header>
  );
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public" element={<PublicPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
