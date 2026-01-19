import { useState, useEffect } from 'react';
import keycloak from './keycloak';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      })
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) {
          setUser(keycloak.tokenParsed);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Keycloak init failed:', err);
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    keycloak.login();
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const handleRefreshToken = () => {
    keycloak
      .updateToken(30)
      .then((refreshed) => {
        if (refreshed) {
          setUser(keycloak.tokenParsed);
          console.log('Token refreshed');
        } else {
          console.log('Token still valid');
        }
      })
      .catch(() => {
        console.error('Failed to refresh token');
      });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>React + Keycloak OIDC</h1>

        {authenticated ? (
          <div>
            <div style={styles.userInfo}>
              <h2>Welcome, {user?.preferred_username || user?.name || 'User'}!</h2>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Realm:</strong> {keycloak.realm}</p>
            </div>

            <div style={styles.tokenSection}>
              <h3>Token Info</h3>
              <p><strong>Token expires:</strong> {new Date(keycloak.tokenParsed?.exp * 1000).toLocaleString()}</p>
              <details style={styles.details}>
                <summary>View Access Token</summary>
                <pre style={styles.tokenPre}>{keycloak.token}</pre>
              </details>
            </div>

            <div style={styles.buttonGroup}>
              <button style={styles.button} onClick={handleRefreshToken}>
                Refresh Token
              </button>
              <button style={{ ...styles.button, ...styles.logoutButton }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={styles.message}>You are not logged in.</p>
            <button style={styles.button} onClick={handleLogin}>
              Login with Keycloak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
    margin: '1rem',
  },
  title: {
    marginTop: 0,
    color: '#333',
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#f0f9ff',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  tokenSection: {
    marginBottom: '1rem',
  },
  details: {
    marginTop: '0.5rem',
  },
  tokenPre: {
    backgroundColor: '#f5f5f5',
    padding: '0.5rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '150px',
    fontSize: '0.75rem',
    wordBreak: 'break-all',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '1rem',
  },
};

export default App;
