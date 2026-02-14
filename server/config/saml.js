import passport from 'passport';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';

async function fetchKeycloakCert() {
  // Get admin access token
  const tokenRes = await fetch('http://localhost:8080/realms/master/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: 'admin',
      password: 'admin',
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Failed to get admin token: ${tokenRes.status} ${tokenRes.statusText}`);
  }
  const { access_token } = await tokenRes.json();

  // Fetch realm keys
  const keysRes = await fetch('http://localhost:8080/admin/realms/local/keys', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!keysRes.ok) {
    throw new Error(`Failed to fetch realm keys: ${keysRes.status} ${keysRes.statusText}`);
  }
  const keysData = await keysRes.json();

  // Find the RSA signing certificate
  const rsaSigKey = keysData.keys.find((k) => k.type === 'RSA' && k.use === 'SIG');
  if (!rsaSigKey || !rsaSigKey.certificate) {
    throw new Error('RSA signing certificate not found in Keycloak realm keys');
  }

  console.log('Fetched IDP certificate from Keycloak');
  return rsaSigKey.certificate;
}

export async function configureSaml() {
  const idpCert = await fetchKeycloakCert();

  const samlStrategy = new SamlStrategy(
    {
      // Service Provider (SP) configuration
      path: '/api/saml/callback',
      entryPoint: 'http://localhost:8080/realms/local/protocol/saml',
      issuer: 'web-saml',

      // Keycloak SAML signing certificate (fetched from Admin API)
      idpCert,
      
      // Assertion Consumer Service URL
      callbackUrl: 'http://localhost:3001/api/saml/callback',

      // Want assertions signed
      wantAssertionsSigned: false,

      // Identifier format
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',

      // Disable request signing for simplicity
      disableRequestedAuthnContext: true,
    },
    // Verify callback
    (profile, done) => {
      const user = {
        id: profile.nameID,
        nameID: profile.nameID,
        email: profile.email || profile['urn:oid:1.2.840.113549.1.9.1'] || profile.nameID,
        displayName: profile.displayName || profile.nameID,
        firstName: profile.firstName || profile['urn:oid:2.5.4.42'],
        lastName: profile.lastName || profile['urn:oid:2.5.4.4'],
        attributes: profile
      };
      return done(null, user);
    }
  );

  passport.use('saml', samlStrategy);

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}
