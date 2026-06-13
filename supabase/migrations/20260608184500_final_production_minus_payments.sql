create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  country text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = check_user_id
      and au.is_active = true
      and au.role in ('admin', 'staff')
  );
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid null references auth.users(id) on delete set null,
  email text not null,
  phone text not null,
  first_name text not null,
  last_name text not null,
  shipping_address text not null,
  shipping_address_2 text not null default '',
  shipping_city text not null,
  shipping_state text not null default '',
  shipping_postcode text not null,
  shipping_country text not null,
  status text not null default 'payment_pending' check (status in ('payment_pending', 'processing', 'shipped', 'completed', 'cancelled')),
  payment_status text not null default 'payment_not_configured' check (payment_status in ('payment_pending', 'payment_not_configured')),
  payment_method text not null default 'manual_payment' check (payment_method in ('manual_payment')),
  currency text not null default 'GBP',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  shipping numeric(12,2) not null default 0 check (shipping >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  source text not null default 'checkout',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_email_idx on public.orders(lower(email));
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  route_slug text not null,
  sku text not null,
  product_code text not null,
  title text not null,
  brand text not null default '',
  selected_size text not null default '',
  quantity integer not null check (quantity > 0 and quantity <= 99),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  old_price numeric(12,2) null check (old_price is null or old_price >= 0),
  image_url text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);
create index if not exists order_items_route_slug_idx on public.order_items(route_slug);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status text null,
  new_status text not null,
  changed_by uuid null references auth.users(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id, created_at desc);

create table if not exists public.inventory_snapshot (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  route_slug text not null,
  sku text not null default '',
  selected_size text not null default '',
  quantity_available integer null,
  is_available boolean not null default true,
  source_updated_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_snapshot_product_size_idx on public.inventory_snapshot(product_id, selected_size);

create table if not exists public.product_overrides (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  route_slug text not null,
  is_active boolean not null default true,
  override jsonb not null default '{}'::jsonb,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_overrides_product_id_idx on public.product_overrides(product_id);

drop trigger if exists product_overrides_set_updated_at on public.product_overrides;
create trigger product_overrides_set_updated_at
before update on public.product_overrides
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.inventory_snapshot enable row level security;
alter table public.product_overrides enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists admin_users_select_admin on public.admin_users;
create policy admin_users_select_admin
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists orders_select_own_or_admin on public.orders;
create policy orders_select_own_or_admin
on public.orders
for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists order_items_select_own_or_admin on public.order_items;
create policy order_items_select_own_or_admin
on public.order_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.customer_id = auth.uid()
  )
);

drop policy if exists order_status_history_select_own_or_admin on public.order_status_history;
create policy order_status_history_select_own_or_admin
on public.order_status_history
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_status_history.order_id
      and o.customer_id = auth.uid()
  )
);

drop policy if exists inventory_snapshot_admin_all on public.inventory_snapshot;
create policy inventory_snapshot_admin_all
on public.inventory_snapshot
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists product_overrides_admin_all on public.product_overrides;
create policy product_overrides_admin_all
on public.product_overrides
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.profiles (id, email, first_name, last_name, phone, created_at, updated_at)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', ''),
  coalesce(u.raw_user_meta_data ->> 'phone', ''),
  coalesce(u.created_at, now()),
  now()
from auth.users u
on conflict (id) do update
set
  email = excluded.email,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  phone = excluded.phone,
  updated_at = now();
