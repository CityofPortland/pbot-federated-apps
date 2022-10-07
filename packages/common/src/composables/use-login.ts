import { Ref, ref, watchEffect } from 'vue';
import { useRouter, RouteRecordRaw, RouteLocation } from 'vue-router';

import {
  AccountInfo,
  Configuration,
  PublicClientApplication,
} from '@azure/msal-browser';
import { RemovableRef, useStorage } from '@vueuse/core';

import { Login, Logout, OAuth } from '../pages';
import { query } from './use-graphql';

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  photo?: Blob;
};

type LoginContext = {
  accessToken: RemovableRef<string>;
  account: Ref<AccountInfo | undefined>;
  msal: PublicClientApplication;
  redirectTo: Ref<RouteLocation | undefined>;
  signIn: (redirect: boolean) => Promise<void>;
  user: Ref<User | undefined>;
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
export function useLogin(): LoginContext {
  const accessToken = useStorage('pbotapps.auth.accessToken', '');
  const account: Ref<AccountInfo | undefined> = ref(undefined);
  const authority = `https://login.microsoftonline.com/${
    import.meta.env.VITE_AZURE_TENANT_ID || 'common'
  }`;
  const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;

  if (!clientId) throw new Error('Must pass "VITE_AZURE_CLIENT_ID"!');

  const user: Ref<User | undefined> = ref(undefined);

  const router = useRouter();
  const redirectTo = useStorage('pbotapps.auth.route', {} as RouteLocation);

  const callback = router?.resolve({
    name: 'OAuthCallback',
  });

  const msalConfig: Configuration = {
    auth: {
      clientId,
      authority,
      navigateToLoginRequestUrl: false,
      redirectUri: callback?.href,
    },
  };

  const msal = new PublicClientApplication(msalConfig);

  watchEffect(() => msal.setActiveAccount(account.value || null));

  watchEffect(async () => {
    if (accessToken.value) {
      const graphql = await query<{ me: User }>({
        operation: `
        query {
          me {
            firstName
            lastName
            email
          }
        }`,
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });

      if (graphql.data) {
        user.value = graphql.data.me;
      }
    }
  });

  const scopes = [`${clientId}/.default`, 'offline_access'];

  const signIn = async (redirect = false) => {
    if (account.value) {
      // we have logged in before
      // try to handle a background login
      const res = await msal.acquireTokenSilent({
        scopes,
        account: account.value,
      });

      if (res) {
        // refreshed token successfully
        account.value = res.account || undefined;
        accessToken.value = res.accessToken;
        return;
      }
    }

    if (redirect) {
      msal.acquireTokenRedirect({
        scopes,
        account: account.value,
        redirectUri: msal.getConfiguration().auth.redirectUri,
      });
    }
  };

  return {
    accessToken,
    account,
    msal,
    redirectTo,
    signIn,
    user,
  };
}
