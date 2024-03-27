import { RemovableRef, StorageSerializers, useStorage } from '@vueuse/core';
import axios from 'axios';
import { watch } from 'vue';

import { AuthObject, AuthRequest } from './types.js';
import {
  decodeToken,
  generateCodes,
  generateScopeHash,
  matchesScopes,
} from './utils.js';

export type AuthContext = {
  authority: string;
  clientId: string;
  requests: RemovableRef<Array<AuthRequest>>;
  route: RemovableRef<Partial<{ path: string }>>;
  tokens: RemovableRef<Record<string, AuthObject>>;
  findRequest: (hash: string) => AuthRequest;
  getToken: (
    scopes?: Array<string>,
    prompt?: 'consent' | 'none' | 'select_account',
    redirect_uri?: string
  ) => Promise<string | undefined>;
  redirect(request: AuthRequest, callback: (url: string) => void): void;
  setToken: (
    scopes: Array<string>,
    accessToken: string,
    refreshToken: string
  ) => void;
};

const requests = useStorage<Array<AuthRequest>>(
  'pbotapps.authorization.requests',
  []
);

const route = useStorage<Partial<{ path: string }>>(
  'pbotapps.authorization.route',
  {},
  undefined,
  {
    serializer: StorageSerializers.object,
  }
);

const tokens = useStorage<Record<string, AuthObject>>(
  'pbotapps.authorization.tokens',
  {},
  undefined,
  {
    serializer: StorageSerializers.object,
  }
);

/**
 * Composable function for using Azure AD tokens for authorization.
 * @param tenantId The GUID for the Azure tenant
 * @param clientId The GUID for the application/client found in Azure
 * @returns Object with functions for interacting with Azure tokens in localStorage
 */
export function useAuth({
  clientId,
  tenantId,
}: {
  clientId: string;
  tenantId: string;
}): AuthContext {
  const authority = `https://login.microsoftonline.com/${tenantId}`;

  const findRequest = (hash: string) =>
    requests.value.find(r => generateScopeHash(r.scopes) == hash);

  const findToken = (scopes: Array<string>) =>
    Object.keys(tokens.value)
      .reduce((acc, curr) => {
        const t = tokens.value[curr];
        if (matchesScopes(scopes, t.scopes)) {
          acc.push(t);
        }
        return acc;
      }, new Array<AuthObject>())
      .find(auth => {
        const { expiration } = auth;

        if (expiration && new Date(expiration * 1000) > new Date()) {
          return true;
        } else return false;
      });

  /**
   * Method called when a token has been retrieved.
   * Clears requests that this token satisifies, modifies the token store, then resolves the next request.
   */
  const setToken = (
    scopes: Array<string>,
    accessToken: string,
    refreshToken: string
  ) => {
    tokens.value = {
      ...tokens.value,
      [generateScopeHash(scopes)]: {
        scopes,
        accessToken,
        expiration: decodeToken(accessToken).exp,
        refreshToken,
      },
    };

    // Eliminate all active requests completely satisfied by this new token
    requests.value = requests.value.reduce((acc, curr) => {
      if (!matchesScopes(curr.scopes, scopes)) {
        acc.push(curr);
      }
      return acc;
    }, new Array<AuthRequest>());
  };

  const getToken = async (
    scopes: Array<string> = [`${clientId}/.default`],
    prompt: 'consent' | 'none' | 'select_account' = 'none',
    redirect_uri?: string
  ) => {
    const token = findToken(scopes);

    if (token) {
      // These scopes have at least been initialized...
      const { expiration, refreshToken } = token;

      if (expiration && new Date(expiration * 1000) > new Date())
        return token.accessToken;

      if (refreshToken) {
        try {
          const params = new URLSearchParams();

          params.append('grant_type', 'refresh_token');
          params.append('refresh_token', refreshToken);
          params.append('client_id', clientId);

          const res = await axios.post(
            `${authority}/oauth2/v2.0/token`,
            params
          );

          const { access_token, scope, refresh_token } = res.data;

          setToken(scope, access_token, refresh_token);

          return access_token;
        } catch (err) {
          return undefined;
        }
      }
    }

    // If we already have a request for these scopes, wait for that to resolve
    if (
      requests.value.find(request =>
        scopes.every(s => request.scopes.includes(s))
      )
    ) {
      // poll every 1/10 of a second we have a request for these scopes
      while (
        requests.value.find(request =>
          scopes.every(s => request.scopes.includes(s))
        )
      ) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // request has been resolved...
      return findToken(scopes)?.accessToken;
    }
    // Add a redirect request if we don't have an existing request for these scopes
    else if (redirect_uri) {
      const request: AuthRequest = {
        codes: generateCodes(),
        initiated: false,
        prompt,
        redirect: redirect_uri,
        scopes,
      };

      requests.value = [...requests.value, request];
    }

    return undefined;
  };
  const redirect = (request: AuthRequest, callback: (url: string) => void) => {
    const url = new URL(`${authority}/oauth2/v2.0/authorize`);

    const { searchParams } = url;

    searchParams.append('client_id', clientId);
    searchParams.append('redirect_uri', request.redirect);
    searchParams.append('prompt', request.prompt);
    searchParams.append('response_type', 'code');
    searchParams.append('scope', request.scopes.join(' '));
    searchParams.append('state', generateScopeHash(request.scopes));
    searchParams.append('code_challenge_method', 'S256');
    searchParams.append('code_challenge', request.codes.challenge);

    request.initiated = true;

    callback(url.toString());
  };

  watch(
    () => requests.value,
    async reqs => {
      console.debug('watch requests', reqs);
      if (reqs.length > 0 && !reqs.find(req => req.initiated)) {
        redirect(reqs[0], async url => {
          window.location.assign(url);
        });
      }
    }
  );

  return {
    authority,
    clientId,
    requests,
    route,
    tokens,
    findRequest,
    getToken,
    redirect,
    setToken,
  };
}
