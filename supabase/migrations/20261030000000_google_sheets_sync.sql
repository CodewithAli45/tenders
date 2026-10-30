-- Google Sheets synchronisation runs. Each row is one sync execution and also
-- acts as the server-side lock: the partial unique index below allows only one
-- row with status = 'running' at a time, so two admin clicks cannot sync at once.
create table if not exists public.google_sheets_sync_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running'
    check (status in ('running', 'completed', 'completed_with_errors', 'failed')),
  spreadsheet_id text,
  triggered_by text not null default 'admin',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_records integer not null default 0 check (total_records >= 0),
  added integer not null default 0 check (added >= 0),
  updated integer not null default 0 check (updated >= 0),
  skipped integer not null default 0 check (skipped >= 0),
  failed integer not null default 0 check (failed >= 0),
  error_details jsonb
);

create unique index if not exists google_sheets_sync_runs_one_running
  on public.google_sheets_sync_runs (status)
  where status = 'running';

create index if not exists google_sheets_sync_runs_started_at_idx
  on public.google_sheets_sync_runs (started_at desc);

alter table public.google_sheets_sync_runs enable row level security;
revoke all on public.google_sheets_sync_runs from anon, authenticated;
