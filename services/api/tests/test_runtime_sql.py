"""Runs against disposable PostgreSQL only; no provider or real account access."""

import os
from datetime import timedelta
from pathlib import Path
from uuid import uuid4

import pytest
from app.models import CheckIn, Profile, now
from app.runtime_service import command
from psycopg.types.json import Jsonb


@pytest.fixture
def database():
    dsn = os.getenv("LINEA_TEST_POSTGRES_DSN")
    if not dsn:
        pytest.skip("Set LINEA_TEST_POSTGRES_DSN to a disposable PostgreSQL database")
    import psycopg
    from psycopg import sql
    from psycopg.conninfo import make_conninfo

    name = f"linea_runtime_test_{uuid4().hex}"
    admin = psycopg.connect(dsn, autocommit=True)
    admin.execute(sql.SQL("create database {} ").format(sql.Identifier(name)))
    conn = psycopg.connect(make_conninfo(dsn, dbname=name))
    try:
        conn.execute("""
            do $$ begin
              if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
              if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
              if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
            end $$;
            create schema auth;
            create table auth.users(id uuid primary key);
            create function auth.uid() returns uuid language sql stable as
              $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
            grant usage on schema public,auth to anon,authenticated,service_role;
            grant execute on function auth.uid() to anon,authenticated,service_role;
            alter default privileges in schema public grant all on tables to authenticated,service_role;
        """)
        root = Path(__file__).resolve().parents[3]
        for migration in sorted((root / "supabase/migrations").glob("*.sql")):
            conn.execute(migration.read_text(encoding="utf-8"))
        try:
            yield conn
        finally:
            conn.rollback()
    finally:
        conn.close()
        admin.execute(sql.SQL("drop database {} ").format(sql.Identifier(name)))
        admin.close()


def setup(conn):
    owner, elder, lease = uuid4(), uuid4(), uuid4()
    conn.execute("insert into auth.users values(%s)", (owner,))
    # Choose a timezone whose local clock is currently inside calling hours.
    hour = now().hour
    offset = 12 - hour
    tz = f"Etc/GMT{'-' if offset >= 0 else '+'}{abs(offset)}" if offset else "Etc/GMT"
    conn.execute(
        """insert into public.elders(id,owner_id,name,preferred_name,phone,timezone,
        call_time,medicine,medicine_time) values(%s,%s,'Test','Test','+12025550101',%s,'08:00','Losartan','08:00')""",
        (elder, owner, tz),
    )
    profile = Profile(
        id=str(elder),
        owner_id=str(owner),
        timezone=tz,
        name="Test",
        preferred_name="Test",
        phone="+12025550101",
        contacts=[{"name": "Family", "relationship": "Family", "phone": "+12025550102"}],
    )
    call = CheckIn(elder_id=str(elder), owner_id=str(owner), local_date=now().date().isoformat())
    from app.lifecycle import place

    place(call, "manual", now())
    call.legs[-1].channel = f"linea-{call.legs[-1].id}"
    assert conn.execute("select public.linea_lock_runtime(%s,%s)", (elder, lease)).fetchone()[0]
    return profile, call, lease


def commit(conn, profile, call, lease, commands=()):
    return conn.execute(
        "select public.linea_commit_runtime(%s,%s,%s,%s,%s)",
        (
            profile.id,
            lease,
            Jsonb(call.model_dump(mode="json")),
            Jsonb(
                {
                    "decision": profile.consent,
                    "words": profile.consent_words,
                    "decided_at": profile.consent_at.isoformat() if profile.consent_at else None,
                }
            ),
            Jsonb(list(commands)),
        ),
    ).fetchone()[0]


def test_runtime_commit_is_atomic_and_lease_serializes_replayed_placement(database):
    conn = database
    profile, call, lease = setup(conn)
    assert not conn.execute(
        "select public.linea_lock_runtime(%s,%s)", (profile.id, uuid4())
    ).fetchone()[0]
    cmd = command(call, "place")
    assert str(commit(conn, profile, call, lease, [cmd])) == call.id
    commit(conn, profile, call, lease, [cmd])
    assert conn.execute("select count(*) from public.linea_commands").fetchone()[0] == 1
    assert conn.execute("select count(*) from public.phone_legs").fetchone()[0] == 1
    with pytest.raises(Exception, match="lease expired"), conn.transaction():
        commit(conn, profile, call, uuid4())
    assert conn.execute("select count(*) from public.checkins").fetchone()[0] == 1
    forged = call.model_copy(deep=True)
    forged.owner_id = str(uuid4())
    with pytest.raises(Exception, match="Owner mismatch"), conn.transaction():
        commit(conn, profile, forged, lease)


def test_consent_alert_presence_callback_and_privileges(database):
    conn = database
    profile, call, lease = setup(conn)
    from app.models import Alert

    profile.consent, profile.consent_words, profile.consent_at = (
        "granted",
        "Yes, that's okay.",
        now(),
    )
    call.alerts.append(
        Alert(
            incident_id="chest",
            concern="CHEST_PAIN",
            tier="emergency",
            reason="Current chest pain",
            quote="My chest hurts.",
            revision=1,
        )
    )
    call.legs[-1].provider_agent_id = "provider-agent"
    call.rtc_members[profile.owner_id] = 2002
    commit(conn, profile, call, lease)
    assert conn.execute("select decision from public.consents").fetchone()[0] == "granted"
    assert conn.execute("select joined_at from public.family_presence").fetchone()[0] is None
    call.family = [profile.owner_id]
    commit(conn, profile, call, lease)
    assert conn.execute("select joined_at from public.family_presence").fetchone()[0]
    # A concurrent family handling write survives a later runtime snapshot update.
    conn.execute("update public.alerts set handled_at=now(),handled_by=%s", (profile.owner_id,))
    commit(conn, profile, call, lease)
    assert conn.execute("select handled_at from public.alerts").fetchone()[0]
    assert conn.execute("select count(*) from public.notification_outbox").fetchone()[0] == 1
    notice = {
        "noticeId": "signed-event",
        "payload": {
            "agent_id": "provider-agent",
            "channel": call.legs[-1].channel,
            "state": "ANSWERED",
            "report_ms": 1,
        },
    }
    assert conn.execute("select public.linea_enqueue_event(%s)", (Jsonb(notice),)).fetchone()[0]
    assert not conn.execute("select public.linea_enqueue_event(%s)", (Jsonb(notice),)).fetchone()[0]
    conn.execute("set local role authenticated")
    assert not conn.execute(
        "select has_function_privilege(current_user,'public.linea_commit_runtime(uuid,uuid,jsonb,jsonb,jsonb)','execute')"
    ).fetchone()[0]
    assert not conn.execute(
        "select has_table_privilege(current_user,'public.linea_runtime','select')"
    ).fetchone()[0]


def test_outbox_claim_has_exclusive_lease_and_revision_status(database):
    conn = database
    profile, call, lease = setup(conn)
    from app.models import Alert

    call.alerts.append(
        Alert(
            incident_id="fall", concern="FALL", tier="significant", reason="Pain", quote="I fell."
        )
    )
    commit(conn, profile, call, lease)
    claim = uuid4()
    job = conn.execute("select id from public.linea_claim_notification(%s)", (claim,)).fetchone()[0]
    assert (
        conn.execute("select id from public.linea_claim_notification(%s)", (uuid4(),)).fetchone()
        is None
    )
    conn.execute("select public.linea_finish_notification(%s,%s,true)", (job, uuid4()))
    assert conn.execute("select state from public.notification_outbox").fetchone()[0] == "pending"
    conn.execute("select public.linea_finish_notification(%s,%s,true)", (job, claim))
    assert conn.execute("select notification_status from public.alerts").fetchone()[0] == "sent"


def test_unenroll_requires_ended_calls_and_keeps_original_history_anchor(database):
    conn = database
    profile, call, lease = setup(conn)
    profile.consent, profile.consent_words, profile.consent_at = "granted", "Yes.", now()
    commit(conn, profile, call, lease)
    with pytest.raises(Exception, match="End active runtime"), conn.transaction():
        conn.execute(
            "select public.linea_unenroll_profile(%s,%s,%s)", (profile.id, profile.owner_id, lease)
        )
    from app.lifecycle import finalize

    finalize(call, now())
    commit(conn, profile, call, lease)
    anchored = conn.execute("select ended_at,structured_expires_at from public.checkins").fetchone()
    with pytest.raises(Exception, match="Elder unavailable"), conn.transaction():
        conn.execute("select public.linea_unenroll_profile(%s,%s,%s)", (profile.id, uuid4(), lease))
    conn.execute(
        "select public.linea_unenroll_profile(%s,%s,%s)", (profile.id, profile.owner_id, lease)
    )
    assert conn.execute("select count(*) from public.elders").fetchone()[0] == 0
    assert conn.execute("select count(*) from public.consents").fetchone()[0] == 0
    history = conn.execute(
        "select elder_id,ended_at,structured_expires_at from public.checkins"
    ).fetchone()
    assert history == (None, *anchored)


def test_retention_removes_private_runtime_and_text_but_keeps_structured_history(database):
    conn = database
    profile, call, lease = setup(conn)
    from app.lifecycle import finalize
    from app.models import Alert

    call.created_at = now() - timedelta(days=92)
    call.legs[-1].started_at = call.created_at
    call.alerts.append(
        Alert(
            incident_id="fall", concern="FALL", tier="significant", reason="Pain", quote="I fell."
        )
    )
    finalize(call, now() - timedelta(days=91))
    commit(conn, profile, call, lease, [command(call, "end")])
    conn.execute("select public.expire_linea_history()")
    for table in ("linea_runtime", "linea_commands", "checkin_details", "alert_details"):
        from psycopg import sql

        assert (
            conn.execute(
                sql.SQL("select count(*) from public.{}").format(sql.Identifier(table))
            ).fetchone()[0]
            == 0
        )
    assert conn.execute("select count(*) from public.checkins").fetchone()[0] == 1
    assert conn.execute("select count(*) from public.alerts").fetchone()[0] == 1
