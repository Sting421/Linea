"""SQLite development repository. Atomic writes; caller holds the per-store lock.
Production Supabase must implement the same transaction boundary, not mirror this
development JSON persistence directly into an unrestricted browser table.
"""

import sqlite3
from datetime import timedelta
from pathlib import Path
from threading import RLock

from .models import CheckIn, Profile, now


class Repository:
    def __init__(self, path: str):
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute("PRAGMA secure_delete=ON")
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, payload TEXT NOT NULL)"
        )
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS checkins (id TEXT PRIMARY KEY, payload TEXT NOT NULL)"
        )
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS subscriptions (owner TEXT, endpoint TEXT, payload TEXT, PRIMARY KEY(owner, endpoint))"
        )
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS demo_outbox (alert_id TEXT, revision INTEGER, checkin_id TEXT, PRIMARY KEY(alert_id,revision))"
        )
        self.lock = RLock()

    def profiles(self):
        return [
            Profile.model_validate_json(row[0])
            for row in self.db.execute("SELECT payload FROM profiles")
        ]

    def calls(self):
        return [
            CheckIn.model_validate_json(row[0])
            for row in self.db.execute("SELECT payload FROM checkins")
        ]

    def save(self, item):
        table = "profiles" if isinstance(item, Profile) else "checkins"
        self.db.execute(
            f"INSERT OR REPLACE INTO {table}(id,payload) VALUES (?,?)",
            (item.id, item.model_dump_json()),
        )
        if isinstance(item, CheckIn):
            for a in item.alerts:
                self.db.execute(
                    "INSERT OR IGNORE INTO demo_outbox VALUES (?,?,?)",
                    (a.id, a.revision, item.id),
                )
        self.db.commit()

    def sweep(self, at=None):
        at = at or now()
        with self.lock:
            for c in self.calls():
                if not c.ended_at:
                    continue
                if at >= c.ended_at + timedelta(days=365):
                    self.db.execute("DELETE FROM demo_outbox WHERE checkin_id=?", (c.id,))
                    self.db.execute("DELETE FROM checkins WHERE id=?", (c.id,))
                elif at >= c.ended_at + timedelta(days=90) and not c.text_expired:
                    c.transcript, c.summary, c.answers, c.facts, c.processed_turns = (
                        [],
                        None,
                        {},
                        {},
                        {},
                    )
                    for a in c.alerts:
                        a.quote = None
                        # Reasons are policy-generated fixed descriptions, not elder free text.
                    c.text_expired = True
                    c.active_prompt = None
                    self.save(c)
            self.db.commit()

    def unenroll(self, elder_id):
        with self.lock:
            from .lifecycle import finalize

            for call in self.calls():
                if call.elder_id == elder_id and not call.ended_at:
                    call.intentional_end = True
                    finalize(call, now())
                    self.save(call)
            self.db.execute("DELETE FROM profiles WHERE id=?", (elder_id,))
            self.db.commit()

    def subscribe(self, owner, subscription):
        import json

        self.db.execute(
            "INSERT OR REPLACE INTO subscriptions VALUES (?,?,?)",
            (owner, subscription["endpoint"], json.dumps(subscription)),
        )
        self.db.commit()
