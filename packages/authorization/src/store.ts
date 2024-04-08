import { RemovableRef } from '@vueuse/core';
import { decodeJwt } from 'jose';
import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';

import { useAuth } from './composable.js';
import { AuthRequest, User } from './types.js';

type Store = {
  authority: Ref<string>;
  clientId: Ref<string>;
  requests: RemovableRef<Array<AuthRequest>>;
  route: RemovableRef<Partial<{ path: string }>>;
  findRequest: (hash: string) => AuthRequest | undefined;
  getToken: (
    scopes?: Array<string>,
    prompt?: 'consent' | 'none' | 'select_account',
    redirect_uri?: string
  ) => Promise<string | undefined>;
  getUser: () => Promise<User>;
  setToken: (
    scopes: Array<string>,
    accessToken: string,
    refreshToken: string
  ) => void;
};

export const createAuthStore = (clientId: string, tenantId: string) =>
  defineStore('auth', () => {
    const { authority, requests, route, findRequest, getToken, setToken } =
      useAuth({
        clientId,
        tenantId,
      });

    const getUser = async () => {
      const token = await getToken();

      if (!token) return undefined;

      const payload = decodeJwt(token);

      return {
        firstName: payload['given_name'],
        lastName: payload['family_name'],
        email: payload['upn'],
        oauthId: payload['oid'],
      };
    };

    return {
      authority: ref(authority),
      clientId: ref(clientId),
      requests,
      route,
      findRequest,
      getToken,
      getUser,
      setToken,
    } as Store;
  });
