alter table public.profiles
  add column if not exists stripe_session_id text,
  add column if not exists stripe_customer_id text;