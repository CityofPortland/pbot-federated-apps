import { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import fetch from 'node-fetch';
import { UserRepository } from './repository.js';

export const handleToken =
  ({ fail = true }): RequestHandler =>
  async (req, res, next) => {
    const token = req['token'];

    if (!token && fail) {
      res.status(401);
      res.send({
        error: 'UNAUTHORIZED',
        message: 'You must pass a token to make requests.',
      });
      return;
    } else if (token) {
      const jwksURI = fetch(
        `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        {
          method: 'GET',
        }
      )
        .then(res => res.json())
        .then((json: { jwks_uri: string }) => json.jwks_uri);

      const { payload } = await jwtVerify(
        token,
        createRemoteJWKSet(new URL(await jwksURI)),
        {
          issuer: `https://sts.windows.net/${process.env.AZURE_TENANT_ID}/`,
          audience: process.env.AZURE_CLIENT_ID,
        }
      );

      req['token'] = payload;
    }

    next();
  };

export const handleUser =
  (repository: UserRepository): RequestHandler =>
  async (req, _, next) => {
    const token = req['token'];

    if (token) {
      // Presume this to be verified and replaced with decrypted payload
      req.user = await repository.getUser({ oauthId: token['oid'] });
    }

    next();
  };
