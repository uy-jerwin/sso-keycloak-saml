import passport from 'passport';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';

export function configureSaml() {
  const samlStrategy = new SamlStrategy(
    {
      // Service Provider (SP) configuration
      path: '/api/saml/callback',
      entryPoint: 'http://localhost:8080/realms/local/protocol/saml',
      issuer: 'web-saml',

      // Keycloak SAML signing certificate
      // Get this from: Keycloak Admin > Realm Settings > Keys > RS256 Certificate
      idpCert: 'MIICmTCCAYECBgGb1UJ9bzANBgkqhkiG9w0BAQsFADAQMQ4wDAYDVQQDDAVsb2NhbDAeFw0yNjAxMTkwNzU2MDNaFw0zNjAxMTkwNzU3NDNaMBAxDjAMBgNVBAMMBWxvY2FsMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9lnSLn92sFClDxTb5NtfHfm7IXfSulwiwgE/puLevqFkThiMefl6CpjNT1ot12v+rIJxM7FhpB6LUR6ZySK0bIGN3JB/vRVGTqiVyF9I8P4Ls7wKPm2sqOfgjcQDPSn5DHj+QyhoroUY4+AmZZL5ADbDbKv5932S8JmBmrx3ekR8nTyu5Zb9s8mo0H5DJfwE7mbo+om7RKSWaeGMUt7Q3Rr2WXpboKLgLcZTgc4MyHTTql5iU+MAZE6iJMam6eYIrxhj9TMtwY5oIDqyAVBHoejyERv9S3AWZdqIejVJ/NWA9XiNEPX6WIREydJXvzRrOn3kh28tQP+fX2GcJUNWfQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBuD3wremzcIxDJwZjfteoAgRn+nMxzv0VCbdbXHPiCQWGTOvPfSvYPdi/rrkSNkaLH4AChTLQl7j2GQ2MrjT0NntlPKd84S02+pTVucVTTHxHMId+vz/ZXKiIi/vOylbv0PWWxpFx4aQeF5UNfgllu5ORIcRmW7nF4qb6DbQMMn8VIXJSN5EEGLxGZs07vuoNbz6Wu/SMTI8vKJS4gG3d3kkadZlNKyvKQq7SBg2ehMf5zMW5put5QsFvJ2ToQ9Wf9InTozj8ZdICwHxN8sXxhDad1SqcAl3G7pIXOYbO41Tt48bES7tyMkZhyqL8QLThE8SoZkcj19P/gKx6GQoYH',
      
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
