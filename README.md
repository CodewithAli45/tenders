# GovTender Pro

GovTender Pro is a full stack tender publishing and administration app built with Next.js, TypeScript, and Supabase. It includes a public tender portal, a protected admin area, tender and organization APIs, PDF upload/storage, post-bid tracking, browser-based PDF utilities, and PWA support.

## Requirements

- Node.js (compatible with Next.js 16)
- npm
- A Supabase project

Dependencies are declared in `package.json` and `package-lock.json`. After cloning, install them with `npm install` when you are ready to run the app.

## Configure Supabase

1. In the Supabase SQL Editor, run every SQL file in [`supabase/migrations`](./supabase/migrations/) in filename order. The migrations create the application tables, access policies, and tender attachment storage bucket.
2. Copy [`.env.example`](./.env.example) to `.env.local` and fill in your Supabase project URL, server-only Secret key (or legacy `service_role` key), and a random session secret. Keep `.env.local` private and out of version control.
3. Restart the app after changing environment variables.

The Supabase key must be server-only. Do not use a Publishable (`sb_publishable_…`) or anon key for `SUPABASE_SERVICE_ROLE_KEY`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visit `/admin` to set the initial administrator password after the database migrations and environment variables are configured. The password is stored as a salted scrypt hash, and the admin session uses an HTTP-only cookie.

## Main areas

- `/` — public tender dashboard
- `/admin` — protected tender, organization, and post-bid management
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
