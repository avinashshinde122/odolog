import { google } from 'googleapis';
import { config } from '../config.js';

// drive.file is the "per-file" Drive scope: it only ever grants access to
// files this app itself created (like the user's Odolog Data spreadsheet),
// never their whole Drive. It also covers Sheets API reads/writes on those
// same files, so we don't need the broader `spreadsheets` scope too.
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
];

export function createOAuthClient() {
  return new google.auth.OAuth2(config.googleClientId, config.googleClientSecret, config.googleRedirectUri);
}

export function getAuthUrl(state) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline', // required to receive a refresh_token
    prompt: 'consent', // forces refresh_token on every login, not just the first
    scope: GOOGLE_SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function fetchUserProfile(accessToken) {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ auth: client, version: 'v2' });
  const { data } = await oauth2.userinfo.get();
  return { email: data.email, name: data.name, picture: data.picture };
}

// Rebuilds an authed client from a stored refresh token. googleapis
// transparently exchanges it for a fresh access token on the first API call.
export function clientFromRefreshToken(refreshToken) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
