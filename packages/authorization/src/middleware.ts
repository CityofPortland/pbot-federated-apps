import { User } from '@pbotapps/objects';
import { RequestHandler } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Knex } from 'knex';
import fetch from 'node-fetch';

import { getUser } from './repository';

type TOptions = {
  fail: boolean;
};

export const handleToken =
  (source: Knex, { fail = true }: TOptions): RequestHandler =>
  async (req, res, next) => {
    const jwksURI = fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      {
        method: 'GET',
      }
    )
      .then(res => res.json())
      .then((json: { jwks_uri: string }) => json.jwks_uri);

    const token = req['token'];

    if (!token && fail) {
      res.status(401);
      res.send({
        error: 'UNAUTHORIZED',
        message: 'You must pass a token to make requests.',
      });
      return;
    } else if (token) {
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
