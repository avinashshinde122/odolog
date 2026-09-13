import crypto from 'node:crypto';
import { config } from '../config.js';

// The session cookie carries the user's Google refresh token and the id of
// their "Odolog Data" spreadsheet. There is no server-side session store —
// encrypting the payload into the cookie itself means the whole app stays
// stateless and needs no database beyond each user's own Google Sheet.

const ALGORITHM = 'aes-256-gcm';
const key = crypto.createHash('sha256').update(config.sessionSecret).digest();

export function encryptSession(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}

export function decryptSession(cookieValue) {
  try {
    const raw = Buffer.from(cookieValue, 'base64url');
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = 'odolog_session';
