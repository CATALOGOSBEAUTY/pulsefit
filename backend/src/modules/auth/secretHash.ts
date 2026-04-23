import crypto from 'crypto';

const DEFAULT_ITERATIONS = 210000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const PREFIX = 'pbkdf2-sha256';

interface CreateSecretHashOptions {
  salt?: string;
  iterations?: number;
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSecretHash(secret: string, options: CreateSecretHashOptions = {}): string {
  const salt = options.salt ?? crypto.randomBytes(16).toString('base64url');
  const iterations = options.iterations ?? DEFAULT_ITERATIONS;
  const hash = crypto.pbkdf2Sync(secret, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');

  return `${PREFIX}:${iterations}:${salt}:${hash}`;
}

export function verifySecretHash(secret: string, storedHash: string): boolean {
  const [prefix, iterationsValue, salt, expected] = storedHash.split(':');
  const iterations = Number(iterationsValue);

  if (prefix !== PREFIX || !Number.isSafeInteger(iterations) || iterations < 1000 || !salt || !expected) {
    return false;
  }

  const calculated = crypto.pbkdf2Sync(secret, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');
  return safeEqualHex(calculated, expected);
}
