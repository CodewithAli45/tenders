-- Make organization details optional (can be updated later)
alter table public.organizations alter column details drop not null;
