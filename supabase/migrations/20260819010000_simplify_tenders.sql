-- Simplify tenders table: PSU-only, remove unused columns
alter table public.tenders drop column if exists category;
alter table public.tenders drop column if exists emd_through;
alter table public.tenders drop column if exists tender_type;
alter table public.tenders drop column if exists form_of_contract;
alter table public.tenders drop column if exists corrigendum;

-- Set defaults so new columns added later won't break existing inserts
alter table public.tenders alter column organization set default 'PSU';
