import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import keycloak from './keycloak';
import { SamlAuthProvider } from './context/SamlAuthContext';
import HomePage from './pages/HomePage';
import OidcProtectedPage from './pages/OidcProtectedPage';
import SamlProtectedPage from './pages/SamlProtectedPage';
import ProtectedRoute from './components/ProtectedRoute';
import SamlProtectedRoute from './components/SamlProtectedRoute';

function App() {
  const [keycloakReady, setKeycloakReady] = useState(false);
  const [oidcAuthenticated, setOidcAuthenticated] = useState(false);
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const initKeycloak = async () => {
      try {
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        });
        setOidcAuthenticated(auth);
        setKeycloakReady(true);
      } catch (err) {
        console.error('Keycloak init failed:', err);
        setKeycloakReady(true);
      }
    };

    initKeycloak();
  }, []);

  if (!keycloakReady) {
    return (
      <div style={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SamlAuthProvider>
      <div style={styles.app}>
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <span style={styles.logo}>Auth Demo</span>
            <div style={styles.links}>
              <Link to="/" style={styles.link}>Home</Link>
              <Link to="/oidc-protected" style={styles.link}>OIDC Protected</Link>
              <Link to="/saml-protected" style={styles.link}>SAML Protected</Link>
            </div>
          </div>
        </nav>

        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/oidc-protected"
              element={
                <ProtectedRoute
                  authenticated={oidcAuthenticated}
                  keycloak={keycloak}
                >
                  <OidcProtectedPage keycloak={keycloak} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saml-protected"
              element={
                <SamlProtectedRoute>
                  <SamlProtectedPage />
                </SamlProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </SamlAuthProvider>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  nav: {
    backgroundColor: '#1f2937',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  logo: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  main: {
    padding: '1rem',
  },
};

export default App;
