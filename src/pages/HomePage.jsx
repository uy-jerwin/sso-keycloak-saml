function HomePage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Authentication Demo</h1>
        <p style={styles.description}>
          This app demonstrates OIDC, SAML, and Single Sign-On (SSO) with Keycloak.
        </p>
        <div style={styles.routes}>
          <div style={styles.route}>
            <h3>/oidc-protected</h3>
            <p>Protected by OpenID Connect using keycloak-js (client-side)</p>
            <p><strong>Client ID:</strong> web-openid</p>
          </div>
          <div style={styles.route}>
            <h3>/oidc-protected-1</h3>
            <p>Second OIDC client — demonstrates SSO (auto-login via shared Keycloak session)</p>
            <p><strong>Client ID:</strong> web-openid-1</p>
            <p style={{ fontSize: '0.85rem', color: '#92400e' }}>
              <strong>Hint:</strong> Log in via /oidc-protected first, then visit this page — no login prompt!
            </p>
          </div>
          <div style={styles.route}>
            <h3>/saml-protected</h3>
            <p>Protected by SAML 2.0 using passport-saml (server-side)</p>
            <p><strong>Client ID:</strong> web-saml</p>
          </div>
        </div>
        <p style={styles.note}>
          Both authentication methods use the same Keycloak server (realm: local).
        </p>
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
    maxWidth: '600px',
    width: '100%'
  },
  title: {
    marginTop: 0,
    color: '#333',
    textAlign: 'center'
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem'
  },
  routes: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  route: {
    flex: 1,
    minWidth: '200px',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  },
  note: {
    marginTop: '1.5rem',
    textAlign: 'center',
    color: '#888',
    fontSize: '0.9rem'
  }
};

export default HomePage;
