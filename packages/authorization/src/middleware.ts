import { BaseType, User } from '@pbotapps/objects';
import { Request, RequestHandler } from 'express';
import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
import fetch from 'node-fetch';

import { RuleRepository, UserRepository } from './repository.js';

export const handleToken =
  ({ fail = true }): RequestHandler =>
  async (req, res, next) => {
    const token = req['token'] || req.header('Authorization')?.split(' ')[1];

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

      try {
        const { payload } = await jwtVerify(
          token,
          createRemoteJWKSet(new URL(await jwksURI)),
          {
            issuer: `https://sts.windows.net/${process.env.AZURE_TENANT_ID}/`,
            audience: process.env.AZURE_CLIENT_ID,
          }
        );
        req['token'] = payload;
      } catch {
        res.status(401);
        res.send({
          error: 'UNAUTHORIZED',
          message: 'Invalid token!',
        });
        return;
      }
    }

    next();
  };

function userFromRequest(req: Request) {
  let user = req['user'];

  if (user) return user;

  const token = req['token'] as JWTPayload;

  if (!token) return undefined;

  user = req['user'] = {
    _id: token.upn,
    email: token.upn,
    oauthId: token.oid,
  };

  return user;
}

export const handleUser =
  (repository: UserRepository): RequestHandler =>
  async (req, _, next) => {
    const user = userFromRequest(req);
    if (user) {
      req['user'] = await repository.getUser({ ...user });
    }
    next();
  };

export const handleRules =
  (repository: RuleRepository, application: BaseType): RequestHandler =>
  async (req, _, next) => {
    // Presuming this to be set by handleUser?
    const user = userFromRequest(req) as User;

    if (user) req['rules'] = await repository.getRules({ user, application });

    next();
  };
