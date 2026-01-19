import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate SAML login
router.get('/login',
  passport.authenticate('saml', {
    failureRedirect: 'http://localhost:3000/saml-protected?error=auth_failed'
  })
);

// Store for SAML assertions (in-memory, for demo purposes)
const assertionStore = new Map();

// SAML callback (Assertion Consumer Service)
router.post('/callback', (req, res, next) => {
  const samlResponse = req.body.SAMLResponse;
  let relayState = {};

  try {
    relayState = JSON.parse(req.body.RelayState || '{}');
  } catch (e) {
    // Not JSON, use as-is or ignore
  }

  const sessionId = relayState.sessionId || req.cookies?.saml_assertion_request;
  const captureAssertion = relayState.captureAssertion;

  passport.authenticate('saml', (err, user, info) => {
    if (err || !user) {
      const errorRedirect = captureAssertion
        ? 'http://localhost:3000/oidc-protected?saml_error=auth_failed'
        : 'http://localhost:3000/saml-protected?error=auth_failed';
      return res.redirect(errorRedirect);
    }

    // If this is an assertion capture request
    if (captureAssertion && sessionId) {
      const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf8');
      assertionStore.set(sessionId, {
        assertion: decodedResponse,
        user: user,
        timestamp: Date.now()
      });
      res.clearCookie('saml_assertion_request');
      return res.redirect(`http://localhost:3000/oidc-protected?saml_generated=true&session=${sessionId}`);
    }

    // Normal SAML login flow
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.redirect('http://localhost:3000/saml-protected?error=auth_failed');
      }
      res.redirect('http://localhost:3000/saml-protected');
    });
  })(req, res, next);
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.redirect('http://localhost:3000');
  });
});

// Get SAML metadata (useful for Keycloak SP configuration)
router.get('/metadata', (req, res) => {
  const strategy = passport._strategy('saml');
  res.type('application/xml');
  res.send(strategy.generateServiceProviderMetadata());
});

// Generate SAML assertion - initiates SAML flow and returns assertion
router.get('/generate-assertion', (req, res, next) => {
  const sessionId = req.sessionID || Math.random().toString(36).substring(7);

  // Store that we want to capture the assertion for this session
  assertionStore.set(sessionId, { pending: true, timestamp: Date.now() });

  // Set a cookie to track this assertion request
  res.cookie('saml_assertion_request', sessionId, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000 // 5 minutes
  });

  // Redirect to SAML login
  passport.authenticate('saml', {
    additionalParams: {
      RelayState: JSON.stringify({ captureAssertion: true, sessionId })
    }
  })(req, res, next);
});

// Retrieve the generated SAML assertion
router.get('/get-assertion/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const data = assertionStore.get(sessionId);

  if (!data || data.pending) {
    return res.status(404).json({ error: 'Assertion not found or still pending' });
  }

  // Clean up old entries (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of assertionStore.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      assertionStore.delete(key);
    }
  }

  res.json({
    assertion: data.assertion,
    user: data.user
  });
});

export default router;
