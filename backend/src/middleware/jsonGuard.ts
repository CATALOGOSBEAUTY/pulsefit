import type { NextFunction, Request, Response } from 'express';
import { ApiError, handleError } from '../lib/http.js';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function assertSafeJsonPayload(value: unknown): void {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    for (const item of value) assertSafeJsonPayload(item);
    return;
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (BLOCKED_KEYS.has(key)) {
      throw new ApiError(400, 'Payload JSON contem chave proibida.');
    }
    assertSafeJsonPayload(nested);
  }
}

export function rejectDangerousJson(req: Request, res: Response, next: NextFunction) {
  try {
    assertSafeJsonPayload(req.body);
    next();
  } catch (error) {
    return handleError(res, error);
  }
}
