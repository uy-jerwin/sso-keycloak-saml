function OidcProtectedPage1({ keycloak }) {
  const user = keycloak.tokenParsed;

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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>OIDC Protected Page 2</h1>
        <div style={styles.badge}>OpenID Connect (SSO)</div>

        <div style={styles.ssoBanner}>
          <strong>SSO in action!</strong> You were automatically authenticated
          because you already logged in via <code>web-openid</code>. Keycloak
          recognized your existing session and issued a token for{' '}
          <code>web-openid-1</code> without prompting for credentials.
        </div>

        <div style={styles.userInfo}>
          <h2>Welcome, {user?.preferred_username || user?.name || 'User'}!</h2>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Auth Method:</strong> OpenID Connect (SSO)</p>
          <p><strong>Client ID:</strong> web-openid-1</p>
          <p><strong>Realm:</strong> {keycloak.realm}</p>
        </div>

        <div style={styles.tokenSection}>
          <h3>Token Info</h3>
          <p><strong>Expires:</strong> {new Date(user?.exp * 1000).toLocaleString()}</p>
          <p><strong>Authorized Party (azp):</strong> {user?.azp}</p>
          <p><strong>Issuer:</strong> {user?.iss}</p>
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
    backgroundColor: '#7c3aed',
    color: 'white',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  ssoBanner: {
    backgroundColor: '#fffbeb',
    border: '1px solid #f59e0b',
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#92400e'
  },
  userInfo: {
    backgroundColor: '#f5f3ff',
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
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    flex: 1
  },
  logoutButton: {
    backgroundColor: '#dc2626'
  }
};

export default OidcProtectedPage1;
