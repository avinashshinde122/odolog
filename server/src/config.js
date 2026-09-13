import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy server/.env.example to server/.env and fill it in.`);
  }
  return value;
}

export const config = {
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: required('GOOGLE_REDIRECT_URI'),
  frontendUrl: required('FRONTEND_URL'),
  sessionSecret: required('SESSION_SECRET'),
  port: Number(process.env.PORT) || 4000,
};
