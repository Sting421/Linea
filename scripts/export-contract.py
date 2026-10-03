import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path("services/api").resolve()))
from app.main import create_app
from app.models import Turn

out = Path("contracts")
out.mkdir(exist_ok=True)
(out / "openapi.json").write_text(
    json.dumps(create_app(":memory:").openapi(), indent=2) + "\n", encoding="utf-8"
)
(out / "semantic-turn.schema.json").write_text(
    json.dumps(Turn.model_json_schema(), indent=2) + "\n", encoding="utf-8"
)
print("Exported API and semantic interpretation schemas.")
