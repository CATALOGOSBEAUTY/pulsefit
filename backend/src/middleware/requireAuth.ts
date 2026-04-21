import type { NextFunction, Request, Response } from 'express';
import { verifySession } from '../lib/auth.js';
import { handleError } from '../lib/http.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ error: 'Autenticacao obrigatoria.' });
    }

    req.admin = verifySession(token);
    next();
  } catch (error) {
    return handleError(res, error);
  }
}

