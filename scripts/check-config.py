"""Report presence only. Never print secrets or claim a configured service works."""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path("services/api/.env"), override=False)

groups = {
    "Supabase": [
        "SUPABASE_URL",
        "SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
    ],
    "Agora": [
        "AGORA_APP_ID",
        "AGORA_APP_CERTIFICATE",
        "AGORA_CUSTOMER_ID",
        "AGORA_CUSTOMER_SECRET",
        "AGORA_PIPELINE_ID",
        "LINEA_CUSTOM_LLM_BEARER",
        "LINEA_PROVIDER_WEBHOOK_SECRET",
    ],
    "Semantic service": [
        "LINEA_SEMANTIC_CLASSIFIER_URL",
        "LINEA_SEMANTIC_CLASSIFIER_TOKEN",
    ],
    "Web push": ["WEB_PUSH_PUBLIC_KEY", "WEB_PUSH_PRIVATE_KEY", "WEB_PUSH_SUBJECT"],
}
for group, keys in groups.items():
    missing = [k for k in keys if not os.getenv(k)]
    print(
        f"{group}: "
        + ("present; connection unverified" if not missing else "missing " + ", ".join(missing))
    )
if "--strict" in sys.argv and any(not os.getenv(k) for keys in groups.values() for k in keys):
    sys.exit(1)
