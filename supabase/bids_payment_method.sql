alter table public.bids
add column if not exists payment_method text;

update public.bids
set payment_method = 'iban'
where payment_method is null
   or btrim(payment_method) = ''
   or payment_method not in ('iban', 'revolut');

alter table public.bids
alter column payment_method set default 'iban';

alter table public.bids
alter column payment_method set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bids_payment_method_check'
      and conrelid = 'public.bids'::regclass
  ) then
    alter table public.bids
    add constraint bids_payment_method_check
    check (payment_method in ('iban', 'revolut'));
  end if;
end
$$;
