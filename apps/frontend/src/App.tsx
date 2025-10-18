import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider.tsx';
import { HomePage } from './routes/HomePage.tsx';
import { CallbackPage } from './routes/CallbackPage.tsx';
import { SilentRenewPage } from './routes/SilentRenewPage.tsx';
import { ProtectedPage } from './routes/ProtectedPage.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import './App.css';

function Navigation(): JSX.Element {
  const { isAuthenticated } = useAuth();

  return (
    <header className="app-header">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/protected">Protected</Link>
      </nav>
      <span className={`status ${isAuthenticated ? 'online' : 'offline'}`}>
        {isAuthenticated ? 'Authenticated' : 'Anonymous'}
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
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedPage />
                </ProtectedRoute>
              }
            />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/silent-renew" element={<SilentRenewPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
