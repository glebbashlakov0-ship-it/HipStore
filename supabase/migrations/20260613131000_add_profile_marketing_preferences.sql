alter table public.profiles
  add column if not exists marketing_email boolean not null default true,
  add column if not exists marketing_sms boolean not null default false,
  add column if not exists marketing_personalized boolean not null default true;
