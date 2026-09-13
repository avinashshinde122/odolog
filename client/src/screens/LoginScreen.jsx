import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';

const ERROR_MESSAGES = {
  google_denied: "Google sign-in was cancelled — nothing was saved.",
  no_refresh_token: "Google didn't grant a full sign-in this time. Please try again.",
  auth_failed: "Something went wrong finishing sign-in. Please try again.",
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
  </svg>
);

export default function LoginScreen() {
  const [params] = useSearchParams();
  const error = params.get('error');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-tint flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 3c-4.97 0-9 3.5-9 8.5S7.03 20 12 20s9-3.5 9-8.5S16.97 3 12 3Z" stroke="#0E7A64" strokeWidth="1.6" />
          <path d="M12 8v3.6l2.4 1.4" stroke="#0E7A64" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="font-display font-bold text-4xl">
        Odo<span className="text-accent">log</span>
      </h1>
      <p className="text-ink-muted text-sm max-w-[26ch]">Every service, every vehicle, one record.</p>

      {error && (
        <p className="text-sm text-bad bg-bad-tint rounded-lg px-4 py-2 max-w-xs">
          {ERROR_MESSAGES[error] || 'Sign-in failed. Please try again.'}
        </p>
      )}

      <a
        href={api.googleLoginUrl()}
        className="w-full max-w-xs flex items-center justify-center gap-2.5 rounded-xl border border-line bg-surface py-3 px-4 font-medium text-sm hover:border-ink-muted"
      >
        <GoogleIcon />
        Sign in with Google
      </a>
      <p className="text-xs text-ink-muted max-w-[30ch] leading-relaxed">
        We'll create one private spreadsheet named "Odolog Data" in your Google Drive — only this app can read or
        write it, and only you can see it.
      </p>
    </div>
  );
}
