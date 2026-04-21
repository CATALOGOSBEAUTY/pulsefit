import type { Response } from 'express';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json(data);
}

export function handleError(res: Response, error: unknown) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }

  const message = error instanceof Error ? error.message : 'Erro interno.';
  return res.status(500).json({ error: message });
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, `Campo obrigatorio: ${field}.`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function requireNumber(value: unknown, field: string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiError(400, `Campo numerico invalido: ${field}.`);
  }
  return parsed;
}

