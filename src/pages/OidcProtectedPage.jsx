import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function OidcProtectedPage({ keycloak }) {
  const user = keycloak.tokenParsed;
  const [searchParams, setSearchParams] = useSearchParams();
  const [samlAssertion, setSamlAssertion] = useState(null);
  const [samlUser, setSamlUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const samlGenerated = searchParams.get('saml_generated');
    const sessionId = searchParams.get('session');

    if (samlGenerated === 'true' && sessionId) {
      // Fetch the generated SAML assertion
      fetch(`http://localhost:3001/api/saml/get-assertion/${sessionId}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.assertion) {
            setSamlAssertion(data.assertion);
            setSamlUser(data.user);
          }
        })
        .catch(err => console.error('Failed to fetch assertion:', err))
        .finally(() => {
          // Clean up URL params
          searchParams.delete('saml_generated');
          searchParams.delete('session');
          setSearchParams(searchParams);
        });
    }
  }, [searchParams, setSearchParams]);

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const handleRefreshToken = () => {
    keycloak
      .updateToken(30)
      .then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
        } else {
          console.log('Token still valid');
        }
      })
      .catch(() => {
        console.error('Failed to refresh token');
      });
  };

  const handleGenerateSamlAssertion = () => {
    setLoading(true);
    // Redirect to the SAML assertion generation endpoint
    window.location.href = 'http://localhost:3001/api/saml/generate-assertion';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>OIDC Protected Page</h1>
        <div style={styles.badge}>OpenID Connect</div>

        <div style={styles.userInfo}>
          <h2>Welcome, {user?.preferred_username || user?.name || 'User'}!</h2>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Auth Method:</strong> OpenID Connect</p>
          <p><strong>Client ID:</strong> web-openid</p>
          <p><strong>Realm:</strong> {keycloak.realm}</p>
        </div>

        <div style={styles.tokenSection}>
          <h3>Token Info</h3>
          <p><strong>Expires:</strong> {new Date(user?.exp * 1000).toLocaleString()}</p>
          <details style={styles.details}>
            <summary>View Access Token</summary>
            <pre style={styles.tokenPre}>{keycloak.token}</pre>
          </details>
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={handleRefreshToken}>
            Refresh Token
          </button>
          <button
            style={{ ...styles.button, ...styles.samlButton }}
            onClick={handleGenerateSamlAssertion}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate SAML Assertion'}
          </button>
          <button style={{ ...styles.button, ...styles.logoutButton }} onClick={handleLogout}>
            Logout (OIDC)
          </button>
        </div>

        {samlAssertion && (
          <div style={styles.samlSection}>
            <h3>SAML Assertion (web-saml)</h3>
            {samlUser && (
              <div style={styles.samlUserInfo}>
                <p><strong>SAML User:</strong> {samlUser.displayName || samlUser.nameID}</p>
                <p><strong>Email:</strong> {samlUser.email || 'N/A'}</p>
              </div>
            )}
            <details style={styles.details}>
              <summary>View SAML Assertion XML</summary>
              <pre style={styles.assertionPre}>{samlAssertion}</pre>
            </details>
            <button
              style={{ ...styles.button, ...styles.clearButton, marginTop: '0.5rem' }}
              onClick={() => { setSamlAssertion(null); setSamlUser(null); }}
            >
              Clear Assertion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%'
  },
  title: {
    marginTop: 0,
    color: '#333',
    textAlign: 'center'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  userInfo: {
    backgroundColor: '#f0f9ff',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  tokenSection: {
    marginBottom: '1rem'
  },
  details: {
    marginTop: '0.5rem'
  },
  tokenPre: {
    backgroundColor: '#f5f5f5',
    padding: '0.5rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '150px',
    fontSize: '0.75rem',
    wordBreak: 'break-all'
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    flex: 1
  },
  logoutButton: {
    backgroundColor: '#dc2626'
  },
  samlButton: {
    backgroundColor: '#059669'
  },
  samlSection: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '4px',
    border: '1px solid #86efac'
  },
  samlUserInfo: {
    marginBottom: '0.5rem'
  },
  assertionPre: {
    backgroundColor: '#f5f5f5',
    padding: '0.5rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '300px',
    fontSize: '0.7rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  },
  clearButton: {
    backgroundColor: '#6b7280',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem'
  }
};

export default OidcProtectedPage;
