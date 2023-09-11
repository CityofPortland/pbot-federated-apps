import { RouteRecordRaw, RouteLocation } from 'vue-router';
import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { assert, RemovableRef, useStorage } from '@vueuse/core';

import { Login, Logout, OAuth } from '../pages';

type LoginContext = {
  accessToken: RemovableRef<string>;
  clientId: string;
  msal: PublicClientApplication;
  getToken(scopes?: Array<string>, redirect?: string): Promise<string | void>;
  route: RemovableRef<Partial<RouteLocation>>;
};

export const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuth,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
  },
];

const authority = `https://login.microsoftonline.com/${
  import.meta.env.VITE_AZURE_TENANT_ID || 'common'
}`;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;

assert(clientId, 'Must set VITE_AZURE_CLIENT_ID!');

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    navigateToLoginRequestUrl: false,
  },
  cache: { cacheLocation: 'localStorage' },
};

const msal = new PublicClientApplication(msalConfig);

export function useLogin(): LoginContext {
  const accessToken = useStorage('pbotapps.auth.accessToken', '');
  const route = useStorage('pbotapps.auth.route', {} as RouteLocation);

  const getToken = async (
    scopes: Array<string> = [`${clientId}/.default`, 'offline_access'],
    redirect?: string
  ) => {
    const request = {
      scopes,
    };

    return msal
      .acquireTokenSilent(request)
      .then(result => {
        accessToken.value = result.accessToken;
        return result.accessToken;
      })
      .catch(() => {
        if (redirect) {
          msal.acquireTokenRedirect({ ...request, redirectUri: redirect });
        }
      });
  };

  return {
    accessToken,
    clientId,
    msal,
    getToken,
    route,
  };
}
