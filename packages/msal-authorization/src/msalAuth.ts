import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  AccountInfo,
  InteractionRequiredAuthError,
  Configuration,
} from '@azure/msal-browser';

export interface LoginRequest {
  scopes: string[];
}

export interface MsalAuth {
  msalInstance: PublicClientApplication;
  initializeMsal: () => Promise<void>;
  getActiveAccount: () => AccountInfo | null;
  isAuthenticated: () => boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: (scopes?: string[]) => Promise<string | undefined>;
}

/**
 * Creates an MSAL authentication instance with all necessary methods.
 * @param msalConfig - The MSAL configuration object
 * @param loginRequest - The login request with scopes
 * @returns An object with all MSAL auth methods
 */
export function createMsalAuth(
  msalConfig: Configuration,
  loginRequest: LoginRequest
): MsalAuth {
  // Create the MSAL instance
  const msalInstance = new PublicClientApplication(msalConfig);

  // Flag to track initialization
  let msalInitialized = false;

  /**
   * Initialize MSAL and handle any redirect responses.
   * Must be called before any other MSAL operations.
   */
  async function initializeMsal(): Promise<void> {
    if (msalInitialized) {
      return;
    }

    await msalInstance.initialize();

    // Handle redirect response if returning from login
    const response = await msalInstance.handleRedirectPromise();

    if (response) {
      // User just logged in via redirect
      msalInstance.setActiveAccount(response.account);
    } else {
      // Check if we have any accounts
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        // Set the first account as active
        msalInstance.setActiveAccount(accounts[0]);
      }
    }

    // Register callback for login success
    msalInstance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        msalInstance.setActiveAccount(payload.account);
      }
    });

    msalInitialized = true;
  }

  /**
   * Get the currently active account
   */
  function getActiveAccount(): AccountInfo | null {
    return msalInstance.getActiveAccount();
  }

  /**
   * Check if a user is currently authenticated
   */
  function isAuthenticated(): boolean {
    return msalInstance.getActiveAccount() !== null;
  }

  /**
   * Initiate login via redirect to Microsoft sign-in page
   */
  async function login(): Promise<void> {
    await msalInstance.loginRedirect(loginRequest);
  }

  /**
   * Logout the current user
   */
  async function logout(): Promise<void> {
    const account = msalInstance.getActiveAccount();
    await msalInstance.logoutRedirect({
      account,
      postLogoutRedirectUri: window.location.origin,
    });
  }

  /**
   * Get an access token for API calls.
   * Will silently acquire a token if possible, otherwise redirects to login.
   */
  async function getAccessToken(
    scopes: string[] = loginRequest.scopes
  ): Promise<string | undefined> {
    const account = msalInstance.getActiveAccount();

    if (!account) {
      return undefined;
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account,
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token expired or consent required - redirect to login
        await msalInstance.acquireTokenRedirect({
          scopes,
          account,
        });
        return undefined;
      }
      console.error('Error acquiring token:', error);
      return undefined;
    }
  }

  return {
    msalInstance,
    initializeMsal,
    getActiveAccount,
    isAuthenticated,
    login,
    logout,
    getAccessToken,
  };
}
