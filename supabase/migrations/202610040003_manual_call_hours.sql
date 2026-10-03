-- Explicit manual calls may run any time. Automatic placement keeps calling hours.
-- Function signature and service-role-only privileges are unchanged.
create or replace function public.linea_commit_runtime(
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
    if ((local_now::time<'06:00' or local_now::time>='21:00') and exists(
      select 1 from jsonb_array_elements(commands) x where x->>'kind'='place'
      and not exists(select 1 from jsonb_array_elements(call_data->'legs') l
        where l->>'id'=x->>'leg_id' and l->>'kind'='manual')
    )) or exists(
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

