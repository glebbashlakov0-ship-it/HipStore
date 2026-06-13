create table if not exists public.catalog_products (
  id text primary key,
  sku text not null unique,
  slug text,
  source_slug text,
  route_slug text not null unique,
  brand text not null default '',
  title text not null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  old_price numeric(12, 2) check (old_price is null or old_price >= 0),
  currency text not null default 'GBP',
  is_sale boolean not null default false,
  category_path text not null default '',
  category_slug text not null default '',
  gender text not null default '',
  image_url text not null default '',
  main_image_url text not null default '',
  images jsonb not null default '[]'::jsonb,
  description text not null default '',
  short_description text not null default '',
  details text not null default '',
  material text not null default '',
  colour text not null default '',
  sizes jsonb not null default '[]'::jsonb,
  in_stock boolean not null default true,
  source_url text not null default '',
  product_code text not null default '',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalog_products_route_slug_idx on public.catalog_products (route_slug);
create index if not exists catalog_products_brand_idx on public.catalog_products (brand);
create index if not exists catalog_products_category_slug_idx on public.catalog_products (category_slug);
create index if not exists catalog_products_category_path_idx on public.catalog_products (category_path);
create index if not exists catalog_products_sale_idx on public.catalog_products (is_sale) where is_sale;
create index if not exists catalog_products_stock_idx on public.catalog_products (in_stock);
create index if not exists catalog_products_price_idx on public.catalog_products (price);
create index if not exists catalog_products_search_idx on public.catalog_products
  using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(category_path, '')));

alter table public.catalog_products enable row level security;

revoke all on table public.catalog_products from anon, authenticated;
grant select, insert, update, delete on table public.catalog_products to service_role;

drop trigger if exists set_catalog_products_updated_at on public.catalog_products;
create trigger set_catalog_products_updated_at
  before update on public.catalog_products
  for each row execute function public.set_updated_at();
