import { onMounted, Ref, ref } from 'vue';
import { useRouter, RouteRecordRaw, RouteLocationNormalized } from 'vue-router';

import CryptoJS from 'crypto-js';

export type PkceCodes = {
  verifier: string;
  challenge: string;
};

export type LoginContext = {
  clientId?: string;
  authority?: string;
  challenge: Ref<string | undefined>;
  redirectURI: string;
  getReturnLocation: () => RouteRecordRaw;
  saveReturnLocation: (to: RouteLocationNormalized) => void;
};

/**
 * Generates a random 32 byte buffer and returns the base64
 * encoded string to be used as a PKCE Code Verifier
 */
const generateCodeVerifier = (): string =>
  CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64url);

/**
 * Creates a base64 encoded PKCE Code Challenge string from the
 * hash created from the PKCE Code Verifier supplied
 */
const generateCodeChallenge = (pkceCodeVerifier: string): string => {
  try {
    return CryptoJS.SHA256(pkceCodeVerifier).toString(CryptoJS.enc.Base64url);
  } catch (e) {
    throw Error('PKCE not generated');
  }
};

/**
 * Generates PKCE Codes. See the RFC for more information: https://tools.ietf.org/html/rfc7636
 */
const generateCodes = (): PkceCodes => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return {
    verifier: codeVerifier,
    challenge: codeChallenge,
  };
};

export function useLogin(): LoginContext {
  const router = useRouter();
  const challenge: Ref<string | undefined> = ref(undefined);

  onMounted(() => {
    const initiated = window.localStorage.getItem('pbotapps.auth.initiated');
    const codes = window.localStorage.getItem('pbotapps.auth.codes');

    if (!initiated && !codes) {
      const codes: PkceCodes = generateCodes();
      challenge.value = codes.challenge;
      window.localStorage.setItem('pbotapps.auth.codes', JSON.stringify(codes));
    } else {
      challenge.value = JSON.parse(codes || '{}').challenge;
    }
  });

  const getReturnLocation = () => {
    return JSON.parse(window.localStorage.getItem('pbotapps.auth.route') || '');
  };
  const saveReturnLocation = (to: RouteLocationNormalized) => {
    const { name, path, params, query, hash } = to;
    window.localStorage.setItem(
      'pbotapps.auth.route',
      JSON.stringify({ name, path, params, query, hash })
    );
  };

  const redirectURI = new URL(
    router &&
      router.resolve({
        name: 'OAuthCallback',
      }).href,
    window.location.origin
  ).toString();

  return {
    authority: `https://login.microsoftonline.com/${process.env.VUE_APP_AZURE_TENANT_ID}`,
    clientId: process.env.VUE_APP_AZURE_CLIENT_ID,
    challenge,
    redirectURI,
    getReturnLocation,
    saveReturnLocation,
  };
}
