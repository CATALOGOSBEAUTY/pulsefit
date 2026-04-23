import type { NextFunction, Request, Response } from 'express';

export function applySecurityHeaders(setHeader: (name: string, value: string) => void) {
  setHeader('Content-Security-Policy', "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  setHeader('X-Content-Type-Options', 'nosniff');
  setHeader('X-Frame-Options', 'DENY');
  setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  setHeader('X-Download-Options', 'noopen');
  setHeader('Referrer-Policy', 'no-referrer');
  setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  setHeader('Cross-Origin-Resource-Policy', 'same-site');
  setHeader('Origin-Agent-Cluster', '?1');
  setHeader('Cache-Control', 'no-store');
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  applySecurityHeaders((name, value) => res.setHeader(name, value));
  next();
}
