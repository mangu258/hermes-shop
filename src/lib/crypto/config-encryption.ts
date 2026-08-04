import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT = 'hermes-payment-config-v1';

function getKey(): Buffer {
  const secret = process.env.CONFIG_ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-fallback-key';
  return scryptSync(secret, SALT, 32);
}

export function encryptConfig(data: Record<string, any>): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptConfig(payload: string | null): Record<string, any> | null {
  if (!payload) return null;
  try {
    const [ivHex, authTagHex, dataHex] = payload.split(':');
    if (!ivHex || !authTagHex || !dataHex) return null;
    const key = getKey();
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch {
    return null;
  }
}

export function maskConfig(
  data: Record<string, any> | null,
  sensitiveKeys: string[]
): Record<string, any> {
  if (!data) return {};
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    result[k] = sensitiveKeys.includes(k) && v ? '••••••••' : v;
  }
  return result;
}
