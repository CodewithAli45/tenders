-- Add structured detail fields for professional tender records
alter table public.tenders add column if not exists payment_terms text;
alter table public.tenders add column if not exists officer_designation text;
alter table public.tenders add column if not exists eligibility_financial text;
alter table public.tenders add column if not exists eligibility_technical text;
alter table public.tenders add column if not exists eligibility_jv text;
alter table public.tenders add column if not exists technical_analysis text;
alter table public.tenders add column if not exists boq_summary text;