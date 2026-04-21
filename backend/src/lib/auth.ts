import crypto from 'crypto';
import { ApiError } from './http.js';
import { env } from '../config/env.js';

export interface AdminSession {
  email: string;
  role: 'admin';
}

interface AdminGateToken {
  purpose: 'admin-gate';
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(value: string): string {
  if (!env.jwtSecret) {
    throw new ApiError(503, 'JWT_SECRET nao configurado no backend.');
  }
  return crypto.createHmac('sha256', env.jwtSecret).update(value).digest('base64url');
}

export function createSession(email: string): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    email,
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  }));
  const body = `${header}.${payload}`;
  return `${body}.${sign(body)}`;
}

export function createAdminGateToken(): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    purpose: 'admin-gate',
    exp: Math.floor(Date.now() / 1000) + 60 * 10,
  }));
  const body = `${header}.${payload}`;
  return `${body}.${sign(body)}`;
}

export function verifySession(token: string): AdminSession {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    throw new ApiError(401, 'Sessao invalida.');
  }

  const body = `${header}.${payload}`;
  if (sign(body) !== signature) {
    throw new ApiError(401, 'Sessao invalida.');
  }

  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession & { exp: number };
  if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'Sessao expirada.');
  }

  return { email: parsed.email, role: 'admin' };
}

export function verifyAdminGateToken(token: string): void {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    throw new ApiError(401, 'Acesso admin invalido.');
  }

  const body = `${header}.${payload}`;
  if (sign(body) !== signature) {
    throw new ApiError(401, 'Acesso admin invalido.');
  }

  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminGateToken;
  if (parsed.purpose !== 'admin-gate' || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'Acesso admin expirado.');
  }
}

function verifyPasswordHash(password: string, hashConfig: string): boolean {
  const [algorithm, salt, expected] = hashConfig.split(':');
  if (algorithm !== 'sha256' || !salt || !expected) return false;

  const calculated = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(expected));
}

export function validateAdminCredentials(email: string, password: string): string {
  if (!env.adminEmail || (!env.adminPassword && !env.adminPasswordHash)) {
    throw new ApiError(503, 'Credenciais admin nao configuradas no backend.');
  }

  const emailMatches = email.trim().toLowerCase() === env.adminEmail.trim().toLowerCase();
  const passwordMatches = env.adminPasswordHash
    ? verifyPasswordHash(password, env.adminPasswordHash)
    : password === env.adminPassword;

  if (!emailMatches || !passwordMatches) {
    throw new ApiError(401, 'Credenciais invalidas.');
  }

  return env.adminEmail;
}

export function validateAdminAccessCode(accessCode: string): void {
  if (!env.adminAccessCode) {
    throw new ApiError(503, 'Codigo de acesso admin nao configurado no backend.');
  }

  const provided = Buffer.from(accessCode);
  const expected = Buffer.from(env.adminAccessCode);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new ApiError(403, 'Codigo de acesso invalido.');
  }
}
