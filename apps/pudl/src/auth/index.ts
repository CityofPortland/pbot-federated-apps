import {
  createMsalConfig,
  createLoginRequest,
  createMsalAuth,
} from '@pbotapps/msal-authorization';

// Create MSAL configuration from environment variables
const msalConfig = createMsalConfig({
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
  redirectUri: `${window.location.origin}/oauth/callback`,
  postLogoutRedirectUri: window.location.origin,
});

// Create login request with default scopes
const loginRequest = createLoginRequest(import.meta.env.VITE_AZURE_CLIENT_ID);

// Create the MSAL auth instance
const msalAuth = createMsalAuth(msalConfig, loginRequest);

// Export all auth methods
export const {
  msalInstance,
  initializeMsal,
  getActiveAccount,
  isAuthenticated,
  login,
  logout,
  getAccessToken,
} = msalAuth;

// Also export config for reference
export { msalConfig, loginRequest };
