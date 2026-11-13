import type { User } from '@pbotapps/objects';
import type { JWTPayload } from 'jose';

import type { Rule } from './repository.js';

declare global {
  namespace Express {
    interface Request {
      token?: JWTPayload;
      user?: User;
      rules?: Rule[];
    }
  }
}
