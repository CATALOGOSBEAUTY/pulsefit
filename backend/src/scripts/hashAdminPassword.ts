import crypto from 'crypto';

const password = process.env.ADMIN_PASSWORD ?? process.argv[2];

if (!password) {
  console.error('Informe a senha via ADMIN_PASSWORD ou como argumento.');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');

console.log(`sha256:${salt}:${hash}`);
