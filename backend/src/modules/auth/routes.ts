import { Router } from 'express';
import { createAdminGateToken, createSession, validateAdminAccessCode, validateAdminCredentials, verifyAdminGateToken } from '../../lib/auth.js';
import { handleError, ok, requireString } from '../../lib/http.js';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { loginKey, rateLimit } from '../../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/gate', rateLimit({
  keyPrefix: 'admin-gate',
  windowMs: env.loginRateLimitWindowMs,
  max: env.loginRateLimitMaxAttempts,
}), (req, res) => {
  try {
    const accessCode = requireString(req.body.accessCode, 'accessCode');
    validateAdminAccessCode(accessCode);

    return ok(res, {
      gateToken: createAdminGateToken(),
    });
  } catch (error) {
    return handleError(res, error);
  }
});

authRouter.post('/login', rateLimit({
  keyPrefix: 'login',
  windowMs: env.loginRateLimitWindowMs,
  max: env.loginRateLimitMaxAttempts,
  keyGenerator: loginKey,
}), (req, res) => {
  try {
    const email = requireString(req.body.email, 'email');
    const password = requireString(req.body.password, 'password');
    const gateToken = requireString(req.get('x-admin-gate-token') || req.body.gateToken, 'gateToken');

    verifyAdminGateToken(gateToken);
    const adminEmail = validateAdminCredentials(email, password);
    const token = createSession(adminEmail);

    return ok(res, {
      token,
      user: {
        id: 'admin',
        email: adminEmail,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  return ok(res, {
    user: {
      id: 'admin',
      email: req.admin?.email,
    },
  });
});
