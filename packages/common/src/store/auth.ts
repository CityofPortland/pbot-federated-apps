import { defineStore } from 'pinia';
import { watchEffect } from 'vue';

import { query } from '../composables/use-graphql';
import { useLogin } from '../composables/use-login';

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  photo?: Blob;
};

export type AuthContext = {
  user: User | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthContext => ({
    user: null,
  }),
  actions: {
    async initialize() {
      const { accessToken } = useLogin();

      watchEffect(async () => {
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

        graphql.data && this.setUser({ ...graphql.data.me });
      });
    },
    clear() {
      this.setUser(null);
    },
    setUser(user: User | null) {
      this.user = user;
    },
  },
  getters: {
    isLoggedIn: state => (state.user ? true : false),
  },
});
