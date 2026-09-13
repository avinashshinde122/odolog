import { decryptSession, SESSION_COOKIE_NAME } from '../utils/sessionCookie.js';
import { clientFromRefreshToken } from '../auth/googleAuth.js';

// Reads and decrypts the session cookie, then attaches the caller's Google
// auth client + spreadsheet id to the request so route handlers don't each
// have to redo that work.
export function requireAuth(req, res, next) {
  const cookieValue = req.cookies[SESSION_COOKIE_NAME];
  const session = cookieValue && decryptSession(cookieValue);
  if (!session) {
    return res.status(401).json({ error: 'Not signed in.' });
  }
  req.session = session;
  req.googleAuth = clientFromRefreshToken(session.refreshToken);
  next();
}
