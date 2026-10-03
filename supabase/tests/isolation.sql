-- Run AFTER migration in a disposable Supabase DB; everything rolls back.
-- Auth user fixtures must already exist. Replace these two UUIDs with test users.
-- This is a manual integration gate, not a claimed executed test.
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
-- Assert user A sees only their family elders and no other family check-ins.
select id, owner_id from public.elders;
select id, owner_id from public.checkins;
-- Assert direct consent/severity/call mutations fail under authenticated role.
-- update public.consents set decision='granted';
-- update public.alerts set tier='routine';
-- set claims to user B and repeat reads; then anon must read no private data.
rollback;
