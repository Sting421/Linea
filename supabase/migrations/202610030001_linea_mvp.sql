-- Linea MVP production schema. Apply in a disposable Supabase project first.
-- Detailed text is separated from structured history. No audio-storage bucket.
create extension if not exists pgcrypto;

create table public.elders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 80),
  preferred_name text not null check (char_length(preferred_name) between 1 and 80),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  timezone text not null default 'Asia/Manila',
  language text not null default 'en-US' check (language='en-US'),
  call_time time not null check (call_time >= '06:00' and call_time < '21:00'),
  medicine text not null,
  medicine_time time not null,
  enrolled boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.family_members (
  elder_id uuid not null references public.elders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'family' check (role in ('owner','family')),
  primary key (elder_id,user_id)
);
create function public.is_family(eid uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists (select 1 from public.family_members where elder_id=eid and user_id=auth.uid());
$$;
create function public.seed_owner_membership() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.family_members(elder_id,user_id,role) values (new.id,new.owner_id,'owner');
  return new;
end; $$;
create trigger elder_owner after insert on public.elders for each row execute function public.seed_owner_membership();

create table public.contacts (
  id uuid primary key default gen_random_uuid(), elder_id uuid not null references public.elders(id) on delete cascade,
  position smallint not null check (position between 1 and 3), name text not null, relationship text not null,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'), nearby boolean not null default false,
  unique(elder_id,position)
);
create table public.consents (
  elder_id uuid primary key references public.elders(id) on delete cascade,
  decision text not null check (decision in ('pending','granted','declined')),
  words text, decided_at timestamptz,
  check ((decision='pending') or (words is not null and decided_at is not null))
);

-- A profile can be removed without restarting history retention.
create table public.checkins (
  id uuid primary key default gen_random_uuid(), elder_id uuid references public.elders(id) on delete set null,
  owner_id uuid not null references auth.users(id),
  local_date date not null, created_at timestamptz not null default now(), ended_at timestamptz,
  state text not null check (state in ('ringing','connected','retry_scheduled','reconnecting','ended')),
  mode text not null check (mode in ('CONSENT','SCRIPT','LISTEN','EMERGENCY','ENDING')),
  complete boolean not null default false, medicine_result text not null default 'unknown' check (medicine_result in ('taken','not_taken','unknown')),
  medicine_due boolean, dose_period date,
  initial_attempts smallint not null default 0 check (initial_attempts between 0 and 2),
  reconnect_used boolean not null default false, emergency_latched boolean not null default false,
  intentional_end boolean not null default false, retry_at timestamptz,
  suspended_retry_at timestamptz, suspended_retry_state text,
  structured_expires_at timestamptz
);
create function public.anchor_checkin_expiry() returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='UPDATE' and old.ended_at is not null and new.ended_at is distinct from old.ended_at then
    raise exception 'Original logical check-in end cannot be changed';
  end if;
  new.structured_expires_at := ((new.ended_at at time zone 'UTC') + interval '365 days') at time zone 'UTC';
  return new;
end; $$;
create trigger checkin_expiry before insert or update on public.checkins for each row execute function public.anchor_checkin_expiry();
create unique index one_active_call_per_elder on public.checkins(elder_id) where state in ('ringing','connected','reconnecting');
create index checkins_family_day on public.checkins(elder_id,local_date);
create table public.phone_legs (
  id uuid primary key default gen_random_uuid(), checkin_id uuid not null references public.checkins(id) on delete cascade,
  kind text not null check (kind in ('initial','retry','reconnect','manual')),
  state text not null check (state in ('ringing','connected','no_answer','failed','dropped','ended')),
  started_at timestamptz not null, ended_at timestamptz, provider_leg_id text
);
create table public.alerts (
  id uuid primary key default gen_random_uuid(), checkin_id uuid not null references public.checkins(id) on delete cascade,
  incident_id text not null,
  concern text not null check (concern in ('FALL','BREATHING','CHEST_PAIN','DIZZINESS','MEDICINE_NOT_TAKEN','CALL_CONNECTION')),
  tier text check (tier in ('routine','significant','emergency')), subject text not null check (subject in ('elder','other')),
  actual_fall boolean,
  assessment text not null check (assessment in ('pending','complete')),
  reason_code text not null, created_at timestamptz not null default now(),
  handled_at timestamptz, handled_by uuid references auth.users(id),
  unique(checkin_id,incident_id)
);
create table public.checkin_details (
  checkin_id uuid primary key references public.checkins(id) on delete cascade,
  transcript jsonb not null default '[]', summary text,
  -- Runtime facts/answers contain text: they share the 90-day deadline.
  runtime_context jsonb not null default '{}'
);
create table public.alert_details (
  alert_id uuid primary key references public.alerts(id) on delete cascade,
  quotation text not null, evidence jsonb not null default '[]'
);
create table public.family_presence (
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  user_id uuid not null references auth.users(id), uid bigint not null check (uid>=2002),
  joined_at timestamptz, left_at timestamptz,
  primary key(checkin_id,user_id), unique(checkin_id,uid)
);
-- Presence means provider-confirmed join, never merely token issuance.
create table public.provider_events (
  event_id text primary key, checkin_id uuid not null references public.checkins(id) on delete cascade,
  leg_id uuid references public.phone_legs(id), kind text not null, received_at timestamptz not null default now()
);
create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(), alert_id uuid not null references public.alerts(id) on delete cascade,
  revision integer not null, state text not null default 'pending' check (state in ('pending','sent','failed')),
  created_at timestamptz not null default now(), delivered_at timestamptz,
  unique(alert_id,revision)
  -- No quotation copy. Fetch permitted detail at delivery time, honor its expiry.
);
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null, p256dh text not null, auth text not null, unique(user_id,endpoint)
);

create function public.can_read_checkin(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists (select 1 from public.checkins c where c.id=cid and
    (c.owner_id=auth.uid() or public.is_family(c.elder_id)) and
    (c.structured_expires_at is null or c.structured_expires_at>now()));
$$;
alter table public.elders enable row level security;
alter table public.family_members enable row level security;
alter table public.contacts enable row level security;
alter table public.consents enable row level security;
alter table public.checkins enable row level security;
alter table public.phone_legs enable row level security;
alter table public.alerts enable row level security;
alter table public.checkin_details enable row level security;
alter table public.alert_details enable row level security;
alter table public.family_presence enable row level security;
alter table public.provider_events enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.push_subscriptions enable row level security;

create policy elder_read on public.elders for select to authenticated using (public.is_family(id));
create policy elder_create on public.elders for insert to authenticated with check (owner_id=auth.uid());
create policy elder_update on public.elders for update to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy family_read on public.family_members for select to authenticated using (public.is_family(elder_id));
create policy contacts_read on public.contacts for select to authenticated using (public.is_family(elder_id));
create policy consent_read on public.consents for select to authenticated using (public.is_family(elder_id));
-- Consent, severity, call-state and handling writes go through the authorized API.
create policy checkins_read on public.checkins for select to authenticated using (public.can_read_checkin(id));
create policy legs_read on public.phone_legs for select to authenticated using (public.can_read_checkin(checkin_id));
create policy alerts_read on public.alerts for select to authenticated using (public.can_read_checkin(checkin_id));
create policy details_read on public.checkin_details for select to authenticated using (public.can_read_checkin(checkin_id) and exists(select 1 from public.checkins c where c.id=checkin_id and (c.ended_at is null or c.ended_at+interval '90 days'>now())));
create policy quotations_read on public.alert_details for select to authenticated using (exists(select 1 from public.alerts a join public.checkins c on c.id=a.checkin_id where a.id=alert_id and public.can_read_checkin(c.id) and (c.ended_at is null or c.ended_at+interval '90 days'>now())));
create policy presence_read on public.family_presence for select to authenticated using (public.can_read_checkin(checkin_id));
create policy subscriptions_own on public.push_subscriptions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
-- provider_events/outbox have no user-facing policies; service role only.

create function public.expire_linea_history() returns void language plpgsql security definer set search_path='' as $$
begin
  delete from public.alert_details d using public.alerts a,public.checkins c
    where d.alert_id=a.id and a.checkin_id=c.id and c.ended_at+interval '90 days'<=now();
  delete from public.checkin_details d using public.checkins c
    where d.checkin_id=c.id and c.ended_at+interval '90 days'<=now();
  delete from public.checkins where structured_expires_at<=now();
end; $$;
revoke all on function public.expire_linea_history() from public, anon, authenticated;
grant execute on function public.expire_linea_history() to service_role;

-- Use within the same DB transaction as reservation/increment/provider command
-- outbox insertion. Never hold a lock only in a separate HTTP RPC transaction.
create function public.lock_elder_placement(eid uuid) returns void language sql security definer set search_path='' as $$
  select pg_advisory_xact_lock(hashtextextended(eid::text,0));
$$;
revoke all on function public.lock_elder_placement(uuid) from public, anon, authenticated;
grant execute on function public.lock_elder_placement(uuid) to service_role;
