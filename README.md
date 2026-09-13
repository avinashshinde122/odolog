# Odolog — Vehicle Service Tracker

Log servicing done on your vehicles — date, odometer reading, parts replaced and their price,
labor charge, total cost, and a note (plus an optional km/date reminder) for the next service.

Every user signs in with their own Google account. On first sign-in the app creates one
private spreadsheet, **"Odolog Data"**, in that user's own Google Drive, and all of their
vehicles and service logs live there — there is no separate app database.

A clickable mockup of every screen is in [`docs/mockups/odolog-mockup.html`](docs/mockups/odolog-mockup.html)
(open it in a browser), with static screenshots in [`docs/mockups/screenshots/`](docs/mockups/screenshots/).

## Architecture

```
client/   React + Vite + Tailwind — the UI (screens map 1:1 to the mockup)
server/   Express — Google OAuth + reads/writes to each user's Sheet
```

The client never talks to Google directly. It calls the Express API, which holds the
OAuth session and does all Sheets/Drive API calls server-side.

To keep a future Android build (React Native) cheap, `client/src/api`, `client/src/hooks`
and `client/src/utils` contain no DOM or browser-only code — only `client/src/screens` and
`client/src/components` (plain Tailwind JSX) would need to be rewritten for React Native;
the data layer would carry over as-is.

## 1. Google Cloud setup (one-time)

You need your own Google Cloud project so the app can ask Google to let a user sign in and
grant it access to create/edit its own spreadsheet in that user's Drive.

1. **Create a project** — [console.cloud.google.com](https://console.cloud.google.com/) →
   project picker (top left) → **New Project**. Any name, e.g. "Odolog".
2. **Enable the Google Sheets API** — in the project, go to
   *APIs & Services → Library*, search **Google Sheets API**, click **Enable**.
   (The Drive scope we use for creating the spreadsheet file works through this same API
   enablement — no separate Drive API step needed.)
3. **Configure the OAuth consent screen** — *APIs & Services → OAuth consent screen*.
   - User type: **External** (so anyone with a Google account can sign in, not just your
     own Workspace org).
   - Fill in the app name ("Odolog"), your email as support/developer contact.
   - Scopes: add `.../auth/drive.file`, plus `openid`, `email`, `profile`.
   - **While the app is in "Testing" mode**, only test users you explicitly add (under
     *Test users*) can sign in — add your own Google account (and anyone else testing it)
     there. This is the fastest way to get running.
   - To let *any* Google user sign in (the "multi-user, deployed" scope you asked for),
     you eventually click **Publish App**. Because `drive.file` is a "sensitive" (not
     "restricted") scope, Google requires a basic verification review before the app can
     go past 100 users in production — plan for that once you're ready to launch publicly;
     it isn't needed to build and test the app.
4. **Create an OAuth Client ID** — *APIs & Services → Credentials → Create Credentials →
   OAuth client ID*.
   - Application type: **Web application**.
   - Authorized redirect URIs: add exactly what you'll put in `GOOGLE_REDIRECT_URI` below,
     e.g. `http://localhost:4000/auth/google/callback` for local dev.
   - Save, then copy the **Client ID** and **Client secret** shown.

## 2. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env` and fill it in:

```bash
cd server
cp .env.example .env
```

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from step 1.4 above.
- `GOOGLE_REDIRECT_URI` — must exactly match an authorized redirect URI on that OAuth
  client (`http://localhost:4000/auth/google/callback` for local dev).
- `FRONTEND_URL` — where the React app runs (`http://localhost:5173` for local dev).
- `SESSION_SECRET` — a random 32-byte hex string used to encrypt the login session cookie
  (there's no server-side session database — this is what makes that safe). Generate one:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**Client** — copy `client/.env.example` to `client/.env`:

```bash
cd client
cp .env.example .env
```

- `VITE_API_URL` — where the Express server runs (`http://localhost:4000` for local dev).

## 3. Install and run

From the repo root:

```bash
npm run install:all   # installs server/ and client/ dependencies
npm run dev            # runs both the API (port 4000) and the app (port 5173)
```

Then open **http://localhost:5173** and sign in with a Google account you added as a test
user in step 1.3.

## Data model (inside each user's "Odolog Data" spreadsheet)

- **Vehicles** tab — `ID, Type, Name, Plate, CreatedAt`
- **ServiceLogs** tab — `ID, VehicleID, Date, KM, PartsJSON, Labor, Total, Comment, NextDueKM, NextDueDate, CreatedAt`
  (parts are stored as a JSON array in one cell — a service log's parts list is small and
  doesn't need its own tab)

## v1 scope

- Add vehicles and service logs, and view history/detail — matches the approved mockup.
- No editing or deleting yet (vehicles or logs) — planned as a fast follow.
- Currency is ₹ (INR) throughout.

## Deploying beyond localhost

When you're ready to host this somewhere:

1. Deploy `server/` (e.g. Render, Railway, Fly.io) and `client/` (e.g. Vercel, Netlify)
   separately — this is a plain Node process and a static Vite build, so most hosts work
   with no code changes.
2. Update `GOOGLE_REDIRECT_URI` to the deployed server's callback URL, and add that same
   URL as an authorized redirect URI on the OAuth client in Google Cloud Console.
3. Update `FRONTEND_URL` (server) and `VITE_API_URL` (client) to the deployed URLs.
4. Set `NODE_ENV=production` on the server so the session cookie is marked `secure`
   (HTTPS-only).
5. When you're ready for the public (not just your test users), publish the OAuth consent
   screen and complete Google's verification review (see step 1.3).
