import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const DEFAULT_PERIOD_SECONDS = 30;
const DEFAULT_DIGITS = 6;

interface TotpOptions {
  digits?: number;
  periodSeconds?: number;
  window?: number;
}

interface TotpUriInput {
  issuer: string;
  accountName: string;
  secret: string;
}

export function encodeBase32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function decodeBase32(secret: string): Buffer {
  const normalized = secret.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of normalized) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error('TOTP secret base32 invalido.');
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return encodeBase32(crypto.randomBytes(20));
}

export function generateTotpCode(secret: string, now = new Date(), options: TotpOptions = {}): string {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const periodSeconds = options.periodSeconds ?? DEFAULT_PERIOD_SECONDS;
  const counter = Math.floor(now.getTime() / 1000 / periodSeconds);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', decodeBase32(secret)).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = ((hmac[offset] & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    | (hmac[offset + 3] & 0xff);
  const mod = 10 ** digits;

  return String(binary % mod).padStart(digits, '0');
}

export function verifyTotpCode(code: string, secret: string, now = new Date(), options: TotpOptions = {}): boolean {
  const digits = options.digits ?? DEFAULT_DIGITS;
  if (!new RegExp(`^\\d{${digits}}$`).test(code)) return false;

  const periodSeconds = options.periodSeconds ?? DEFAULT_PERIOD_SECONDS;
  const window = options.window ?? 1;

  for (let drift = -window; drift <= window; drift += 1) {
    const drifted = new Date(now.getTime() + drift * periodSeconds * 1000);
    const expected = generateTotpCode(secret, drifted, { digits, periodSeconds });
    if (crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

export function buildTotpUri(input: TotpUriInput): string {
  const label = `${encodeURIComponent(input.issuer)}:${encodeURIComponent(input.accountName)}`;
  const params = new URLSearchParams({
    secret: input.secret,
    issuer: input.issuer,
    algorithm: 'SHA1',
    digits: String(DEFAULT_DIGITS),
    period: String(DEFAULT_PERIOD_SECONDS),
  });

  return `otpauth://totp/${label}?${params.toString()}`;
}
