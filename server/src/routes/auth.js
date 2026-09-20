import crypto from 'node:crypto';
import { Router } from 'express';
import { config } from '../config.js';
import { getAuthUrl, exchangeCodeForTokens, fetchUserProfile, clientFromRefreshToken } from '../auth/googleAuth.js';
import { ensureSpreadsheet } from '../sheets/sheetsService.js';
import { encryptSession, SESSION_COOKIE_NAME } from '../utils/sessionCookie.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRouter = Router();

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  // Frontend and backend are on different domains in production (Vercel/Render), so the
  // session cookie only reaches cross-site fetch requests with SameSite=None — which in
  // turn requires Secure. Locally both run on "localhost" (same-site), where Lax is enough.
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days — refresh tokens don't expire on their own
  path: '/',
};

const STATE_COOKIE_NAME = 'odolog_oauth_state';
const stateCookieOptions = { ...cookieOptions, maxAge: 5 * 60 * 1000 };

authRouter.get('/google', (req, res) => {
  // A random per-attempt state, checked on callback, stops an attacker from
  // handing a victim a login link that binds their session to the attacker's
  // Google account (a login CSRF).
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE_NAME, state, stateCookieOptions);
  res.redirect(getAuthUrl(state));
});

authRouter.get('/google/callback', async (req, res) => {
  const { code, error, state } = req.query;
  const expectedState = req.cookies[STATE_COOKIE_NAME];
  res.clearCookie(STATE_COOKIE_NAME, { ...stateCookieOptions, maxAge: undefined });

  if (error || !code) {
    return res.redirect(`${config.frontendUrl}/login?error=google_denied`);
  }
  if (!expectedState || state !== expectedState) {
    return res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // Google only issues a refresh_token the first time a user consents (or
      // after prompt=consent, which we always pass — see getAuthUrl). If it's
      // still missing here the account needs to revoke access and try again.
      return res.redirect(`${config.frontendUrl}/login?error=no_refresh_token`);
    }

    const profile = await fetchUserProfile(tokens.access_token);
    const auth = clientFromRefreshToken(tokens.refresh_token);
    const spreadsheetId = await ensureSpreadsheet(auth, null);

    const session = { refreshToken: tokens.refresh_token, spreadsheetId, ...profile };
    res.cookie(SESSION_COOKIE_NAME, encryptSession(session), cookieOptions);
    res.redirect(`${config.frontendUrl}/vehicles`);
  } catch (err) {
    console.error('Google OAuth callback failed:', err);
    res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (req, res) => {
  const { email, name, picture } = req.session;
  res.json({ email, name, picture });
});
