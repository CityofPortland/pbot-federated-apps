import { BearerStrategy } from 'passport-azure-ad';

export class Strategy extends BearerStrategy {
  constructor() {
    super(
      {
        identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        clientID: process.env.AZURE_CLIENT_ID,
        validateIssuer: true,
        passReqToCallback: true,
      },
      async function (_req, token, done) {
        const user = {
          oauthId: token.oid,
          email: token.upn.toLowerCase(),
          firstName: token.given_name,
          lastName: token.family_name,
        };

        return done(null, user, token);
      }
    );
  }
}
