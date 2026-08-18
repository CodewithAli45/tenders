This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# GovTender Hub

## Admin login setup

1. In your Supabase project's SQL Editor, run [the admin access migration](./supabase/migrations/20260818000000_admin_access.sql) and [the admin data migration](./supabase/migrations/20260818010000_admin_data.sql).
2. Add these values to `.env.local`. In Supabase **Settings → API**, use the server-only **Secret key** (`sb_secret_…`), or the legacy `service_role` key. Do not use a Publishable (`sb_publishable_…`) or anon key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SESSION_SECRET=your-random-32-byte-secret
```

3. Restart the app and visit `/admin`. On the first visit, create and confirm the admin password. It is then stored as a salted scrypt hash in Supabase. The admin session lasts 12 hours and is stored in an HTTP-only cookie.

The migration enables RLS and prevents browser roles from reading password data. Password verification runs only through the server with Supabase's service-role key.
