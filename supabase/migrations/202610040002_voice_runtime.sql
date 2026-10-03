-- Private durable policy state and queues. Family access remains through RLS.
create table public.linea_runtime (
  checkin_id uuid primary key references public.checkins(id) on delete cascade,
  payload jsonb not null
);
create table public.linea_runtime_locks (
  elder_id uuid primary key references public.elders(id) on delete cascade,
  lease uuid not null, expires_at timestamptz not null
);
create table public.linea_commands (
  id uuid primary key, checkin_id uuid not null references public.checkins(id) on delete cascade,
  leg_id uuid not null references public.phone_legs(id) on delete cascade,
  kind text not null check (kind in ('place','speak','end')),
  text text, state text not null default 'pending'
    check (state in ('pending','inflight','done','failed','uncertain')),
  created_at timestamptz not null default now(), not_before timestamptz not null default now()
);
create table public.linea_event_inbox (
  id text primary key, checkin_id uuid not null references public.checkins(id) on delete cascade,
  leg_id uuid not null references public.phone_legs(id) on delete cascade,
  agent_id text not null, kind text not null, report_ms bigint not null,
  state text not null default 'pending' check (state in ('pending','done','failed')),
  created_at timestamptz not null default now()
);
create table public.linea_worker_status (
  role text primary key check(role in ('voice','notifications','retention')),
  updated_at timestamptz not null
);
alter table public.linea_runtime enable row level security;
alter table public.linea_runtime_locks enable row level security;
alter table public.linea_commands enable row level security;
alter table public.linea_event_inbox enable row level security;
alter table public.linea_worker_status enable row level security;
revoke all on public.linea_runtime, public.linea_runtime_locks, public.linea_commands,
  public.linea_event_inbox, public.linea_worker_status from anon, authenticated;
grant all on public.linea_runtime, public.linea_runtime_locks, public.linea_commands,
  public.linea_event_inbox, public.linea_worker_status to service_role;
alter table public.alerts add column revision integer not null default 1;
alter table public.alerts add column notification_status text not null default 'not_connected'
  check (notification_status in ('not_connected','pending','sent','failed'));
alter table public.phone_legs add column channel text;
alter table public.notification_outbox add column attempts integer not null default 0;
alter table public.notification_outbox add column lease uuid;
alter table public.notification_outbox add column lease_until timestamptz;
alter table public.notification_outbox add column next_attempt_at timestamptz not null default now();

-- Lease acquisition and mutation each hold the same advisory transaction lock.
-- The durable lease spans the bounded network/model operation between these RPCs.
create function public.linea_lock_runtime(eid uuid, lease uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(eid::text,0));
  if not exists(select 1 from public.elders where id=eid and enrolled) then
    raise exception 'Elder unavailable';
  end if;
  insert into public.linea_runtime_locks as l values(eid,lease,now()+interval '120 seconds')
    on conflict(elder_id) do update set lease=excluded.lease,expires_at=excluded.expires_at
    where l.expires_at<=now();
  return found;
end; $$;
create function public.linea_unlock_runtime(eid uuid, lease uuid) returns void
language sql security definer set search_path='' as $$
  delete from public.linea_runtime_locks where elder_id=eid and linea_runtime_locks.lease=$2;
$$;

create function public.linea_commit_runtime(
  eid uuid, lease uuid, call_data jsonb, consent_data jsonb, commands jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare
  cid uuid := (call_data->>'id')::uuid;
  owner_uuid uuid := (call_data->>'owner_id')::uuid;
  row_call public.checkins;
  leg jsonb; a jsonb; cmd jsonb; member jsonb;
  local_now timestamp;
begin
  perform pg_advisory_xact_lock(hashtextextended(eid::text,0));
  if not exists(select 1 from public.linea_runtime_locks l
    where l.elder_id=eid and l.lease=$2 and l.expires_at>now()) then
    raise exception 'Runtime lease expired';
  end if;
  if (call_data->>'elder_id')::uuid<>eid or not exists(
    select 1 from public.elders where id=eid and owner_id=owner_uuid and enrolled
  ) then raise exception 'Owner mismatch'; end if;
  select * into row_call from public.checkins where id=cid for update;
  if found and (row_call.elder_id<>eid or row_call.owner_id<>owner_uuid) then
    raise exception 'Call ownership is immutable';
  end if;
  if exists(select 1 from jsonb_array_elements(commands) x where x->>'kind'='place') then
    select now() at time zone timezone into local_now from public.elders where id=eid;
    if local_now::time<'06:00' or local_now::time>='21:00' or exists(
      select 1 from public.consents where elder_id=eid and decision='declined'
    ) then raise exception 'Placement unavailable'; end if;
    if exists(select 1 from public.checkins where elder_id=eid and id<>cid
      and state in ('ringing','connected','reconnecting')) then
      raise exception 'Active call exists';
    end if;
  end if;
  -- Explicit mapping prevents JSON from writing server-only expiry or unrelated columns.
  insert into public.checkins(id,elder_id,owner_id,local_date,created_at,ended_at,state,mode,
    complete,medicine_result,medicine_due,initial_attempts,reconnect_used,emergency_latched,
    intentional_end,retry_at,suspended_retry_at,suspended_retry_state)
  values(cid,eid,owner_uuid,(call_data->>'local_date')::date,
    (call_data->>'created_at')::timestamptz,(call_data->>'ended_at')::timestamptz,
    call_data->>'state',call_data->>'mode',(call_data->>'complete')::boolean,
    call_data->>'medicine_result',(call_data->>'medicine_due')::boolean,
    (call_data->>'initial_attempts')::smallint,(call_data->>'reconnect_used')::boolean,
    (call_data->>'emergency_latched')::boolean,(call_data->>'intentional_end')::boolean,
    (call_data->>'retry_at')::timestamptz,(call_data->>'suspended_retry_at')::timestamptz,
    call_data->>'suspended_retry_state')
  on conflict(id) do update set ended_at=excluded.ended_at,state=excluded.state,mode=excluded.mode,
    complete=excluded.complete,medicine_result=excluded.medicine_result,
    medicine_due=excluded.medicine_due,initial_attempts=excluded.initial_attempts,
    reconnect_used=excluded.reconnect_used,emergency_latched=excluded.emergency_latched,
    intentional_end=excluded.intentional_end,retry_at=excluded.retry_at,
    suspended_retry_at=excluded.suspended_retry_at,suspended_retry_state=excluded.suspended_retry_state;
  insert into public.linea_runtime values(cid,call_data)
    on conflict(checkin_id) do update set payload=excluded.payload;
  insert into public.checkin_details values(cid,call_data->'transcript',call_data->>'summary',
    jsonb_build_object('answers',call_data->'answers','active_question',call_data->'active_question',
      'family_joined_at',call_data->'family_joined_at','farewell_asked',call_data->'farewell_asked'))
    on conflict(checkin_id) do update set transcript=excluded.transcript,summary=excluded.summary,
      runtime_context=excluded.runtime_context;
  if consent_data->>'decision' in ('granted','declined') then
    insert into public.consents values(eid,consent_data->>'decision',consent_data->>'words',
      (consent_data->>'decided_at')::timestamptz)
      on conflict(elder_id) do update set decision=excluded.decision,words=excluded.words,
        decided_at=excluded.decided_at;
  end if;
  for leg in select * from jsonb_array_elements(call_data->'legs') loop
    if exists(select 1 from public.phone_legs where id=(leg->>'id')::uuid and checkin_id<>cid) then
      raise exception 'Leg mismatch';
    end if;
    insert into public.phone_legs(id,checkin_id,kind,state,started_at,ended_at,provider_leg_id,channel)
      values((leg->>'id')::uuid,cid,leg->>'kind',leg->>'state',
      (leg->>'started_at')::timestamptz,(leg->>'ended_at')::timestamptz,
      leg->>'provider_agent_id',leg->>'channel')
      on conflict(id) do update set state=excluded.state,ended_at=excluded.ended_at,
        provider_leg_id=excluded.provider_leg_id,channel=excluded.channel;
  end loop;
  for a in select * from jsonb_array_elements(call_data->'alerts') loop
    if exists(select 1 from public.alerts where id=(a->>'id')::uuid and checkin_id<>cid) then
      raise exception 'Alert mismatch';
    end if;
    insert into public.alerts(id,checkin_id,incident_id,concern,tier,subject,actual_fall,
      assessment,reason_code,created_at,revision,notification_status)
      values((a->>'id')::uuid,cid,a->>'incident_id',a->>'concern',a->>'tier',a->>'subject',
        (a->>'actual_fall')::boolean,a->>'assessment',a->>'reason',
        (a->>'created_at')::timestamptz,(a->>'revision')::integer,'pending')
      on conflict(id) do update set tier=excluded.tier,assessment=excluded.assessment,
        actual_fall=excluded.actual_fall,reason_code=excluded.reason_code,
        revision=excluded.revision,notification_status=case
          when alerts.revision<excluded.revision then 'pending' else alerts.notification_status end;
    if a->>'quote' is not null then
      insert into public.alert_details(alert_id,quotation) values((a->>'id')::uuid,a->>'quote')
        on conflict(alert_id) do update set quotation=excluded.quotation;
    end if;
    insert into public.notification_outbox(alert_id,revision) values((a->>'id')::uuid,(a->>'revision')::integer)
      on conflict(alert_id,revision) do nothing;
  end loop;
  -- Issued UID rows have null joined_at; membership only changes after provider confirmation.
  for member in select jsonb_build_object('user_id',key,'uid',value)
    from jsonb_each(call_data->'rtc_members') loop
    insert into public.family_presence(checkin_id,user_id,uid,joined_at,left_at)
      values(cid,(member->>'user_id')::uuid,(member->>'uid')::bigint,
        case when (call_data->'family') ? (member->>'user_id') then now() else null end,null)
      on conflict(checkin_id,user_id) do update set uid=excluded.uid,
        joined_at=case when excluded.joined_at is not null
          then case when family_presence.left_at is null
            then coalesce(family_presence.joined_at,excluded.joined_at) else excluded.joined_at end
          else family_presence.joined_at end,
        left_at=case when excluded.joined_at is not null then null
          when family_presence.joined_at is not null then coalesce(family_presence.left_at,now())
          else null end;
  end loop;
  for cmd in select * from jsonb_array_elements(commands) loop
    insert into public.linea_commands(id,checkin_id,leg_id,kind,text,not_before)
      values((cmd->>'id')::uuid,cid,(cmd->>'leg_id')::uuid,cmd->>'kind',cmd->>'text',
        coalesce((cmd->>'not_before')::timestamptz,now())) on conflict(id) do nothing;
  end loop;
  return cid;
end; $$;

create function public.linea_enqueue_event(notice jsonb) returns boolean
language plpgsql security definer set search_path='' as $$
declare leg public.phone_legs;
begin
  select * into leg from public.phone_legs where channel=notice->'payload'->>'channel'
    and provider_leg_id=notice->'payload'->>'agent_id';
  if not found then raise exception 'Unknown provider session'; end if;
  insert into public.linea_event_inbox(id,checkin_id,leg_id,agent_id,kind,report_ms)
    values(notice->>'noticeId',leg.checkin_id,leg.id,leg.provider_leg_id,
      notice->'payload'->>'state',(notice->'payload'->>'report_ms')::bigint)
    on conflict(id) do nothing;
  return found;
end; $$;

create function public.linea_unenroll_profile(eid uuid, owner_uuid uuid, lease uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(eid::text,0));
  if not exists(select 1 from public.linea_runtime_locks l
    where l.elder_id=eid and l.lease=$3 and l.expires_at>now()) then
    raise exception 'Runtime lease expired';
  end if;
  if exists(select 1 from public.checkins where elder_id=eid and state<>'ended') then
    raise exception 'End active runtime work before unenrollment';
  end if;
  delete from public.elders where id=eid and owner_id=owner_uuid;
  if not found then raise exception 'Elder unavailable'; end if;
end; $$;

create function public.linea_claim_notification(claim uuid) returns setof public.notification_outbox
language sql security definer set search_path='' as $$
  update public.notification_outbox set lease=claim,lease_until=now()+interval '120 seconds',
    attempts=attempts+1
  where id=(select id from public.notification_outbox where state in ('pending','failed')
    and attempts<5 and next_attempt_at<=now() and (lease_until is null or lease_until<=now())
    order by created_at for update skip locked limit 1) returning *;
$$;
create function public.linea_finish_notification(job uuid, claim uuid, succeeded boolean) returns void
language plpgsql security definer set search_path='' as $$
declare a uuid; rev integer;
begin
  update public.notification_outbox set state=case when succeeded then 'sent' else 'failed' end,
    delivered_at=case when succeeded then now() else null end,lease=null,lease_until=null,
    next_attempt_at=now()+interval '1 minute'*power(2,attempts)
    where id=job and lease=claim and lease_until>now() returning alert_id,revision into a,rev;
  if found then
    update public.alerts set notification_status=case when succeeded then 'sent' else 'failed' end
      where id=a and revision=rev;
  end if;
end; $$;

create or replace function public.expire_linea_history() returns void
language plpgsql security definer set search_path='' as $$
begin
  delete from public.linea_runtime r using public.checkins c
    where r.checkin_id=c.id and c.ended_at+interval '90 days'<=now();
  delete from public.linea_commands j using public.checkins c
    where j.checkin_id=c.id and c.ended_at+interval '90 days'<=now();
  delete from public.alert_details d using public.alerts a,public.checkins c
    where d.alert_id=a.id and a.checkin_id=c.id and c.ended_at+interval '90 days'<=now();
  delete from public.checkin_details d using public.checkins c
    where d.checkin_id=c.id and c.ended_at+interval '90 days'<=now();
  delete from public.checkins where structured_expires_at<=now();
end; $$;

revoke all on function public.linea_lock_runtime(uuid,uuid), public.linea_unlock_runtime(uuid,uuid),
  public.linea_commit_runtime(uuid,uuid,jsonb,jsonb,jsonb), public.linea_enqueue_event(jsonb),
  public.linea_claim_notification(uuid), public.linea_finish_notification(uuid,uuid,boolean)
  ,public.linea_unenroll_profile(uuid,uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.linea_lock_runtime(uuid,uuid), public.linea_unlock_runtime(uuid,uuid),
  public.linea_commit_runtime(uuid,uuid,jsonb,jsonb,jsonb), public.linea_enqueue_event(jsonb),
  public.linea_claim_notification(uuid), public.linea_finish_notification(uuid,uuid,boolean) to service_role;
grant execute on function public.linea_unenroll_profile(uuid,uuid,uuid) to service_role;
