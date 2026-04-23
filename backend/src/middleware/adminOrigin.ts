import type { Request } from 'express';
import { ApiError } from '../lib/http.js';
import { SESSION_COOKIE_NAME } from '../modules/auth/sessionCookie.js';

interface RequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isUnsafeMethod(method: string | undefined): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase());
}

function hasSessionCookie(cookieHeader: string | undefined): boolean {
  return cookieHeader?.split(';').some((part) => part.trim().startsWith(`${SESSION_COOKIE_NAME}=`)) ?? false;
}

export function assertTrustedAdminOrigin(req: RequestLike, allowedOrigins: string[]): void {
  if (!isUnsafeMethod(req.method)) return;

  const cookie = firstHeader(req.headers.cookie);
  if (!hasSessionCookie(cookie)) return;

  const origin = firstHeader(req.headers.origin);
  if (!origin || !allowedOrigins.includes(origin)) {
    throw new ApiError(403, 'Origem administrativa nao autorizada.');
  }
}

export function requireTrustedAdminOrigin(allowedOrigins: string[]) {
  return (req: Request): void => assertTrustedAdminOrigin(req, allowedOrigins);
}
