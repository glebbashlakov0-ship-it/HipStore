create table if not exists public.profile_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Delivery Address',
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  address text not null default '',
  address_2 text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  country text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_addresses_user_id_idx
on public.profile_addresses(user_id);

create unique index if not exists profile_addresses_one_default_per_user
on public.profile_addresses(user_id)
where is_default;

drop trigger if exists profile_addresses_set_updated_at on public.profile_addresses;
create trigger profile_addresses_set_updated_at
before update on public.profile_addresses
for each row execute function public.set_updated_at();

alter table public.profile_addresses enable row level security;

drop policy if exists profile_addresses_select_own_or_admin on public.profile_addresses;
create policy profile_addresses_select_own_or_admin
on public.profile_addresses
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists profile_addresses_insert_own on public.profile_addresses;
create policy profile_addresses_insert_own
on public.profile_addresses
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists profile_addresses_update_own_or_admin on public.profile_addresses;
create policy profile_addresses_update_own_or_admin
on public.profile_addresses
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists profile_addresses_delete_own_or_admin on public.profile_addresses;
create policy profile_addresses_delete_own_or_admin
on public.profile_addresses
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

insert into public.profile_addresses (
  user_id,
  label,
  first_name,
  last_name,
  phone,
  address,
  city,
  state,
  postal_code,
  country,
  is_default,
  created_at,
  updated_at
)
select
  p.id,
  'Default Address',
  p.first_name,
  p.last_name,
  p.phone,
  p.address,
  p.city,
  p.state,
  p.postal_code,
  p.country,
  true,
  p.created_at,
  p.updated_at
from public.profiles p
where (
  coalesce(p.address, '') <> ''
  or coalesce(p.city, '') <> ''
  or coalesce(p.state, '') <> ''
  or coalesce(p.postal_code, '') <> ''
  or coalesce(p.country, '') <> ''
)
and not exists (
  select 1
  from public.profile_addresses pa
  where pa.user_id = p.id
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  profile_address text := coalesce(metadata ->> 'address', '');
  profile_address_2 text := coalesce(metadata ->> 'address_2', '');
  profile_city text := coalesce(metadata ->> 'city', '');
  profile_state text := coalesce(metadata ->> 'state', '');
  profile_postal_code text := coalesce(metadata ->> 'postal_code', '');
  profile_country text := coalesce(metadata ->> 'country', '');
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    country,
    address,
    city,
    state,
    postal_code
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(metadata ->> 'first_name', ''),
    coalesce(metadata ->> 'last_name', ''),
    coalesce(metadata ->> 'phone', ''),
    profile_country,
    profile_address,
    profile_city,
    profile_state,
    profile_postal_code
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    country = excluded.country,
    address = excluded.address,
    city = excluded.city,
    state = excluded.state,
    postal_code = excluded.postal_code,
    updated_at = now();

  if (
    profile_address <> ''
    or profile_address_2 <> ''
    or profile_city <> ''
    or profile_state <> ''
    or profile_postal_code <> ''
    or profile_country <> ''
  ) then
    insert into public.profile_addresses (
      user_id,
      label,
      first_name,
      last_name,
      phone,
      address,
      address_2,
      city,
      state,
      postal_code,
      country,
      is_default
    )
    select
      new.id,
      'Default Address',
      coalesce(metadata ->> 'first_name', ''),
      coalesce(metadata ->> 'last_name', ''),
      coalesce(metadata ->> 'phone', ''),
      profile_address,
      profile_address_2,
      profile_city,
      profile_state,
      profile_postal_code,
      profile_country,
      true
    where not exists (
      select 1
      from public.profile_addresses pa
      where pa.user_id = new.id
    );
  end if;

  return new;
end;
$$;
