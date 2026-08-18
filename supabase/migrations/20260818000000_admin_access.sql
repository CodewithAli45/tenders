-- Run this migration in the Supabase SQL editor (or through the Supabase CLI).
-- The first visitor to /admin creates the password. The Next.js server stores
-- a unique salted password hash; password hashes are never sent to the browser.
create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supports a table created by the previous version of this feature.
alter table public.admin_credentials add column if not exists password_salt text;
alter table public.admin_credentials enable row level security;

-- No browser role can read or change administrator credentials. The service
-- role is used exclusively from server-only route handlers.
revoke all on table public.admin_credentials from anon, authenticated;
