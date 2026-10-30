# GovTender Pro

GovTender Pro is a full stack tender publishing and administration app built with Next.js, TypeScript, and Supabase. It includes a public tender portal, a protected admin area, tender and organization APIs, PDF upload/storage, post-bid tracking, browser-based PDF utilities, and PWA support.

## Requirements

- Node.js (compatible with Next.js 16)
- npm
- A Supabase project
- Optional: a Google Cloud service account with the Google Sheets API enabled, for the admin Google Sheets sync

Dependencies are declared in `package.json` and `package-lock.json`. After cloning, install them with `npm install` when you are ready to run the app.

## Configure Supabase

1. In the Supabase SQL Editor, run every SQL file in [`supabase/migrations`](./supabase/migrations/) in filename order. The migrations create the application tables, access policies, and tender attachment storage bucket.
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
