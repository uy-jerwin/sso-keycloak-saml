import { useSamlAuth } from '../context/SamlAuthContext';

function SamlProtectedPage() {
  const { samlUser, samlLogout } = useSamlAuth();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>SAML Protected Page</h1>
        <div style={styles.badge}>SAML 2.0</div>

        <div style={styles.userInfo}>
          <h2>Welcome, {samlUser?.displayName || samlUser?.nameID || 'User'}!</h2>
          <p><strong>Email:</strong> {samlUser?.email || 'N/A'}</p>
          <p><strong>Auth Method:</strong> SAML 2.0</p>
          <p><strong>Client ID:</strong> web-saml</p>
          <p><strong>Name ID:</strong> {samlUser?.nameID}</p>
        </div>

        <div style={styles.attributesSection}>
          <h3>SAML Attributes</h3>
          <details style={styles.details}>
            <summary>View All Attributes</summary>
            <pre style={styles.attributesPre}>
              {JSON.stringify(samlUser?.attributes, null, 2)}
            </pre>
          </details>
        </div>

        <button style={styles.logoutButton} onClick={samlLogout}>
          Logout (SAML)
        </button>
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
    backgroundColor: '#22c55e',
    color: 'white',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  userInfo: {
    backgroundColor: '#f0fdf4',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  attributesSection: {
    marginBottom: '1rem'
  },
  details: {
    marginTop: '0.5rem'
  },
  attributesPre: {
    backgroundColor: '#f5f5f5',
    padding: '0.5rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: '0.75rem'
  },
  logoutButton: {
    width: '100%',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default SamlProtectedPage;
