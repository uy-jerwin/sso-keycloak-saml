import { createContext, useContext, useState, useEffect } from 'react';

const SamlAuthContext = createContext(null);

export function SamlAuthProvider({ children }) {
  const [samlUser, setSamlUser] = useState(null);
  const [samlLoading, setSamlLoading] = useState(true);
  const [samlAuthenticated, setSamlAuthenticated] = useState(false);

  const checkSamlStatus = async () => {
    try {
      const response = await fetch('/api/saml/status', {
        credentials: 'include'
      });
      const data = await response.json();
      setSamlAuthenticated(data.authenticated);
      setSamlUser(data.user);
    } catch (error) {
      console.error('Failed to check SAML status:', error);
      setSamlAuthenticated(false);
      setSamlUser(null);
    } finally {
      setSamlLoading(false);
    }
  };

  useEffect(() => {
    checkSamlStatus();
  }, []);

  const samlLogin = () => {
    window.location.href = '/api/saml/login';
  };

  const samlLogout = () => {
    window.location.href = '/api/saml/logout';
  };

  return (
    <SamlAuthContext.Provider value={{
      samlUser,
      samlAuthenticated,
      samlLoading,
      samlLogin,
      samlLogout,
      refreshStatus: checkSamlStatus
    }}>
      {children}
    </SamlAuthContext.Provider>
  );
}

export function useSamlAuth() {
  const context = useContext(SamlAuthContext);
  if (!context) {
    throw new Error('useSamlAuth must be used within SamlAuthProvider');
  }
  return context;
}
