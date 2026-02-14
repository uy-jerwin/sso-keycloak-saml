import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// In-memory store for PKCE code verifiers, keyed by state
const pkceStore = new Map();

// Cleanup old entries every 60 seconds (remove entries older than 5 minutes)
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of pkceStore.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      pkceStore.delete(key);
    }
  }
}, 60 * 1000);

// GET /initiate — Generate PKCE params and redirect to Keycloak authorize endpoint
router.get('/initiate', (req, res) => {
  // Generate PKCE code_verifier (43-128 chars, base64url)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');

  // Generate code_challenge = base64url(SHA256(code_verifier))
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('base64url');

  // Store code_verifier keyed by state (single-use)
  pkceStore.set(state, {
    code_verifier: codeVerifier,
    timestamp: Date.now(),
  });

  // Build Keycloak authorize URL
  const params = new URLSearchParams({
    client_id: 'web-openid-1',
    redirect_uri: 'http://localhost:3100',
    response_type: 'code',
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  const keycloakAuthUrl = `http://localhost:8080/realms/local/protocol/openid-connect/auth?${params}`;
  res.redirect(keycloakAuthUrl);
});

// POST /exchange — Exchange authorization code for tokens using stored code_verifier
router.post('/exchange', async (req, res) => {
  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  // Retrieve and delete code_verifier (single-use)
  const stored = pkceStore.get(state);
  if (!stored) {
    return res.status(400).json({ error: 'Invalid or expired state' });
  }
  pkceStore.delete(state);

  try {
    // Exchange code at Keycloak token endpoint
    const tokenRes = await fetch('http://localhost:8080/realms/local/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'web-openid-1',
        code,
        redirect_uri: 'http://localhost:3100',
        code_verifier: stored.code_verifier,
      }),
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      return res.status(tokenRes.status).json({ error: 'Token exchange failed', details: errorBody });
    }

    const tokens = await tokenRes.json();
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: 'Token exchange error', details: err.message });
  }
});

export default router;
