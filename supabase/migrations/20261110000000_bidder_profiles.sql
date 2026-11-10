-- Reusable bidder directory and per-tender technical bid display mode.
create table if not exists public.bidder_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_person text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tender_tracking
  add column if not exists technical_bid_mode text not null default 'detailed'
  check (technical_bid_mode in ('summary', 'detailed'));

alter table public.tender_bidders
  add column if not exists bidder_profile_id uuid references public.bidder_profiles(id) on delete set null;

alter table public.bidder_profiles enable row level security;
revoke all on public.bidder_profiles from anon, authenticated;

-- Keep existing bidder names reusable without changing their tender results.
insert into public.bidder_profiles (name)
select distinct b.bidder_name
from public.tender_bidders b
where nullif(trim(b.bidder_name), '') is not null
on conflict (name) do nothing;

update public.tender_bidders b
set bidder_profile_id = p.id
from public.bidder_profiles p
where b.bidder_profile_id is null and p.name = b.bidder_name;
