import axios from 'axios';
import CryptoJS from 'crypto-js';
import { defineStore } from 'pinia';
import qs from 'qs';

type User = {
  givenName?: string;
  photo?: Blob;
};

export type AuthContext = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthContext => ({
    user: null,
    accessToken: window.localStorage.getItem('pbotapps.auth.access_token'),
    refreshToken: window.localStorage.getItem('pbotapps.auth.refresh_token'),
  }),
  actions: {
    async initialize() {
      let expired = true;

      if (this.accessToken) {
        const payload = JSON.parse(
          CryptoJS.enc.Base64url.parse(this.accessToken.split('.')[1]).toString(
            CryptoJS.enc.Utf8
          )
        );
        expired = new Date(payload.exp * 1000) <= new Date();

        if (expired) {
          // try to get a new access token
          if (this.refreshToken) {
            try {
              const res = await axios.post(
                `https://login.microsoftonline.com/${process.env.VUE_APP_AZURE_TENANT_ID}/oauth2/v2.0/token`,
                qs.stringify({
                  grant_type: 'refresh_token',
                  refresh_token: this.refreshToken,
                  client_id: process.env.VUE_APP_AZURE_CLIENT_ID,
                })
              );
              const { access_token, refresh_token } = res.data;
              this.setTokens(access_token, refresh_token);
            } catch (err) {
              console.error(`Error retrieving token: ${err}`);
              // we couldn't log in silently
              this.clear();
              return;
            }
          } else {
            this.clear();
            return;
          }
        }

        let res = await axios.get('https://graph.microsoft.com/v1.0/me/', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });

        this.setUser(res.data);

        res = await axios.get(
          'https://graph.microsoft.com/v1.0/me/photos/48x48/$value',
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
            responseType: 'blob',
          }
        );

        this.setUser({
          ...this.user,
          photo: res.data,
        });
      }
    },
    clear() {
      this.setUser(null);
      this.setTokens(null, null);
      window.localStorage.removeItem('pbotapps.auth.access_token');
      window.localStorage.removeItem('pbotapps.auth.refresh_token');
    },
    setTokens(access_token: string | null, refresh_token: string | null) {
      this.accessToken = access_token;
      if (access_token) {
        window.localStorage.setItem('pbotapps.auth.access_token', access_token);
      }
      this.refreshToken = refresh_token;
      if (refresh_token) {
        window.localStorage.setItem(
          'pbotapps.auth.refresh_token',
          refresh_token
        );
      }
    },
    setUser(user: User | null) {
      this.user = user;
    },
  },
  getters: {
    isLoggedIn: (state) => (state.user ? true : false),
  },
});
