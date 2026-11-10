# GovTender Pro

GovTender Pro is a full stack tender publishing and administration app built with Next.js, TypeScript, and Supabase. It includes a public tender portal, a protected admin area, tender and organization APIs, PDF upload/storage, post-bid tracking, browser-based PDF utilities, and PWA support.

## Requirements

- Node.js (compatible with Next.js 16)
- npm
- A Supabase project
- Optional: a Google Cloud service account with the Google Sheets API enabled, for the admin Google Sheets sync

Dependencies are declared in `package.json` and `package-lock.json`. After cloning, install them with `npm install` when you are ready to run the app.

## Configure Supabase

1. In the Supabase SQL Editor, run every SQL file in [`supabase/migrations`](./supabase/migrations/) in filename order. The migrations create the application tables, access policies, and tender attachment storage bucket. This includes `20261110000000_bidder_profiles.sql` for reusable bidder contact details and technical bid display mode.
2. Copy [`.env.example`](./.env.example) to `.env.local` and fill in your Supabase project URL, server-only Secret key (or legacy `service_role` key), and a random session secret. Keep `.env.local` private and out of version control.
3. Restart the app after changing environment variables.

The Supabase key must be server-only. Do not use a Publishable (`sb_publishable_…`) or anon key for `SUPABASE_SERVICE_ROLE_KEY`.

## Configure Google Sheets sync (optional)

1. Enable the Google Sheets API in the Google Cloud project that owns the service account, then create a service-account JSON key.
2. Share the target spreadsheet with the service-account email as **Editor**. The sheet can stay private.
3. Set server-only `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (the full key, with escaped `\n` newlines if it is one line), and `GOOGLE_SHEET_ID` in `.env.local` or the host environment. Never use a `NEXT_PUBLIC_` prefix.
4. Restart the app, open `/admin`, and select **Google Sheets**. Add the private key only in environment settings; never paste it into chat or client code.

`supabase/migrations/20261030000000_google_sheets_sync.sql` creates the sync history/lock table. The Google Sheets section reports a clear setup message until it, the private key, and the spreadsheet sharing are in place.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visit `/admin` to set the initial administrator password after the database migrations and environment variables are configured. The password is stored as a salted scrypt hash, and the admin session uses an HTTP-only cookie.

The migration enables RLS and prevents browser roles from reading password data. Password verification runs only through the server with Supabase's service-role key.

## Main areas

- `/` — public tender dashboard
- `/admin` — protected tender, organization, post-bid, and Google Sheets sync management
- `/tender-document-tools` — browser-based PDF merge, split, arrange, and compression tools
- `/about`, `/tenders/[status]`, `/services/[service]`, and `/tools/[tool]` — informational and supporting routes
- `src/app/api` — public and admin API route handlers
- `supabase/migrations` — ordered database schema and policy migrations

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for the application architecture, API reference, schema, and operational notes.

## Production

Build and run the production server with:

```bash
npm run build
npm start
```

## Android APK (Trusted Web Activity)

The app is configured to run full-screen as an Android app. The manifest uses
`display: "standalone"`, a `/` scope, and maskable icons.

### 1. Digital Asset Links (required)

Android only hides the browser URL bar when it can verify that the app and the
website belong to the same owner. That verification is served from
[`public/.well-known/assetlinks.json`](./public/.well-known/assetlinks.json):

- `package_name`: `app.vercel.tenders_epc.twa`
- `sha256_cert_fingerprints`: the SHA-256 fingerprint of the certificate used to
  sign the installed APK.

This file is already populated for the current package/fingerprint. If you
re-sign the APK, use Play App Signing, or build with a different package name,
update this file with the new values. Include **all** fingerprints that can
sign the app (upload key and Play App Signing key), each as a separate string.

After deploying, confirm it is publicly reachable with **no redirect**:

```bash
curl -i https://YOUR_DOMAIN/.well-known/assetlinks.json
```

It must return `200` with `Content-Type: application/json`.

### 2. Build the APK

You can use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) or
[PWABuilder](https://www.pwabuilder.com/). With Bubblewrap:

```bash
npx @bubblewrap/cli init --manifest https://YOUR_DOMAIN/manifest.webmanifest
npx @bubblewrap/cli build
```

Use the package name `app.vercel.tenders_epc.twa`, or update
`assetlinks.json` to match the package name you choose.

### 3. If the URL bar still appears

- Asset Links verification only covers the certificate of the **installed**
  APK. Debug builds, locally re-signed APKs, and Play-signed APKs can have
  different fingerprints.
- Uninstall the old APK, clear Chrome's data for the site, then reinstall after
  `assetlinks.json` is live. Verification results are cached by Google Play
  services.
- Make sure the APK's host is exactly the deployed HTTPS origin (no `www`
  mismatch, no redirect from `http`).
- Verify the live statement with Google's
  [Statement List Tester](https://developers.google.com/digital-asset-links/tools/generator).
