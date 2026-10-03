"""Revisioned Supabase outbox delivery. Sent means accepted by push service, not read."""

import json
import os
from uuid import uuid4

from pywebpush import WebPushException, webpush


def deliver_one(repo, sender=webpush):
    lease = str(uuid4())
    jobs = repo.request("POST", "rpc/linea_claim_notification", json={"claim": lease})
    if not jobs:
        return False
    job, succeeded = jobs[0], False
    try:
        alerts = repo.request(
            "GET",
            "alerts",
            params={"id": f"eq.{job['alert_id']}", "select": "*,checkins(owner_id,local_date)"},
        )
        if alerts:
            alert = alerts[0]
            # A stale revision is superseded; deliver only the current assessment.
            if alert["revision"] != job["revision"]:
                succeeded = True
            else:
                subscriptions = repo.rows(
                    "push_subscriptions",
                    {
                        "user_id": f"eq.{alert['checkins']['owner_id']}",
                        "select": "*",
                    },
                )
                succeeded = bool(subscriptions)
                for subscription in subscriptions:
                    payload = {
                        "title": "Linea update",
                        "body": "A check-in needs your review. Open Linea for details.",
                        "event_id": f"{alert['id']}:{job['revision']}",
                        "url": f"/day/{alert['checkins']['local_date']}",
                    }
                    try:
                        sender(
                            subscription_info={
                                "endpoint": subscription["endpoint"],
                                "keys": {
                                    "p256dh": subscription["p256dh"],
                                    "auth": subscription["auth"],
                                },
                            },
                            data=json.dumps(payload),
                            vapid_private_key=os.environ["WEB_PUSH_PRIVATE_KEY"],
                            vapid_claims={"sub": os.environ["WEB_PUSH_SUBJECT"]},
                            timeout=10,
                        )
                    except WebPushException as exc:
                        succeeded = False
                        if exc.response is not None and exc.response.status_code in (404, 410):
                            repo.request(
                                "DELETE",
                                "push_subscriptions",
                                params={"id": f"eq.{subscription['id']}"},
                            )
                    except Exception:
                        succeeded = False
    finally:
        repo.request(
            "POST",
            "rpc/linea_finish_notification",
            json={
                "job": job["id"],
                "claim": lease,
                "succeeded": succeeded,
            },
        )
    return True
