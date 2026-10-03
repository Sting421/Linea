-- Atomic, user-scoped family edits. Does not enable provider calls or consent writes.
begin;

create function public.save_family_profile(profile_id uuid, profile_data jsonb, create_new boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare
  actor uuid := auth.uid();
  contact jsonb;
  contact_position integer := 0;
begin
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if jsonb_typeof(profile_data->'contacts') is distinct from 'array'
     or jsonb_array_length(profile_data->'contacts') not between 1 and 3 then
    raise exception 'One to three contacts required' using errcode='22023';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name=profile_data->>'timezone') then
    raise exception 'Invalid timezone' using errcode='22023';
  end if;
  if length(btrim(profile_data->>'medicine')) not between 1 and 80
     or profile_data->>'medicine' is null then
    raise exception 'Medicine required' using errcode='22023';
  end if;
  if create_new then
    insert into public.elders(id,owner_id,name,preferred_name,phone,timezone,language,call_time,medicine,medicine_time)
    values(profile_id,actor,profile_data->>'name',profile_data->>'preferred_name',profile_data->>'phone',
      profile_data->>'timezone',profile_data->>'language',(profile_data->>'call_time')::time,
      profile_data->>'medicine',(profile_data->>'medicine_time')::time);
    insert into public.consents(elder_id,decision) values(profile_id,'pending');
  else
    -- Row lock serializes profile/contact replacement in the same transaction.
    perform 1 from public.elders where id=profile_id and owner_id=actor for update;
    if not found then raise exception 'Elder not found' using errcode='42501'; end if;
    update public.elders set name=profile_data->>'name', preferred_name=profile_data->>'preferred_name',
      phone=profile_data->>'phone', timezone=profile_data->>'timezone', language=profile_data->>'language',
      call_time=(profile_data->>'call_time')::time, medicine=profile_data->>'medicine',
      medicine_time=(profile_data->>'medicine_time')::time
    where id=profile_id and owner_id=actor;
    delete from public.contacts where elder_id=profile_id;
  end if;
  for contact in select value from jsonb_array_elements(profile_data->'contacts') loop
    contact_position := contact_position + 1;
    if length(btrim(contact->>'name')) not between 1 and 80
       or length(btrim(contact->>'relationship')) not between 1 and 50 then
      raise exception 'Invalid contact' using errcode='22023';
    end if;
    insert into public.contacts(elder_id,position,name,relationship,phone,nearby)
    values(profile_id,contact_position,contact->>'name',contact->>'relationship',
      contact->>'phone',coalesce((contact->>'nearby')::boolean,false));
  end loop;
  return profile_id;
end; $$;
revoke all on function public.save_family_profile(uuid,jsonb,boolean) from public,anon;
grant execute on function public.save_family_profile(uuid,jsonb,boolean) to authenticated;

create function public.handle_family_alert(call_id uuid, alert_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.checkins c where c.id=call_id and c.owner_id=auth.uid()
      and (c.structured_expires_at is null or c.structured_expires_at>now())
  ) then raise exception 'Check-in not found' using errcode='42501'; end if;
  update public.alerts a set handled_at=coalesce(a.handled_at,now()), handled_by=coalesce(a.handled_by,auth.uid())
    where a.id=alert_id and a.checkin_id=call_id;
  if not found then raise exception 'Alert not found' using errcode='42501'; end if;
end; $$;
revoke all on function public.handle_family_alert(uuid,uuid) from public,anon;
grant execute on function public.handle_family_alert(uuid,uuid) to authenticated;

-- Existing direct profile writes can leave contact-less rows; use the atomic RPC.
drop policy elder_create on public.elders;
drop policy elder_update on public.elders;
commit;
