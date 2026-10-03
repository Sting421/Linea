"""Local worker entrypoint. --once prints placement proposals; never places calls.
Use this as the integration seam for a single production scheduler/outbox worker.
"""

import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv

from .models import now
from .repository import Repository
from .scheduler import plan


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", required=True)
    parser.parse_args()
    repo = Repository(os.getenv("LINEA_DATABASE_PATH", ".local/linea.db"))
    repo.sweep()
    print(
        json.dumps(
            {
                "mode": "plan_only",
                "proposals": plan(repo.profiles(), repo.calls(), now()),
            }
        )
    )


if __name__ == "__main__":
    main()
