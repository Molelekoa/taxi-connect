-- FCM device tokens for push notifications.
-- One row per (profile, device token). A user can have several devices.
-- Register/refresh via the `register-device-token` edge function (also used to
-- unregister, by removing the token).

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null default 'android', -- android | ios | web
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, token)
);

create index if not exists idx_device_tokens_profile on public.device_tokens (profile_id);

-- Users may only see/delete their own device tokens.
alter table public.device_tokens enable row level security;

create policy "Users can select their own device tokens"
  on public.device_tokens for select
  using (profile_id = public.get_profile_id(auth.uid()));

create policy "Users can insert their own device tokens"
  on public.device_tokens for insert
  with check (profile_id = public.get_profile_id(auth.uid()));

create policy "Users can update their own device tokens"
  on public.device_tokens for update
  using (profile_id = public.get_profile_id(auth.uid()));

create policy "Users can delete their own device tokens"
  on public.device_tokens for delete
  using (profile_id = public.get_profile_id(auth.uid()));

-- Grant access to authenticated (app) roles and service_role (edge functions).
grant select, insert, update, delete on public.device_tokens to authenticated;
grant select, insert, update, delete on public.device_tokens to service_role;
