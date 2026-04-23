import { Router } from 'express';
import { createSession, validateAdminCredentials } from '../../lib/auth.js';
import { handleError, ok, requireString } from '../../lib/http.js';
import { env } from '../../config/env.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { loginKey, rateLimit } from '../../middleware/rateLimit.js';
import { validateAdminAccessCode } from './adminSecrets.js';
import { consumeStoredGateToken, createStoredGateToken } from './gateTokens.js';
import { serializeLogoutCookie, serializeSessionCookie } from './sessionCookie.js';

export const authRouter = Router();

authRouter.post('/gate', rateLimit({
  keyPrefix: 'admin-gate',
  windowMs: env.loginRateLimitWindowMs,
  max: env.loginRateLimitMaxAttempts,
}), async (req, res) => {
  try {
    const accessCode = requireString(req.body.accessCode, 'accessCode');
    await validateAdminAccessCode(accessCode);

    return ok(res, {
      gateToken: await createStoredGateToken(getSupabaseAdmin()),
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
}), async (req, res) => {
  try {
    const email = requireString(req.body.email, 'email');
    const password = requireString(req.body.password, 'password');
    const gateToken = requireString(req.get('x-admin-gate-token') || req.body.gateToken, 'gateToken');

    await consumeStoredGateToken(getSupabaseAdmin(), gateToken);
    const adminEmail = validateAdminCredentials(email, password);
    const token = createSession(adminEmail);

    res.setHeader('Set-Cookie', serializeSessionCookie(token, env.nodeEnv));
    return ok(res, {
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

authRouter.post('/logout', requireAuth, (_req, res) => {
  res.setHeader('Set-Cookie', serializeLogoutCookie(env.nodeEnv));
  return ok(res, { success: true });
});
