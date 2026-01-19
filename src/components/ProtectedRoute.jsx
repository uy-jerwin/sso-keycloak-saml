function ProtectedRoute({ children, authenticated, keycloak }) {
  if (!authenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>OIDC Authentication Required</h2>
          <p>You must be logged in via OpenID Connect to view this page.</p>
          <button
            style={styles.button}
            onClick={() => keycloak.login()}
          >
            Login with Keycloak (OIDC)
          </button>
        </div>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
    fontSize: '1rem'
  }
};

export default ProtectedRoute;
