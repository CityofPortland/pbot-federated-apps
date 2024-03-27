import CryptoJS from 'crypto-js';
import { AuthRequest, PkceCodes } from './types.js';

export const encode = (message: string) =>
  CryptoJS.SHA256(message).toString(CryptoJS.enc.Base64url);

/**
 * Generates a random 32 byte buffer and returns the base64
 * encoded string to be used as a PKCE Code Verifier
 */
export const generateCodeVerifier = (): string =>
  CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64url);

/**
 * Creates a base64 encoded PKCE Code Challenge string from the
 * hash created from the PKCE Code Verifier supplied
 */
export const generateCodeChallenge = (verifier: string): string =>
  encode(verifier);

/**
 * Generates PKCE Codes. See the RFC for more information: https://tools.ietf.org/html/rfc7636
 */
export const generateCodes = (): PkceCodes => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  return {
    verifier,
    challenge,
  };
};

export const decodeToken = (jwt: string) =>
  JSON.parse(
    CryptoJS.enc.Base64url.parse(jwt.split('.')[1]).toString(CryptoJS.enc.Utf8)
  );

export const generateScopeHash = (scopes: Array<string>) => {
  const s = scopes.reduce((acc, curr) => {
    if (curr != 'offline_access') acc.add(curr);
    return acc;
  }, new Set<string>());

  return encode(
    Array.from(s)
      .sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .join('|')
  );
};

/**
 * Check for determining if scopes are contained in another array of scopes.
 * Ignores 'offline_access' because that is never contained in returned scopes.
 * @param left The array of scopes that all need to be contained in the right scopes
 * @param right The array of scopes which must contain the left scopes
 * @returns True if the right scopes contains all the left scopes, false otherwise
 */
export const matchesScopes = (left: Array<string>, right: Array<string>) => {
  const result = left
    // offline_access never appears in returned scopes...
    .filter(scope => scope != 'offline_access')
    .every(scope => right.includes(scope));
  return result;
};

export const redirect = (
  authority: string,
  clientId: string,
  request: AuthRequest,
  callback: (url: string) => void
) => {
  const url = new URL(`${authority}/oauth2/v2.0/authorize`);

  const { searchParams } = url;

  searchParams.append('client_id', clientId);
  searchParams.append('redirect_uri', request.redirect);
  searchParams.append('prompt', request.prompt);
  searchParams.append('response_type', 'code');
  searchParams.append('scope', request.scopes.join(' '));
  searchParams.append('code_challenge_method', 'S256');
  searchParams.append('code_challenge', request.codes.challenge);

  request.initiated = true;

  callback(url.toString());
};
