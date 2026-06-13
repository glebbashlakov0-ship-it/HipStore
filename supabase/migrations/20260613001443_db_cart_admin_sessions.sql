create table if not exists public.shopping_carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'ordered', 'abandoned')),
  currency text not null default 'GBP',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.shopping_carts(id) on delete cascade,
  product_id text not null default '',
  route_slug text not null default '',
  sku text not null default '',
  product_code text not null default '',
  title text not null,
  brand text not null default '',
  selected_size text not null default 'ONE SIZE',
  size_sku text not null default '',
  quantity integer not null default 1 check (quantity between 1 and 99),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  old_price numeric(12, 2),
  currency text not null default 'GBP',
  image_url text not null default '',
  source_url text not null default '',
  in_stock boolean not null default true,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, route_slug, selected_size)
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  token_hash text not null unique,
  role text not null default 'owner',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create index if not exists shopping_carts_customer_active_idx
  on public.shopping_carts (customer_id, updated_at desc)
  where status = 'active';

create index if not exists shopping_cart_items_cart_idx
  on public.shopping_cart_items (cart_id);

create index if not exists admin_sessions_token_hash_idx
  on public.admin_sessions (token_hash)
  where revoked_at is null;

create index if not exists admin_sessions_expires_idx
  on public.admin_sessions (expires_at);

alter table public.shopping_carts enable row level security;
alter table public.shopping_cart_items enable row level security;
alter table public.admin_sessions enable row level security;

grant select, insert, update, delete on public.shopping_carts to service_role;
grant select, insert, update, delete on public.shopping_cart_items to service_role;
grant select, insert, update, delete on public.admin_sessions to service_role;

drop trigger if exists shopping_carts_set_updated_at on public.shopping_carts;
create trigger shopping_carts_set_updated_at
  before update on public.shopping_carts
  for each row execute function public.set_updated_at();

drop trigger if exists shopping_cart_items_set_updated_at on public.shopping_cart_items;
create trigger shopping_cart_items_set_updated_at
  before update on public.shopping_cart_items
  for each row execute function public.set_updated_at();
