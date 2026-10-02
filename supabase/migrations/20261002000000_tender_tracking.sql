-- Admin-managed post-bid tracking. Tracking rows are linked to tender records
-- so deadline changes never remove an item from the evaluation workflow.
create table if not exists public.tender_tracking (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null unique
    constraint tender_tracking_tender_id_fkey references public.tenders(id) on delete cascade,
  stage text not null default 'awaiting_bid_opening'
    check (stage in ('awaiting_bid_opening', 'technical_evaluation', 'financial_evaluation', 'awarded', 'cancelled', 'on_hold')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tender_bidders (
  id uuid primary key default gen_random_uuid(),
  tracking_id uuid not null
    constraint tender_bidders_tracking_id_fkey references public.tender_tracking(id) on delete cascade,
  bidder_name text not null,
  technical_status text not null default 'pending'
    check (technical_status in ('pending', 'qualified', 'disqualified', 'not_applicable')),
  quoted_rate numeric check (quoted_rate is null or quoted_rate >= 0),
  financial_rank integer check (financial_rank is null or financial_rank > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tender_tracking_updated_at_idx on public.tender_tracking(updated_at desc);
create index if not exists tender_bidders_tracking_id_idx on public.tender_bidders(tracking_id);

alter table public.tender_tracking enable row level security;
alter table public.tender_bidders enable row level security;
revoke all on public.tender_tracking, public.tender_bidders from anon, authenticated;
