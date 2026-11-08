create table if not exists public.platform_news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  summary text not null check (char_length(btrim(summary)) between 10 and 300),
  content text not null check (char_length(btrim(content)) between 20 and 20000),
  category text not null default 'Update' check (char_length(btrim(category)) between 2 and 50),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_news_published_at_idx
  on public.platform_news (published_at desc)
  where published = true;

alter table public.platform_news enable row level security;
revoke all on public.platform_news from anon, authenticated;
