import crypto from 'crypto';

const PREFIX = 'aes-256-gcm';
const IV_LENGTH = 12;

function keyFromSecret(secret: string): Buffer {
  if (!secret) {
    throw new Error('JWT_SECRET necessario para criptografar segredos admin.');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptSecret(plaintext: string, jwtSecret: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFromSecret(jwtSecret), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':');
}

export function decryptSecret(payload: string, jwtSecret: string): string {
  const [prefix, ivValue, tagValue, encryptedValue] = payload.split(':');
  if (prefix !== PREFIX || !ivValue || !tagValue || !encryptedValue) {
    throw new Error('Formato de segredo criptografado invalido.');
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyFromSecret(jwtSecret), Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
