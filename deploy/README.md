# Hosted API and voice worker

The actual frontend is https://linea.aldrinvitorillo.dev. As of 05:36 on
4 October 2026 (Asia/Singapore), the API and worker use source commit
`311bd5e36f6a357384a05d34fd466f031eed3795`; the frontend remains on
`098e52a8a6e2ef44169f8446c200c82fbcc0c020`.
`linea-api` and the privately scoped `linea-voice` worker are running. Voice
remains disabled for automatic startup on boot. The separately installed
preflight script matches the API release, and the already applied
`manual_call_hours` migration was not reapplied. See
[the deployment record](DEPLOYMENT-20261004.md) for checks and verification limits.

Web releases live in `/opt/linea/web/releases/<commit>`, selected by
`/opt/linea/web/current`; `systemd/linea-web.service` binds Next.js to loopback
port 3000. `/etc/linea/web.env` supplies connected mode, the HTTPS API/app origins,
and public Supabase/VAPID keys only. The build requires the same public values.
The Nginx frontend virtual host uses its own Let's Encrypt certificate and
preserves the browser Host for same-origin session checks. Keep private backend
secrets out of the frontend environment, build output and access logs.
TLS/HTTP responses are verified; authenticated browser use is still NOT RUN.

Speech properties for the current host are at
`/opt/linea/config/agora-properties.json` (root:linea 0640; parent 0750).
Keep `/etc/linea` root-only. Test file access and runtime construction as the
actual `linea` service user; testing as root can conceal a startup failure.

The Linux units in `systemd/` share `/etc/linea/backend.env` and the configured
private journal directory. Install a Python 3.12 virtual environment at
`/opt/linea/venv` from `services/api/requirements.lock.txt`; point
`/opt/linea/current` at an immutable release containing `services/api/app` and
`services/api/data`. The `linea` service user needs read access to the properties
JSON and write access to `/var/lib/linea/runtime-journal`. Keep environment files
and properties outside Git, restrict their permissions, and use the same
completion bearer in both services. The existing Nginx proxy targets port 8000.

Install the API unit and enable it after checking its configuration. Install
the voice unit **without enabling or starting it** until the provider and test
prerequisites in `IMPLEMENTATION-NOTES.md` are complete.

Starting the voice worker is consequential: each tick processes pending events,
pending/inflight/uncertain commands, journal recovery, scheduled placements,
retries, and call reconciliation. A test scope limits the profile/account but
does not disable scheduled calls for that profile. Before starting it, obtain
explicit recipient authorization, verify the agreed profile/owner pair, inspect
all queues and recovery files, and run the read-only planner. Do not substitute a
heartbeat row or an acceptance JSON for a running worker or actual test evidence.

Use `scripts/preflight-calling.py --env-file /etc/linea/backend.env --check-provider`
with the release's Python environment for a read-only audit. It reports active
phone legs and provider agents, all pending/inflight/uncertain commands (including
future commands), callbacks, retry/reconnection schedules, recovery files,
due scheduler proposals, worker heartbeats and the actual scoped calling hours.
It prints no profile/account IDs, names, phones, quotations or credentials.
Exit 2 means the audit is blocked or there is work to inspect; exit 0 is only
a clear snapshot, never authorization or acceptance. Recheck immediately before
startup and after every take. Scoped mode still permits normal scheduled calling.

The current host also has the audit installed separately at
`/opt/linea/ops/preflight-calling.py`, without changing the application release.
Run it as the private configuration's operator:

```sh
PYTHONPATH=/opt/linea/current/services/api /opt/linea/venv/bin/python /opt/linea/ops/preflight-calling.py --env-file /etc/linea/backend.env --check-provider
```

Keep connected mode with voice/push disabled while provider setup is incomplete.
For scoped testing use the exact settings in the acceptance guide. After startup,
verify a fresh worker heartbeat and the authenticated dashboard's capability for
the scoped owner; global `/health` can continue to report voice disabled. Follow
`testing/README.md` for phone, family audio, push, persistence, and full acceptance
before general live mode.
