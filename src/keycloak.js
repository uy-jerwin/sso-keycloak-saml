import Keycloak from 'keycloak-js';

// Keycloak configuration - update these values to match your Keycloak server
const keycloakConfig = {
  url: 'http://localhost:8080',      // Keycloak server URL
  realm: 'local',                  // Your realm name
  clientId: 'web-openid',          // Your client ID
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
