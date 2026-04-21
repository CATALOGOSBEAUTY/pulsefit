import type { AdminSession } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSession;
    }
  }
}

export {};

