alter table public.orders
  add column if not exists payment_provider text not null default 'manual',
  add column if not exists payment_reference text not null default '',
  add column if not exists payment_details jsonb not null default '{}'::jsonb,
  add column if not exists paid_at timestamptz null;

alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('manual_payment', 'card', 'paypal', 'apple_pay', 'klarna', 'future_method'));

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('payment_pending', 'payment_not_configured', 'requires_action', 'authorized', 'paid', 'failed', 'refunded'));

create index if not exists orders_payment_provider_idx on public.orders(payment_provider);
create index if not exists orders_payment_reference_idx on public.orders(payment_reference);
