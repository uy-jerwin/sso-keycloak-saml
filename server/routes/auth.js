import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate SAML login
router.get('/login',
  passport.authenticate('saml', {
    failureRedirect: 'http://localhost:3000/saml-protected?error=auth_failed'
  })
);

// SAML callback (Assertion Consumer Service)
router.post('/callback',
  passport.authenticate('saml', {
    failureRedirect: 'http://localhost:3000/saml-protected?error=auth_failed'
  }),
  (req, res) => {
    // Successful authentication, redirect to protected page
    res.redirect('http://localhost:3000/saml-protected');
  }
);

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

export default router;
