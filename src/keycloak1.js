import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'local',
  clientId: 'web-openid-1',
};

const keycloak1 = new Keycloak(keycloakConfig);

export default keycloak1;
