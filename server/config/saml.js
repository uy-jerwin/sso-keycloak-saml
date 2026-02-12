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
      idpCert: 'MIICmTCCAYECBgGcT9kwKTANBgkqhkiG9w0BAQsFADAQMQ4wDAYDVQQDDAVsb2NhbDAeFw0yNjAyMTIwMzE0MTlaFw0zNjAyMTIwMzE1NTlaMBAxDjAMBgNVBAMMBWxvY2FsMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8DiwkaH5Yie6Wp4mSsutSTp5Mj7xdmkCd1qeFae1vuJMIgSL1k9M4NfUJPj5g4XYPpMliPF/y+NHlbGvkx0THJy2GA1K2A/jRrRTnXwEOT6HUZh6Eni8lj+IG4YEIvg/vni+SyU8qhqMf0u8rKOh2uA7Lq10flIHf8qs8cAlJJT9STV8LUiyK67/kvMCICtMNzfH6DV8dybqHM3Lrys7tWnC2H4dCBxPpVW0r3K+FJxMB9nHPRbQ9JPo2Xf9SGpoUoKKu0rFMTifyI5tLzrW2iRul1+9qizoqQgINZy+WHfIBuwQpfittQcfXXVnZ3XlhvvxkGEPUVZWWhE/2egAiwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAZOJ3aBzCJJarjNjGbMjH8QPIh57Rh1PNUL2RHDtvZQ9fvdvOfO6xVCRDDpkmF0URHMn9oLmCuwSp66HCUge3FZpSejttcl1Af8iUqynvfMoL0pyUgBrLqTYcx/VxFqWKEjKlNpVX9xRKR0MmsKLOj0DyxqTrmpxFytmzjs9LiMvAT+NWGnazxsYiBaUS+Rsy84M2helhWBwaXFVlyipTWfNjAt3Fdyo0Fhtg1RF5QVr8SF6qjSpepDIXPXQsMs5wk44eRHDaSIdRIap9ao9yVfirdkZUrgMQziQ2aom+JBMBEooaVCHKo5gx5RzWnsyA7sRZz67XGI9p4It4BbPbd',
      
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
