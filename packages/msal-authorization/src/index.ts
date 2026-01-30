export {
  MsalAuthConfig,
  createMsalConfig,
  createLoginRequest,
} from './config.js';

export {
  MsalAuth,
  LoginRequest,
  createMsalAuth,
} from './msalAuth.js';

// Re-export useful types from msal-browser
export type {
  AccountInfo,
  AuthenticationResult,
  Configuration,
} from '@azure/msal-browser';
