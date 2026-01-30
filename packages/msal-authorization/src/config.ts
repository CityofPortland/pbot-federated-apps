import { Configuration, LogLevel } from '@azure/msal-browser';

export interface MsalAuthConfig {
  clientId: string;
  tenantId: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scopes?: string[];
}

/**
 * Creates an MSAL configuration object from the provided auth config.
 */
export function createMsalConfig(config: MsalAuthConfig): Configuration {
  const {
    clientId,
    tenantId,
    redirectUri = `${window.location.origin}/oauth/callback`,
    postLogoutRedirectUri = window.location.origin,
  } = config;

  return {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri,
      postLogoutRedirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (
          level: LogLevel,
          message: string,
          containsPii: boolean
        ) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
          }
        },
        logLevel: LogLevel.Warning,
      },
    },
  };
}

/**
 * Creates the default login request scopes.
 */
export function createLoginRequest(clientId: string, scopes?: string[]) {
  return {
    scopes: scopes || [`${clientId}/.default`],
  };
}
