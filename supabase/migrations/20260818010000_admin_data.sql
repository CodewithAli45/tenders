-- Admin data: all application records and files are stored in Supabase.
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  details text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  internal_id text not null unique,
  title text not null,
  organization text not null,
  category text not null,
  tender_value numeric not null,
  tender_no text not null,
  portal_id text not null,
  emd_amount numeric not null,
  emd_through text not null,
  publish_date date not null,
  due_date date not null,
  tender_type text not null,
  form_of_contract text not null,
  corrigendum boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  file_url text not null,
  attachment_type text not null check (attachment_type in ('document', 'corrigendum')),
  created_at timestamptz not null default now()
);

create index if not exists tenders_created_at_idx on public.tenders (created_at desc);
create index if not exists organizations_created_at_idx on public.organizations (created_at desc);
create index if not exists attachments_tender_id_idx on public.attachments (tender_id);

alter table public.tenders enable row level security;
alter table public.organizations enable row level security;
alter table public.attachments enable row level security;
revoke all on public.tenders, public.organizations, public.attachments from anon, authenticated;

-- The server uploads files with the service-role key. The bucket is public so
-- the admin can open a stored attachment URL; no browser write policy exists.
insert into storage.buckets (id, name, public)
values ('tender-attachments', 'tender-attachments', true)
on conflict (id) do update set public = true;
