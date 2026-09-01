-- Add extra tender detail fields: scope of work, location, and contact info
alter table public.tenders add column if not exists scope_of_work text;
alter table public.tenders add column if not exists location text;
alter table public.tenders add column if not exists contact_person text;
alter table public.tenders add column if not exists contact_phone text;
alter table public.tenders add column if not exists contact_email text;